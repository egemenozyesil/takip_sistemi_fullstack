'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/auth/AuthContext';
import { Button } from '@/app/components/Button';
import { Input } from '@/app/components/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/Card';
import { Alert } from '@/app/components/Alert';

export default function RegisterPage() {
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    studentNumber: '',
    department: '',
    phone: ''
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
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Şifreler eşleşmiyor');
      }

      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        studentNumber: formData.studentNumber,
        department: formData.department,
        phone: formData.phone
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Öğrenci Kaydı</CardTitle>
          <p className="text-gray-600 text-sm mt-2">Takip sistemine katılmak için kaydolun</p>
        </CardHeader>
        <CardContent>
          {error && <Alert type="error">{error}</Alert>}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Ad Soyad"
              name="name"
              type="text"
              placeholder="Adınız ve soyadınız"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="ornek@email.com"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <Input
              label="Öğrenci Numarası (Opsiyonel)"
              name="studentNumber"
              type="text"
              placeholder="2024001"
              value={formData.studentNumber}
              onChange={handleChange}
            />

            <Input
              label="Bölüm (Opsiyonel)"
              name="department"
              type="text"
              placeholder="Bilgisayar Mühendisliği"
              value={formData.department}
              onChange={handleChange}
            />

            <Input
              label="Telefon (Opsiyonel)"
              name="phone"
              type="tel"
              placeholder="+90 555 555 55 55"
              value={formData.phone}
              onChange={handleChange}
            />

            <Input
              label="Şifre"
              name="password"
              type="password"
              placeholder="En az 6 karakter"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <Input
              label="Şifre Onayla"
              name="confirmPassword"
              type="password"
              placeholder="Şifrenizi tekrar girin"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Kaydolunuyor...' : 'Kaydol'}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-4">
            Zaten hesabınız var mı?{' '}
            <Link href="/auth/login" className="text-blue-600 hover:underline">
              Giriş yapın
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
