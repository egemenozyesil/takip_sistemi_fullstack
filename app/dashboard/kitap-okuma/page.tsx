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
import { Book, Plus, Trash2, Calendar } from 'lucide-react';

interface BookReading {
  id: string;
  book_title: string;
  pages_read: number;
  reading_date: string;
  notes: string | null;
}

export default function BookReadingPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [books, setBooks] = useState<BookReading[]>([]);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState({
    book_title: '',
    pages_read: '',
    reading_date: new Date().toISOString().split('T')[0],
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
      fetchBooks();
    }
  }, [user, startDate, endDate]);

  const fetchBooks = async () => {
    setLoadingBooks(true);
    try {
      let url = '/api/books';
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      if (params.toString()) url += '?' + params.toString();

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setBooks(data);
      }
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoadingBooks(false);
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
      const response = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          book_title: formData.book_title,
          pages_read: parseInt(formData.pages_read) || 0,
          reading_date: formData.reading_date,
          notes: formData.notes || null,
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Kitap okuma kaydı başarıyla eklendi' });
        setFormData({
          book_title: '',
          pages_read: '',
          reading_date: new Date().toISOString().split('T')[0],
          notes: '',
        });
        setShowModal(false);
        fetchBooks();
        setTimeout(() => setMessage(null), 3000);
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error || 'Kayıt eklenirken hata oluştu' });
      }
    } catch (error) {
      console.error('Error saving book:', error);
      setMessage({ type: 'error', text: 'Bir hata oluştu' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu kaydı silmek istediğinize emin misiniz?')) return;

    try {
      const response = await fetch(`/api/books?id=${id}`, { method: 'DELETE' });
      if (response.ok) {
        setMessage({ type: 'success', text: 'Kayıt başarıyla silindi' });
        fetchBooks();
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: 'Kayıt silinirken hata oluştu' });
      }
    } catch (error) {
      console.error('Error deleting book:', error);
      setMessage({ type: 'error', text: 'Bir hata oluştu' });
    }
  };

  const totalPages = books.reduce((sum, book) => sum + book.pages_read, 0);
  const totalBooks = new Set(books.map((b) => b.book_title)).size;

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
                <Book className="text-blue-600" size={32} />
                Kitap Okuma Takibi
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
                    <p className="text-gray-800 text-sm font-medium">Toplam Okunan Sayfa</p>
                    <p className="text-4xl font-bold text-blue-600 mt-2">{totalPages}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-gray-800 text-sm font-medium">Okunan Kitap Sayısı</p>
                    <p className="text-4xl font-bold text-green-600 mt-2">{totalBooks}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-gray-800 text-sm font-medium">Toplam Kayıt</p>
                    <p className="text-4xl font-bold text-purple-600 mt-2">{books.length}</p>
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

            {/* Books List */}
            <Card>
              <CardHeader>
                <CardTitle>Okuma Kayıtları</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingBooks ? (
                  <div className="text-center py-8 text-gray-700">Yükleniyor...</div>
                ) : books.length === 0 ? (
                  <div className="text-center py-8 text-gray-700">
                    Henüz kitap okuma kaydı bulunmuyor.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {books.map((book) => (
                      <div
                        key={book.id}
                        className="border rounded-lg p-4 hover:bg-gray-50 transition"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-lg">{book.book_title}</h3>
                            <div className="mt-2 flex items-center gap-4 text-sm text-gray-800">
                              <span className="flex items-center gap-1">
                                <Calendar size={16} />
                                {new Date(book.reading_date).toLocaleDateString('tr-TR')}
                              </span>
                              <span>{book.pages_read} sayfa</span>
                            </div>
                            {book.notes && (
                              <p className="mt-2 text-sm text-gray-700">{book.notes}</p>
                            )}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(book.id)}
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
              <CardTitle>Yeni Kitap Okuma Kaydı</CardTitle>
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
                    Kitap Adı *
                  </label>
                  <Input
                    type="text"
                    name="book_title"
                    value={formData.book_title}
                    onChange={handleInputChange}
                    required
                    placeholder="Kitap adını girin"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Okunan Sayfa Sayısı
                  </label>
                  <Input
                    type="number"
                    name="pages_read"
                    value={formData.pages_read}
                    onChange={handleInputChange}
                    min="0"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Okuma Tarihi *
                  </label>
                  <Input
                    type="date"
                    name="reading_date"
                    value={formData.reading_date}
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
