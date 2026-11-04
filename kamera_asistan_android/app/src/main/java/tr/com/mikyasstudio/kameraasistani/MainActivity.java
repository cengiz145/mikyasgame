package tr.com.mikyasstudio.kameraasistani;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Bundle;
import android.util.Base64;
import android.view.KeyEvent;
import android.view.WindowManager;
import android.webkit.GeolocationPermissions;
import android.webkit.PermissionRequest;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;

public class MainActivity extends AppCompatActivity {
    private static final int REQ_PERMS = 1001;
    private static final int REQ_FILE_CHOOSER = 1002;
    private WebView webView;
    private ValueCallback<Uri[]> filePathCallback;
    private String pendingSharedImageDataUrl = null;
    private long lastVolumeDownTime = 0;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        extractSharedImageIfPresent(getIntent());

        webView = new WebView(this);
        setContentView(webView);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setGeolocationEnabled(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setAllowFileAccessFromFileURLs(true);
        settings.setAllowUniversalAccessFromFileURLs(true);

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                deliverPendingSharedImageToWebView();
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
                    intent.setType("image/*");
                    startActivityForResult(Intent.createChooser(intent, "Betimlenecek Fotoğrafı Seçin"), REQ_FILE_CHOOSER);
                    return true;
                } catch (Exception e) {
                    MainActivity.this.filePathCallback = null;
                    return false;
                }
            }
        });

        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED ||
            ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, new String[]{
                Manifest.permission.CAMERA,
                Manifest.permission.ACCESS_FINE_LOCATION,
                Manifest.permission.ACCESS_COARSE_LOCATION
            }, REQ_PERMS);
        } else {
            loadAssistantApp();
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
        if (Intent.ACTION_SEND.equals(intent.getAction()) && intent.getType() != null && intent.getType().startsWith("image/")) {
            Uri imageUri = intent.getParcelableExtra(Intent.EXTRA_STREAM);
            if (imageUri != null) {
                try (InputStream is = getContentResolver().openInputStream(imageUri)) {
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
            }
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
        }
    }

    private void loadAssistantApp() {
        webView.loadUrl("file:///android_asset/www/index.html");
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
        // Ses Kısma Tuşuna Çift Basış: Son Betimlemeyi Tekrarla (T Kısayolu)
        if (keyCode == KeyEvent.KEYCODE_VOLUME_DOWN) {
            long now = System.currentTimeMillis();
            if (now - lastVolumeDownTime < 450) {
                webView.evaluateJavascript("window.dispatchEvent(new KeyboardEvent('keydown', {key: 't'}));", null);
                lastVolumeDownTime = 0;
                return true;
            }
            lastVolumeDownTime = now;
        }
        return super.onKeyDown(keyCode, event);
    }
}
