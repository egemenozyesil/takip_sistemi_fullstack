'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/auth/AuthContext';
import { Button } from '@/app/components/Button';
import { Input } from '@/app/components/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/Card';
import { Alert } from '@/app/components/Alert';
import { AuthIntroPanel } from '@/app/auth/AuthIntroPanel';

const PHONE_PREFIX = '+90';
const PASSWORD_MIN_LENGTH = 6;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function CheckIcon({ met }: { met: boolean }) {
  return met ? (
    <span className="text-emerald-600" aria-hidden>✓</span>
  ) : (
    <span className="text-slate-400" aria-hidden>✗</span>
  );
}

export default function RegisterPage() {
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
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

  const emailError = useMemo(() => {
    const e = formData.email.trim();
    if (!e) return '';
    if (!EMAIL_REGEX.test(e)) {
      return 'Geçerli bir e-posta adresi girin (örn: ornek@email.com)';
    }
    return '';
  }, [formData.email]);

  const phoneError = useMemo(() => {
    const p = formData.phone.trim();
    if (!p) return '';
    const normalized = p.replace(/\s/g, '');
    if (!normalized.startsWith(PHONE_PREFIX)) {
      return `Telefon numarası ${PHONE_PREFIX} ile başlamalıdır`;
    }
    const digitsAfterPrefix = normalized.slice(PHONE_PREFIX.length).replace(/\D/g, '');
    if (digitsAfterPrefix.length !== 10) {
      return 'Telefon numarası 10 haneli olmalıdır (5XX XXX XX XX)';
    }
    return '';
  }, [formData.phone]);

  const passwordChecks = useMemo(() => {
    const p = formData.password;
    return {
      length: p.length >= PASSWORD_MIN_LENGTH,
      hasNumber: /\d/.test(p),
      hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p)
    };
  }, [formData.password]);

  const passwordAllMet = passwordChecks.length && passwordChecks.hasNumber && passwordChecks.hasSpecial;
  const confirmPasswordError = formData.confirmPassword && formData.password !== formData.confirmPassword
    ? 'Şifreler eşleşmiyor'
    : '';

  const requiredEmpty = {
    name: !formData.name.trim(),
    email: !formData.email.trim(),
    studentNumber: !formData.studentNumber.trim(),
    department: !formData.department.trim(),
    phone: !formData.phone.trim(),
    password: !formData.password,
    confirmPassword: !formData.confirmPassword
  };

  const formValid = !Object.values(requiredEmpty).some(Boolean) && !emailError && !phoneError && passwordAllMet && formData.password === formData.confirmPassword;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    setError('');

    if (emailError) return;
    if (phoneError) return;
    if (!passwordAllMet) {
      setError('Lütfen şifre koşullarını sağlayın.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return;
    }

    setLoading(true);
    try {
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
    <div className="min-h-screen flex overflow-x-hidden w-full max-w-full">
      {/* Sol panel - Proje tanıtımı ve referans yorumları (masaüstünde görünür) */}
      <div className="hidden lg:flex lg:w-[44%] xl:w-[42%] bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 p-8 xl:p-12 flex-shrink-0">
        <AuthIntroPanel />
      </div>

      {/* Sağ panel - Form */}
      <div className="flex-1 min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="w-full max-w-md my-6">
          {/* Mobil: kısa proje başlığı */}
          <div className="lg:hidden text-center mb-4">
            <h1 className="text-xl font-bold text-indigo-900">Öğrenci Takip Sistemi</h1>
            <p className="text-sm text-slate-600 mt-1">Sisteme katılmak için kaydolun</p>
          </div>

          <Card className="w-full shadow-xl shadow-indigo-900/5 border border-slate-200/80 rounded-xl overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl text-slate-800">Öğrenci Kaydı</CardTitle>
              <p className="text-slate-600 text-sm mt-1">Takip sistemine katılmak için bilgilerinizi girin</p>
            </CardHeader>
            <CardContent className="pt-0">
              {error && <Alert type="error">{error}</Alert>}
              <p className="text-xs text-slate-500 mb-3">* Zorunlu alan</p>

              <form onSubmit={handleSubmit} className="space-y-3">
                <Input
                  label="Ad Soyad *"
                  name="name"
                  type="text"
                  placeholder="Adınız ve soyadınız"
                  value={formData.name}
                  onChange={handleChange}
                  error={submitAttempted && requiredEmpty.name ? 'Bu alan zorunludur' : undefined}
                  required
                />

                <Input
                  label="E-posta *"
                  name="email"
                  type="email"
                  placeholder="ornek@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  error={submitAttempted && requiredEmpty.email ? 'Bu alan zorunludur' : emailError || undefined}
                  required
                />

                <Input
                  label="Öğrenci Numarası *"
                  name="studentNumber"
                  type="text"
                  placeholder="2024001"
                  value={formData.studentNumber}
                  onChange={handleChange}
                  error={submitAttempted && requiredEmpty.studentNumber ? 'Bu alan zorunludur' : undefined}
                  required
                />

                <Input
                  label="Bölüm *"
                  name="department"
                  type="text"
                  placeholder="Bilgisayar Mühendisliği"
                  value={formData.department}
                  onChange={handleChange}
                  error={submitAttempted && requiredEmpty.department ? 'Bu alan zorunludur' : undefined}
                  required
                />

                <Input
                  label="Telefon *"
                  name="phone"
                  type="tel"
                  placeholder="+90 555 555 55 55"
                  value={formData.phone}
                  onChange={handleChange}
                  error={submitAttempted && requiredEmpty.phone ? 'Bu alan zorunludur' : phoneError || undefined}
                  required
                />

                <div className="space-y-1">
                  <Input
                    label="Şifre *"
                    name="password"
                    type="password"
                    placeholder="En az 6 karakter, 1 sayı, 1 işaret"
                    value={formData.password}
                    onChange={handleChange}
                    error={submitAttempted && requiredEmpty.password ? 'Bu alan zorunludur' : undefined}
                    required
                  />
                  <ul className="text-xs space-y-1 mt-1 ml-1 text-slate-600" aria-live="polite">
                    <li className={`flex items-center gap-2 ${passwordChecks.length ? 'text-emerald-600' : ''}`}>
                      <CheckIcon met={passwordChecks.length} />
                      En az 6 karakter
                    </li>
                    <li className={`flex items-center gap-2 ${passwordChecks.hasNumber ? 'text-emerald-600' : ''}`}>
                      <CheckIcon met={passwordChecks.hasNumber} />
                      En az 1 sayı
                    </li>
                    <li className={`flex items-center gap-2 ${passwordChecks.hasSpecial ? 'text-emerald-600' : ''}`}>
                      <CheckIcon met={passwordChecks.hasSpecial} />
                      En az 1 özel karakter (!@#$%^&* vb.)
                    </li>
                  </ul>
                </div>

                <Input
                  label="Şifre Onayla *"
                  name="confirmPassword"
                  type="password"
                  placeholder="Şifrenizi tekrar girin"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={submitAttempted && requiredEmpty.confirmPassword ? 'Bu alan zorunludur' : confirmPasswordError || undefined}
                  required
                />

                <Button
                  type="submit"
                  disabled={loading || !formValid}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {loading ? 'Kaydolunuyor...' : 'Kaydol'}
                </Button>
              </form>

              <p className="text-center text-sm text-slate-600 mt-4 pt-4 border-t border-slate-100">
                Zaten hesabınız var mı?{' '}
                <Link href="/auth/login" className="text-indigo-600 font-medium hover:underline">
                  Giriş yapın
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
