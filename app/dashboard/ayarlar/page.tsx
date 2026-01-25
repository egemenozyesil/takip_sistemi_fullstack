'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/auth/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/Card';
import { Button } from '@/app/components/Button';
import { Alert } from '@/app/components/Alert';
import Sidebar from '@/app/components/Sidebar';
import Navbar from '@/app/components/Navbar';
import { Upload, FileSpreadsheet, CheckCircle, XCircle, Eye, X, Plus, BookOpen } from 'lucide-react';
import { Input } from '@/app/components/Input';

interface PreviewData {
  row: number;
  ders: string;
  unite: string;
  konu: string;
  meb_kazanim: string;
  alt_kazanimlar: string;
  soru_tipleri: string;
}

interface PreviewResponse {
  success: boolean;
  totalRows: number;
  validRows: number;
  errors: number;
  errorMessages: string[];
  preview: PreviewData[];
  hasMore: boolean;
}

export default function SettingsPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info' | 'warning'; text: string } | null>(null);
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number } | null>(null);
  const [previewData, setPreviewData] = useState<PreviewResponse | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  
  // Manual form state
  const [manualFormData, setManualFormData] = useState({
    ders: '',
    unite: '',
    konu: '',
    meb_kazanim: '',
    alt_kazanimlar: '',
    soru_tipleri: '',
  });
  const [isAddingManual, setIsAddingManual] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [loading, isAuthenticated, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const validExtensions = ['.xlsx', '.xls'];
      const fileExtension = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
      
      if (!validExtensions.includes(fileExtension)) {
        setMessage({ type: 'error', text: 'Lütfen geçerli bir Excel dosyası seçin (.xlsx veya .xls)' });
        setFile(null);
        return;
      }
      
      setFile(selectedFile);
      setMessage(null);
      setImportResult(null);
      setPreviewData(null);
      setShowPreview(false);
    }
  };

  const handlePreview = async () => {
    if (!file) {
      setMessage({ type: 'error', text: 'Lütfen bir dosya seçin' });
      return;
    }

    setIsPreviewing(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/topics/import/preview', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setPreviewData(data);
        setShowPreview(true);
        if (data.errors > 0) {
          setMessage({ 
            type: 'warning', 
            text: `${data.errors} satırda hata bulundu. Lütfen önizlemeyi kontrol edin.` 
          });
        } else {
          setMessage({ 
            type: 'info', 
            text: `${data.validRows} geçerli satır bulundu. Onaylamak için "İçe Aktar" butonuna tıklayın.` 
          });
        }
      } else {
        setMessage({ type: 'error', text: data.error || 'Dosya önizlenirken hata oluştu' });
      }
    } catch (error) {
      console.error('Preview error:', error);
      setMessage({ type: 'error', text: 'Bir hata oluştu. Lütfen tekrar deneyin.' });
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage({ type: 'error', text: 'Lütfen bir dosya seçin' });
      return;
    }

    setIsUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/topics/import', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message });
        setImportResult({ imported: data.imported, skipped: data.skipped });
        setFile(null);
        setPreviewData(null);
        setShowPreview(false);
        // Reset file input
        const fileInput = document.getElementById('file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        setMessage({ type: 'error', text: data.error || 'Dosya yüklenirken hata oluştu' });
      }
    } catch (error) {
      console.error('Upload error:', error);
      setMessage({ type: 'error', text: 'Bir hata oluştu. Lütfen tekrar deneyin.' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleManualInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setManualFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!manualFormData.ders.trim() || !manualFormData.konu.trim()) {
      setMessage({ type: 'error', text: 'Ders ve Konu alanları zorunludur' });
      return;
    }

    setIsAddingManual(true);
    setMessage(null);

    try {
      const response = await fetch('/api/topics/manual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(manualFormData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Konu başarıyla eklendi' });
        // Reset form
        setManualFormData({
          ders: '',
          unite: '',
          konu: '',
          meb_kazanim: '',
          alt_kazanimlar: '',
          soru_tipleri: '',
        });
      } else {
        setMessage({ type: 'error', text: data.error || 'Konu eklenirken hata oluştu' });
      }
    } catch (error) {
      console.error('Manual add error:', error);
      setMessage({ type: 'error', text: 'Bir hata oluştu. Lütfen tekrar deneyin.' });
    } finally {
      setIsAddingManual(false);
    }
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

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden w-full max-w-full">
      <Navbar />
      <div className="flex overflow-x-hidden w-full max-w-full">
        <Sidebar />
        <div className="flex-1 md:ml-64 w-full max-w-full overflow-x-hidden">
          <main className="w-full max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-x-hidden">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Ayarlar</h1>

            {message && (
              <Alert type={message.type} className="mb-6">
                <div className="flex justify-between items-center">
                  <span>{message.text}</span>
                  <button onClick={() => setMessage(null)} className="ml-4">
                    ✕
                  </button>
                </div>
              </Alert>
            )}

            {/* Manual Add Section */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="text-green-600" size={24} />
                  Manuel Konu Ekleme
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleManualSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="ders" className="block text-sm font-medium text-gray-900 mb-2">
                        Ders <span className="text-red-600">*</span>
                      </label>
                      <Input
                        id="ders"
                        type="text"
                        name="ders"
                        value={manualFormData.ders}
                        onChange={handleManualInputChange}
                        placeholder="Örn: Matematik"
                        required
                        className="text-gray-900"
                      />
                    </div>

                    <div>
                      <label htmlFor="unite" className="block text-sm font-medium text-gray-900 mb-2">
                        Ünite
                      </label>
                      <Input
                        id="unite"
                        type="text"
                        name="unite"
                        value={manualFormData.unite}
                        onChange={handleManualInputChange}
                        placeholder="Örn: Ünite 1"
                        className="text-gray-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="konu" className="block text-sm font-medium text-gray-900 mb-2">
                      Konu <span className="text-red-600">*</span>
                    </label>
                    <Input
                      id="konu"
                      type="text"
                      name="konu"
                      value={manualFormData.konu}
                      onChange={handleManualInputChange}
                      placeholder="Örn: Fonksiyonlar"
                      required
                      className="text-gray-900"
                    />
                  </div>

                  <div>
                    <label htmlFor="meb_kazanim" className="block text-sm font-medium text-gray-900 mb-2">
                      MEB Kazanımı
                    </label>
                    <Input
                      id="meb_kazanim"
                      type="text"
                      name="meb_kazanim"
                      value={manualFormData.meb_kazanim}
                      onChange={handleManualInputChange}
                      placeholder="MEB kazanımını girin"
                      className="text-gray-900"
                    />
                  </div>

                  <div>
                    <label htmlFor="alt_kazanimlar" className="block text-sm font-medium text-gray-900 mb-2">
                      Alt Kazanımlar
                    </label>
                    <textarea
                      id="alt_kazanimlar"
                      name="alt_kazanimlar"
                      value={manualFormData.alt_kazanimlar}
                      onChange={handleManualInputChange}
                      placeholder="Alt kazanımları girin"
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    />
                  </div>

                  <div>
                    <label htmlFor="soru_tipleri" className="block text-sm font-medium text-gray-900 mb-2">
                      Soru Tipleri
                    </label>
                    <Input
                      id="soru_tipleri"
                      type="text"
                      name="soru_tipleri"
                      value={manualFormData.soru_tipleri}
                      onChange={handleManualInputChange}
                      placeholder="Örn: Çoktan seçmeli, Boşluk doldurma"
                      className="text-gray-900"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="submit"
                      disabled={isAddingManual}
                      className="flex-1 bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2"
                    >
                      <Plus size={18} />
                      <span>{isAddingManual ? 'Ekleniyor...' : 'Konu Ekle'}</span>
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        setManualFormData({
                          ders: '',
                          unite: '',
                          konu: '',
                          meb_kazanim: '',
                          alt_kazanimlar: '',
                          soru_tipleri: '',
                        });
                      }}
                      variant="outline"
                      className="flex items-center justify-center gap-2"
                    >
                      <X size={18} />
                      <span>Temizle</span>
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Excel Import Section */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="text-blue-600" size={24} />
                  Konu İçe Aktarma
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-gray-800 mb-4">
                    Excel dosyası ile konuları toplu olarak içe aktarabilirsiniz. Dosya formatı:
                  </p>
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-300">
                          <th className="text-left p-2 text-gray-900 font-semibold">Ders</th>
                          <th className="text-left p-2 text-gray-900 font-semibold">Ünite</th>
                          <th className="text-left p-2 text-gray-900 font-semibold">Konu</th>
                          <th className="text-left p-2 text-gray-900 font-semibold">MEB Kazanımı</th>
                          <th className="text-left p-2 text-gray-900 font-semibold">Alt Kazanımlar</th>
                          <th className="text-left p-2 text-gray-900 font-semibold">Soru Tipleri</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="p-2 text-gray-900">Matematik</td>
                          <td className="p-2 text-gray-900">Ünite 1</td>
                          <td className="p-2 text-gray-900">Fonksiyonlar</td>
                          <td className="p-2 text-gray-900">Kazanım 1</td>
                          <td className="p-2 text-gray-900">Alt kazanım 1</td>
                          <td className="p-2 text-gray-900">Çoktan seçmeli</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <label htmlFor="file-input" className="block text-sm font-medium text-gray-800 mb-2">
                    Excel Dosyası Seç
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      id="file-input"
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleFileChange}
                      className="block w-full text-sm text-gray-800
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-lg file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100
                        cursor-pointer"
                    />
                    {file && (
                      <div className="flex items-center gap-2 text-sm text-gray-800">
                        <CheckCircle size={18} className="text-green-600" />
                        <span>{file.name}</span>
                        <span className="text-gray-800">({(file.size / 1024).toFixed(2)} KB)</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handlePreview}
                    disabled={!file || isPreviewing}
                    variant="outline"
                    className="flex items-center justify-center gap-2"
                  >
                    <Eye size={18} />
                    <span>{isPreviewing ? 'Önizleniyor...' : 'Önizle'}</span>
                  </Button>
                  <Button
                    onClick={handleUpload}
                    disabled={!file || !previewData || isUploading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
                  >
                    <Upload size={18} />
                    <span>{isUploading ? 'Yükleniyor...' : 'İçe Aktar'}</span>
                  </Button>
                </div>

                {importResult && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-green-800 mb-2">
                      <CheckCircle size={20} />
                      <span className="font-semibold">İçe Aktarma Tamamlandı</span>
                    </div>
                    <div className="text-sm text-green-900 space-y-1">
                      <p>Başarıyla içe aktarılan: {importResult.imported} konu</p>
                      {importResult.skipped > 0 && (
                        <p>Atlanan: {importResult.skipped} satır</p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Preview Section */}
            {showPreview && previewData && (
              <Card>
                <CardHeader className="flex justify-between items-center">
                  <CardTitle>Önizleme</CardTitle>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="text-gray-800 hover:text-gray-900"
                  >
                    <X size={24} />
                  </button>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 space-y-2">
                    <div className="flex gap-4 text-sm">
                      <span className="text-gray-800">
                        <span className="font-medium">Toplam Satır:</span> {previewData.totalRows}
                      </span>
                      <span className="text-green-800">
                        <span className="font-medium">Geçerli:</span> {previewData.validRows}
                      </span>
                      {previewData.errors > 0 && (
                        <span className="text-red-800">
                          <span className="font-medium">Hata:</span> {previewData.errors}
                        </span>
                      )}
                    </div>
                    {previewData.hasMore && (
                      <p className="text-sm text-gray-800">
                        İlk 50 satır gösteriliyor. Toplam {previewData.validRows} geçerli satır var.
                      </p>
                    )}
                  </div>

                  {previewData.errorMessages.length > 0 && (
                    <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="font-semibold text-red-900 mb-2">Hatalar:</h4>
                      <ul className="list-disc list-inside text-sm text-red-900 space-y-1">
                        {previewData.errorMessages.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-gray-100 border-b border-gray-300">
                          <th className="text-left p-2 font-semibold text-gray-800">Satır</th>
                          <th className="text-left p-2 font-semibold text-gray-800">Ders</th>
                          <th className="text-left p-2 font-semibold text-gray-800">Ünite</th>
                          <th className="text-left p-2 font-semibold text-gray-800">Konu</th>
                          <th className="text-left p-2 font-semibold text-gray-800">MEB Kazanımı</th>
                          <th className="text-left p-2 font-semibold text-gray-800">Alt Kazanımlar</th>
                          <th className="text-left p-2 font-semibold text-gray-800">Soru Tipleri</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.preview.map((row, index) => (
                          <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="p-2 text-gray-800">{row.row}</td>
                            <td className="p-2 text-gray-900 font-medium">{row.ders}</td>
                            <td className="p-2 text-gray-800">{row.unite || '-'}</td>
                            <td className="p-2 text-gray-900">{row.konu}</td>
                            <td className="p-2 text-gray-800">{row.meb_kazanim || '-'}</td>
                            <td className="p-2 text-gray-800">{row.alt_kazanimlar || '-'}</td>
                            <td className="p-2 text-gray-800">{row.soru_tipleri || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
