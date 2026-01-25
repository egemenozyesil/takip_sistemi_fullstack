'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/app/auth/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/Card';
import { Button } from '@/app/components/Button';
import { Input } from '@/app/components/Input';
import { Alert } from '@/app/components/Alert';
import Sidebar from '@/app/components/Sidebar';
import Navbar from '@/app/components/Navbar';
import { 
  Target, 
  Plus, 
  Trash2, 
  Calendar, 
  BookOpen, 
  Clock, 
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  X
} from 'lucide-react';

interface Topic {
  id: string;
  lesson_id: string;
  unit: string | null;
  topic: string;
  lesson_name: string;
}

interface TopicProgress {
  id: string;
  topic: string;
  unit: string | null;
  lesson_id: string;
  lesson_name: string;
  total_study_hours: number;
  total_questions_solved: number;
  study_days: number;
  last_study_date: string | null;
  first_study_date: string | null;
}

interface TopicTracking {
  id: string;
  topic_id: string;
  study_date: string;
  study_hours: number;
  questions_solved: number;
  notes: string | null;
  topic: string;
  unit: string | null;
  lesson_name: string;
}

const DEFAULT_TARGET_HOURS = 10; // Varsayılan hedef süre (saat)

function TopicTrackingContent() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [topicProgress, setTopicProgress] = useState<TopicProgress[]>([]);
  const [trackings, setTrackings] = useState<TopicTracking[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState({
    topic_id: '',
    study_date: new Date().toISOString().split('T')[0],
    study_hours: '',
    questions_solved: '',
    notes: '',
  });
  const [selectedLesson, setSelectedLesson] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'progress' | 'records'>('progress');

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      fetchTopics();
      fetchTopicProgress();
      fetchTrackings();
    }
  }, [user]);

  useEffect(() => {
    const topicId = searchParams.get('topic');
    if (topicId) {
      setFormData((prev) => ({ ...prev, topic_id: topicId }));
      setShowModal(true);
    }
  }, [searchParams]);

  const fetchTopics = async () => {
    try {
      const response = await fetch('/api/topics');
      if (response.ok) {
        const data = await response.json();
        setTopics(data);
      }
    } catch (error) {
      console.error('Error fetching topics:', error);
    }
  };

  const fetchTopicProgress = async () => {
    setLoadingData(true);
    try {
      const response = await fetch('/api/topics/progress');
      if (response.ok) {
        const data = await response.json();
        setTopicProgress(data);
      }
    } catch (error) {
      console.error('Error fetching topic progress:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchTrackings = async () => {
    try {
      const response = await fetch('/api/topic-tracking');
      if (response.ok) {
        const data = await response.json();
        setTrackings(data);
      }
    } catch (error) {
      console.error('Error fetching trackings:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      const response = await fetch('/api/topic-tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic_id: formData.topic_id,
          study_date: formData.study_date,
          study_hours: parseFloat(formData.study_hours) || 0,
          questions_solved: parseInt(formData.questions_solved) || 0,
          notes: formData.notes || null,
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Konu takip kaydı başarıyla eklendi' });
        setFormData({
          topic_id: '',
          study_date: new Date().toISOString().split('T')[0],
          study_hours: '',
          questions_solved: '',
          notes: '',
        });
        setShowModal(false);
        fetchTopicProgress();
        fetchTrackings();
        setTimeout(() => setMessage(null), 3000);
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error || 'Kayıt eklenirken hata oluştu' });
      }
    } catch (error) {
      console.error('Error saving tracking:', error);
      setMessage({ type: 'error', text: 'Bir hata oluştu' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu kaydı silmek istediğinize emin misiniz?')) return;

    try {
      const response = await fetch(`/api/topic-tracking?id=${id}`, { method: 'DELETE' });
      if (response.ok) {
        setMessage({ type: 'success', text: 'Kayıt başarıyla silindi' });
        fetchTopicProgress();
        fetchTrackings();
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: 'Kayıt silinirken hata oluştu' });
      }
    } catch (error) {
      console.error('Error deleting tracking:', error);
      setMessage({ type: 'error', text: 'Bir hata oluştu' });
    }
  };

  const filteredTopics = selectedLesson
    ? topics.filter((t) => t.lesson_id === selectedLesson)
    : topics;

  const lessons = Array.from(new Set(topics.map((t) => ({ id: t.lesson_id, name: t.lesson_name }))))
    .reduce((acc, curr) => {
      if (!acc.find((l) => l.id === curr.id)) {
        acc.push(curr);
      }
      return acc;
    }, [] as { id: string; name: string }[]);

  // Filter progress by search and lesson
  const filteredProgress = topicProgress.filter((tp) => {
    const matchesSearch = searchQuery === '' || 
      tp.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tp.lesson_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tp.unit && tp.unit.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesLesson = selectedLesson === '' || tp.lesson_id === selectedLesson;
    return matchesSearch && matchesLesson;
  });

  // Calculate overall stats
  const totalHours = topicProgress.reduce((sum, tp) => sum + tp.total_study_hours, 0);
  const totalQuestions = topicProgress.reduce((sum, tp) => sum + tp.total_questions_solved, 0);
  const studiedTopics = topicProgress.filter(tp => tp.total_study_hours > 0).length;
  const totalTopics = topicProgress.length;
  const completionRate = totalTopics > 0 ? (studiedTopics / totalTopics) * 100 : 0;

  const getProgressPercentage = (hours: number) => {
    return Math.min((hours / DEFAULT_TARGET_HOURS) * 100, 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 70) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getProgressStatus = (hours: number) => {
    const percentage = getProgressPercentage(hours);
    if (percentage >= 100) return { text: 'Tamamlandı', icon: CheckCircle2, color: 'text-green-600' };
    if (percentage >= 70) return { text: 'İyi İlerleme', icon: TrendingUp, color: 'text-blue-600' };
    if (percentage >= 40) return { text: 'Orta İlerleme', icon: AlertCircle, color: 'text-yellow-600' };
    return { text: 'Başlangıç', icon: AlertCircle, color: 'text-red-600' };
  };

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

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden w-full max-w-full">
      <Navbar />
      <div className="flex overflow-x-hidden w-full max-w-full">
        <Sidebar />
        <div className="flex-1 md:ml-64 w-full max-w-full overflow-x-hidden">
          <main className="w-full max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-x-hidden">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Target className="text-blue-600" size={32} />
                Konu Takibi
              </h1>
              <Button
                onClick={() => setShowModal(true)}
                className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus size={18} />
                Yeni Kayıt
              </Button>
            </div>

            {message && (
              <Alert type={message.type} className="mb-6">
                <div className="flex justify-between items-center">
                  <span>{message.text}</span>
                  <button onClick={() => setMessage(null)}>✕</button>
                </div>
              </Alert>
            )}

            {/* Overall Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="border-l-4 border-l-blue-600">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-800 text-sm font-medium">Toplam Çalışma</p>
                      <p className="text-3xl font-bold text-blue-600 mt-2">{totalHours.toFixed(1)}</p>
                      <p className="text-gray-800 text-xs mt-1">saat</p>
                    </div>
                    <Clock className="text-blue-500" size={40} />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-green-600">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-800 text-sm font-medium">Çözülen Soru</p>
                      <p className="text-3xl font-bold text-green-600 mt-2">{totalQuestions}</p>
                    </div>
                    <BookOpen className="text-green-500" size={40} />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-purple-600">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-800 text-sm font-medium">Çalışılan Konu</p>
                      <p className="text-3xl font-bold text-purple-600 mt-2">{studiedTopics}/{totalTopics}</p>
                    </div>
                    <Target className="text-purple-500" size={40} />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-orange-600">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-800 text-sm font-medium">Tamamlanma</p>
                      <p className="text-3xl font-bold text-orange-600 mt-2">{completionRate.toFixed(0)}%</p>
                    </div>
                    <TrendingUp className="text-orange-500" size={40} />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-4 mb-6">
              <Button
                variant={viewMode === 'progress' ? 'default' : 'outline'}
                onClick={() => setViewMode('progress')}
                className="flex items-center gap-2"
              >
                <Target size={18} />
                İlerleme Görünümü
              </Button>
              <Button
                variant={viewMode === 'records' ? 'default' : 'outline'}
                onClick={() => setViewMode('records')}
                className="flex items-center gap-2"
              >
                <Calendar size={18} />
                Kayıt Listesi
              </Button>
            </div>

            {/* Filters */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <Input
                      type="text"
                      placeholder="Konu, ders veya ünite ara..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="md:w-64">
                    <select
                      value={selectedLesson}
                      onChange={(e) => setSelectedLesson(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    >
                      <option value="">Tüm Dersler</option>
                      {lessons.map((lesson) => (
                        <option key={lesson.id} value={lesson.id}>
                          {lesson.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {(searchQuery || selectedLesson) && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedLesson('');
                      }}
                      className="flex items-center gap-2"
                    >
                      <X size={18} />
                      Temizle
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Progress View */}
            {viewMode === 'progress' && (
              <div className="space-y-6">
                {loadingData ? (
                  <Card>
                    <CardContent className="pt-6 text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-800">Yükleniyor...</p>
                    </CardContent>
                  </Card>
                ) : filteredProgress.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6 text-center py-12">
                      <Target className="text-gray-400 mx-auto mb-4" size={48} />
                      <p className="text-gray-800">Konu bulunamadı.</p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredProgress.map((progress) => {
                    const percentage = getProgressPercentage(progress.total_study_hours);
                    const status = getProgressStatus(progress.total_study_hours);
                    const StatusIcon = status.icon;
                    const hours = progress.total_study_hours;
                    const minutes = Math.round((hours - Math.floor(hours)) * 60);

                    return (
                      <Card key={progress.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="pt-6">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-lg ${percentage >= 100 ? 'bg-green-100' : percentage >= 70 ? 'bg-blue-100' : percentage >= 40 ? 'bg-yellow-100' : 'bg-red-100'}`}>
                                  <StatusIcon className={status.color} size={24} />
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-bold text-gray-900 text-lg">
                                    {progress.lesson_name}
                                    {progress.unit && <span className="text-gray-600"> - {progress.unit}</span>}
                                  </h3>
                                  <p className="text-gray-800 mt-1 font-medium">{progress.topic}</p>
                                  
                                  {/* Progress Bar */}
                                  <div className="mt-4">
                                    <div className="flex justify-between items-center mb-2">
                                      <span className="text-sm font-semibold text-gray-900">
                                        {Math.floor(hours)}s {minutes}dk / {DEFAULT_TARGET_HOURS}s
                                      </span>
                                      <span className={`text-sm font-semibold ${status.color}`}>
                                        {status.text}
                                      </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                      <div
                                        className={`h-full transition-all duration-500 ${getProgressColor(percentage)}`}
                                        style={{ width: `${Math.min(percentage, 100)}%` }}
                                      />
                                    </div>
                                    <div className="flex justify-between items-center mt-1">
                                      <span className="text-xs text-gray-600">
                                        %{percentage.toFixed(1)} tamamlandı
                                      </span>
                                      {progress.total_study_hours < DEFAULT_TARGET_HOURS && (
                                        <span className="text-xs text-gray-600">
                                          {DEFAULT_TARGET_HOURS - progress.total_study_hours > 0 
                                            ? `${(DEFAULT_TARGET_HOURS - progress.total_study_hours).toFixed(1)}s kaldı`
                                            : 'Hedefe ulaşıldı!'}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:w-auto">
                              <div className="bg-blue-50 rounded-lg p-3 text-center">
                                <p className="text-xs text-gray-700 font-medium">Çözülen Soru</p>
                                <p className="text-xl font-bold text-blue-600 mt-1">{progress.total_questions_solved}</p>
                              </div>
                              <div className="bg-green-50 rounded-lg p-3 text-center">
                                <p className="text-xs text-gray-700 font-medium">Çalışma Günü</p>
                                <p className="text-xl font-bold text-green-600 mt-1">{progress.study_days}</p>
                              </div>
                              <div className="bg-purple-50 rounded-lg p-3 text-center col-span-2 md:col-span-1">
                                <p className="text-xs text-gray-700 font-medium">Son Çalışma</p>
                                <p className="text-sm font-semibold text-purple-600 mt-1">
                                  {progress.last_study_date
                                    ? new Date(progress.last_study_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
                                    : 'Henüz yok'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            )}

            {/* Records View */}
            {viewMode === 'records' && (
              <Card>
                <CardHeader>
                  <CardTitle>Konu Takip Kayıtları</CardTitle>
                </CardHeader>
                <CardContent>
                  {trackings.length === 0 ? (
                    <div className="text-center py-12 text-gray-800">
                      <Calendar className="text-gray-400 mx-auto mb-4" size={48} />
                      <p>Henüz konu takip kaydı bulunmuyor.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {trackings.map((tracking) => (
                        <div
                          key={tracking.id}
                          className="border rounded-lg p-4 hover:bg-gray-50 transition"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 text-lg">
                                {tracking.lesson_name}
                                {tracking.unit && ` - ${tracking.unit}`}
                              </h3>
                              <p className="text-gray-800 mt-1">{tracking.topic}</p>
                              <div className="mt-3 flex items-center gap-4 text-sm text-gray-800">
                                <span className="flex items-center gap-1">
                                  <Calendar size={16} />
                                  {new Date(tracking.study_date).toLocaleDateString('tr-TR')}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock size={16} />
                                  {tracking.study_hours} saat
                                </span>
                                <span className="flex items-center gap-1">
                                  <BookOpen size={16} />
                                  {tracking.questions_solved} soru
                                </span>
                              </div>
                              {tracking.notes && (
                                <p className="text-sm text-gray-700 mt-2">{tracking.notes}</p>
                              )}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(tracking.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 size={18} />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </main>
        </div>
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="flex justify-between items-center">
              <CardTitle className="text-gray-900">Yeni Konu Takip Kaydı</CardTitle>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-700 hover:text-gray-900"
              >
                ✕
              </button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Ders
                  </label>
                  <select
                    value={selectedLesson}
                    onChange={(e) => {
                      setSelectedLesson(e.target.value);
                      setFormData((prev) => ({ ...prev, topic_id: '' }));
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  >
                    <option value="">Tüm Dersler</option>
                    {lessons.map((lesson) => (
                      <option key={lesson.id} value={lesson.id}>
                        {lesson.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Konu *
                  </label>
                  <select
                    name="topic_id"
                    value={formData.topic_id}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  >
                    <option value="">Konu seçin</option>
                    {filteredTopics.map((topic) => (
                      <option key={topic.id} value={topic.id}>
                        {topic.lesson_name}
                        {topic.unit && ` - ${topic.unit}`}: {topic.topic}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Çalışma Tarihi *
                  </label>
                  <Input
                    type="date"
                    name="study_date"
                    value={formData.study_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Çalışma Süresi (saat)
                  </label>
                  <Input
                    type="number"
                    name="study_hours"
                    value={formData.study_hours}
                    onChange={handleInputChange}
                    step="0.5"
                    min="0"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Çözülen Soru Sayısı
                  </label>
                  <Input
                    type="number"
                    name="questions_solved"
                    value={formData.questions_solved}
                    onChange={handleInputChange}
                    min="0"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Notlar
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="Notlarınızı buraya yazın..."
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={isSaving}
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

export default function TopicTrackingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-800">Yükleniyor...</p>
        </div>
      </div>
    }>
      <TopicTrackingContent />
    </Suspense>
  );
}
