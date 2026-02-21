'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/auth/AuthContext';
import { Button } from '@/app/components/Button';
import { Input } from '@/app/components/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/Card';
import { Alert } from '@/app/components/Alert';
import { AuthIntroPanel } from '@/app/auth/AuthIntroPanel';

export default function LoginPage() {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData.email, formData.password);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex overflow-x-hidden w-full max-w-full">
      {/* Sol panel - Proje tanıtımı ve referans yorumları (masaüstünde görünür) */}
      <div className="hidden lg:flex lg:w-[44%] xl:w-[42%] bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 p-8 xl:p-12 flex-shrink-0">
        <AuthIntroPanel />
      </div>

      {/* Sağ panel - Form */}
      <div className="flex-1 min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          {/* Mobil: kısa proje başlığı */}
          <div className="lg:hidden text-center mb-6">
            <h1 className="text-xl font-bold text-indigo-900">Öğrenci Takip Sistemi</h1>
            <p className="text-sm text-slate-600 mt-1">Güvenli giriş ile devam takibinize erişin</p>
          </div>

          <Card className="w-full shadow-xl shadow-indigo-900/5 border border-slate-200/80 rounded-xl overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl text-slate-800">Giriş Yap</CardTitle>
              <p className="text-slate-600 text-sm mt-1">Hesabınızla devam edin</p>
            </CardHeader>
            <CardContent className="pt-0">
              {error && <Alert type="error">{error}</Alert>}

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="E-posta"
                  name="email"
                  type="email"
                  placeholder="ornek@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />

                <Input
                  label="Şifre"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5"
                >
                  {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
                </Button>
              </form>

              <p className="text-center text-sm text-slate-600 mt-5 pt-4 border-t border-slate-100">
                Hesabınız yok mu?{' '}
                <Link href="/auth/register" className="text-indigo-600 font-medium hover:underline">
                  Kaydol
                </Link>
                {' · '}
                <Link href="/" className="text-indigo-600 font-medium hover:underline">
                  Anasayfa
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
