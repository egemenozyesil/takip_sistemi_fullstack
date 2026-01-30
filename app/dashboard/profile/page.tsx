'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/auth/AuthContext';
import { Button } from '@/app/components/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/Card';
import { Input } from '@/app/components/Input';
import { Alert } from '@/app/components/Alert';
import Sidebar from '@/app/components/Sidebar';
import Navbar from '@/app/components/Navbar';
import { Mail, Phone, BookOpen, FileText, Save, X } from 'lucide-react';

interface ProfileData {
  id: string;
  name: string;
  email: string;
  student_number: string;
  department: string | null;
  phone: string | null;
  bio: string | null;
  avatar: string | null;
}

export default function ProfilePage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    phone: '',
    department: '',
    bio: '',
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (user) {
      fetchProfile();
    }
  }, [user, loading, isAuthenticated, router]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/students/update-profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setFormData({
          phone: data.phone || '',
          department: data.department || '',
          bio: data.bio || '',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setMessage({ type: 'error', text: 'Profil yüklenirken hata oluştu' });
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/students/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updated = await response.json();
        setProfile(updated);
        setIsEditing(false);
        setMessage({ type: 'success', text: 'Profil başarıyla güncellendi' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: 'Profil güncellenirken hata oluştu' });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
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
          <p className="text-gray-800">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden w-full max-w-full">
      <Navbar />
      <div className="flex overflow-x-hidden w-full max-w-full pt-16">
        <Sidebar />
        <div className="flex-1 md:ml-64 w-full max-w-full overflow-x-hidden">
          <main className="w-full max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-x-hidden">
            {message.text && (
              <div className="fixed top-16 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:right-auto md:max-w-md z-[60] animate-in fade-in slide-in-from-top-2 duration-200">
                <Alert
                  type={message.type as 'success' | 'error' | 'info' | 'warning'}
                  className="shadow-lg"
                >
                  <div className="flex justify-between items-center">
                    <span>{message.text}</span>
                    <button onClick={() => setMessage({ type: '', text: '' })} className="ml-4 font-medium">✕</button>
                  </div>
                </Alert>
              </div>
            )}

            <Card className="mb-6">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-2xl text-gray-900">Profil Bilgileri</CardTitle>
                  <Button
                    onClick={() => {
                      if (isEditing) {
                        setFormData({
                          phone: profile.phone || '',
                          department: profile.department || '',
                          bio: profile.bio || '',
                        });
                      }
                      setIsEditing(!isEditing);
                    }}
                    variant={isEditing ? 'outline' : 'default'}
                  >
                    {isEditing ? (
                      <>
                        <X size={18} />
                        <span>İptal</span>
                      </>
                    ) : (
                      <span>Düzenle</span>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Display Only Section */}
                {!isEditing && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Ad Soyad
                        </label>
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-800">{profile.name}</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Öğrenci Numarası
                        </label>
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                          <BookOpen size={18} className="text-gray-800" />
                          <span className="text-gray-800">{profile.student_number}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Email
                      </label>
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <Mail size={18} className="text-gray-800" />
                        <span className="text-gray-800">{profile.email}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Bölüm
                        </label>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-800">
                            {profile.department || 'Belirtilmemiş'}
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Telefon
                        </label>
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                          <Phone size={18} className="text-gray-800" />
                          <span className="text-gray-800">{profile.phone || 'Belirtilmemiş'}</span>
                        </div>
                      </div>
                    </div>

                    {profile.bio && (
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Biyografi
                        </label>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-gray-800 whitespace-pre-wrap">{profile.bio}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Edit Mode Section */}
                {isEditing && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Ad Soyad
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg text-gray-800">
                        {profile.name}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="department" className="block text-sm font-medium text-gray-900 mb-2">
                        Bölüm
                      </label>
                      <Input
                        id="department"
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        placeholder="Bölümünüzü girin"
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-900 mb-2">
                        Telefon
                      </label>
                      <Input
                        id="phone"
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Telefon numaranızı girin"
                      />
                    </div>

                    <div>
                      <label htmlFor="bio" className="block text-sm font-medium text-gray-900 mb-2">
                        Biyografi
                      </label>
                      <textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        placeholder="Kendiniz hakkında yazın..."
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      />
                    </div>

                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="w-full bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2"
                    >
                      <Save size={18} />
                      <span>{isSaving ? 'Kaydediliyor...' : 'Kaydet'}</span>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-gray-900">Ek Bilgiler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-800">Üyelik Tarihi</span>
                    <span className="text-gray-800 font-medium">
                      {new Date().toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-800">Hesap Durumu</span>
                    <span className="text-green-600 font-medium">Aktif</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
}
