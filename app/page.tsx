'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/auth/AuthContext';
import { Button } from '@/app/components/Button';
import { BookOpen, BarChart3, BookMarked, Footprints, Shield, TrendingUp, Mail, ChevronLeft, ChevronRight } from 'lucide-react';

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

// Unsplash ücretsiz görseller (Unsplash License - ticari kullanım serbest)
const HERO_SLIDES = [
  {
    title: 'Günlük Çalışma Takibi',
    subtitle: 'Çalışma saatlerinizi, çözdüğünüz soruları ve konuları tek yerden kaydedin.',
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1920&q=80',
    credit: 'Unsplash',
  },
  {
    title: 'Kitap Okuma Takibi',
    subtitle: 'Okuduğunuz kitapları ve okuma sürelerinizi kayıt altına alın.',
    image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=1920&q=80',
    credit: 'Unsplash',
  },
  {
    title: 'Dışarı Çıkma Kaydı',
    subtitle: 'Dışarı çıkma aktivitelerinizi ve sürelerini takip edin.',
    image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=1920&q=80',
    credit: 'Unsplash',
  },
  {
    title: 'Konu Takibi & İstatistikler',
    subtitle: 'İlerlemenizi grafikler ve raporlarla görselleştirin.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1920&q=80',
    credit: 'Unsplash',
  },
  {
    title: 'Güvenli Veri',
    subtitle: 'Verileriniz güvenle saklanır, sadece siz erişirsiniz.',
    image: 'https://images.unsplash.com/photo-1614064548230-9703c93c2b2e?w=1920&q=80',
    credit: 'Unsplash',
  },
];

