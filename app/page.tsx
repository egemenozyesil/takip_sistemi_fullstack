'use client';

import Link from 'next/link';
import { useAuth } from '@/app/auth/AuthContext';
import { Button } from '@/app/components/Button';

export default function Home() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 overflow-x-hidden w-full max-w-full">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <nav className="w-full max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 overflow-x-hidden">
          <div className="flex items-center justify-between">
            {/* Logo Icon */}
            <Link href="/" className="flex items-center">
              <div className="text-3xl sm:text-4xl">📚</div>
            </Link>

            {/* Navigation Items */}
            <div className="flex items-center gap-2 sm:gap-4">
              {isAuthenticated ? (
                <>
                  <div className="hidden sm:block text-sm text-gray-800">
                    Hoş geldiniz, <span className="font-semibold">{user?.name}</span>
                  </div>
                  <Link href="/dashboard">
                    <Button variant="default" size="sm" className="text-xs sm:text-sm px-3 sm:px-4">
                      <span className="hidden sm:inline">Dashboard</span>
                      <span className="sm:hidden">📊</span>
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    onClick={logout}
                    size="sm"
                    className="text-xs sm:text-sm px-3 sm:px-4"
                  >
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
                    <Button variant="default" size="sm" className="text-xs sm:text-sm px-3 sm:px-4">
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

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Öğrenci Aktivite Takip Sistemi
          </h2>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            Günlük çalışmalarınızı, konu takiplerinizi, dışarı çıkma ve kitap okuma gibi tüm 
            aktivitelerinizi kolayca kaydedin. Modern ve kullanıcı dostu arayüz ile tüm verilerinizi yönetin.
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
              icon: '📚',
              title: 'Günlük Çalışma Takibi',
              description: 'Günlük çalışma saatlerinizi, çözdüğünüz soruları ve çalıştığınız konuları kaydedin'
            },
            {
              icon: '📖',
              title: 'Kitap Okuma Takibi',
              description: 'Okuduğunuz kitapları ve okuma sürelerinizi kayıt altına alın'
            },
            {
              icon: '🚶',
              title: 'Dışarı Çıkma Kaydı',
              description: 'Dışarı çıkma aktivitelerinizi ve sürelerini takip edin'
            },
            {
              icon: '📊',
              title: 'Konu Takibi',
              description: 'Çalıştığınız konuları detaylı şekilde kaydedin ve ilerlemenizi görün'
            },
            {
              icon: '📈',
              title: 'İstatistik ve Raporlar',
              description: 'Tüm aktivitelerinizi grafikler ve raporlarla görselleştirin'
            },
            {
              icon: '🔐',
              title: 'Güvenli Veri',
              description: 'Şifreli depolama ve güvenli kimlik doğrulama ile verileriniz korunur'
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
              <p className="text-gray-800">
                {feature.description}
              </p>
            </div>
          ))}
        </div>


      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-gray-800">
          <p>&copy; 2026 Öğrenci Aktivite Takip Sistemi. Tüm hakları saklıdır. by Egemen Özyeşil</p>
        </div>
      </footer>
    </div>
  );
}
