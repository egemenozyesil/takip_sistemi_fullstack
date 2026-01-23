# Öğrenci Takip Sistemi - Fullstack

Modern ve kullanıcı dostu bir öğrenci devam takip sistemi. Next.js, TypeScript, SQLite ve Tailwind CSS ile geliştirilmiştir.

## 🎯 Özellikler

- ✅ **Kayıt & Giriş Sistemi** - Güvenli kimlik doğrulama
- ✅ **JWT Token** - Secure authentication
- ✅ **SQLite Veritabanı** - Hızlı ve güvenilir veri depolama
- ✅ **Öğrenci Dashboard** - Devam durumunu takip edin
- ✅ **Modern UI** - Tailwind CSS ile tasarlanmış
- ✅ **Responsive Design** - Mobil ve masaüstüde mükemmel görünüm
- ✅ **API Routes** - RESTful API ile veri yönetimi

## 🚀 Hızlı Başlangıç

### Gereksinimler
- Node.js 18+
- npm veya yarn

### Kurulum

```bash
# Paketleri yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev
```

Tarayıcınızda [http://localhost:3000](http://localhost:3000) açın.

## 📁 Proje Yapısı

```
├── app/
│   ├── api/
│   │   ├── auth/              # Kimlik doğrulama API'si
│   │   │   ├── register/      # Kayıt endpoint'i
│   │   │   ├── login/         # Giriş endpoint'i
│   │   │   ├── logout/        # Çıkış endpoint'i
│   │   │   └── me/            # Kullanıcı bilgisi endpoint'i
│   │   └── students/          # Öğrenci API'si
│   ├── auth/
│   │   ├── AuthContext.tsx    # Auth context & hooks
│   │   ├── login/             # Giriş sayfası
│   │   └── register/          # Kayıt sayfası
│   ├── components/            # Reusable UI bileşenleri
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   └── Alert.tsx
│   ├── dashboard/             # Öğrenci dashboard
│   ├── lib/
│   │   ├── db.ts             # Veritabanı konfigürasyonu
│   │   ├── auth.ts           # Auth servisleri
│   │   └── students.ts       # Öğrenci servisleri
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Ana sayfa (Tanıtım)
├── data/                      # SQLite veritabanı
├── public/                    # Statik dosyalar
└── package.json
```

## 🔐 Kimlik Doğrulama

Sistem JWT token tabanlı kimlik doğrulama kullanır:

1. **Kayıt**: Email, şifre ve ad ile yeni hesap oluştur
2. **Giriş**: Email ve şifre ile oturum aç
3. **Token**: Başarılı giriş sonrası JWT token alınır
4. **Dashboard**: Token geçersiz ise otomatik login sayfasına yönlendir

## 📊 Veritabanı Şeması

### Users Table
```sql
- id (TEXT PRIMARY KEY)
- email (TEXT UNIQUE)
- password (TEXT)
- name (TEXT)
- role (TEXT)
- created_at (DATETIME)
```

### Students Table
```sql
- id (TEXT PRIMARY KEY)
- user_id (FOREIGN KEY)
- student_number (TEXT UNIQUE)
- department (TEXT)
- phone (TEXT)
- updated_at (DATETIME)
```

### Attendance Table
```sql
- id (TEXT PRIMARY KEY)
- student_id (FOREIGN KEY)
- date (DATETIME)
- status (TEXT: 'present' | 'absent')
```

## 🛣️ API Endpoints

### Authentication
- `POST /api/auth/register` - Yeni kullanıcı kaydı
- `POST /api/auth/login` - Kullanıcı girişi
- `POST /api/auth/logout` - Çıkış yap
- `GET /api/auth/me` - Mevcut kullanıcı bilgisi

### Students
- `GET /api/students/profile` - Öğrenci profili ve devam durumu

## 🎨 Kullanılan Teknolojiler

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: SQLite3, better-sqlite3
- **Authentication**: JWT, bcrypt
- **HTTP Client**: Axios
- **Form Management**: React hooks

## 📝 Sayfalar

### Public Sayfalar
- `/` - Ana sayfa (Tanıtım)
- `/auth/login` - Giriş sayfası
- `/auth/register` - Kayıt sayfası

### Protected Sayfalar
- `/dashboard` - Öğrenci dashboard

## 🔧 Ortam Değişkenleri

`.env.local` dosyasını oluştur:

```env
JWT_SECRET=your-super-secret-key-change-this-in-production
NODE_ENV=development
```

## 📦 Build & Deploy

```bash
# Production build
npm run build

# Production'da çalıştır
npm start
```

## 🐛 Troubleshooting

### Token hatası
- Tarayıcınızın çerezlerini temizleyin
- Sayfayı yenileyin
- Tekrar giriş yapın

### Veritabanı hatası
- `data` klasörünün varlığını kontrol edin
- Disk space'i kontrol edin

## 📄 Lisans

MIT

## 👨‍💻 Geliştirici

Egemen Özyeşil

---

**Not**: Bu proje eğitim amaçlıdır. Production'da kullanmadan önce security improvements yapınız.
