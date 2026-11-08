package tr.com.mikyasstudio.kameraasistani;

import android.accessibilityservice.AccessibilityService;
import android.graphics.Bitmap;
import android.graphics.ColorSpace;
import android.hardware.HardwareBuffer;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.speech.tts.TextToSpeech;
import android.util.Base64;
import android.view.Display;
import android.view.KeyEvent;
import android.view.accessibility.AccessibilityEvent;
import androidx.annotation.NonNull;
import java.io.ByteArrayOutputStream;
import java.util.Locale;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * Görme engelli kullanıcılar için Resmi Erişilebilirlik Yardımcı Servisi (isAccessibilityTool="true"):
 * 1) Ses Açma tuşuna çift basıldığında: Bilgisayar ekranı ve karekod (QR) ortalama radarını çalıştırır.
 * 2) Ses Kısma tuşuna çift basıldığında: Erişilemeyen Uygulama Kurtarıcısı (Anlık Ekran Betimleme Köprüsü)
 *    olarak o anki ekran görüntüsünü bellekte analiz eder; etiketsiz butonların, afişlerin ve görsel
 *    bölgelerin ekranın neresinde (Üst, Orta, Alt) olduğunu seslendirir ve tam OCR analizi için
 *    Kamera Asistanı köprüsüne aktarır.
 */
public class MikyasOverlayAccessibilityService extends AccessibilityService implements TextToSpeech.OnInitListener {
    public static volatile String latestCapturedScreenDataUrl = null;
    public static volatile String latestCapturedScreenSummary = null;

