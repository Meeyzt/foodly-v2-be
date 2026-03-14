# PRD: QR Menü ve Restoran Operasyon Uygulaması

## 1. Ürün Özeti

Bu ürün, restoranlar için QR tabanlı dijital menü, sipariş ve operasyon yönetim platformudur. Müşteri menü üzerinden ürünleri inceleyip sepet oluşturabilir, aynı masa için birden fazla sipariş verebilir, restoran keşfedebilir, geçmiş siparişlerini görüntüleyebilir ve yorum bırakabilir. İşletme tarafı tek şubeli veya çok şubeli şekilde çalışabilir; genel menü, şubeye özel menü, ürün, kategori, kampanya, sipariş, masa hesabı ve performans yönetimini yapabilir. Sistem; işletme admini, şube müdürü ve şube çalışanı rollerini destekler. Çalışan tarafı ise QR okutarak sipariş doğrulama, masaya sipariş girme, hesap alma ve günlük operasyon verilerini takip etme işlemlerini yapar.

## 2. Amaç

Amaç, restoran içi sipariş süreçlerini hızlandırmak, operasyonel görünürlüğü artırmak ve müşteri deneyimini uçtan uca dijitalleştirmektir.

## 3. Hedefler

- Müşterinin menü üzerinden hızlı sipariş oluşturabilmesi
- Aynı masa için çoklu sipariş yönetimi
- QR doğrulama ile siparişin staff tarafından onaylanması
- İşletmenin ürün, kategori, kampanya ve sipariş operasyonlarını tek panelden yönetmesi
- Çok şubeli işletmeler için merkez ve şube bazlı yönetim sağlanması
- Rol bazlı yetkilendirme ile operasyonel kontrolün güvenli şekilde dağıtılması
- Staff'ın servis sürecini hızlı ve hatasız yürütmesi
- Restoranın performans ve ürün analitiğini takip edebilmesi

## 4. Kullanıcı Tipleri

- Müşteri
- İşletme admini / restoran sahibi
- Şube müdürü
- Şube çalışanı / garson / operasyon çalışanı

## 5. Problem Tanımı

Restoranlarda basılı menüler güncel kalmıyor, masa bazlı çoklu sipariş takibi zorlaşıyor, staff ile müşteri arasındaki sipariş doğrulama süreci verimsiz ilerliyor ve işletmeler ürün performansını yeterince ölçemiyor. Bu ürün, bu problemleri tek sistemde çözmeyi hedefler.

## 6. Başarı Kriterleri

- Sipariş oluşturma süresinin kısalması
- Masa bazlı sipariş hatalarının azalması
- QR doğrulamalı sipariş tamamlama oranının artması
- İşletme panelinde aktif ürün/kampanya kullanım oranı
- Review bırakma oranı
- Staff operasyon süresinde iyileşme

## 7. Kapsam

### Müşteri Uygulaması

- QR ile restoran menüsüne erişim
- Menü görüntüleme
- Ürün detaylarını inceleme
- Sepet oluşturma
- Sipariş oluşturma
- Aynı masaya birden fazla sipariş verebilme
- Explore bölümünden restoran keşfetme
- Filtreler: yakınındakiler, popüler, kampanyalı vb.
- Geçmiş siparişleri görüntüleme
- Review verilmemiş siparişler için yorum bırakma
- Sipariş sonrası QR üretimi
- Staff QR'ı okutunca siparişin işletmeye iletilmesi / onaylanması

### İşletme Paneli

- Şube ekleme ve yönetme
- Şubeye müdür atama
- Şubeye çalışan atama
- Çalışan bazlı yetki atama ve rol yönetimi
- Genel menü oluşturma ve yönetme
- Şubeye özel menü oluşturma ve yönetme
- Menü oluşturma ve yönetme
- Özel menü tanımlama: örneğin Ramazan özel menü
- Ürün ekleme, güncelleme, silme, listeleme
- Kategori ekleme, güncelleme, silme, listeleme
- Ürünleri kategorilere bağlama
- Sipariş yönetimi
- Eksik ürün durumunda siparişi düzenleme
- Masa için işletme tarafından sipariş oluşturma
- Masa hesabı çıkarma
- Kampanya oluşturma
- Genel kampanya oluşturma
- Şubeye özel kampanya oluşturma
- Segmentler: yeni müşteri, sadık müşteri vb.
- Çalışan shift yönetimi
- Çalışan performansı görüntüleme
- Şube bazlı istatistikleri görüntüleme
- Analitikler:
  - satılan ürünler
  - talep gören ürünler
  - en çok görüntülenen / tıklanan ürünler
  - ürün detay sayfasında en çok vakit geçirilen ürünler

### Staff Uygulaması