export default function Home() {
  const { isAuthenticated, user, logout } = useAuth();
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setHeroIndex((i) => (i + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(t);
  }, []);

  const goToSlide = (index: number) => {
    setHeroIndex(index);
  };

  const navLinks = [
    { label: 'Ana Sayfa', id: 'hero' },
    { label: 'Özellikler', id: 'ozellikler' },
    { label: 'İletişim', id: 'iletisim' },
  ];

  const features = [
    {
      icon: BookOpen,
      title: 'Günlük Çalışma Takibi',
      description: 'Günlük çalışma saatlerinizi, çözdüğünüz soruları ve çalıştığınız konuları kaydedin',
    },
    {
      icon: BookMarked,
      title: 'Kitap Okuma Takibi',
      description: 'Okuduğunuz kitapları ve okuma sürelerinizi kayıt altına alın',
    },
    {
      icon: Footprints,
      title: 'Dışarı Çıkma Kaydı',
      description: 'Dışarı çıkma aktivitelerinizi ve sürelerini takip edin',
    },
    {
      icon: BarChart3,
      title: 'Konu Takibi',
      description: 'Çalıştığınız konuları detaylı şekilde kaydedin ve ilerlemenizi görün',
    },
    {
      icon: TrendingUp,
      title: 'İstatistik ve Raporlar',
      description: 'Tüm aktivitelerinizi grafikler ve raporlarla görselleştirin',
    },
    {
      icon: Shield,
      title: 'Güvenli Veri',
      description: 'Şifreli depolama ve güvenli kimlik doğrulama ile verileriniz korunur',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100 overflow-x-hidden w-full max-w-full scroll-smooth">
      {/* Navigation Header */}
      <header className="sticky top-0 z-[100] border-b border-white/20 bg-white/80 backdrop-blur-xl shadow-sm">
        <nav className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-lg shadow-indigo-500/25">
                <BookOpen className="h-5 w-5" />
              </div>
              <span className="font-semibold text-gray-900 hidden sm:inline">Takip Sistemi</span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50/80 transition-colors"
                >
                  {link.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => scrollToSection('iletisim')}
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
              >
                <Mail className="h-4 w-4" />
                İletişime Geç
              </button>
              {isAuthenticated ? (
                <>
                  <div className="hidden lg:block text-sm text-gray-600">
                    Hoş geldiniz, <span className="font-semibold text-gray-900">{user?.name}</span>
                  </div>
                  <Link href="/dashboard">
                    <Button variant="default" size="sm" className="text-xs sm:text-sm px-3 sm:px-4 shadow-md">
                      <span className="hidden sm:inline">Dashboard</span>
                      <span className="sm:hidden">📊</span>
                    </Button>
                  </Link>
                  <Button variant="outline" onClick={logout} size="sm" className="text-xs sm:text-sm px-3 sm:px-4">
                    <span className="hidden sm:inline">Çıkış Yap</span>
                    <span className="sm:hidden">🚪</span>
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/auth/login">
                    <Button variant="outline" size="sm" className="text-xs sm:text-sm px-3 sm:px-4">
                      <span className="hidden sm:inline">Giriş Yap</span>
                      <span className="sm:hidden">Giriş</span>
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button variant="default" size="sm" className="text-xs sm:text-sm px-3 sm:px-4 shadow-md">
                      <span className="hidden sm:inline">Kaydol</span>
                      <span className="sm:hidden">Kayıt</span>
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Slider */}
      <section
        id="hero"
        className="relative min-h-[85vh] sm:min-h-[90vh] flex items-center justify-center overflow-hidden"
      >
        {HERO_SLIDES.map((slide, index) => (
          <div
            key={index}
            className="absolute inset-0 transition-opacity duration-700 ease-in-out"
            style={{
              opacity: index === heroIndex ? 1 : 0,
              pointerEvents: index === heroIndex ? 'auto' : 'none',
            }}
          >
            {/* Arka plan görseli */}
            <div className="absolute inset-0">
              <img
                src={slide.image}
                alt=""
                className="w-full h-full object-cover"
                fetchPriority={index === 0 ? 'high' : 'low'}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900/85 via-slate-900/70 to-slate-900/50" />
            </div>

            {/* İçerik */}
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 flex flex-col items-center justify-center min-h-[85vh] sm:min-h-[90vh] text-center">
              <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-white/15 text-white/95 backdrop-blur mb-6">
                {index + 1} / {HERO_SLIDES.length} — Modül
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg">
                {slide.title}
              </h1>
              <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto mb-10">
                {slide.subtitle}
              </p>
              {!isAuthenticated && index === 0 && (
                <div className="flex flex-wrap gap-4 justify-center">
                  <Link href="/auth/register">
                    <Button variant="default" size="lg" className="shadow-lg bg-white text-indigo-600 hover:bg-indigo-50 border-0">
                      Şimdi Kaydol
                    </Button>
                  </Link>
                  <Link href="/auth/login">
                    <Button size="lg" className="bg-white/15 text-white border-2 border-white/50 hover:bg-white/25">
                      Giriş Yap
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Önceki / Sonraki */}
        <button
          type="button"
          onClick={() => setHeroIndex((i) => (i - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/20 hover:bg-white/35 text-white backdrop-blur transition-colors"
          aria-label="Önceki slide"
        >
          <ChevronLeft className="h-6 w-6 sm:h-8 sm:w-8" />
        </button>
        <button
          type="button"
          onClick={() => setHeroIndex((i) => (i + 1) % HERO_SLIDES.length)}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/20 hover:bg-white/35 text-white backdrop-blur transition-colors"
          aria-label="Sonraki slide"
        >
          <ChevronRight className="h-6 w-6 sm:h-8 sm:w-8" />
        </button>

        {/* Nokta göstergeleri */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {HERO_SLIDES.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === heroIndex ? 'w-8 bg-white' : 'w-2 bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Unsplash kredisi - hafif */}
        <a
          href="https://unsplash.com"
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-6 right-4 z-10 text-white/50 hover:text-white/80 text-xs transition-colors"
        >
          Görseller: Unsplash
        </a>
      </section>

      {/* Features Section */}
      <section
        id="ozellikler"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 scroll-mt-20"
      >
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Özellikler</h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            Tüm ihtiyaçlarınızı tek bir platformda toplayan araçlarla verimliliğinizi artırın.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group relative bg-white/90 backdrop-blur rounded-2xl p-6 sm:p-8 shadow-lg shadow-gray-200/50 border border-gray-100 hover:shadow-xl hover:shadow-indigo-100/50 hover:border-indigo-100 transition-all duration-300 hover:-translate-y-1"
                style={{
                  animation: 'fade-in-up 0.6s ease-out forwards',
                  animationDelay: `${400 + index * 80}ms`,
                  animationFillMode: 'both',
                  opacity: 0,
                }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/10 to-blue-500/10 text-indigo-600 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Contact Section */}
      <section
        id="iletisim"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 scroll-mt-20"
      >
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-blue-700 p-8 sm:p-12 lg:p-16 text-center shadow-2xl shadow-indigo-500/25">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyem0wLTR2MkgyNHYtMmgxMnoiLz48L2g+PC9nPjwvc3ZnPg==')] opacity-40" />
          <div className="relative">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Sorularınız mı var?</h2>
            <p className="text-indigo-100 mb-8 max-w-lg mx-auto">
              Proje hakkında bilgi almak veya destek için bizimle iletişime geçebilirsiniz.
            </p>
            <a
              href="mailto:iletisim@takipsistemi.com"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-indigo-600 font-semibold shadow-lg hover:bg-indigo-50 transition-colors"
            >
              <Mail className="h-5 w-5" />
              İletişime Geç
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white/80 backdrop-blur mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-gray-600 text-sm">
          <p>&copy; 2026 Öğrenci Aktivite Takip Sistemi. Tüm hakları saklıdır. by Egemen Özyeşil</p>
        </div>
      </footer>
    </div>
  );
}
