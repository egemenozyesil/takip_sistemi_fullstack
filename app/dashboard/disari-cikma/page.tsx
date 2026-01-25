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
import { LogOut, Plus, Trash2, Calendar, Clock } from 'lucide-react';

interface GoingOut {
  id: string;
  out_date: string;
  duration_hours: number;
  purpose: string | null;
  notes: string | null;
}

export default function GoingOutPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [records, setRecords] = useState<GoingOut[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState({
    out_date: new Date().toISOString().split('T')[0],
    duration_hours: '',
    purpose: '',
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
      fetchRecords();
    }
  }, [user, startDate, endDate]);

  const fetchRecords = async () => {
    setLoadingRecords(true);
    try {
      let url = '/api/going-out';
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      if (params.toString()) url += '?' + params.toString();

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setRecords(data);
      }
    } catch (error) {
      console.error('Error fetching records:', error);
    } finally {
      setLoadingRecords(false);
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
      const response = await fetch('/api/going-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          out_date: formData.out_date,
          duration_hours: parseFloat(formData.duration_hours) || 0,
          purpose: formData.purpose || null,
          notes: formData.notes || null,
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Dışarı çıkma kaydı başarıyla eklendi' });
        setFormData({
          out_date: new Date().toISOString().split('T')[0],
          duration_hours: '',
          purpose: '',
          notes: '',
        });
        setShowModal(false);
        fetchRecords();
        setTimeout(() => setMessage(null), 3000);
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error || 'Kayıt eklenirken hata oluştu' });
      }
    } catch (error) {
      console.error('Error saving record:', error);
      setMessage({ type: 'error', text: 'Bir hata oluştu' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu kaydı silmek istediğinize emin misiniz?')) return;

    try {
      const response = await fetch(`/api/going-out?id=${id}`, { method: 'DELETE' });
      if (response.ok) {
        setMessage({ type: 'success', text: 'Kayıt başarıyla silindi' });
        fetchRecords();
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: 'Kayıt silinirken hata oluştu' });
      }
    } catch (error) {
      console.error('Error deleting record:', error);
      setMessage({ type: 'error', text: 'Bir hata oluştu' });
    }
  };

  const totalHours = records.reduce((sum, record) => sum + record.duration_hours, 0);
  const avgHours = records.length > 0 ? (totalHours / records.length).toFixed(1) : 0;

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
                <LogOut className="text-blue-600" size={32} />
                Dışarı Çıkma Takibi
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

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-gray-800 text-sm font-medium">Toplam Süre</p>
                    <p className="text-4xl font-bold text-blue-600 mt-2">{totalHours.toFixed(1)}</p>
                    <p className="text-gray-800 text-xs mt-1">saat</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-gray-800 text-sm font-medium">Ortalama Süre</p>
                    <p className="text-4xl font-bold text-green-600 mt-2">{avgHours}</p>
                    <p className="text-gray-800 text-xs mt-1">saat</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-gray-800 text-sm font-medium">Toplam Kayıt</p>
                    <p className="text-4xl font-bold text-purple-600 mt-2">{records.length}</p>
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

            {/* Records List */}
            <Card>
              <CardHeader>
                <CardTitle>Dışarı Çıkma Kayıtları</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingRecords ? (
                  <div className="text-center py-8 text-gray-700">Yükleniyor...</div>
                ) : records.length === 0 ? (
                  <div className="text-center py-8 text-gray-700">
                    Henüz dışarı çıkma kaydı bulunmuyor.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {records.map((record) => (
                      <div
                        key={record.id}
                        className="border rounded-lg p-4 hover:bg-gray-50 transition"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-4 text-sm text-gray-800 mb-2">
                              <span className="flex items-center gap-1">
                                <Calendar size={16} />
                                {new Date(record.out_date).toLocaleDateString('tr-TR')}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock size={16} />
                                {record.duration_hours} saat
                              </span>
                            </div>
                            {record.purpose && (
                              <p className="font-medium text-gray-900 mb-1">{record.purpose}</p>
                            )}
                            {record.notes && (
                              <p className="text-sm text-gray-700 mt-2">{record.notes}</p>
                            )}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(record.id)}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="flex justify-between items-center">
              <CardTitle>Yeni Dışarı Çıkma Kaydı</CardTitle>
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
                    Tarih *
                  </label>
                  <Input
                    type="date"
                    name="out_date"
                    value={formData.out_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Süre (saat)
                  </label>
                  <Input
                    type="number"
                    name="duration_hours"
                    value={formData.duration_hours}
                    onChange={handleInputChange}
                    step="0.5"
                    min="0"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amaç
                  </label>
                  <Input
                    type="text"
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleInputChange}
                    placeholder="Örn: Alışveriş, Spor, vb."
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
