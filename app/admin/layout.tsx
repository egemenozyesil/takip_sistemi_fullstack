'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/auth/AuthContext';
import Navbar from '@/app/components/Navbar';
import { LayoutDashboard, Users } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/auth/login');
      return;
    }
    if (user.role !== 'admin') {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-16 flex">
        <aside className="hidden md:flex w-56 bg-white border-r border-gray-200 flex-col min-h-[calc(100vh-4rem)] p-4">
          <nav className="space-y-1">
            <Link
              href="/admin"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                pathname === '/admin' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Users size={20} />
              <span className="font-medium">Öğrenciler</span>
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <LayoutDashboard size={20} />
              <span className="font-medium">Dashboard</span>
            </Link>
          </nav>
        </aside>
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
