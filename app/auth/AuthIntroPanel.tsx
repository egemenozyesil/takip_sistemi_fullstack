'use client';

import React from 'react';
import Link from 'next/link';

const TESTIMONIALS = [
  {
    quote: 'Devam takibini artık çok kolay yapıyoruz. Öğrenciler ve yönetim için gerçekten faydalı bir sistem.',
    author: 'Dr. Ayşe Yılmaz',
    role: 'Bölüm Başkanı',
    avatar: 'AY'
  },
  {
    quote: 'Tek ekrandan tüm devam durumumu görebiliyorum. Mobil uyumlu arayüz sayesinde her yerden erişebiliyorum.',
    author: 'Mehmet Kaya',
    role: 'Öğrenci',
    avatar: 'MK'
  },
  {
    quote: 'Güvenli giriş ve sade arayüz sayesinde hem öğrenci kaydı hem takip işlemleri çok hızlı ilerliyor.',
    author: 'Elif Demir',
    role: 'Idari Personel',
    avatar: 'ED'
  }
];

export function AuthIntroPanel() {
  return (
    <div className="flex flex-col justify-between h-full text-white">
      <div>
        <Link href="/" className="inline-flex items-center gap-2 text-white/90 hover:text-white text-sm mb-8 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Anasayfa
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
          Öğrenci Takip Sistemi
        </h1>
        <p className="text-white/90 text-sm sm:text-base max-w-md leading-relaxed mb-6">
          Modern ve güvenli bir devam takip platformu. Öğrenci kayıtları, JWT kimlik doğrulama ve anlık takip ile eğitim süreçlerinizi kolayca yönetin.
        </p>
        <ul className="space-y-2 text-sm text-white/85">
          <li className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">✓</span>
            Güvenli kayıt ve giriş
          </li>
          <li className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">✓</span>
            Öğrenci dashboard ile devam takibi
          </li>
          <li className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">✓</span>
            Mobil uyumlu ve hızlı arayüz
          </li>
        </ul>
      </div>

      <div className="mt-8 sm:mt-12 space-y-4">
        <p className="text-xs font-medium uppercase tracking-wider text-white/70">Referanslar ne diyor?</p>
        <div className="space-y-4 max-h-[220px] overflow-y-auto pr-2 scrollbar-thin">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="bg-white/10 backdrop-blur rounded-lg p-4 border border-white/10">
              <p className="text-sm text-white/95 italic">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-3 mt-3">
                <div className="w-8 h-8 rounded-full bg-indigo-400/80 flex items-center justify-center text-xs font-semibold">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-medium">{t.author}</p>
                  <p className="text-xs text-white/70">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
