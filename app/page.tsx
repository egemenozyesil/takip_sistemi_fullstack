'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/auth/AuthContext';
import { Button } from '@/app/components/Button';
import {
  BookOpen,
  BarChart3,
  BookMarked,
  Footprints,
  Shield,
  TrendingUp,
  Mail,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  LogIn,
  LayoutDashboard,
  Quote,
  CheckCircle2,
  Zap,
  AlertCircle,
  Users,
  Target,
} from 'lucide-react';

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

const FOMO_REASONS = [
  { icon: Target, text: 'Hedeflerinize ulaşan öğrenciler düzenli takip yapanlar arasından çıkıyor.' },
  { icon: Zap, text: 'Her gün kayıt tutan öğrenciler, tutmayanlara göre çok daha fazla ilerleme kaydediyor.' },
  { icon: Users, text: 'Sınıfınızdaki arkadaşlarınız da kullanmaya başladı — geride kalmayın.' },
  { icon: AlertCircle, text: 'Dağınık notlar ve unutulan saatler yerine tek ekranda her şey.' },
];

const FOMO_MISSING = [
  'Haftalık / aylık ilerleme raporları',
  'Hangi konuda ne kadar çalıştığınızı gösteren grafikler',
  'Kitap okuma alışkanlığınızın istatistiği',
  'Devam ve aktivite geçmişinize anında erişim',
];

// Unsplash (telif hakları açık, ticari kullanım serbest - Unsplash License)
const HERO_SLIDES = [
  {
    title: 'Günlük Çalışma Takibi',
    subtitle: 'Çalışma saatlerinizi, çözdüğünüz soruları ve konuları tek yerden kaydedin.',
    accent: 'from-amber-400/85 to-orange-500/85',
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1920&q=80',
  },
  {
    title: 'Kitap Okuma Takibi',
    subtitle: 'Okuduğunuz kitapları ve okuma sürelerinizi kayıt altına alın.',
    accent: 'from-emerald-400/85 to-teal-500/85',
    image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=1920&q=80',
  },
  {
    title: 'Dışarı Çıkma Kaydı',
    subtitle: 'Dışarı çıkma aktivitelerinizi ve sürelerini takip edin.',
    accent: 'from-sky-400/85 to-blue-500/85',
    image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=1920&q=80',
  },
  {
    title: 'Konu Takibi & İstatistikler',
    subtitle: 'İlerlemenizi grafikler ve raporlarla görselleştirin.',
    accent: 'from-violet-400/85 to-purple-500/85',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1920&q=80',
  },
  {
    title: 'Güvenli Veri',
    subtitle: 'Verileriniz güvenle saklanır, sadece siz erişirsiniz.',
    accent: 'from-rose-400/85 to-pink-500/85',
    image: 'https://images.unsplash.com/photo-1614064548230-9703c93c2b2e?w=1920&q=80',
  },
];

const TESTIMONIALS = [
  {
    quote: 'Devam takibini artık çok kolay yapıyoruz. Öğrenciler ve yönetim için gerçekten faydalı bir sistem.',
    author: 'Dr. Ayşe Yılmaz',
    role: 'Bölüm Başkanı',
  },
  {
    quote: 'Tek ekrandan tüm devam durumumu görebiliyorum. Mobil uyumlu arayüz sayesinde her yerden erişebiliyorum.',
    author: 'Mehmet Kaya',
    role: 'Öğrenci',
  },
  {
    quote: 'Güvenli giriş ve sade arayüz sayesinde hem öğrenci kaydı hem takip işlemleri çok hızlı ilerliyor.',
    author: 'Elif Demir',
    role: 'İdari Personel',
  },
];

const STEPS = [
  { step: 1, title: 'Kaydolun', desc: 'E-posta ve öğrenci bilgilerinizle ücretsiz hesap oluşturun.', icon: UserPlus },
  { step: 2, title: 'Giriş yapın', desc: 'Güvenli şifrenizle panele erişin.', icon: LogIn },
  { step: 3, title: 'Takip edin', desc: 'Çalışma, kitap ve aktivitelerinizi tek yerden kaydedin.', icon: LayoutDashboard },
  { step: 4, title: 'İlerleyin', desc: 'İstatistikler ve raporlarla gelişiminizi görün.', icon: TrendingUp },
];