    private TextToSpeech tts;
    private boolean ttsReady = false;
    private volatile boolean liveScanActive = false;
    private volatile int scanSessionId = 0;
    private long lastVolUpPress = 0;
    private long lastVolDownPress = 0;
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
        // Kamera Asistanı kendi ön planındayken ses tuşu çift basışlarını (Fotoğraf Çek / Son Söyleneni Tekrarla)
        // MainActivity.onKeyDown'un yakalaması için doğrudan uygulamaya bırak:
        if (MainActivity.isAppInForeground) {
            return super.onKeyEvent(event);
        }
        if (event.getRepeatCount() > 0) {
            return super.onKeyEvent(event);
        }
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
        if (event.getAction() == KeyEvent.ACTION_DOWN && event.getKeyCode() == KeyEvent.KEYCODE_VOLUME_DOWN) {
            long now = System.currentTimeMillis();
            if (now - lastVolDownPress < 450) {
                lastVolDownPress = 0;
                triggerInstantScreenRescueBridge();
                return true;
            }
            lastVolDownPress = now;
        }
        return super.onKeyEvent(event);
    }

    /**
     * Erişilemeyen Uygulama Kurtarıcısı (Anlık Ekran Betimleme Köprüsü):
     * Resmi Android 11+ takeScreenshot API'sini kullanarak ekran görüntüsünü tamamen bellekte analiz eder,
     * etiketsiz butonların ve görsel afişlerin ekran bölgelerini (Üst, Orta, Alt) anında seslendirir.
     */
    private void triggerInstantScreenRescueBridge() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.R) {
            speakTurkish("Erişilemeyen uygulama ekran kurtarıcısı Android 11 ve üzeri sürümlerde çalışır.", true);
            return;
        }
        speakTurkish("Erişilemeyen ekran kurtarıcısı devrede, ekran analiz ediliyor.", true);
        takeScreenshot(Display.DEFAULT_DISPLAY, executor, new TakeScreenshotCallback() {
            @Override
            public void onSuccess(@NonNull ScreenshotResult screenshotResult) {
                try (HardwareBuffer buffer = screenshotResult.getHardwareBuffer()) {
                    Bitmap hwBitmap = Bitmap.wrapHardwareBuffer(buffer, ColorSpace.get(ColorSpace.Named.SRGB));
                    if (hwBitmap != null) {
                        Bitmap soft = hwBitmap.copy(Bitmap.Config.ARGB_8888, false);
                        hwBitmap.recycle();
                        if (soft != null) {
                            String summary = analyzeUnlabelledScreenRegions(soft);
                            int w = soft.getWidth();
                            int h = soft.getHeight();
                            int maxDim = 960;
                            Bitmap scaled = soft;
                            if (w > maxDim || h > maxDim) {
                                float ratio = Math.min((float) maxDim / w, (float) maxDim / h);
                                scaled = Bitmap.createScaledBitmap(
                                    soft,
                                    Math.max(1, Math.round(w * ratio)),
                                    Math.max(1, Math.round(h * ratio)),
                                    true
                                );
                            }
                            ByteArrayOutputStream bos = new ByteArrayOutputStream();
                            scaled.compress(Bitmap.CompressFormat.JPEG, 82, bos);
                            if (scaled != soft) {
                                scaled.recycle();
                            }
                            soft.recycle();
                            String b64 = Base64.encodeToString(bos.toByteArray(), Base64.NO_WRAP);
                            latestCapturedScreenDataUrl = "data:image/jpeg;base64," + b64;
                            latestCapturedScreenSummary = summary;
                            speakTurkish(summary, true);
                        }
                    }
                } catch (Throwable ignored) {}
            }

            @Override
            public void onFailure(int errorCode) {
                speakTurkish("Bu ekran güvenlik kısıtlaması nedeniyle görüntüyü paylaşmaya izin vermiyor.", true);
            }
        });
    }

    private String analyzeUnlabelledScreenRegions(Bitmap bmp) {
        int w = bmp.getWidth();
        int h = bmp.getHeight();
        int step = 8;
        long topEdges = 0, midEdges = 0, botEdges = 0;
        long topLeftCornerEdges = 0, topRightCornerEdges = 0, botRightFabEdges = 0;
        long botSatCount = 0, botSamples = 0;

        for (int y = step; y < h - step; y += step) {
            for (int x = step; x < w - step; x += step) {
                int p = bmp.getPixel(x, y);
                int pr = bmp.getPixel(x + step, y);
                int pd = bmp.getPixel(x, y + step);
                int lum = (((p >> 16) & 0xff) * 3 + ((p >> 8) & 0xff) * 6 + (p & 0xff)) / 10;
                int lumR = (((pr >> 16) & 0xff) * 3 + (((pr >> 8) & 0xff) * 6) + (pr & 0xff)) / 10;
                int lumD = (((pd >> 16) & 0xff) * 3 + (((pd >> 8) & 0xff) * 6) + (pd & 0xff)) / 10;
                int grad = Math.abs(lum - lumR) + Math.abs(lum - lumD);

                if (y < h * 0.14) {
                    if (x < w * 0.22 && grad > 42) topLeftCornerEdges++;
                    else if (x > w * 0.78 && grad > 42) topRightCornerEdges++;
                }
                if (y < h * 0.28) {
                    if (grad > 38) topEdges++;
                } else if (y < h * 0.72) {
                    if (grad > 38) midEdges++;
                } else {
                    if (grad > 38) botEdges++;
                    if (x > w * 0.74 && y > h * 0.78 && grad > 42) botRightFabEdges++;
                    int r = (p >> 16) & 0xff;
                    int g = (p >> 8) & 0xff;
                    int b = p & 0xff;
                    int maxC = Math.max(r, Math.max(g, b));
                    int minC = Math.min(r, Math.min(g, b));
                    if (maxC - minC > 55) botSatCount++;
                    botSamples++;
                }
            }
        }

        StringBuilder sb = new StringBuilder("Ekran düzeni özeti: ");
        if (topLeftCornerEdges > 18 || topRightCornerEdges > 18) {
            if (topLeftCornerEdges > 18 && topRightCornerEdges > 18) {
                sb.append("Sol üst köşede geri veya menü ikonu, sağ üst köşede kapatma veya sepet ikonu yer alıyor. ");
            } else if (topRightCornerEdges > 18) {
                sb.append("Sağ üst köşede kapatma, arama veya sepet ikonu yer alıyor. ");
            } else {
                sb.append("Sol üst köşede geri veya menü ikonu yer alıyor. ");
            }
        }
        if (topEdges > 120) {
            sb.append("Ekranın üst kısmında başlık ve görsel afiş alanı yer alıyor. ");
        }
        if (midEdges > 180) {
            sb.append("Orta kısımda ürün kartları, görseller veya liste öğeleri bulunuyor. ");
        }
        if (botSamples > 0 && ((double) botSatCount / botSamples > 0.14 || botEdges > 110)) {
            sb.append("Ekranın alt kısmında belirgin renkli bir onay veya devam düğmesi tespit edildi. ");
        } else if (botRightFabEdges > 20) {
            sb.append("Sağ alt köşede yüzen hızlı işlem düğmesi tespit edildi. ");
        }
        sb.append("Ekran üzerindeki tüm metinleri ve etiketsiz butonları dinlemek için Kamera Asistanı uygulamasına geçebilirsiniz.");
        return sb.toString();
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
    public void onInterrupt() {
        liveScanActive = false;
        scanSessionId++;
        mainHandler.removeCallbacksAndMessages(null);
        if (tts != null) {
            tts.stop();
        }
    }

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

