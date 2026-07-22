# IJLES Google Apps Script Kurulumu

Bu klasördeki `IJLES_Submission_Web_App.gs` dosyası, IJLES web sitesindeki yazar başvuru formunu ve hakem değerlendirme formunu Google Drive + Google Sheets + Gmail bildirimi ile çalıştırır.

## Google Drive Yapısı

Script ilk başarılı gönderimde aşağıdaki yapıyı otomatik oluşturur. Bu dosyalar, Apps Script projesini hangi Google hesabında deploy ettiysen o hesabın Drive alanında görünür.

- Ana klasör: `IJLES Editorial Office`
  - `00 Logs`
    - `IJLES Submission Log`
    - `IJLES Reviewer Report Log`
  - `01 Author Submissions`
    - `2026`
      - `IJLES-YYYYMMDD-HHMMSS - Manuscript Title`
  - `02 Reviewer Reports`
    - `2026`
      - `REV-YYYYMMDD-HHMMSS - Manuscript Title`

## Kurulum Adımları

1. Google hesabında https://script.google.com adresini aç.
2. `New project` seç.
3. Açılan `Code.gs` içeriğini tamamen sil.
4. Bu repodaki `apps-script/IJLES_Submission_Web_App.gs` dosyasındaki kodu kopyalayıp `Code.gs` içine yapıştır.
5. Project Settings veya üstteki proje adına tıklayarak proje adını `IJLES Submission Portal` yap.
6. `Deploy` > `New deployment` seç.
7. Type olarak `Web app` seç.
8. Ayarları şöyle yap:
   - Execute as: `Me`
   - Who has access: `Anyone`
9. `Deploy` butonuna bas.
10. Google izin ekranı açılırsa Drive, Sheets ve Mail izinlerini onayla.
11. Deploy sonucunda çıkan `Web app URL` adresini kopyala.
12. Bu URL'yi `site-config.js` içindeki `googleAppsScriptEndpoint` alanına yapıştır.
13. Daha önce deploy ettiysen `Deploy > Manage deployments > Edit` menüsünden `New version` seçerek güncelle. Böylece aynı Web App URL çalışmaya devam eder.

## Çalışma Mantığı

- Yazar `Submit Manuscript` formunu doldurunca dosya `01 Author Submissions / yıl / başvuru klasörü` içine kaydedilir.
- Başvuru bilgileri `IJLES Submission Log` Sheet dosyasına satır olarak yazılır.
- `ijlescontact@gmail.com` adresine başvuru bildirimi gönderilir.
- Hakem formu doldurulunca dosya ve metin raporu `02 Reviewer Reports / yıl / rapor klasörü` içine kaydedilir.
- Hakem kayıtları `IJLES Reviewer Report Log` Sheet dosyasına yazılır.
- Hakem bildirimi de `ijlescontact@gmail.com` adresine gönderilir.

## Not

Sitede endpoint URL boşken formlar e-posta yedeğine yönlendirir. Web App URL eklendikten sonra formlar Google Drive sistemine gönderim yapar.
