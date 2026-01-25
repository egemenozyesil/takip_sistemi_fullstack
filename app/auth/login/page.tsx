'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/auth/AuthContext';
import { Button } from '@/app/components/Button';
import { Input } from '@/app/components/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/Card';
import { Alert } from '@/app/components/Alert';

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 overflow-x-hidden w-full max-w-full">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Giriş Yap</CardTitle>
          <p className="text-gray-800 text-sm mt-2">Takip sistemi hesabınıza giriş yapın</p>
        </CardHeader>
        <CardContent>
          {error && <Alert type="error">{error}</Alert>}
          
          <form onSubmit={handleSubmit} className="space-y-4">
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
              label="Şifre"
              name="password"
              type="password"
              placeholder="Şifrenizi girin"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-800 mt-4">
            Hesabınız yok mu?{' '}
            <Link href="/auth/register" className="text-blue-600 hover:underline">
              Kaydol
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
