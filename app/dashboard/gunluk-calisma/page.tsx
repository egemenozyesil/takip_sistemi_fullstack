'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/auth/AuthContext';
import { Button } from '@/app/components/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/Card';
import { Input } from '@/app/components/Input';
import { Alert } from '@/app/components/Alert';
import Sidebar from '@/app/components/Sidebar';
import Navbar from '@/app/components/Navbar';
import { Clock, Plus, Trash2, Calendar, HelpCircle, BookOpen, X } from 'lucide-react';

interface Topic {
  id: string;
  lesson_id: string;
  unit: string | null;
  topic: string;
  soru_tipleri: string | null;
  lesson_name: string;
}

interface DailyStats {
  id: string;
  date: string;
  topic_id: string | null;
  work_minutes: number;
  questions_answered: number;
  soru_tipleri: string | null;
  topic: string | null;
  unit: string | null;
  lesson_name: string | null;
}

interface DailyStatsForm {
  date: string;
  lesson_id: string;
  topic_id: string;
  work_minutes: string;
  questions_answered: string;
  soru_tipleri: string;
}

export default function DailyStudyPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DailyStats[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState<DailyStatsForm>({
    date: new Date().toISOString().split('T')[0],
    lesson_id: '',
    topic_id: '',
    work_minutes: '',
    questions_answered: '',
    soru_tipleri: '',
  });
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      fetchStats();
      fetchTopics();
    }
  }, [user, startDate, endDate]);

  useEffect(() => {
    if (formData.lesson_id) {
      // Filter topics by selected lesson
      fetchTopics();
    }
  }, [formData.lesson_id]);

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      let url = '/api/students/daily-stats';
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      if (params.toString()) url += '?' + params.toString();

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        const list = Array.isArray(data) ? data : (data?.stats != null ? data.stats : [data]);
        setStats(Array.isArray(list) ? list : [list]);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchTopics = async () => {
    setLoadingTopics(true);
    try {
      let url = '/api/topics';
      if (formData.lesson_id) {
        url += `?lesson_id=${formData.lesson_id}`;
      }

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setTopics(data);
      }
    } catch (error) {
      console.error('Error fetching topics:', error);
    } finally {
      setLoadingTopics(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      // If lesson changed, reset topic
      if (name === 'lesson_id') {
        newData.topic_id = '';
      }
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.topic_id) {
      setMessage({ type: 'error', text: 'Lütfen bir konu seçin' });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/students/daily-stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: formData.date,
          topic_id: formData.topic_id,
          work_minutes: parseInt(formData.work_minutes) || 0,
          questions_answered: parseInt(formData.questions_answered) || 0,
          soru_tipleri: formData.soru_tipleri || null,
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Günlük istatistikler başarıyla kaydedildi' });
        setFormData({
          date: new Date().toISOString().split('T')[0],
          lesson_id: '',
          topic_id: '',
          work_minutes: '',
          questions_answered: '',
          soru_tipleri: '',
        });
        setShowModal(false);
        fetchStats();
        setTimeout(() => setMessage(null), 3000);
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error || 'Kayıt eklenirken hata oluştu' });
      }
    } catch (error) {
      console.error('Error saving stats:', error);
      setMessage({ type: 'error', text: 'Bir hata oluştu' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!id) {
      setMessage({ type: 'error', text: 'Bu kayıt silinemiyor (geçersiz kayıt)' });
      return;
    }
    if (!confirm('Bu kaydı silmek istediğinize emin misiniz?')) return;

    try {
      const response = await fetch(`/api/students/daily-stats?id=${id}`, { method: 'DELETE' });
      if (response.ok) {
        setMessage({ type: 'success', text: 'Kayıt başarıyla silindi' });
        fetchStats();
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: 'Kayıt silinirken hata oluştu' });
      }
    } catch (error) {
      console.error('Error deleting stats:', error);
      setMessage({ type: 'error', text: 'Bir hata oluştu' });
    }
  };

  const totalMinutes = stats.reduce((sum, stat) => sum + (stat.work_minutes || 0), 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;
  const totalQuestions = stats.reduce((sum, stat) => sum + (stat.questions_answered || 0), 0);
  const avgMinutes = stats.length > 0 ? Math.floor(totalMinutes / stats.length) : 0;
  const avgHours = Math.floor(avgMinutes / 60);
  const avgRemainingMinutes = avgMinutes % 60;

  // Get unique lessons from topics
  const lessons = Array.from(
    new Map(topics.map(t => [t.lesson_id, t.lesson_name])).entries()
  ).map(([id, name]) => ({ id, name }));

  // Get unique question types from selected topic
  const selectedTopic = topics.find(t => t.id === formData.topic_id);
  const questionTypes = selectedTopic?.soru_tipleri
    ? selectedTopic.soru_tipleri.split(',').map(t => t.trim()).filter(t => t)
    : [];

  // Get all unique question types from all topics for dropdown
  const allQuestionTypes = Array.from(
    new Set(
      topics
        .filter(t => t.soru_tipleri)
        .flatMap(t => t.soru_tipleri!.split(',').map(q => q.trim()))
        .filter(q => q)
    )
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-800">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden w-full max-w-full">
      <Navbar />
      <div className="flex overflow-x-hidden w-full max-w-full pt-16">
        <Sidebar />
        <div className="flex-1 md:ml-64 w-full max-w-full overflow-x-hidden">
          <main className="w-full max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-x-hidden">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                  <Clock className="text-blue-600" size={32} />
                  Günlük Çalışma
                </h1>
                <p className="text-gray-800 mt-2">Günlük çalışma istatistiklerinizi buradan yönetebilirsiniz.</p>
              </div>
              <Button
                onClick={() => setShowModal(true)}
                className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus size={18} />
                Yeni Kayıt
              </Button>
            </div>

            {message && (
              <div className="fixed top-16 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:right-auto md:max-w-md z-[60] animate-in fade-in slide-in-from-top-2 duration-200">
                <Alert type={message.type} className="shadow-lg">
                  <div className="flex justify-between items-center">
                    <span>{message.text}</span>
                    <button onClick={() => setMessage(null)} className="font-medium">✕</button>
                  </div>
                </Alert>
              </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-gray-800 text-sm font-medium">Toplam Çalışma Süresi</p>
                    <p className="text-4xl font-bold text-blue-600 mt-2">
                      {totalHours > 0 ? `${totalHours}s ` : ''}{remainingMinutes}dk
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-gray-800 text-sm font-medium">Toplam Çözülen Soru</p>
                    <p className="text-4xl font-bold text-green-600 mt-2">{totalQuestions}</p>
                    <p className="text-gray-800 text-xs mt-1">soru</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-gray-800 text-sm font-medium">Ortalama Çalışma Süresi</p>
                    <p className="text-4xl font-bold text-purple-600 mt-2">
                      {avgHours > 0 ? `${avgHours}s ` : ''}{avgRemainingMinutes}dk
                    </p>
                    <p className="text-gray-800 text-xs mt-1">günlük</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Başlangıç Tarihi
                    </label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Bitiş Tarihi
                    </label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setStartDate('');
                      setEndDate('');
                    }}
                  >
                    Temizle
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Stats List */}
            <Card>
              <CardHeader>
                <CardTitle>Çalışma Kayıtları</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingStats ? (
                  <div className="text-center py-8 text-gray-700">Yükleniyor...</div>
                ) : stats.length === 0 ? (
                  <div className="text-center py-8 text-gray-700">
                    Henüz çalışma kaydı bulunmuyor.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {stats.map((stat, index) => {
                      const hours = Math.floor((stat.work_minutes || 0) / 60);
                      const minutes = (stat.work_minutes || 0) % 60;
                      return (
                        <div
                          key={stat.id ? `${stat.id}-${index}` : `stat-${index}`}
                          className="border rounded-lg p-4 hover:bg-gray-50 transition"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-4 text-sm text-gray-800 mb-3">
                                <span className="flex items-center gap-1">
                                  <Calendar size={16} />
                                  {stat.date
                                    ? (() => {
                                        const d = new Date(stat.date);
                                        return Number.isNaN(d.getTime())
                                          ? String(stat.date)
                                          : d.toLocaleDateString('tr-TR', {
                                              weekday: 'long',
                                              year: 'numeric',
                                              month: 'long',
                                              day: 'numeric'
                                            });
                                      })()
                                    : 'Tarih belirtilmemiş'}
                                </span>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {stat.lesson_name && stat.topic && (
                                  <div className="flex items-center gap-2">
                                    <BookOpen className="text-purple-600" size={20} />
                                    <div>
                                      <p className="text-xs text-gray-600">Ders / Konu</p>
                                      <p className="font-semibold text-gray-900 text-sm">
                                        {stat.lesson_name}
                                        {stat.unit && ` - ${stat.unit}`}
                                      </p>
                                      <p className="text-xs text-gray-700">{stat.topic}</p>
                                    </div>
                                  </div>
                                )}
                                <div className="flex items-center gap-2">
                                  <Clock className="text-blue-600" size={20} />
                                  <div>
                                    <p className="text-xs text-gray-600">Çalışma Süresi</p>
                                    <p className="font-semibold text-gray-900">
                                      {hours > 0 ? `${hours}s ` : ''}{minutes}dk
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <HelpCircle className="text-green-600" size={20} />
                                  <div>
                                    <p className="text-xs text-gray-600">Çözülen Soru</p>
                                    <p className="font-semibold text-gray-900">{stat.questions_answered || 0} soru</p>
                                  </div>
                                </div>
                                {stat.soru_tipleri && (
                                  <div className="flex items-center gap-2">
                                    <BookOpen className="text-orange-600" size={20} />
                                    <div>
                                      <p className="text-xs text-gray-600">Soru Tipi</p>
                                      <p className="font-semibold text-gray-900 text-sm">{stat.soru_tipleri}</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(stat.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 size={18} />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="flex justify-between items-center">
              <CardTitle>Günlük İstatistikler</CardTitle>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-900 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-900 mb-2">
                    Tarih *
                  </label>
                  <Input
                    id="date"
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="lesson_id" className="block text-sm font-medium text-gray-900 mb-2">
                    Ders *
                  </label>
                  <select
                    id="lesson_id"
                    name="lesson_id"
                    value={formData.lesson_id}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  >
                    <option value="" className="text-gray-900">Ders seçin</option>
                    {lessons.map((lesson) => (
                      <option key={lesson.id} value={lesson.id}>
                        {lesson.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="topic_id" className="block text-sm font-medium text-gray-900 mb-2">
                    Konu *
                  </label>
                  <select
                    id="topic_id"
                    name="topic_id"
                    value={formData.topic_id}
                    onChange={handleInputChange}
                    required
                    disabled={!formData.lesson_id || loadingTopics}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900"
                  >
                    <option value="" className="text-gray-900">Önce ders seçin</option>
                    {topics
                      .filter(t => t.lesson_id === formData.lesson_id)
                      .map((topic) => (
                        <option key={topic.id} value={topic.id}>
                          {topic.lesson_name}
                          {topic.unit && ` - ${topic.unit}`}: {topic.topic}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="work_minutes" className="block text-sm font-medium text-gray-900 mb-2">
                    Çalışma Süresi (dakika)
                  </label>
                  <Input
                    id="work_minutes"
                    type="number"
                    name="work_minutes"
                    min="0"
                    value={formData.work_minutes}
                    onChange={handleInputChange}
                    placeholder="Örn: 120"
                  />
                </div>
                <div>
                  <label htmlFor="questions_answered" className="block text-sm font-medium text-gray-900 mb-2">
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
                  <label htmlFor="soru_tipleri" className="block text-sm font-medium text-gray-900 mb-2">
                    Soru Tipi (Opsiyonel)
                  </label>
                  <select
                    id="soru_tipleri"
                    name="soru_tipleri"
                    value={formData.soru_tipleri}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  >
                    <option value="" className="text-gray-900">Soru tipi seçin (opsiyonel)</option>
                    {questionTypes.length > 0 ? (
                      questionTypes.map((type, index) => (
                        <option key={index} value={type}>
                          {type}
                        </option>
                      ))
                    ) : (
                      allQuestionTypes.map((type, index) => (
                        <option key={index} value={type}>
                          {type}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={isSaving || !formData.topic_id}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowModal(false)}
                    className="flex-1"
                  >
                    İptal
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