- QR okutarak sipariş doğrulama / oluşturma
- Masaya manuel sipariş girme
- Masanın hesabını çıkarma
- Masanın hesabının ödemesini alma
- Günlük özet tabloları görüntüleme
- Haftalık ve aylık shift planını görüntüleme
- Günlük, haftalık ve aylık kişisel istatistikleri görüntüleme
- Kalan ürün stok miktarlarını görüntüleme

## 8. Temel Kullanım Akışları

### 8.1 Müşteri Sipariş Akışı

1. Müşteri masadaki QR'ı okur.
2. İlgili restoran menüsü açılır.
3. Ürünleri inceler, sepete ekler.
4. Siparişi oluşturur.
5. Sistem siparişe özel bir doğrulama QR'ı üretir.
6. Garson QR'ı okutur.
7. Sipariş "onaylandı / işletmeye iletildi" durumuna geçer.
8. İşletme ve staff siparişi yönetir.

### 8.2 Aynı Masa İçin Çoklu Sipariş

- Aynı masa numarasına bağlı birden fazla sipariş açılabilir.
- Her sipariş ayrı kayıt olarak tutulur.
- Hesap kapatma anında masa bazında birleştirilmiş özet gösterilir.

### 8.3 Masa Hesabı Çıkarma

Sistem, aynı masaya ait açık siparişleri konsolide eder ve ürün bazında özetler.

Örnek:

- Sipariş 1: 3x kola
- Sipariş 2: 1x cheesecake
- Sipariş 3: 2x çikolatalı mousse

Çıktı:

- 3x kola
- 1x cheesecake
- 2x çikolatalı mousse

Not:
Aynı ürün birden fazla siparişte geçiyorsa adetler toplanmalıdır.

## 9. Fonksiyonel Gereksinimler

### 9.1 Müşteri

- Kullanıcı restoran menüsünü QR ile açabilmelidir.
- Kullanıcı ürün detayını görüntüleyebilmelidir.
- Kullanıcı sepete ürün ekleyip çıkarabilmelidir.
- Kullanıcı sipariş notu ekleyebilmelidir.
- Kullanıcı aynı masa için birden fazla sipariş verebilmelidir.
- Kullanıcı sipariş geçmişini görüntüleyebilmelidir.
- Kullanıcı review bırakmadığı siparişlere yorum verebilmelidir.
- Kullanıcı explore ekranında restoran keşfedebilmelidir.
- Explore filtreleri en az yakınındakiler ve popüler olmalıdır.

### 9.2 Sipariş ve QR

- Her sipariş için benzersiz QR üretilmelidir.
- Staff QR kodunu okuttuğunda sipariş onaylanmalıdır.
- Sipariş durumları takip edilebilmelidir.

Önerilen durumlar:

- Taslak
- QR oluşturuldu
- Staff onayı bekleniyor
- Onaylandı
- Hazırlanıyor
- Servise hazır
- Teslim edildi
- Tamamlandı
- İptal edildi

### 9.3 İşletme Admini

- İşletme admini birden fazla şube oluşturabilmelidir.
- İşletme admini şubeleri aktif/pasif yapabilmelidir.
- İşletme admini her şubeye müdür atayabilmelidir.
- İşletme admini her şubeye çalışan atayabilmelidir.
- İşletme admini genel menü oluşturabilmeli ve düzenleyebilmelidir.
- İşletme admini şubeye özel menü oluşturabilmeli ve düzenleyebilmelidir.
- İşletme admini genel kategori ve ürün yapısını yönetebilmelidir.
- İşletme admini genel kampanya oluşturabilmelidir.
- İşletme admini genel indirim, menü, kategori ve kampanya tanımlayabilmelidir.
- İşletme admini tüm şubelerde sipariş, operasyon ve raporlama yetkisine sahip olmalıdır.
- İşletme admini şube müdürü ve çalışanın tüm yetkilerini kapsamalıdır.

### 9.4 Şube Müdürü

- Şube müdürü yalnızca yetkili olduğu şubeyi yönetebilmelidir.
- Şube müdürü çalışanları görüntüleyebilmeli ve yönetebilmelidir.
- Şube müdürü çalışan shiftlerini oluşturabilmeli ve güncelleyebilmelidir.
- Şube müdürü menüyü yönetebilmelidir.
- Şube müdürü kategorileri yönetebilmelidir.
- Şube müdürü ürünleri yönetebilmelidir.
- Şube müdürü kampanya oluşturabilmelidir.
- Şube müdürü yetkili olduğu şubenin istatistiklerini görüntüleyebilmelidir.
- Şube müdürü sipariş üzerinde değişiklik yapabilmelidir.
- Eksik ürün varsa alternatif / iptal / güncelleme işlemi yapabilmelidir.
- Masa bazlı tüm siparişleri görebilmelidir.
- Masa hesabını ara toplam ve toplam olarak çıkarabilmelidir.
- Şube müdürü çalışanın tüm yetkilerini kapsamalıdır.

