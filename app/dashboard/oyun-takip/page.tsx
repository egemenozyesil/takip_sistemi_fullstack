'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/auth/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/Card';
import { Button } from '@/app/components/Button';
import { Input } from '@/app/components/Input';
import { Alert } from '@/app/components/Alert';
import Sidebar from '@/app/components/Sidebar';
import Navbar from '@/app/components/Navbar';
import { Gamepad2, Plus, Trash2, Calendar, Clock } from 'lucide-react';

interface GameSession {
  id: string;
  game_name: string;
  duration_minutes: number;
  play_date: string;
  notes: string | null;
}

export default function GameTrackingPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [games, setGames] = useState<GameSession[]>([]);
  const [loadingGames, setLoadingGames] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState({
    game_name: '',
    duration_minutes: '',
    play_date: new Date().toISOString().split('T')[0],
    notes: '',
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
      fetchGames();
    }
  }, [user, startDate, endDate]);

  const fetchGames = async () => {
    setLoadingGames(true);
    try {
      let url = '/api/games';
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      if (params.toString()) url += '?' + params.toString();

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setGames(data);
      }
    } catch (error) {
      console.error('Error fetching games:', error);
    } finally {
      setLoadingGames(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          game_name: formData.game_name,
          duration_minutes: parseInt(formData.duration_minutes) || 0,
          play_date: formData.play_date,
          notes: formData.notes || null,
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Oyun oynama kaydı başarıyla eklendi' });
        setFormData({
          game_name: '',
          duration_minutes: '',
          play_date: new Date().toISOString().split('T')[0],
          notes: '',
        });
        setShowModal(false);
        fetchGames();
        setTimeout(() => setMessage(null), 3000);
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error || 'Kayıt eklenirken hata oluştu' });
      }
    } catch (error) {
      console.error('Error saving game:', error);
      setMessage({ type: 'error', text: 'Bir hata oluştu' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu kaydı silmek istediğinize emin misiniz?')) return;

    try {
      const response = await fetch(`/api/games?id=${id}`, { method: 'DELETE' });
      if (response.ok) {
        setMessage({ type: 'success', text: 'Kayıt başarıyla silindi' });
        fetchGames();
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: 'Kayıt silinirken hata oluştu' });
      }
    } catch (error) {
      console.error('Error deleting game:', error);
      setMessage({ type: 'error', text: 'Bir hata oluştu' });
    }
  };

  const totalMinutes = games.reduce((sum, game) => sum + game.duration_minutes, 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalGamesCount = new Set(games.map((g) => g.game_name)).size;

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
      <div className="flex overflow-x-hidden w-full max-w-full pt-16">
        <Sidebar />
        <div className="flex-1 md:ml-64 w-full max-w-full overflow-x-hidden">
          <main className="w-full max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-x-hidden">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Gamepad2 className="text-purple-600" size={32} />
                Oyun Oynama Takibi
              </h1>
              <Button
                onClick={() => setShowModal(true)}
                className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
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
                    <p className="text-gray-800 text-sm font-medium">Toplam Oynama Süresi</p>
                    <p className="text-4xl font-bold text-purple-600 mt-2">
                      {totalHours}s {totalMinutes % 60}dk
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-gray-800 text-sm font-medium">Oynanan Oyun Sayısı</p>
                    <p className="text-4xl font-bold text-green-600 mt-2">{totalGamesCount}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-gray-800 text-sm font-medium">Toplam Kayıt</p>
                    <p className="text-4xl font-bold text-blue-600 mt-2">{games.length}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Başlangıç Tarihi
                    </label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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

            {/* Games List */}
            <Card>
              <CardHeader>
                <CardTitle>Oyun Oynama Kayıtları</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingGames ? (
                  <div className="text-center py-8 text-gray-700">Yükleniyor...</div>
                ) : games.length === 0 ? (
                  <div className="text-center py-8 text-gray-700">
                    Henüz oyun oynama kaydı bulunmuyor.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {games.map((game) => (
                      <div
                        key={game.id}
                        className="border rounded-lg p-4 hover:bg-gray-50 transition"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-lg">{game.game_name}</h3>
                            <div className="mt-2 flex items-center gap-4 text-sm text-gray-800">
                              <span className="flex items-center gap-1">
                                <Calendar size={16} />
                                {new Date(game.play_date).toLocaleDateString('tr-TR')}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock size={16} />
                                {Math.floor(game.duration_minutes / 60)}s {game.duration_minutes % 60}dk
                              </span>
                            </div>
                            {game.notes && (
                              <p className="mt-2 text-sm text-gray-700">{game.notes}</p>
                            )}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(game.id)}
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
          </main>
        </div>
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="flex justify-between items-center">
              <CardTitle>Yeni Oyun Oynama Kaydı</CardTitle>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-700 hover:text-gray-700"
              >
                ✕
              </button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Oyun Adı *
                  </label>
                  <Input
                    type="text"
                    name="game_name"
                    value={formData.game_name}
                    onChange={handleInputChange}
                    required
                    placeholder="Oyun adını girin"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Oynama Süresi (Dakika)
                  </label>
                  <Input
                    type="number"
                    name="duration_minutes"
                    value={formData.duration_minutes}
                    onChange={handleInputChange}
                    min="0"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Oynama Tarihi *
                  </label>
                  <Input
                    type="date"
                    name="play_date"
                    value={formData.play_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notlar
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Notlarınızı buraya yazın..."
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
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