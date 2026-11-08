package tr.com.mikyasstudio.kameraasistani;

import android.Manifest;
import android.app.Activity;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.ContentValues;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Matrix;
import android.media.AudioManager;
import android.media.ExifInterface;
import android.media.MediaMetadataRetriever;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.speech.RecognizerIntent;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
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
import android.webkit.WebResourceResponse;
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
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

public class MainActivity extends AppCompatActivity implements TextToSpeech.OnInitListener {
    private static final int REQ_PERMS = 1001;
    private static final int REQ_FILE_CHOOSER = 1002;
    private static final int REQ_VOICE_SONG = 1003;
    private static final int REQ_VOICE_GENERIC = 1004;
    private static final String LIVE_APP_URL = "https://mikyasstudio.com.tr/kamera_asistan/";
    private static final String BACKUP_APP_URL = "https://cengiz145.github.io/mikyasgame/kamera_asistan/";
    private static final String LOCAL_FALLBACK_URL = "file:///android_asset/www/index.html";
    public static volatile boolean isAppInForeground = false;
    private WebView webView;
    private ValueCallback<Uri[]> filePathCallback;
    private String pendingSharedImageDataUrl = null;
    private String pendingSharedMultiImagesJsCall = null;
    private String pendingSharedVideoJsCall = null;
    private String pendingSharedTextJsCall = null;
    private String pendingInitialSpeech = null;
    private String pendingVoicePurpose = "song";
    private TextToSpeech nativeTts;
    private boolean nativeTtsReady = false;
    private boolean triedBackupServer = false;
    private AudioManager audioManager;
    private final AudioManager.OnAudioFocusChangeListener audioFocusListener = focusChange -> {
        if (focusChange == AudioManager.AUDIOFOCUS_LOSS ||
            focusChange == AudioManager.AUDIOFOCUS_LOSS_TRANSIENT ||
            focusChange == AudioManager.AUDIOFOCUS_LOSS_TRANSIENT_CAN_DUCK) {
            if (nativeTts != null) {
                try { nativeTts.stop(); } catch (Exception ignored) {}
            }
            runOnUiThread(() -> {
                if (webView != null) {
                    try {
                        webView.evaluateJavascript("if (typeof window.pauseAudioForIncomingCallOrFocusLoss === 'function') { window.pauseAudioForIncomingCallOrFocusLoss(); }", null);
                    } catch (Exception ignored) {}
                }
            });
        } else if (focusChange == AudioManager.AUDIOFOCUS_GAIN) {
            runOnUiThread(() -> {
                if (webView != null) {
                    try {
                        webView.evaluateJavascript("if (typeof window.resumeAudioAfterCallOrFocusGain === 'function') { window.resumeAudioAfterCallOrFocusGain(); }", null);
                    } catch (Exception ignored) {}
                }
            });
        }
    };
    private long lastVolumeUpTime = 0;
    private long lastVolumeDownTime = 0;

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

        nativeTts = new TextToSpeech(this, this);
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
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                if (request == null || request.getUrl() == null) return false;
                Uri uri = request.getUrl();
                String scheme = uri.getScheme() != null ? uri.getScheme().toLowerCase(Locale.ROOT) : "";
                String host = uri.getHost() != null ? uri.getHost().toLowerCase(Locale.ROOT) : "";
                String urlStr = uri.toString();

