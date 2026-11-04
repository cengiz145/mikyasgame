package tr.com.mikyasstudio.kameraasistani;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.view.KeyEvent;
import android.view.WindowManager;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

public class MainActivity extends AppCompatActivity {
    private static final int REQ_CAMERA = 1001;
    private WebView webView;
    private long lastVolumeDownTime = 0;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        webView = new WebView(this);
        setContentView(webView);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setAllowFileAccessFromFileURLs(true);
        settings.setAllowUniversalAccessFromFileURLs(true);

        webView.setWebViewClient(new WebViewClient());
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                runOnUiThread(() -> request.grant(request.getResources()));
            }
        });

        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.CAMERA}, REQ_CAMERA);
        } else {
            loadAssistantApp();
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
        // Ses Açma Tuşu: Anında Fotoğraf / Sınav Kağıdı Çek ve Oku (Space Kısayolu)
        if (keyCode == KeyEvent.KEYCODE_VOLUME_UP) {
            webView.evaluateJavascript("window.dispatchEvent(new KeyboardEvent('keydown', {code: 'Space', key: ' '}));", null);
            return true;
        }
        // Ses Kısma Tuşuna Çift Basış: Son Raporu Tekrarla (T Kısayolu)
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
