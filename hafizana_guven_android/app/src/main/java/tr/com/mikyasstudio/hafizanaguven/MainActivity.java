package tr.com.mikyasstudio.hafizanaguven;

import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.Intent;
import android.media.AudioManager;
import android.net.ConnectivityManager;
import android.net.NetworkCapabilities;
import android.net.NetworkInfo;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.activity.OnBackPressedCallback;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import java.util.Locale;

public class MainActivity extends AppCompatActivity {
    private static final String LIVE_APP_URL = "https://mikyasstudio.com.tr/hafizana_guven/index.html";
    private static final String BACKUP_APP_URL = "https://cengiz145.github.io/mikyasgame/hafizana_guven/index.html";
    private static final String LOCAL_FALLBACK_URL = "file:///android_asset/www/index.html";

    private WebView webView;
    private boolean triedBackupServer = false;
    private AudioManager audioManager;

    private final AudioManager.OnAudioFocusChangeListener audioFocusListener = focusChange -> {
        if (focusChange == AudioManager.AUDIOFOCUS_LOSS ||
            focusChange == AudioManager.AUDIOFOCUS_LOSS_TRANSIENT ||
            focusChange == AudioManager.AUDIOFOCUS_LOSS_TRANSIENT_CAN_DUCK) {
            runOnUiThread(() -> {
                if (webView != null) {
                    try {
                        webView.evaluateJavascript("if (typeof window.pauseAudioForBackground === 'function') { window.pauseAudioForBackground(); }", null);
                    } catch (Exception ignored) {}
                }
            });
        } else if (focusChange == AudioManager.AUDIOFOCUS_GAIN) {
            runOnUiThread(() -> {
                if (webView != null) {
                    try {
                        webView.evaluateJavascript("if (typeof window.resumeAudioFromBackground === 'function') { window.resumeAudioFromBackground(); }", null);
                    } catch (Exception ignored) {}
                }
            });
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        try {
            audioManager = (AudioManager) getSystemService(Context.AUDIO_SERVICE);
            if (audioManager != null) {
                audioManager.requestAudioFocus(audioFocusListener, AudioManager.STREAM_MUSIC, AudioManager.AUDIOFOCUS_GAIN);
            }
        } catch (Exception ignored) {}

        webView = new WebView(this);
        webView.setBackgroundColor(0xFF000000);
        ViewCompat.setOnApplyWindowInsetsListener(webView, (v, windowInsets) -> {
            Insets insets = windowInsets.getInsets(WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout());
            v.setPadding(insets.left, insets.top, insets.right, insets.bottom);
            return WindowInsetsCompat.CONSUMED;
        });
        setContentView(webView);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(false);
        settings.setAllowFileAccessFromFileURLs(false);
        settings.setAllowUniversalAccessFromFileURLs(false);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);

        webView.addJavascriptInterface(new AndroidAppBridge(), "AndroidAppBridge");
        webView.setWebChromeClient(new WebChromeClient());

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                if (request == null || request.getUrl() == null) return false;
                Uri uri = request.getUrl();
                String scheme = uri.getScheme() != null ? uri.getScheme().toLowerCase(Locale.ROOT) : "";
                String host = uri.getHost() != null ? uri.getHost().toLowerCase(Locale.ROOT) : "";
                String path = uri.getPath() != null ? uri.getPath().toLowerCase(Locale.ROOT) : "";

                if ("file".equals(scheme)) {
                    return path.endsWith(".apk") || path.endsWith(".aab");
                }

                if ("https".equals(scheme) && (host.contains("mikyasstudio.com.tr") || host.contains("cengiz145.github.io"))) {
                    if (path.contains("hafizana_guven") && !path.endsWith(".apk") && !path.endsWith(".aab")) {
                        return false;
                    }
                }

                try {
                    Intent extIntent = new Intent(Intent.ACTION_VIEW, uri);
                    extIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    startActivity(extIntent);
                } catch (Exception ignored) {}
                return true;
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request != null && request.isForMainFrame()) {
                    if (!triedBackupServer) {
                        triedBackupServer = true;
                        view.loadUrl(BACKUP_APP_URL);
                    } else {
                        view.loadUrl(LOCAL_FALLBACK_URL);
                    }
                }
            }

            @Override
            public void onReceivedHttpError(WebView view, WebResourceRequest request, WebResourceResponse errorResponse) {
                if (request != null && request.isForMainFrame() && errorResponse != null && errorResponse.getStatusCode() >= 400) {
                    if (!triedBackupServer) {
                        triedBackupServer = true;
                        view.loadUrl(BACKUP_APP_URL);
                    } else {
                        view.loadUrl(LOCAL_FALLBACK_URL);
                    }
                }
            }
        });

        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                if (webView == null) {
                    finish();
                    return;
                }
                String currentUrl = webView.getUrl() != null ? webView.getUrl() : "";
                if ((currentUrl.contains("gizlilik.html") || currentUrl.contains("veri-silme.html") || currentUrl.contains("yardim.html")) && webView.canGoBack()) {
                    webView.goBack();
                    return;
                }
                webView.evaluateJavascript(
                        "(function(){ try { return (typeof window.handleAndroidBackButton === 'function') ? Boolean(window.handleAndroidBackButton()) : false; } catch(e) { return false; } })()",
                        value -> {
                            if ("true".equals(value)) {
                                return;
                            }
                            finish();
                        }
                );
            }
        });

        if (hasNetworkConnection()) {
            webView.loadUrl(LIVE_APP_URL);
        } else {
            triedBackupServer = true;
            webView.loadUrl(LOCAL_FALLBACK_URL);
        }
    }

    private boolean hasNetworkConnection() {
        try {
            ConnectivityManager cm = (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);
            if (cm == null) return false;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                android.net.Network nw = cm.getActiveNetwork();
                if (nw == null) return false;
                NetworkCapabilities caps = cm.getNetworkCapabilities(nw);
                return caps != null && (caps.hasTransport(NetworkCapabilities.TRANSPORT_WIFI)
                        || caps.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR)
                        || caps.hasTransport(NetworkCapabilities.TRANSPORT_ETHERNET));
            } else {
                NetworkInfo ni = cm.getActiveNetworkInfo();
                return ni != null && ni.isConnected();
            }
        } catch (Exception e) {
            return true;
        }
    }

    public class AndroidAppBridge {
        @JavascriptInterface
        public void closeApp() {
            runOnUiThread(() -> {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                    finishAndRemoveTask();
                } else {
                    finish();
                }
            });
        }

        @JavascriptInterface
        public void copyText(String text) {
            if (text == null) return;
            runOnUiThread(() -> {
                try {
                    ClipboardManager cb = (ClipboardManager) getSystemService(Context.CLIPBOARD_SERVICE);
                    if (cb != null) {
                        cb.setPrimaryClip(ClipData.newPlainText("HafizanaGuven", text));
                    }
                } catch (Exception ignored) {}
            });
        }
    }

    @Override
    protected void onPause() {
        if (webView != null) {
            try {
                webView.evaluateJavascript("if (typeof window.pauseAudioForBackground === 'function') { window.pauseAudioForBackground(); }", null);
                webView.onPause();
            } catch (Exception ignored) {}
        }
        super.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (webView != null) {
            try {
                webView.onResume();
                webView.evaluateJavascript("if (typeof window.resumeAudioFromBackground === 'function') { window.resumeAudioFromBackground(); }", null);
            } catch (Exception ignored) {}
        }
    }

    @Override
    protected void onDestroy() {
        if (audioManager != null) {
            try { audioManager.abandonAudioFocus(audioFocusListener); } catch (Exception ignored) {}
        }
        if (webView != null) {
            try {
                webView.stopLoading();
                webView.destroy();
            } catch (Exception ignored) {}
            webView = null;
        }
        super.onDestroy();
    }
}