                if ("file".equals(scheme)) {
                    if (urlStr.endsWith("/android_asset/index.html") || urlStr.endsWith(".apk")) {
                        return true;
                    }
                    return false;
                }
                if (("https".equals(scheme) || "http".equals(scheme)) && (host.contains("mikyasstudio.com.tr") || host.contains("cengiz145.github.io"))) {
                    if (urlStr.endsWith(".apk") || !uri.getPath().contains("kamera_asistan")) {
                        return true;
                    }
                    return false;
                }
                try {
                    Intent extIntent = new Intent(Intent.ACTION_VIEW, uri);
                    extIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    startActivity(extIntent);
                    return true;
                } catch (Exception ignored) {
                    return true;
                }
            }

            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                if (request != null && request.getUrl() != null) {
                    Uri uri = request.getUrl();
                    String host = uri.getHost() != null ? uri.getHost().toLowerCase(Locale.ROOT) : "";
                    String path = uri.getPath() != null ? uri.getPath() : "";
                    if ((host.contains("mikyasstudio.com.tr") || host.contains("cengiz145.github.io")) && path.contains("/kamera_asistan")) {
                        String assetFile = "www/index.html";
                        String mimeType = "text/html";
                        if (path.endsWith("/app.js") || path.endsWith("app.js")) {
                            assetFile = "www/app.js";
                            mimeType = "application/javascript";
                        } else if (path.endsWith("/style.css") || path.endsWith("style.css")) {
                            assetFile = "www/style.css";
                            mimeType = "text/css";
                        } else if (path.endsWith("/manifest.json") || path.endsWith("manifest.json")) {
                            assetFile = "www/manifest.json";
                            mimeType = "application/json";
                        } else if (path.endsWith("/") || path.endsWith("/kamera_asistan") || path.endsWith("/index.html")) {
                            assetFile = "www/index.html";
                            mimeType = "text/html";
                        } else {
                            return super.shouldInterceptRequest(view, request);
                        }
                        try {
                            InputStream is = getAssets().open(assetFile);
                            Map<String, String> headers = new HashMap<>();
                            headers.put("Access-Control-Allow-Origin", "*");
                            headers.put("Cache-Control", "no-store");
                            return new WebResourceResponse(mimeType, "UTF-8", 200, "OK", headers, is);
                        } catch (Exception ignored) {}
                    }
                }
                return super.shouldInterceptRequest(view, request);
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                deliverPendingSharedImageToWebView();
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request != null && request.isForMainFrame()) {
                    if (!triedBackupServer) {
                        triedBackupServer = true;
                        view.loadUrl(BACKUP_APP_URL + "?t=" + (System.currentTimeMillis() / 60000L));
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
                        view.loadUrl(BACKUP_APP_URL + "?t=" + (System.currentTimeMillis() / 60000L));
                    } else {
                        view.loadUrl(LOCAL_FALLBACK_URL);
                    }
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
                    intent.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true);
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

    @Override
    public void onInit(int status) {
        if (status == TextToSpeech.SUCCESS && nativeTts != null) {
            nativeTts.setLanguage(new Locale("tr", "TR"));
            nativeTts.setSpeechRate(1.1f);
            nativeTts.setOnUtteranceProgressListener(new UtteranceProgressListener() {
                @Override
                public void onStart(String utteranceId) {}

                @Override
                public void onDone(String utteranceId) {
                    notifyJsSpeechDone();
                }

                @Override
                public void onError(String utteranceId) {
                    notifyJsSpeechDone();
                }

                private void notifyJsSpeechDone() {
                    runOnUiThread(() -> {
                        if (webView != null) {
                            try {
                                webView.evaluateJavascript("if (typeof window.notifyNativeSpeechFinished === 'function') { window.notifyNativeSpeechFinished(); }", null);
                            } catch (Exception ignored) {}
                        }
                    });
                }
            });
            nativeTtsReady = true;
            if (pendingInitialSpeech != null && !pendingInitialSpeech.trim().isEmpty()) {
                final String initialMsg = pendingInitialSpeech;
                pendingInitialSpeech = null;
                nativeTts.speak(initialMsg, TextToSpeech.QUEUE_FLUSH, null, "mikyas_native_tts_init");
            }
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
                } catch (Exception e) {
                    if (webView != null) {
                        webView.evaluateJavascript(
                            "if (typeof window.receiveRecognizedSongWordsFromAndroid === 'function') { window.receiveRecognizedSongWordsFromAndroid(''); }",
                            null
                        );
                    }
                }
            });
        }

        @JavascriptInterface
        public void startNativeVoiceCaptureForMode(final String purpose, final String promptText) {
            runOnUiThread(() -> {
                try {
                    pendingVoicePurpose = purpose != null ? purpose : "generic";
                    Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
                    intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
                    intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, "tr-TR");
                    intent.putExtra(RecognizerIntent.EXTRA_PROMPT, promptText != null ? promptText : "Lütfen konuşun...");
                    startActivityForResult(intent, REQ_VOICE_GENERIC);
                } catch (Exception e) {
                    if (webView != null) {
                        String safePurpose = (pendingVoicePurpose != null ? pendingVoicePurpose : "generic").replace("'", "");
                        webView.evaluateJavascript(
                            "if (typeof window.receiveNativeVoiceCaptureFromAndroid === 'function') { window.receiveNativeVoiceCaptureFromAndroid('" + safePurpose + "', ''); }",
                            null
                        );
                    }
                }
            });
        }

        @JavascriptInterface
        public void speakNativeTurkish(final String text, final boolean flush) {
            if (text == null || text.trim().isEmpty()) return;
            if (nativeTtsReady && nativeTts != null) {
                nativeTts.speak(
                    text,
                    flush ? TextToSpeech.QUEUE_FLUSH : TextToSpeech.QUEUE_ADD,
                    null,
                    "mikyas_native_tts"
                );
            } else {
                pendingInitialSpeech = text;
            }
        }

        @JavascriptInterface
        public void stopNativeSpeech() {
            if (nativeTtsReady && nativeTts != null) {
                try { nativeTts.stop(); } catch (Exception ignored) {}
            }
        }

        @JavascriptInterface
        public boolean isNativeSpeaking() {
            if (nativeTtsReady && nativeTts != null) {
                try { return nativeTts.isSpeaking(); } catch (Exception ignored) {}
            }
            return false;
        }

        @JavascriptInterface
        public void setNativeSpeechRate(final float rate) {
            if (nativeTtsReady && nativeTts != null) {
                try {
                    float clamped = Math.max(0.6f, Math.min(2.2f, rate));
                    nativeTts.setSpeechRate(clamped);
                } catch (Exception ignored) {}
            }
        }

        @JavascriptInterface
        public boolean copyToClipboard(final String label, final String text) {
            if (text == null) return false;
            try {
                ClipboardManager cm = (ClipboardManager) getSystemService(Context.CLIPBOARD_SERVICE);
                if (cm != null) {
                    ClipData clip = ClipData.newPlainText(label != null ? label : "MikyasKamera", text);
                    cm.setPrimaryClip(clip);
                    return true;
                }
            } catch (Exception ignored) {}
            return false;
        }

        @JavascriptInterface
        public boolean openExternalUrl(final String urlStr) {
            if (urlStr == null || urlStr.trim().isEmpty()) return false;
            try {
                Intent extIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(urlStr.trim()));
                extIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                startActivity(extIntent);
                return true;
            } catch (Exception ignored) {
                return false;
            }
        }

        @JavascriptInterface
        public boolean saveBase64PhotoToGallery(final String dataUrl) {
            if (dataUrl == null || !dataUrl.contains(",")) return false;
            try {
                String base64Part = dataUrl.substring(dataUrl.indexOf(',') + 1);
                byte[] bytes = Base64.decode(base64Part, Base64.DEFAULT);
                if (bytes == null || bytes.length == 0) return false;

                ContentValues values = new ContentValues();
                values.put(MediaStore.Images.Media.DISPLAY_NAME, "mikyas_kamera_" + System.currentTimeMillis() + ".jpg");
                values.put(MediaStore.Images.Media.MIME_TYPE, "image/jpeg");
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    values.put(MediaStore.Images.Media.RELATIVE_PATH, Environment.DIRECTORY_PICTURES + "/ErisilebilirKamera");
                }
                Uri uri = getContentResolver().insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, values);
                if (uri != null) {
                    try (OutputStream os = getContentResolver().openOutputStream(uri)) {
                        if (os != null) {
                            os.write(bytes);
                            os.flush();
                            return true;
                        }
                    }
                }
            } catch (Exception ignored) {}
            return false;
        }

        @JavascriptInterface
        public boolean launchGoogleHumToSearch() {
            try {
                Intent googleMusicIntent = new Intent("com.google.android.googlequicksearchbox.MUSIC_SEARCH");
                googleMusicIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                startActivity(googleMusicIntent);
                return true;
            } catch (Exception ignored) {}
            try {
                Intent stdMusicIntent = new Intent("android.intent.action.MUSIC_SEARCH");
                stdMusicIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                startActivity(stdMusicIntent);
                return true;
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
        String action = intent.getAction();
        String type = intent.getType();
        if (type == null || (!Intent.ACTION_SEND.equals(action) && !Intent.ACTION_SEND_MULTIPLE.equals(action))) return;

        if (Intent.ACTION_SEND.equals(action) && type.startsWith("text/")) {
            String sharedText = intent.getStringExtra(Intent.EXTRA_TEXT);
            if (sharedText != null && !sharedText.trim().isEmpty()) {
                String safeText = sharedText.replace("\\", "\\\\").replace("'", "\\'").replace("\r", " ").replace("\n", "\\n");
                pendingSharedTextJsCall = "if (typeof window.receiveSharedTextFromAndroid === 'function') { window.receiveSharedTextFromAndroid('" + safeText + "'); }";
                deliverPendingSharedImageToWebView();
            }
            return;
        }

        Uri mediaUri = null;
        final ArrayList<Uri> multiImageUris = new ArrayList<>();
        if (Intent.ACTION_SEND_MULTIPLE.equals(action)) {
            ArrayList<Uri> streamList = intent.getParcelableArrayListExtra(Intent.EXTRA_STREAM);
            if (streamList != null && !streamList.isEmpty()) {
                mediaUri = streamList.get(0);
                if (type.startsWith("image/") && streamList.size() > 1) {
                    for (int i = 0; i < Math.min(6, streamList.size()); i++) {
                        if (streamList.get(i) != null) {
                            multiImageUris.add(streamList.get(i));
                        }
                    }
                }
            }
        } else {
            mediaUri = intent.getParcelableExtra(Intent.EXTRA_STREAM);
        }
        if (mediaUri == null) return;

        if (type.startsWith("image/") && multiImageUris.size() > 1) {
            new Thread(() -> {
                StringBuilder jsArr = new StringBuilder("[");
                boolean firstImg = true;
                for (Uri u : multiImageUris) {
                    String dUrl = decodeUriToBase64DataUrl(u, 1280);
                    if (dUrl != null) {
                        if (!firstImg) jsArr.append(",");
                        jsArr.append("'").append(dUrl).append("'");
                        firstImg = false;
                    }
                }
                jsArr.append("]");
                if (!firstImg) {
                    final String builtMulti = "if (typeof window.receiveSharedMultiplePhotosFromAndroid === 'function') { window.receiveSharedMultiplePhotosFromAndroid(" + jsArr.toString() + "); }";
                    runOnUiThread(() -> {
                        pendingSharedMultiImagesJsCall = builtMulti;
                        deliverPendingSharedImageToWebView();
                    });
                }
            }).start();
            return;
        }

        if (type.startsWith("image/")) {
            final Uri imageUri = mediaUri;
            new Thread(() -> {
                final String dataUrl = decodeUriToBase64DataUrl(imageUri, 1280);
                if (dataUrl != null) {
                    runOnUiThread(() -> {
                        pendingSharedImageDataUrl = dataUrl;
                        deliverPendingSharedImageToWebView();
                    });
                }
            }).start();
        } else if (type.startsWith("video/")) {
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

    private String decodeUriToBase64DataUrl(Uri imageUri, int maxDim) {
        if (imageUri == null) return null;
        int rotationDegrees = 0;
        try (InputStream exifStream = getContentResolver().openInputStream(imageUri)) {
            if (exifStream != null) {
                ExifInterface exif = new ExifInterface(exifStream);
                int orientation = exif.getAttributeInt(ExifInterface.TAG_ORIENTATION, ExifInterface.ORIENTATION_NORMAL);
                if (orientation == ExifInterface.ORIENTATION_ROTATE_90) rotationDegrees = 90;
                else if (orientation == ExifInterface.ORIENTATION_ROTATE_180) rotationDegrees = 180;
                else if (orientation == ExifInterface.ORIENTATION_ROTATE_270) rotationDegrees = 270;
            }
        } catch (Exception ignored) {}

        int sampleSize = 1;
        try (InputStream boundsStream = getContentResolver().openInputStream(imageUri)) {
            if (boundsStream != null) {
                BitmapFactory.Options boundsOpts = new BitmapFactory.Options();
                boundsOpts.inJustDecodeBounds = true;
                BitmapFactory.decodeStream(boundsStream, null, boundsOpts);
                int rawW = boundsOpts.outWidth;
                int rawH = boundsOpts.outHeight;
                while ((rawW / sampleSize) > maxDim * 2 || (rawH / sampleSize) > maxDim * 2) {
                    sampleSize *= 2;
                }
            }
        } catch (Exception ignored) {}

        try (InputStream is = getContentResolver().openInputStream(imageUri)) {
            if (is != null) {
                BitmapFactory.Options decodeOpts = new BitmapFactory.Options();
                decodeOpts.inSampleSize = sampleSize;
                Bitmap rawBmp = BitmapFactory.decodeStream(is, null, decodeOpts);
                if (rawBmp != null) {
                    if (rotationDegrees != 0) {
                        Matrix matrix = new Matrix();
                        matrix.postRotate(rotationDegrees);
                        Bitmap rotatedBmp = Bitmap.createBitmap(rawBmp, 0, 0, rawBmp.getWidth(), rawBmp.getHeight(), matrix, true);
                        if (rotatedBmp != rawBmp) {
                            rawBmp.recycle();
                            rawBmp = rotatedBmp;
                        }
                    }
                    int w = rawBmp.getWidth();
                    int h = rawBmp.getHeight();
                    Bitmap targetBmp = rawBmp;
                    if (w > maxDim || h > maxDim) {
                        float scale = Math.min((float) maxDim / w, (float) maxDim / h);
                        targetBmp = Bitmap.createScaledBitmap(
                            rawBmp,
                            Math.max(1, Math.round(w * scale)),
                            Math.max(1, Math.round(h * scale)),
                            true
                        );
                        if (targetBmp != rawBmp) {
                            rawBmp.recycle();
                        }
                    }
                    ByteArrayOutputStream bos = new ByteArrayOutputStream();
                    targetBmp.compress(Bitmap.CompressFormat.JPEG, 88, bos);
                    targetBmp.recycle();
                    String base64 = Base64.encodeToString(bos.toByteArray(), Base64.NO_WRAP);
                    return "data:image/jpeg;base64," + base64;
                }
            }
        } catch (Exception ignored) {}
        return null;
    }

    private void deliverPendingSharedImageToWebView() {
        attemptDeliverSharedMedia(12);
    }

    @Override
    protected void onResume() {
        super.onResume();
        isAppInForeground = true;
        deliverPendingAccessibilityRescueScreen();
        if (webView != null) {
            webView.postDelayed(() -> {
                if (webView != null && isAppInForeground) {
                    try {
                        webView.evaluateJavascript("if (typeof window.resumeFromAndroidForeground === 'function') { window.resumeFromAndroidForeground(); }", null);
                    } catch (Exception ignored) {}
                }
            }, 300);
        }
    }

    private void deliverPendingAccessibilityRescueScreen() {
        final String rescueDataUrl = MikyasOverlayAccessibilityService.latestCapturedScreenDataUrl;
        final String rescueSummary = MikyasOverlayAccessibilityService.latestCapturedScreenSummary;
        if (rescueDataUrl == null || webView == null) return;
        MikyasOverlayAccessibilityService.latestCapturedScreenDataUrl = null;
        MikyasOverlayAccessibilityService.latestCapturedScreenSummary = null;

        webView.postDelayed(() -> {
            if (webView == null) return;
            String safeSummary = (rescueSummary != null ? rescueSummary : "").replace("\\", "\\\\").replace("'", "\\'").replace("\n", " ");
            String js = "if (typeof window.receiveAccessibilityScreenRescueFromAndroid === 'function') { window.receiveAccessibilityScreenRescueFromAndroid('" + rescueDataUrl + "', '" + safeSummary + "'); }";
            webView.evaluateJavascript(js, null);
        }, 400);
    }

    private void attemptDeliverSharedMedia(final int retriesLeft) {
        if (webView == null || retriesLeft <= 0) return;
        if (pendingSharedImageDataUrl == null && pendingSharedMultiImagesJsCall == null && pendingSharedVideoJsCall == null && pendingSharedTextJsCall == null) return;

        webView.postDelayed(() -> {
            if (webView == null) return;
            webView.evaluateJavascript(
                "(typeof window.receiveSharedPhotoFromAndroid === 'function' && typeof window.receiveSharedVideoFramesFromAndroid === 'function')",
                value -> {
                    if ("true".equals(value)) {
                        if (pendingSharedMultiImagesJsCall != null) {
                            final String multiCall = pendingSharedMultiImagesJsCall;
                            pendingSharedMultiImagesJsCall = null;
                            webView.evaluateJavascript(multiCall, null);
                        }
                        if (pendingSharedImageDataUrl != null) {
                            final String payload = pendingSharedImageDataUrl;
                            pendingSharedImageDataUrl = null;
                            String js = "window.receiveSharedPhotoFromAndroid('" + payload + "');";
                            webView.evaluateJavascript(js, null);
                        }
                        if (pendingSharedVideoJsCall != null) {
                            final String jsCall = pendingSharedVideoJsCall;
                            pendingSharedVideoJsCall = null;
                            webView.evaluateJavascript(jsCall, null);
                        }
                        if (pendingSharedTextJsCall != null) {
                            final String txtCall = pendingSharedTextJsCall;
                            pendingSharedTextJsCall = null;
                            webView.evaluateJavascript(txtCall, null);
                        }
                    } else {
                        attemptDeliverSharedMedia(retriesLeft - 1);
                    }
                }
            );
        }, 450);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == REQ_FILE_CHOOSER) {
            if (filePathCallback == null) return;
            Uri[] results = null;
            if (resultCode == Activity.RESULT_OK && data != null) {
                if (data.getClipData() != null && data.getClipData().getItemCount() > 0) {
                    int count = data.getClipData().getItemCount();
                    ArrayList<Uri> uriList = new ArrayList<>();
                    for (int i = 0; i < count; i++) {
                        Uri clipUri = data.getClipData().getItemAt(i).getUri();
                        if (clipUri != null) {
                            uriList.add(clipUri);
                        }
                    }
                    if (!uriList.isEmpty()) {
                        results = uriList.toArray(new Uri[0]);
                    }
                } else if (data.getDataString() != null) {
                    results = new Uri[]{Uri.parse(data.getDataString())};
                } else if (data.getData() != null) {
                    results = new Uri[]{data.getData()};
                }
            }
            filePathCallback.onReceiveValue(results);
            filePathCallback = null;
        } else if (requestCode == REQ_VOICE_SONG) {
            String spoken = "";
            if (resultCode == Activity.RESULT_OK && data != null) {
                ArrayList<String> matches = data.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS);
                if (matches != null && !matches.isEmpty() && matches.get(0) != null) {
                    spoken = matches.get(0).replace("\\", "\\\\").replace("'", "\\'").replace("\r", " ").replace("\n", " ");
                }
            }
            if (webView != null) {
                webView.evaluateJavascript(
                    "if (typeof window.receiveRecognizedSongWordsFromAndroid === 'function') { window.receiveRecognizedSongWordsFromAndroid('" + spoken + "'); }",
                    null
                );
            }
        } else if (requestCode == REQ_VOICE_GENERIC) {
            String spoken = "";
            if (resultCode == Activity.RESULT_OK && data != null) {
                ArrayList<String> matches = data.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS);
                if (matches != null && !matches.isEmpty() && matches.get(0) != null) {
                    spoken = matches.get(0).replace("\\", "\\\\").replace("'", "\\'").replace("\r", " ").replace("\n", " ");
                }
            }
            if (webView != null) {
                String safePurpose = (pendingVoicePurpose != null ? pendingVoicePurpose : "generic").replace("'", "");
                webView.evaluateJavascript(
                    "if (typeof window.receiveNativeVoiceCaptureFromAndroid === 'function') { window.receiveNativeVoiceCaptureFromAndroid('" + safePurpose + "', '" + spoken + "'); }",
                    null
                );
            }
        }
    }

    private void loadAssistantApp() {
        // Güvenli HTTPS üzerinden en güncel sürümü doğrudan yükler.
        // İnternet yoksa WebViewClient.onReceivedError otomatik olarak çevrimdışı yerel kopyayı (LOCAL_FALLBACK_URL) açar.
        webView.loadUrl(LIVE_APP_URL + "?t=" + (System.currentTimeMillis() / 60000L));
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        loadAssistantApp();
        if (webView != null) {
            webView.postDelayed(() -> {
                if (webView != null) {
                    webView.evaluateJavascript("if (typeof window.retryCameraAfterAndroidPermission === 'function') { window.retryCameraAfterAndroidPermission(); }", null);
                }
            }, 600);
        }
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (event != null && event.getRepeatCount() > 0) {
            return super.onKeyDown(keyCode, event);
        }
        // Ses Açma Tuşu: Tek basışta telefonun sesini normal açar; hızlı çift basışta Fotoğraf / Sınav Kağıdı Çeker (Space Kısayolu)
        if (keyCode == KeyEvent.KEYCODE_VOLUME_UP) {
            long now = System.currentTimeMillis();
            if (now - lastVolumeUpTime < 450) {
                lastVolumeUpTime = 0;
                webView.evaluateJavascript("window.dispatchEvent(new KeyboardEvent('keydown', {code: 'Space', key: ' '}));", null);
                return true;
            }
            lastVolumeUpTime = now;
            return super.onKeyDown(keyCode, event);
        }
        // Ses Kısma Tuşu: Tek basışta telefonun sesini normal kısar; hızlı çift basışta Son Söyleneni Tekrar Okur (T Kısayolu)
        if (keyCode == KeyEvent.KEYCODE_VOLUME_DOWN) {
            long now = System.currentTimeMillis();
            if (now - lastVolumeDownTime < 450) {
                lastVolumeDownTime = 0;
                webView.evaluateJavascript("window.dispatchEvent(new KeyboardEvent('keydown', {code: 'KeyT', key: 't'}));", null);
                return true;
            }
            lastVolumeDownTime = now;
            return super.onKeyDown(keyCode, event);
        }
        return super.onKeyDown(keyCode, event);
    }

    @Override
    protected void onPause() {
        isAppInForeground = false;
        if (nativeTts != null) {
            try { nativeTts.stop(); } catch (Exception ignored) {}
        }
        if (webView != null) {
            try {
                webView.evaluateJavascript("if (typeof window.pauseBackgroundHardwareAndAudio === 'function') { window.pauseBackgroundHardwareAndAudio(); } else if (typeof window.stopAllSpeechImmediately === 'function') { window.stopAllSpeechImmediately(); }", null);
            } catch (Exception ignored) {}
        }
        super.onPause();
    }

    @Override
    protected void onDestroy() {
        isAppInForeground = false;
        if (audioManager != null) {
            try { audioManager.abandonAudioFocus(audioFocusListener); } catch (Exception ignored) {}
        }
        if (nativeTts != null) {
            try {
                nativeTts.stop();
                nativeTts.shutdown();
            } catch (Exception ignored) {}
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

    @Override
    @SuppressWarnings("deprecation")
    public void onBackPressed() {
        if (nativeTts != null) {
            try {
                if (nativeTts.isSpeaking()) {
                    nativeTts.stop();
                    return;
                }
            } catch (Exception ignored) {}
        }
        if (webView != null) {
            webView.evaluateJavascript(
                    "(function(){ try { return (typeof window.handleAndroidBackButton === 'function') ? Boolean(window.handleAndroidBackButton()) : false; } catch(e) { return false; } })()",
                    value -> {
                        if ("true".equals(value)) {
                            return;
                        }
                        if (webView.canGoBack()) {
                            webView.goBack();
                        } else {
                            MainActivity.super.onBackPressed();
                        }
                    }
            );
        } else {
            super.onBackPressed();
        }
    }
}