function HeroSlideCard({
  slide,
  index,
  isAuthenticated,
}: {
  slide: (typeof HERO_SLIDES)[0];
  index: number;
  isAuthenticated: boolean;
}) {
  return (
    <div className={`relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16 text-center bg-gradient-to-br ${slide.accent} rounded-3xl border border-gray-200/80 shadow-xl shadow-gray-200/50`}>
      <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-white/90 text-gray-700 shadow-sm mb-6">
        {index + 1} / {HERO_SLIDES.length} — Modül
      </span>
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
        {slide.title}
      </h1>
      <p className="text-lg sm:text-xl text-gray-700 max-w-2xl mx-auto mb-10">
        {slide.subtitle}
      </p>
      {!isAuthenticated && index === 0 && (
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/auth/register">
            <Button variant="default" size="lg" className="shadow-lg bg-indigo-600 hover:bg-indigo-700 text-white border-0 animate-pulse-soft">
              Şimdi Kaydol
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button variant="outline" size="lg" className="border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50">
              Giriş Yap
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

const SLIDE_DURATION_MS = 550;

export default function Home() {
  const { isAuthenticated, user, logout } = useAuth();
  const [heroIndex, setHeroIndex] = useState(0);
  const [transitionFrom, setTransitionFrom] = useState<number | null>(null);
  const [transitionTarget, setTransitionTarget] = useState<number | null>(null);
  const [transitionDir, setTransitionDir] = useState<'next' | 'prev' | null>(null);

  const goToSlide = useCallback((index: number) => {
    if (index === heroIndex || transitionFrom !== null) return;
    const steps = (index - heroIndex + HERO_SLIDES.length) % HERO_SLIDES.length;
    const direction = steps <= HERO_SLIDES.length / 2 ? 'next' : 'prev';
    setTransitionFrom(heroIndex);
    setTransitionTarget(index);
    setTransitionDir(direction);
    setTimeout(() => {
      setHeroIndex(index);
      setTransitionFrom(null);
      setTransitionTarget(null);
      setTransitionDir(null);
    }, SLIDE_DURATION_MS);
  }, [heroIndex, transitionFrom]);

  const goNext = useCallback(() => {
    if (transitionFrom !== null) return;
    const next = (heroIndex + 1) % HERO_SLIDES.length;
    setTransitionFrom(heroIndex);
    setTransitionTarget(next);
    setTransitionDir('next');
    setTimeout(() => {
      setHeroIndex(next);
      setTransitionFrom(null);
      setTransitionTarget(null);
      setTransitionDir(null);
    }, SLIDE_DURATION_MS);
  }, [heroIndex, transitionFrom]);

  const goPrev = useCallback(() => {
    if (transitionFrom !== null) return;
    const prev = (heroIndex - 1 + HERO_SLIDES.length) % HERO_SLIDES.length;
    setTransitionFrom(heroIndex);
    setTransitionTarget(prev);
    setTransitionDir('prev');
    setTimeout(() => {
      setHeroIndex(prev);
      setTransitionFrom(null);
      setTransitionTarget(null);
      setTransitionDir(null);
    }, SLIDE_DURATION_MS);
  }, [heroIndex, transitionFrom]);

  useEffect(() => {
    const t = setInterval(goNext, 5000);
    return () => clearInterval(t);
  }, [goNext]);

  const navLinks = [
    { label: 'Ana Sayfa', id: 'hero' },
    { label: 'Neden?', id: 'neden' },
    { label: 'Proje', id: 'proje' },
    { label: 'Özellikler', id: 'ozellikler' },
    { label: 'Referanslar', id: 'referanslar' },
    { label: 'İletişim', id: 'iletisim' },
  ];

  const features = [
    { icon: BookOpen, title: 'Günlük Çalışma Takibi', description: 'Günlük çalışma saatlerinizi, çözdüğünüz soruları ve çalıştığınız konuları kaydedin' },
    { icon: BookMarked, title: 'Kitap Okuma Takibi', description: 'Okuduğunuz kitapları ve okuma sürelerinizi kayıt altına alın' },
    { icon: Footprints, title: 'Dışarı Çıkma Kaydı', description: 'Dışarı çıkma aktivitelerinizi ve sürelerini takip edin' },
    { icon: BarChart3, title: 'Konu Takibi', description: 'Çalıştığınız konuları detaylı şekilde kaydedin ve ilerlemenizi görün' },
    { icon: TrendingUp, title: 'İstatistik ve Raporlar', description: 'Tüm aktivitelerinizi grafikler ve raporlarla görselleştirin' },
    { icon: Shield, title: 'Güvenli Veri', description: 'Şifreli depolama ve güvenli kimlik doğrulama ile verileriniz korunur' },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden w-full max-w-full scroll-smooth">
      {/* Navigation */}
      <header className="sticky top-0 z-[100] border-b border-gray-200 bg-white/95 backdrop-blur-md shadow-sm">
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
                    <Button variant="default" size="sm" className="text-xs sm:text-sm px-3 sm:px-4 shadow-md !text-white">
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

      {/* Hero - 3D flip slider */}
      <section id="hero" className="relative min-h-[85vh] sm:min-h-[88vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-indigo-50/40">
        {/* Arka plan görselleri (Unsplash - telif hakları açık), opacity ~0.3 */}
        {HERO_SLIDES.map((slide, index) => (
          <div
            key={index}
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-700 ease-in-out"
            style={{
              backgroundImage: `url(${slide.image})`,
              opacity: index === heroIndex ? 0.3 : 0,
              pointerEvents: 'none',
            }}
            aria-hidden
          />
        ))}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.12),transparent)]" />
        <div className="absolute top-20 right-0 w-72 h-72 bg-indigo-200/30 rounded-full blur-3xl animate-float" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-20 left-0 w-96 h-96 bg-blue-200/25 rounded-full blur-3xl" style={{ animation: 'float 5s ease-in-out infinite' }} />

        <div className="carousel-3d-scene relative w-full max-w-4xl mx-auto px-4 h-[70vh] sm:h-[75vh] flex items-center justify-center">
          {transitionFrom !== null && transitionDir !== null ? (
            <>
              <div className="absolute inset-0 flex items-center justify-center" style={{ perspective: '1400px' }}>
                <div className={`carousel-3d-slide w-full max-w-4xl mx-auto px-4 ${transitionDir === 'next' ? 'carousel-flip-out' : 'carousel-flip-out-prev'}`}>
                  <HeroSlideCard slide={HERO_SLIDES[transitionFrom]} index={transitionFrom} isAuthenticated={isAuthenticated} />
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center" style={{ perspective: '1400px' }}>
                <div className={`carousel-3d-slide w-full max-w-4xl mx-auto px-4 z-10 ${transitionDir === 'next' ? 'carousel-flip-in' : 'carousel-flip-in-prev'}`}>
                  <HeroSlideCard
                    slide={HERO_SLIDES[transitionTarget!]}
                    index={transitionTarget!}
                    isAuthenticated={isAuthenticated}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center" style={{ perspective: '1400px' }}>
              <div className="carousel-3d-slide w-full max-w-4xl mx-auto px-4 animate-scale-in">
                <HeroSlideCard slide={HERO_SLIDES[heroIndex]} index={heroIndex} isAuthenticated={isAuthenticated} />
              </div>
            </div>
          )}
        </div>

        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 pointer-events-none px-2">
          <div className="max-w-6xl mx-auto flex justify-between pointer-events-auto">
            <button
              type="button"
              onClick={goPrev}
              className="p-2.5 rounded-full bg-white/90 border border-gray-200 text-gray-700 shadow-md hover:bg-indigo-50 hover:border-indigo-200 hover:scale-110 transition-all z-10"
              aria-label="Önceki slide"
            >
              <ChevronLeft className="h-6 w-6 sm:h-7 sm:w-7" />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="p-2.5 rounded-full bg-white/90 border border-gray-200 text-gray-700 shadow-md hover:bg-indigo-50 hover:border-indigo-200 hover:scale-110 transition-all z-10"
              aria-label="Sonraki slide"
            >
              <ChevronRight className="h-6 w-6 sm:h-7 sm:w-7" />
            </button>
          </div>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goToSlide(i)}
              className={`h-2 rounded-full transition-all duration-300 ${i === heroIndex ? 'w-8 bg-indigo-600' : 'w-2 bg-gray-300 hover:bg-gray-400'}`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>

        {!isAuthenticated && (
          <div className="absolute top-24 left-1/2 -translate-x-1/2 z-10 animate-badge-bounce">
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-amber-400/95 text-gray-900 text-sm font-semibold shadow-lg border border-amber-500/50">
              <Zap className="h-4 w-4" />
              Ücretsiz kayıt — Hemen başlayın
            </span>
          </div>
        )}

        <a
          href="https://unsplash.com"
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-6 right-4 z-10 text-gray-400 hover:text-gray-600 text-xs transition-colors"
        >
          Görseller: Unsplash
        </a>
      </section>

      {/* FOMO - Neden kullanmalı & Kaçırdıklarınız */}
      <section id="neden" className="scroll-mt-20 bg-white border-y border-gray-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center mb-12 animate-fade-in-up animation-fill-both">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Neden Bu Uygulamayı Kullanmalısınız?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Düzenli takip tutan öğrenciler hedeflerine daha hızlı ulaşıyor. Siz de aynı fırsata sahip olun.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {FOMO_REASONS.map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={i}
                  className="flex gap-4 p-5 rounded-2xl bg-gradient-to-br from-indigo-50/80 to-white border border-indigo-100/80 shadow-sm hover:shadow-md hover:border-indigo-200/80 transition-all duration-300 animate-fade-in-up animation-fill-both"
                  style={{ animationDelay: `${150 * i}ms`, opacity: 0 }}
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-indigo-500/15 flex items-center justify-center text-indigo-600">
                    <Icon className="h-6 w-6" />
                  </div>
                  <p className="text-gray-700 font-medium leading-relaxed pt-1">{item.text}</p>
                </div>
              );
            })}
          </div>

          <div className="rounded-2xl bg-amber-50 border-2 border-amber-200/80 p-6 sm:p-8 animate-fade-in-up animation-fill-both" style={{ animationDelay: '400ms', opacity: 0 }}>
            <h3 className="text-xl font-bold text-amber-900 mb-3 flex items-center gap-2">
              <AlertCircle className="h-6 w-6" />
              Kaydolmazsanız bunları kaçırırsınız
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-700">
              {FOMO_MISSING.map((item, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-400/60 flex items-center justify-center text-amber-900 text-xs font-bold">!</span>
                  {item}
                </li>
              ))}
            </ul>
            {!isAuthenticated && (
              <div className="mt-6 text-center">
                <Link href="/auth/register">
                  <Button variant="default" size="lg" className="bg-amber-500 hover:bg-amber-600 text-white border-0 animate-glow-pulse shadow-lg">
                    Hemen ücretsiz kaydol — Kaçırmayın
                  </Button>
                </Link>
              </div>
            )}
          </div>

          <div className="mt-12 text-center animate-fade-in-up animation-fill-both" style={{ animationDelay: '500ms', opacity: 0 }}>
            <p className="text-gray-500 text-sm">
              <Users className="inline h-4 w-4 mr-1 -mt-0.5 text-indigo-500" />
              Binlerce öğrenci düzenli takip ile hedeflerine ulaşıyor. Bugün başlayan yarın bir adım önde.
            </p>
          </div>
        </div>
      </section>

      {/* Proje Hakkında */}
      <section id="proje" className="scroll-mt-20 bg-gray-50/80 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="max-w-3xl mx-auto text-center mb-14 animate-fade-in-up animation-fill-both">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Proje Hakkında</h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              <strong>Öğrenci Takip Sistemi</strong>, öğrencilerin günlük çalışma saatleri, kitap okuma süreleri ve dışarı çıkma gibi aktivitelerini tek bir platformda kaydetmesini ve takip etmesini sağlayan modern bir web uygulamasıdır. Next.js, TypeScript, SQLite ve Tailwind CSS ile geliştirilmiştir.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
              <div className="text-2xl font-bold text-indigo-600 mb-1">Güvenli</div>
              <p className="text-sm text-gray-600">JWT kimlik doğrulama ile verileriniz korunur</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
              <div className="text-2xl font-bold text-indigo-600 mb-1">Hızlı</div>
              <p className="text-sm text-gray-600">Anlık kayıt ve raporlama</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
              <div className="text-2xl font-bold text-indigo-600 mb-1">Mobil Uyumlu</div>
              <p className="text-sm text-gray-600">Her cihazdan erişim</p>
            </div>
          </div>

          {/* Nasıl Çalışır */}
          <div className="mt-20">
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-10">Nasıl Çalışır?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {STEPS.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.step} className="relative bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-100 transition-all">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 mb-4">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-semibold text-indigo-600">Adım {item.step}</span>
                    <h4 className="text-lg font-semibold text-gray-900 mt-1 mb-2">{item.title}</h4>
                    <p className="text-sm text-gray-600">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Özellikler */}
      <section id="ozellikler" className="scroll-mt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center mb-14 animate-fade-in-up animation-fill-both">
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
                className="group bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 hover:shadow-lg hover:border-indigo-100 transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02] animate-fade-in-up animation-fill-both"
                style={{ animationDelay: `${80 * index}ms`, opacity: 0 }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/10 to-blue-500/10 text-indigo-600 mb-4 group-hover:scale-105 transition-transform duration-300">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Referanslar */}
      <section id="referanslar" className="scroll-mt-20 bg-gray-50/80 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center mb-12 animate-fade-in-up animation-fill-both">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Referanslar Ne Diyor?</h2>
            <p className="text-gray-600 max-w-xl mx-auto">Sistemimizi kullanan eğitimciler ve öğrencilerden geri bildirimler</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300 animate-fade-in-up animation-fill-both" style={{ animationDelay: `${120 * i}ms`, opacity: 0 }}>
                <Quote className="h-8 w-8 text-indigo-200 mb-4" />
                <p className="text-gray-700 italic mb-4">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-sm">
                    {t.author.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{t.author}</p>
                    <p className="text-sm text-gray-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rakamlarla (kısa istatistik) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-700 p-8 sm:p-12 text-white shadow-xl shadow-indigo-500/20 animate-fade-in-up animation-fill-both hover:shadow-2xl hover:shadow-indigo-500/30 transition-shadow duration-500">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-bold">6+</div>
              <p className="text-indigo-100 text-sm mt-1">Özellik</p>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold">7/24</div>
              <p className="text-indigo-100 text-sm mt-1">Erişim</p>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold">%100</div>
              <p className="text-indigo-100 text-sm mt-1">Güvenli Giriş</p>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold">✓</div>
              <p className="text-indigo-100 text-sm mt-1">Mobil Uyumlu</p>
            </div>
          </div>
        </div>
      </section>

      {/* İletişim */}
      <section id="iletisim" className="scroll-mt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="rounded-3xl bg-gradient-to-br from-slate-50 to-indigo-50/50 border border-gray-200 p-8 sm:p-12 lg:p-16 text-center shadow-inner">
          <div className="flex justify-center mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100">
              <Mail className="h-7 w-7 text-indigo-600" />
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Sorularınız mı var?</h2>
          <p className="text-gray-600 mb-8 max-w-lg mx-auto">
            Proje hakkında bilgi almak veya destek için bizimle iletişime geçebilirsiniz.
          </p>
          <a
            href="mailto:iletisim@takipsistemi.com"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold shadow-lg hover:bg-indigo-700 transition-colors"
          >
            <Mail className="h-5 w-5" />
            İletişime Geç
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-gray-600 text-sm">
          <p className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-indigo-500" />
            Öğrenci Aktivite Takip Sistemi · Tüm hakları saklıdır.
          </p>
          <p className="text-gray-500">by Egemen Özyeşil</p>
        </div>
      </footer>
    </div>
  );
}
