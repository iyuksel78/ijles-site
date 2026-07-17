# IJLES statik web sitesi

Bu klasör, WordPress'e ihtiyaç duymadan çalışan bağımsız IJLES web sitesidir.

## Bilgisayarda çalıştırma

En kolay yöntem:

1. `ijles-site` klasörünü açın.
2. `index.html` dosyasına çift tıklayın.

Alternatif olarak yerel sunucuda çalıştırmak için:

```powershell
cd C:\VCode\ijles-site
python -m http.server 8000
```

Sonra tarayıcıda şu adresi açın:

```text
http://localhost:8000
```

## Dosya yapısı

- `index.html`: Sayfa içeriği ve bölümler
- `styles.css`: Tüm görsel tasarım
- `script.js`: Mobil menü davranışı
- `assets/ijles-hero.png`: Ana sayfa görseli

## Alan adına yükleme

Name.com üzerinden hosting veya statik dosya barındırma hizmeti bağladığınızda, `ijles-site` klasörünün içindeki dosyaları sitenin ana dizinine yüklemeniz yeterlidir.

Gerçek editör adları, ISSN, DOI, indeks kayıtları ve güncel sayı bilgileri kesinleştiğinde `index.html` içindeki ilgili metinler değiştirilebilir.
