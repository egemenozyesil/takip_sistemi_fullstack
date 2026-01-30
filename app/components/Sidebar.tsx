'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/app/auth/AuthContext';
import { 
  LayoutDashboard, 
  BookOpen, 
  Target, 
  Book, 
  LogOut, 
  Settings,
  User,
  Clock,
  FileText,
  Gamepad2
} from 'lucide-react';

interface SidebarProps {
  onAddStats?: () => void;
}

const navigationItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/gunluk-calisma', label: 'Günlük Çalışma', icon: Clock },
  { href: '/dashboard/konu-takip', label: 'Konu Takip', icon: Target },
  { href: '/dashboard/konular', label: 'Konular', icon: FileText },
  { href: '/dashboard/kitap-okuma', label: 'Kitap Okuma', icon: Book },
  { href: '/dashboard/oyun-takip', label: 'Oyun Takip', icon: Gamepad2 },
  { href: '/dashboard/disari-cikma', label: 'Dışarı Çıkma', icon: LogOut },
  { href: '/dashboard/ayarlar', label: 'Ayarlar', icon: Settings },
];

export default function Sidebar({ onAddStats }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <aside className="hidden md:flex w-64 bg-gray-50 border-r border-gray-200 flex-col h-[calc(100vh-4rem)] fixed top-16 left-0 z-40">
      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto p-4">
        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Profile Section */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <Link
          href="/dashboard/profile"
          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.name || 'Kullanıcı'}
            </p>
            <p className="text-xs text-gray-700 truncate">
              {user?.email || ''}
            </p>
          </div>
          <User size={18} className="text-gray-700" />
        </Link>
      </div>
    </aside>
  );
}
