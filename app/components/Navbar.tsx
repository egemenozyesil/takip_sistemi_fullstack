'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/auth/AuthContext';
import { Button } from './Button';
import { LogOut, User, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  if (!user) {
    return null;
  }

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="font-bold text-xl text-blue-600">
              Takip Sistemi
            </Link>
            {user && (
              <div className="flex gap-4">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition"
                >
                  <LayoutDashboard size={20} />
                  <span>Dashboard</span>
                </Link>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition"
                >
                  <User size={20} />
                  <span>Profil</span>
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <>
                <span className="text-gray-700">{user.name}</span>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <LogOut size={18} />
                  <span>Çıkış</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
