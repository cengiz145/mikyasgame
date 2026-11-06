package tr.com.mikyasstudio.kameraasistani;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.media.MediaMetadataRetriever;
import android.net.Uri;
import android.os.Bundle;
import android.speech.RecognizerIntent;
import android.util.Base64;
import android.view.KeyEvent;
import android.view.WindowManager;
import android.webkit.GeolocationPermissions;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.ArrayList;

public class MainActivity extends AppCompatActivity {
    private static final int REQ_PERMS = 1001;
    private static final int REQ_FILE_CHOOSER = 1002;
    private static final int REQ_VOICE_SONG = 1003;
    private static final String LIVE_APP_URL = "https://cengiz145.github.io/mikyasgame/kamera_asistan/";
    private static final String LOCAL_FALLBACK_URL = "file:///android_asset/www/index.html";
    private WebView webView;
    private ValueCallback<Uri[]> filePathCallback;
    private String pendingSharedImageDataUrl = null;
    private String pendingSharedVideoJsCall = null;
    private long lastVolumeDownTime = 0;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        extractSharedImageIfPresent(getIntent());

        webView = new WebView(this);
        webView.setBackgroundColor(0xFF0F172A);
        ViewCompat.setOnApplyWindowInsetsListener(webView, (v, windowInsets) -> {
            Insets insets = windowInsets.getInsets(WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout());
            v.setPadding(insets.left, insets.top, insets.right, insets.bottom);
            return WindowInsetsCompat.CONSUMED;
        });
        setContentView(webView);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setGeolocationEnabled(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);

