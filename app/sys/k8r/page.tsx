'use client';

import React, { useState } from 'react';
import { Button } from '@/app/components/Button';
import { Input } from '@/app/components/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/Card';
import { Alert } from '@/app/components/Alert';

export default function UserRemovePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/delete-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Bir hata oluştu');
      }

      setSuccess('Kullanıcı başarıyla silindi.');
      setFormData({ email: '', password: '' });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-gray-700">Sistem Bakımı</CardTitle>
          <p className="text-gray-500 text-sm mt-2">Veritabanı kullanıcı işlemleri</p>
        </CardHeader>
        <CardContent>
          {error && <Alert type="error">{error}</Alert>}
          {success && <Alert type="success">{success}</Alert>}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="kullanici@email.com"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <Input
              label="Şifre"
              name="password"
              type="password"
              placeholder="Kullanıcı şifresi"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <Button type="submit" disabled={loading} variant="destructive" className="w-full">
              {loading ? 'İşleniyor...' : 'İşlemi Onayla'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
