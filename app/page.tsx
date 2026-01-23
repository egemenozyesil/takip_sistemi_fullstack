'use client';

import Link from 'next/link';
import { useAuth } from '@/app/auth/AuthContext';
import { Button } from '@/app/components/Button';

export default function Home() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-600">📚 Öğrenci Takip Sistemi</h1>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <div className="text-sm text-gray-600">
                  Hoş geldiniz, <span className="font-semibold">{user?.name}</span>
                </div>
                <Link href="/dashboard">
                  <Button variant="default" size="md">
                    Dashboard
                  </Button>
                </Link>
                <Button variant="outline" onClick={logout}>
                  Çıkış Yap
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="outline">Giriş Yap</Button>
                </Link>
                <Link href="/auth/register">
                  <Button variant="default">Kaydol</Button>
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Öğrenci Devam Takip Sistemi
          </h2>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            Öğrencilerin ders devam durumlarını kolayca takip edin. Modern ve kullanıcı dostu 
            arayüz ile tüm verilerinizi yönetin.
          </p>
          {!isAuthenticated && (
            <div className="flex gap-4 justify-center">
              <Link href="/auth/register">
                <Button variant="default" size="lg">
                  Şimdi Kaydol
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="outline" size="lg">
                  Giriş Yap
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          {[
            {
              icon: '📊',
              title: 'Detaylı Raporlar',
              description: 'Devam oranlarını, devamsızlıkları ve trend analizi yapın'
            },
            {
              icon: '👥',
              title: 'Çok Kullanıcılı Sistem',
              description: 'Öğrenciler ve öğretmenler için ayrı erişim seviyeleri'
            },
            {
              icon: '🔐',
              title: 'Güvenli Veri',
              description: 'Şifreli depolama ve güvenli kimlik doğrulama'
            },
            {
              icon: '📱',
              title: 'Responsive Tasarım',
              description: 'Mobil cihazlar ve masaüstü bilgisayarlarda mükemmel görünüm'
            },
            {
              icon: '⚡',
              title: 'Hızlı Erişim',
              description: 'Modern teknoloji ile instant veri işleme'
            },
            {
              icon: '📈',
              title: 'Grafik Gösterimler',
              description: 'Verileri kolayca anlaşılır grafikler ile görselleştirin'
            }
          ].map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Statistics Section */}
        <div className="mt-20 bg-white rounded-lg shadow-lg p-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-blue-600">500+</p>
              <p className="text-gray-600 mt-2">Aktif Öğrenci</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-green-600">50+</p>
              <p className="text-gray-600 mt-2">Kurs</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-purple-600">99%</p>
              <p className="text-gray-600 mt-2">Doğruluk</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-orange-600">24/7</p>
              <p className="text-gray-600 mt-2">Erişim</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-gray-600">
          <p>&copy; 2024 Öğrenci Takip Sistemi. Tüm hakları saklıdır.</p>
        </div>
      </footer>
    </div>
  );
}