### 9.5 Çalışan

- Çalışan yetkileri şube müdürü tarafından kişi bazlı atanabilmelidir.
- Çalışan QR tarayabilmelidir.
- Çalışan masa bazlı sipariş girebilmelidir.
- Çalışan masanın hesabını çıkarabilmelidir.
- Çalışan masanın hesabının ödemesini alabilmelidir.
- Çalışan günlük sipariş özetlerini görebilmelidir.
- Çalışan stokta kalan ürün miktarlarını görebilmelidir.
- Çalışan günlük, haftalık ve aylık shift planını görebilmelidir.
- Çalışan günlük, haftalık ve aylık kişisel istatistiklerini görebilmelidir.

## 10. Analitik Gereksinimler

İşletme tarafında aşağıdaki metrikler raporlanmalıdır:

- En çok satılan ürünler
- En çok sipariş edilen kategoriler
- En çok görüntülenen ürünler
- En çok tıklanan ürünler
- Ürün detayında en çok vakit geçirilen ürünler
- Çalışan başına alınan sipariş sayısı
- Ortalama sipariş tutarı
- Günlük / haftalık / aylık ciro
- Kampanya dönüşüm oranı

## 11. Yetkilendirme

- Müşteri: menü, sipariş, geçmiş sipariş, review
- İşletme admini: tüm şubelerde tam yetki, şube oluşturma, müdür/çalışan atama, genel ve şubeye özel menü yönetimi, genel kampanya/kategori/ürün yönetimi, tüm raporlama ve operasyon yetkileri
- Şube müdürü: yalnızca yetkili olduğu şubede çalışan yönetimi, shift yönetimi, menü/kategori/ürün yönetimi, kampanya oluşturma, sipariş operasyonu, şube istatistiklerini görüntüleme
- Çalışan: QR doğrulama, masa siparişi, hesap çıkarma, ödeme alma, stok görüntüleme, kendi shift ve istatistiklerini görüntüleme

Yetki modeli:

- İşletme admini, şube müdürü ve çalışanın tüm yetkilerini içerir.
- Şube müdürü, çalışanın tüm yetkilerini içerir.
- Çalışan yetkileri modüler olmalı ve şube müdürü tarafından kişi bazlı açılıp kapatılabilmelidir.
- Çalışan bazlı atanabilir yetkiler en az şu alanları kapsamalıdır: QR ile sipariş alma, masaya sipariş girme, hesap çıkarma, ödeme alma, stok görüntüleme, günlük tabloları görüntüleme.

## 12. Temel Veri Modeli

- Restaurant
- Branch
- BranchRoleAssignment
- Table
- Menu
- MenuScope
- Category
- Product
- Campaign
- User
- Staff
- Role
- Permission
- Shift
- Order
- OrderItem
- Review
- QRSession / OrderQR
- InventoryItem
- AnalyticsEvent

## 13. MVP Kapsamı

İlk sürüm için önerilen kapsam:

- QR ile menü açma
- Sepet ve sipariş oluşturma
- Aynı masaya çoklu sipariş
- Sipariş sonrası QR üretimi
- Staff QR doğrulama
- Şube oluşturma ve şubeye kullanıcı atama
- İşletme admini / şube müdürü / çalışan rol modeli
- İşletme ürün/kategori/menü yönetimi
- Genel menü ve şubeye özel menü yönetimi
- Sipariş yönetimi
- Masa hesabı çıkarma
- Hesap ödeme alma
- Sipariş geçmişi
- Review bırakma
- Basit explore ekranı
- Basit analitikler
- Staff günlük sipariş özeti

## 14. Sonraki Faz

- Online ödeme
- Sadakat programı
- Push bildirimleri
- Kampanya otomasyonu
- Gelişmiş CRM segmentasyonu
- Yapay zeka ile ürün önerileri
- Çok şubeli gelişmiş raporlama
- Mutfak ekranı entegrasyonu

## 15. Non-Functional Gereksinimler

- Mobil öncelikli arayüz
- Düşük ağ kalitesinde çalışabilirlik
- Hızlı QR açılışı
- Rol bazlı erişim kontrolü
- Sipariş ve ödeme verilerinde güvenlik
- Restoran bazlı veri izolasyonu
- Analitik event'lerin doğru loglanması

## 16. Açık Sorular

- QR sipariş sonrası ödeme alınacak mı, yoksa sadece sipariş doğrulama mı yapılacak?
- Aynı masa için farklı müşterilerin siparişleri kişi bazlı mı, sadece masa bazlı mı tutulacak?
- Eksik ürün durumunda müşteriye bildirim akışı olacak mı?
- Staff siparişi düzenlediğinde müşteri onayı gerekecek mi?
- Explore tarafı sadece restoran listeleme mi olacak, yoksa rezervasyon / kampanya giriş noktası da olacak mı?