        webView.addJavascriptInterface(new AndroidSongBridge(), "AndroidSongBridge");

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                deliverPendingSharedImageToWebView();
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request != null && request.isForMainFrame()) {
                    view.loadUrl(LOCAL_FALLBACK_URL);
                }
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                runOnUiThread(() -> request.grant(request.getResources()));
            }

            @Override
            public void onGeolocationPermissionsShowPrompt(String origin, GeolocationPermissions.Callback callback) {
                callback.invoke(origin, true, false);
            }

            @Override
            public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback, FileChooserParams fileChooserParams) {
                if (MainActivity.this.filePathCallback != null) {
                    MainActivity.this.filePathCallback.onReceiveValue(null);
                }
                MainActivity.this.filePathCallback = filePathCallback;
                try {
                    Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
                    intent.addCategory(Intent.CATEGORY_OPENABLE);
                    intent.setType("*/*");
                    intent.putExtra(Intent.EXTRA_MIME_TYPES, new String[]{"image/*", "video/*"});
                    startActivityForResult(Intent.createChooser(intent, "Betimlenecek Fotoğrafı veya Videoyu Seçin"), REQ_FILE_CHOOSER);
                    return true;
                } catch (Exception e) {
                    MainActivity.this.filePathCallback = null;
                    return false;
                }
            }
        });

        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED ||
            ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED ||
            ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, new String[]{
                Manifest.permission.CAMERA,
                Manifest.permission.RECORD_AUDIO,
                Manifest.permission.ACCESS_FINE_LOCATION,
                Manifest.permission.ACCESS_COARSE_LOCATION
            }, REQ_PERMS);
        } else {
            loadAssistantApp();
        }
    }

    public class AndroidSongBridge {
        @JavascriptInterface
        public void startNativeVoiceLyricsCapture() {
            runOnUiThread(() -> {
                try {
                    Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
                    intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
                    intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, "tr-TR");
                    intent.putExtra(RecognizerIntent.EXTRA_PROMPT, "Çalan şarkının sözlerini dinletin veya hatırladığınız birkaç kelimesini söyleyin...");
                    startActivityForResult(intent, REQ_VOICE_SONG);
                } catch (Exception ignored) {}
            });
        }

        @JavascriptInterface
        public boolean launchGoogleHumToSearch() {
            try {
                Intent googleMusicIntent = new Intent("com.google.android.googlequicksearchbox.MUSIC_SEARCH");
                if (googleMusicIntent.resolveActivity(getPackageManager()) != null) {
                    startActivity(googleMusicIntent);
                    return true;
                }
            } catch (Exception ignored) {}
            try {
                Intent stdMusicIntent = new Intent("android.intent.action.MUSIC_SEARCH");
                if (stdMusicIntent.resolveActivity(getPackageManager()) != null) {
                    startActivity(stdMusicIntent);
                    return true;
                }
            } catch (Exception ignored) {}
            return false;
        }
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        extractSharedImageIfPresent(intent);
        deliverPendingSharedImageToWebView();
    }

    private void extractSharedImageIfPresent(Intent intent) {
        if (intent == null) return;
        if (!Intent.ACTION_SEND.equals(intent.getAction()) || intent.getType() == null) return;

        Uri mediaUri = intent.getParcelableExtra(Intent.EXTRA_STREAM);
        if (mediaUri == null) return;

        if (intent.getType().startsWith("image/")) {
            try (InputStream is = getContentResolver().openInputStream(mediaUri)) {
                if (is != null) {
                    ByteArrayOutputStream buffer = new ByteArrayOutputStream();
                    byte[] data = new byte[8192];
                    int nRead;
                    while ((nRead = is.read(data, 0, data.length)) != -1) {
                        buffer.write(data, 0, nRead);
                    }
                    buffer.flush();
                    String base64 = Base64.encodeToString(buffer.toByteArray(), Base64.NO_WRAP);
                    pendingSharedImageDataUrl = "data:" + intent.getType() + ";base64," + base64;
                }
            } catch (Exception ignored) {}
        } else if (intent.getType().startsWith("video/")) {
            final Uri videoUri = mediaUri;
            new Thread(() -> {
                MediaMetadataRetriever retriever = new MediaMetadataRetriever();
                try {
                    retriever.setDataSource(MainActivity.this, videoUri);
                    String durStr = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_DURATION);
                    long durationMs = durStr != null ? Long.parseLong(durStr) : 6000L;
                    if (durationMs < 1000L) durationMs = 4000L;
                    int durationSec = Math.max(1, Math.round(durationMs / 1000f));

                    int stepCount = Math.min(8, Math.max(4, (int) Math.ceil(durationSec / 1.5)));
                    StringBuilder jsArray = new StringBuilder("[");
                    boolean first = true;

                    for (int i = 0; i < stepCount; i++) {
                        double r = stepCount == 1 ? 0.5 : (0.04 + ((double) i / (stepCount - 1)) * 0.90);
                        long timeUs = (long) (durationMs * r * 1000.0);
                        Bitmap rawFrame = retriever.getFrameAtTime(timeUs, MediaMetadataRetriever.OPTION_CLOSEST);
                        if (rawFrame == null) {
                            rawFrame = retriever.getFrameAtTime(timeUs, MediaMetadataRetriever.OPTION_CLOSEST_SYNC);
                        }
                        if (rawFrame != null) {
                            int w = rawFrame.getWidth();
                            int h = rawFrame.getHeight();
                            int maxDim = 640;
                            Bitmap targetFrame = rawFrame;
                            if (w > maxDim || h > maxDim) {
                                float scale = Math.min((float) maxDim / w, (float) maxDim / h);
                                targetFrame = Bitmap.createScaledBitmap(rawFrame, Math.max(1, Math.round(w * scale)), Math.max(1, Math.round(h * scale)), true);
                                if (targetFrame != rawFrame) {
                                    rawFrame.recycle();
                                }
                            }
                            ByteArrayOutputStream bos = new ByteArrayOutputStream();
                            targetFrame.compress(Bitmap.CompressFormat.JPEG, 80, bos);
                            targetFrame.recycle();
                            String b64 = Base64.encodeToString(bos.toByteArray(), Base64.NO_WRAP);
                            if (!first) jsArray.append(",");
                            jsArray.append("'data:image/jpeg;base64,").append(b64).append("'");
                            first = false;
                        }
                    }
                    jsArray.append("]");
                    if (!first) {
                        final String builtCall = "if (typeof window.receiveSharedVideoFramesFromAndroid === 'function') { window.receiveSharedVideoFramesFromAndroid(" + durationSec + ", " + jsArray.toString() + "); }";
                        runOnUiThread(() -> {
                            pendingSharedVideoJsCall = builtCall;
                            deliverPendingSharedImageToWebView();
                        });
                    }
                } catch (Exception ignored) {
                } finally {
                    try { retriever.release(); } catch (Exception ignored) {}
                }
            }).start();
        }
    }

    private void deliverPendingSharedImageToWebView() {
        if (pendingSharedImageDataUrl != null && webView != null) {
            final String payload = pendingSharedImageDataUrl;
            pendingSharedImageDataUrl = null;
            webView.postDelayed(() -> {
                String js = "if (typeof window.receiveSharedPhotoFromAndroid === 'function') { window.receiveSharedPhotoFromAndroid('" + payload + "'); }";
                webView.evaluateJavascript(js, null);
            }, 600);
        }
        if (pendingSharedVideoJsCall != null && webView != null) {
            final String jsCall = pendingSharedVideoJsCall;
            pendingSharedVideoJsCall = null;
            webView.postDelayed(() -> {
                webView.evaluateJavascript(jsCall, null);
            }, 700);
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == REQ_FILE_CHOOSER) {
            if (filePathCallback == null) return;
            Uri[] results = null;
            if (resultCode == Activity.RESULT_OK && data != null) {
                String dataString = data.getDataString();
                if (dataString != null) {
                    results = new Uri[]{Uri.parse(dataString)};
                }
            }
            filePathCallback.onReceiveValue(results);
            filePathCallback = null;
        } else if (requestCode == REQ_VOICE_SONG && resultCode == Activity.RESULT_OK && data != null) {
            ArrayList<String> matches = data.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS);
            if (matches != null && !matches.isEmpty() && webView != null) {
                String spoken = matches.get(0).replace("'", "\\'").replace("\n", " ");
                webView.evaluateJavascript(
                    "if (typeof window.receiveRecognizedSongWordsFromAndroid === 'function') { window.receiveRecognizedSongWordsFromAndroid('" + spoken + "'); }",
                    null
                );
            }
        }
    }

    private void loadAssistantApp() {
        // Güvenli HTTPS üzerinden en güncel sürümü doğrudan yükler (FileOutputStream dropper kullanmadan).
        // İnternet yoksa WebViewClient.onReceivedError otomatik olarak çevrimdışı yerel kopyayı (LOCAL_FALLBACK_URL) açar.
        webView.loadUrl(LIVE_APP_URL + "?t=" + (System.currentTimeMillis() / 60000L));
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        loadAssistantApp();
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        // Ses Açma Tuşu: Anında Fotoğraf / Sınav Kağıdı Çek ve Betimle (Space Kısayolu)
        if (keyCode == KeyEvent.KEYCODE_VOLUME_UP) {
            webView.evaluateJavascript("window.dispatchEvent(new KeyboardEvent('keydown', {code: 'Space', key: ' '}));", null);
            return true;
        }
        // Ses Kısma Tuşu: Tek veya çift basışta Son Söyleneni Tekrar Oku (T Kısayolu - Galeri/Flaş tetiklemez)
        if (keyCode == KeyEvent.KEYCODE_VOLUME_DOWN) {
            webView.evaluateJavascript("window.dispatchEvent(new KeyboardEvent('keydown', {code: 'KeyT', key: 't'}));", null);
            lastVolumeDownTime = System.currentTimeMillis();
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
