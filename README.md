# 🏥 Nöbetçi Eczanem — Türkiye Geneli 81 İl & 973 İlçe Canlı Nöbetçi Eczane ve Navigasyon Platformu

> **Nöbetçi Eczanem**, Türkiye'nin 81 ili ve 973 ilçesinde nöbet tutan eczaneleri anlık olarak listeleyen, canlı GPS mesafesi hesaplayan, tam detaylı açık adres ve belirgin konum tarifleri (`Tarif: ...`) sunan, tek tıkla arama ve navigasyon başlatan modern, yüksek performanslı bir sağlık platformudur.

---

## 📑 İçindekiler
1. [Proje Hakkında & Temel Özellikler](#-proje-hakkında--temel-özellikler)
2. [Google & Arama Motorları (SEO) Optimizasyonu ve Anahtar Kelimeler](#-google--arama-motorları-seo-optimizasyonu-ve-anahtar-kelimeler)
3. [Kullanıcı Rehberi: İnsanların Bilmesi Gereken Tüm Detaylar](#-kullanıcı-rehberi-insanların-bilmesi-gereken-tüm-detaylar)
4. [Veri Kaynakları & Akıllı Önbellek (Kota Koruma) Mimarisi](#-veri-kaynakları--akıllı-önbellek-kota-koruma-mimarisi)
5. [Adres & Konum Tarifi Doğrulama Standartları](#-adres--konum-tarifi-doğrulama-standartları)
6. [Teknik Altyapı & Kurulum](#-teknik-altyapı--kurulum)
7. [Mevzuat & Yasal Dayanak](#-mevzuat--yasal-dayanak)

---

## 🌟 Proje Hakkında & Temel Özellikler

Nöbetçi Eczanem, acil ilaç ihtiyacı duyan vatandaşların en doğru, güncel ve resmi nöbetçi eczane bilgisine **en hızlı ve engelsiz şekilde** ulaşması amacıyla geliştirilmiştir.

- **📍 Otomatik Canlı GPS & Mesafe Sıralaması:** Tek bir butonla kullanıcının konumunu alır ve en yakın nöbetçi eczaneden uzağa doğru kilometre bazında hassas mesafe ile sıralar.
- **🏷️ Tam Detaylı Açık Adres & Sarı Zeminli Konum Tarifi:** Her eczane kartında mahalle, cadde, sokak ve kapı numarası eksiksiz yer alır. Altında belirgin sarı zeminli `Tarif: [Devlet Hastanesi Karşısı / ASM Yanı vb.]` kutucuğu bulunur.
- **📞 Tek Tıkla Arama:** Numarayı tek satırda ve boşluklu düzende gösterir, mobil cihazlarda doğrudan arama başlatır.
- **🧭 Google Haritalar Entegrasyonu:** Koordinat bazlı hassas rota ve yol tarifi sunar.
- **📅 3 Günlük Nöbet Çizelgesi (Dün, Bugün, Yarın):** Sabah saatlerinde nöbet devir teslimini kaçırmamak için dün, bugün ve yarının nöbet listelerini tek dokunuşla görüntüler.
- **🇹🇷 81 İl ve 973 İlçe Desteği:** Türkiye'nin tüm illeri ve tüm ilçeleri sisteme eksiksiz kayıtlıdır.

---

## 🔍 Google & Arama Motorları (SEO) Optimizasyonu ve Anahtar Kelimeler

Platform, Google, Yandex ve Bing gibi arama motorlarında **en üst sıralarda yer almak** üzere tasarlanmış kapsamlı bir SEO mimarisine sahiptir:

### 1. Hedeflenen Organik Arama Terimleri & Anahtar Kelimeler
* **Şehir & İlçe Aramaları:** `İstanbul nöbetçi eczane`, `Kadıköy nöbetçi eczaneler bu gece`, `Ankara Çankaya açık eczane`, `İzmir Konak nöbetçi eczane`, `Bursa Nilüfer nöbetçi eczane`, `Antalya Muratpaşa nöbetçi eczaneler`.
* **Zaman & Acil Durum Aramaları:** `Bugün nöbetçi eczane kim`, `Yarın açık olan eczaneler`, `Gece açık eczane en yakın`, `Pazar günü açık eczane`, `Resmi tatilde nöbetçi eczaneler`, `Bayramda açık eczane listesi`.
* **Konum & İlaç Odaklı Aramalar:** `En yakın nöbetçi eczane nerede`, `Devlet hastanesi civarı nöbetçi eczane`, `e-reçete nöbetçi eczaneden alınır mı`, `Nöbetçi eczanede ilaç fiyat farkı var mı`.

### 2. Schema.org Yapılandırılmış Veri (JSON-LD)
Arama motoru botlarının eczane verilerini zengin snippet (Rich Results) olarak dizine eklemesi için `MedicalBusiness` ve `Pharmacy` şemaları uygulanmıştır:
* Eczane Resmi Adı (`legalName`, `name`)
* Coğrafi Konum Koordinatları (`geo`: `latitude`, `longitude`)
* Açık Adres ve Posta Kodu (`addressCountry: TR`, `addressLocality`, `streetAddress`)
* Telefon Numarası (`telephone`)
* Çalışma / Nöbet Saatleri (`openingHoursSpecification`: 7/24 nöbet vardiyaları)

### 3. OpenGraph ve Sosyal Paylaşım Kartları
WhatsApp, Telegram, X (Twitter), Facebook gibi platformlarda paylaşıldığında dinamik önizleme başlığı, açıklaması ve görsel kartları otomatik üretilir.

---

## 📖 Kullanıcı Rehberi: İnsanların Bilmesi Gereken Tüm Detaylar

### 1. Nöbetçi Eczane Çalışma Saatleri Nedir?
* Normal eczaneler hafta içi ve Cumartesi günleri mesai bitimine kadar çalışır.
* **Nöbetçi Eczaneler**, akşam mesai bitiminden başlayarak **ertesi sabah saat 09:00'a kadar** (24 saat kesintisiz) hizmet verir.
* Pazar günleri ve resmi tatillerde nöbetçi eczaneler gün boyunca 24 saat açıktır.

### 2. Nöbetçi Eczanede İlaç Fiyatı Değişir mi?
* **HAYIR.** Türkiye Cumhuriyeti Sağlık Bakanlığı ve Türkiye İlaç ve Tıbbi Cihaz Kurumu (TİTCK) mevzuatına göre tüm eczanelerde ilaç fiyatları sabittir. Nöbet saatlerinde ekstra nöbet ücreti, gece tarifesi veya ek fiyat farkı alınamaz.

### 3. e-Reçete ve Raporlu İlaçlar Nöbetçi Eczaneden Alınabilir mi?
* **EVET.** Nöbetçi eczaneler SGK Medula sistemine 7/24 bağlıdır. T.C. kimlik numaranız ve doktorunuzun verdiği e-reçete numarası ile tüm reçeteli ve raporlu ilaçlarınızı resmi katkı payı kurallarıyla alabilirsiniz.

### 4. Gitmeden Önce Telefonla Teyit Etmek Gerekir mi?
* Çok acil ve nadir bulunan ilaçlar için yola çıkmadan önce kart üzerindeki **"Telefon Et"** butonuna basarak eczaneyle irtibat kurmanız ve ilacın stok durumunu teyit etmeniz tavsiye edilir.

---

## 🌐 Veri Kaynakları & Akıllı Önbellek (Kota Koruma) Mimarisi

Nöbetçi Eczanem, çoklu sağlayıcı ve akıllı failover mimarisiyle çalışır:

| Veri Kaynağı | Rolü & Kapsamı | Kota & Hız Limiti | Önbellek / TTL |
| :--- | :--- | :--- | :--- |
| **EczaneAPI.com** | Birincil Resmi API (54 Eczacı Odası verisi) | Aylık 200 Sorgu Kotası | Sabah 09:00 TTL |
| **EczaneAdresi.com Public v1** | Kamu Nöbet Listesi & Koordinat Havuzu | 60 istek / dk / IP | 1 Saatlik Önbellek |
| **RapidAPI Nöbetçi Eczane** | Failover Yedek Bulut Entegrasyonu | Aylık 250 İstek Kapasitesi | Günlük Senkron |
| **Resmi Eczacı Odaları (TEB)** | Yasal Nöbet Çizelgeleri Referansı | 81 İl / 973 İlçe Doğrulama | Resmi Onay Tarihi |
| **Akıllı Sunucu Önbelleği** | Sıfır Kota Harcama & Yüksek Hız Motoru | Sınırsız Kullanıcı Desteği | 09:00 Devir Saati |

### Akıllı Kota Koruma Mantığı
1. **İl Düzeyinde Tekil Çekim:** Bir kullanıcı örneğin "İstanbul" ilini seçtiğinde, arka planda o ilin dün, bugün ve yarınki **tüm ilçe nöbet listeleri tek bir API çağrısıyla** belleğe alınır.
2. **Sıfır Maliyetli İlçe Gezintisi:** Kullanıcı "Kadıköy", "Beşiktaş", "Üsküdar" gibi ilçeler arasında geçiş yaptığında dış API'ye **hiçbir yeni istek atılmaz**; veri anında yerel bellekten süzülür.
3. **GPS Koordinat Kümeleme:** GPS yakınlık aramalarında koordinatlar 2 ondalık basamağa (~1.1 km) yuvarlanarak aynı bölgedeki sonraki sorgular için kota harcanması engellenir.

---

## 🗺️ Adres & Konum Tarifi Doğrulama Standartları

Platformdaki her eczane kaydında adres gösterimi katı standartlara bağlanmıştır:
1. **Net Açık Adres:** `[Mahalle], [Cadde/Sokak] No: [Kapı No], [İlçe] / [İl]` düzeninde sunulur.
2. **Sarı Zeminli Vurgulu Konum Tarifi:** `Tarif: [Örn. Kadıköy Devlet Hastanesi Acil Servisi Karşısı]` şeklinde yüksek kontrastlı sarı zemin üzerinde gösterilerek gece vakti bulunabilirliği artırılır.
3. **Coğrafi Koordinatlar:** Google Haritalar ile uyumlu hassas enlem/boylam noktaları kullanılır.

---

## 💻 Teknik Altyapı & Kurulum

### Kullanılan Teknolojiler
* **Frontend:** React 18, TypeScript, Tailwind CSS, Lucide Icons, Sonner (Toast bildirimleri), Wouter (Hafif istemci yönlendirici).
* **Backend:** Node.js, Express, ESBuild / TSX, Akıllı Önbellek Servisi, Kota Yönetim Servisi.
* **SEO & Standartlar:** OpenGraph Meta, Schema.org JSON-LD, WCAG AA Erişilebilirlik.

### Geliştirme Ortamı Kurulumu

```bash
# 1. Depoyu klonlayın
git clone https://github.com/kullanici/nobetci-eczanem.git
cd nobetci-eczanem

# 2. Bağımlılıkları yükleyin
npm install

# 3. Geliştirme sunucusunu başlatın
npm run dev

# 4. Üretim (Production) derlemesi oluşturun
npm run build
npm start
```

---

## ⚖️ Mevzuat & Yasal Dayanak

Nöbetçi Eczanem platformu, **6197 sayılı Eczacılar ve Eczaneler Hakkında Kanun**, **Eczacılar ve Eczaneler Hakkında Yönetmelik** ve **Türk Eczacıları Birliği (TEB)** nöbet esaslarına uygun olarak bilgilendirme amacıyla hazırlanmıştır. 

* *Acil durumlarda lütfen vakit kaybetmeden **112 Acil Çağrı Merkezi**'ni arayınız.*
* *İlaç ve sağlık danışma konularında T.C. Sağlık Bakanlığı **ALO 184 SABİM** hattından ücretsiz bilgi alabilirsiniz.*

---

**© 2026 Nöbetçi Eczanem. Türkiye Geneli Kesintisiz Sağlık ve Nöbet Rehberi.**
