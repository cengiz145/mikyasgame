package tr.com.mikyasstudio.kameraasistani;

import android.accessibilityservice.AccessibilityService;
import android.graphics.Bitmap;
import android.graphics.ColorSpace;
import android.hardware.HardwareBuffer;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.speech.tts.TextToSpeech;
import android.view.Display;
import android.view.KeyEvent;
import android.view.accessibility.AccessibilityEvent;
import androidx.annotation.NonNull;
import java.util.Locale;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * WhatsApp "Cihaz Bağla" veya Bilgisayar Karekod (QR) ekranları açıkken arka planda ekranı
 * analiz edip bilgisayar ekranının konumunu Türkçe sesle söyleyen Erişilebilirlik Servisi.
 * Ses Açma tuşuna çift basıldığında 15 saniyelik canlı ekran hizalama taramasını başlatır.
 */
public class MikyasOverlayAccessibilityService extends AccessibilityService implements TextToSpeech.OnInitListener {
    private TextToSpeech tts;
    private boolean ttsReady = false;
    private volatile boolean liveScanActive = false;
    private volatile int scanSessionId = 0;
    private long lastVolUpPress = 0;
    private long lastSpokenTime = 0;
    private final ExecutorService executor = Executors.newSingleThreadExecutor();
    private final Handler mainHandler = new Handler(Looper.getMainLooper());

    @Override
    public void onCreate() {
        super.onCreate();
        tts = new TextToSpeech(this, this);
    }

    @Override
    public void onInit(int status) {
        if (status == TextToSpeech.SUCCESS && tts != null) {
            tts.setLanguage(new Locale("tr", "TR"));
            tts.setSpeechRate(1.1f);
            ttsReady = true;
        }
    }

    private void speakTurkish(String message, boolean force) {
        if (!ttsReady || tts == null) return;
        long now = System.currentTimeMillis();
        if (!force && now - lastSpokenTime < 2400) return;
        lastSpokenTime = now;
        tts.speak(message, force ? TextToSpeech.QUEUE_FLUSH : TextToSpeech.QUEUE_ADD, null, "mikyas_qr_guide");
    }

    @Override
    protected boolean onKeyEvent(KeyEvent event) {
        if (event.getAction() == KeyEvent.ACTION_DOWN && event.getKeyCode() == KeyEvent.KEYCODE_VOLUME_UP) {
            long now = System.currentTimeMillis();
            if (now - lastVolUpPress < 450) {
                liveScanActive = !liveScanActive;
                scanSessionId++;
                mainHandler.removeCallbacksAndMessages(null);
                if (liveScanActive) {
                    final int currentSession = scanSessionId;
                    speakTurkish("Sesli ekran ortalama radarı devreye girdi. Telefonu bilgisayar ekranına tutun.", true);
                    triggerPeriodicScreenAnalysis(8, currentSession);
                } else {
                    speakTurkish("Ekran radarı kapatıldı.", true);
                }
                lastVolUpPress = 0;
                return true;
            }
            lastVolUpPress = now;
        }
        return super.onKeyEvent(event);
    }

    private void triggerPeriodicScreenAnalysis(final int remainingTicks, final int sessionId) {
        if (!liveScanActive || sessionId != scanSessionId || remainingTicks <= 0) {
            if (sessionId == scanSessionId) {
                liveScanActive = false;
            }
            return;
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            takeScreenshot(Display.DEFAULT_DISPLAY, executor, new TakeScreenshotCallback() {
                @Override
                public void onSuccess(@NonNull ScreenshotResult screenshotResult) {
                    try (HardwareBuffer buffer = screenshotResult.getHardwareBuffer()) {
                        if (!liveScanActive || sessionId != scanSessionId) {
                            return;
                        }
                        Bitmap hwBitmap = Bitmap.wrapHardwareBuffer(buffer, ColorSpace.get(ColorSpace.Named.SRGB));
                        if (hwBitmap != null) {
                            Bitmap soft = hwBitmap.copy(Bitmap.Config.ARGB_8888, false);
                            hwBitmap.recycle();
                            if (soft != null) {
                                String guidance = analyzeScreenBitmapForMonitorCenter(soft);
                                soft.recycle();
                                if (liveScanActive && sessionId == scanSessionId) {
                                    speakTurkish(guidance, false);
                                }
                            }
                        }
                    } catch (Throwable ignored) {}
                    if (liveScanActive && sessionId == scanSessionId) {
                        mainHandler.postDelayed(() -> triggerPeriodicScreenAnalysis(remainingTicks - 1, sessionId), 1600);
                    }
                }

                @Override
                public void onFailure(int errorCode) {
                    if (sessionId == scanSessionId) {
                        liveScanActive = false;
                    }
                }
            });
        } else {
            speakTurkish("Bu özellik Android 11 ve üzeri sürümlerde ekran okuma ile çalışır.", true);
            liveScanActive = false;
        }
    }

    private String analyzeScreenBitmapForMonitorCenter(Bitmap bmp) {
        int w = bmp.getWidth();
        int h = bmp.getHeight();
        int yStart = (int) (h * 0.18);
        int yEnd = (int) (h * 0.82);

        double sumX = 0, sumY = 0, weightSum = 0;
        int step = 8;

        for (int y = yStart; y < yEnd; y += step) {
            for (int x = step; x < w - step; x += step) {
                int p = bmp.getPixel(x, y);
                int r = (p >> 16) & 0xff;
                int g = (p >> 8) & 0xff;
                int b = p & 0xff;
                double lum = 0.299 * r + 0.587 * g + 0.114 * b;
                if (lum > 155) {
                    weightSum += lum;
                    sumX += x * lum;
                    sumY += y * lum;
                }
            }
        }

        if (weightSum < 5000) {
            return "Karşıda henüz parlak bilgisayar ekranı görünmüyor, telefonu ekrana doğru çevirin.";
        }

        double cx = sumX / weightSum;
        double cy = sumY / weightSum;
        double offX = (cx - w / 2.0) / (w / 2.0);
        double offY = (cy - h / 2.0) / (h / 2.0);

        StringBuilder sb = new StringBuilder();
        if (offX < -0.22) sb.append("biraz sola ");
        else if (offX > 0.22) sb.append("biraz sağa ");

        if (offY < -0.22) sb.append("ve yukarı kaldırın");
        else if (offY > 0.22) sb.append("ve aşağı indirin");

        if (sb.length() == 0) {
            return "Ekran tam ortalandı! Elinizi sabit tutun.";
        }
        return "Telefonu " + sb.toString().trim() + ".";
    }

    @Override
    public void onAccessibilityEvent(AccessibilityEvent event) {}

    @Override
    public void onInterrupt() {}

    @Override
    public void onDestroy() {
        liveScanActive = false;
        scanSessionId++;
        mainHandler.removeCallbacksAndMessages(null);
        executor.shutdownNow();
        if (tts != null) {
            tts.stop();
            tts.shutdown();
        }
        super.onDestroy();
    }
}

