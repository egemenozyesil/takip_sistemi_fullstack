'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/auth/AuthContext';
import { Button } from '@/app/components/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/Card';
import { Input } from '@/app/components/Input';
import { Alert } from '@/app/components/Alert';
import Sidebar from '@/app/components/Sidebar';
import { X } from 'lucide-react';

interface DailyStatsForm {
  work_hours: string;
  questions_answered: string;
  topics_studied: string;
}

export default function DashboardPage() {
  const { user, logout, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState<DailyStatsForm>({
    work_hours: '',
    questions_answered: '',
    topics_studied: '',
  });
  const [sidebarKey, setSidebarKey] = useState(0);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [loading, isAuthenticated, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveStats = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/students/daily-stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          work_hours: parseFloat(formData.work_hours) || 0,
          questions_answered: parseInt(formData.questions_answered) || 0,
          topics_studied: formData.topics_studied || null,
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Günlük istatistikler başarıyla kaydedildi' });
        setFormData({
          work_hours: '',
          questions_answered: '',
          topics_studied: '',
        });
        setShowStatsModal(false);
        setSidebarKey((prev) => prev + 1);
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: 'İstatistikler kaydedilirken hata oluştu' });
      }
    } catch (error) {
      console.error('Error saving stats:', error);
      setMessage({ type: 'error', text: 'Bir hata oluştu' });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar key={sidebarKey} onAddStats={() => setShowStatsModal(true)} />

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <header className="bg-white shadow-md sticky top-16 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Öğrenci Takip Sistemi</h1>
              <p className="text-gray-600 text-sm">Dashboard</p>
            </div>
            <div className="text-right">
              <p className="font-medium text-gray-900">{user.name}</p>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
          </div>
        </header>

        {/* Alert Messages */}
        {message.text && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
            <Alert type={message.type as 'success' | 'error' | 'info' | 'warning'}>
              <div className="flex justify-between items-center">
                <span>{message.text}</span>
                <button onClick={() => setMessage({ type: '', text: '' })} className="ml-4">
                  ✕
                </button>
              </div>
            </Alert>
          </div>
        )}

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Stats Cards */}
            <Card>
              <CardContent>
                <div className="text-center">
                  <p className="text-gray-600 text-sm font-medium">Devam Durumu</p>
                  <p className="text-4xl font-bold text-blue-600 mt-2">%92</p>
                  <p className="text-gray-600 text-xs mt-1">Bu ayın devam oranı</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <div className="text-center">
                  <p className="text-gray-600 text-sm font-medium">Kurs Sayısı</p>
                  <p className="text-4xl font-bold text-green-600 mt-2">4</p>
                  <p className="text-gray-600 text-xs mt-1">Kayıtlı kursa devam ediyorsunuz</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <div className="text-center">
                  <p className="text-gray-600 text-sm font-medium">Devamsızlık</p>
                  <p className="text-4xl font-bold text-red-600 mt-2">2</p>
                  <p className="text-gray-600 text-xs mt-1">Bu dönem devamsızlık sayısı</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Courses Section */}
          <Card>
            <CardHeader>
              <CardTitle>Kayıtlı Kurslar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4 hover:bg-gray-50 transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">Yazılım Geliştirme</h3>
                      <p className="text-sm text-gray-600">Ders Kodu: CSC101</p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                      Aktif
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-600">Devam</p>
                      <p className="text-lg font-semibold text-green-600">24</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Devamsız</p>
                      <p className="text-lg font-semibold text-red-600">2</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Oran</p>
                      <p className="text-lg font-semibold text-blue-600">92%</p>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4 hover:bg-gray-50 transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">Veri Tabanları</h3>
                      <p className="text-sm text-gray-600">Ders Kodu: CSC201</p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                      Aktif
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-600">Devam</p>
                      <p className="text-lg font-semibold text-green-600">25</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Devamsız</p>
                      <p className="text-lg font-semibold text-red-600">1</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Oran</p>
                      <p className="text-lg font-semibold text-blue-600">96%</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Daily Stats Modal */}
      {showStatsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="flex justify-between items-center">
              <CardTitle>Günlük İstatistikler</CardTitle>
              <button
                onClick={() => setShowStatsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="work_hours" className="block text-sm font-medium text-gray-700 mb-2">
                  Çalışma Süresi (saat)
                </label>
                <Input
                  id="work_hours"
                  type="number"
                  name="work_hours"
                  step="0.5"
                  min="0"
                  value={formData.work_hours}
                  onChange={handleInputChange}
                  placeholder="Örn: 2.5"
                />
              </div>

              <div>
                <label htmlFor="questions_answered" className="block text-sm font-medium text-gray-700 mb-2">
                  Yanıtlanan Sorular (sayı)
                </label>
                <Input
                  id="questions_answered"
                  type="number"
                  name="questions_answered"
                  min="0"
                  value={formData.questions_answered}
                  onChange={handleInputChange}
                  placeholder="Örn: 15"
                />
              </div>

              <div>
                <label htmlFor="topics_studied" className="block text-sm font-medium text-gray-700 mb-2">
                  Çalışılan Konular
                </label>
                <Input
                  id="topics_studied"
                  type="text"
                  name="topics_studied"
                  value={formData.topics_studied}
                  onChange={handleInputChange}
                  placeholder="Örn: JavaScript, React, Node.js"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSaveStats}
                  disabled={isSaving}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
                </Button>
                <Button
                  onClick={() => setShowStatsModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  İptal
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
