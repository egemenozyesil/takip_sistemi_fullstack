'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/auth/AuthContext';
import { Button } from './Button';
import { 
  LogOut, 
  User, 
  LayoutDashboard, 
  Search, 
  X, 
  BookOpen,
  Menu,
  Settings,
  Clock,
  Target,
  FileText,
  Book,
  Gamepad2,
  MapPin
} from 'lucide-react';

interface SearchResult {
  id: string;
  lesson_name: string;
  topic: string;
  unit: string | null;
}

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchTopics = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        setShowResults(false);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(`/api/topics/search?q=${encodeURIComponent(searchQuery)}`);
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data);
          setShowResults(data.length > 0);
        }
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(searchTopics, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  const handleResultClick = (topicId: string) => {
    setSearchQuery('');
    setShowResults(false);
    router.push(`/dashboard/konu-takip?topic=${topicId}`);
  };

  if (loading || !user) {
    return null;
  }

  return (
    <nav className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-lg fixed top-0 left-0 right-0 z-50 backdrop-blur-sm">
      <div className="w-full max-w-full mx-auto px-4 sm:px-6 lg:px-8 overflow-x-hidden">
        <div className="flex justify-between items-center h-16 gap-4">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link 
              href="/" 
              className="flex items-center gap-2 group transition-transform hover:scale-105"
            >
              <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg group-hover:bg-white/30 transition-colors">
                <BookOpen className="text-white" size={24} />
              </div>
              <span className="font-bold text-xl text-white hidden sm:inline-block">
                Takip Sistemi
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          {user && (
            <div className="hidden md:flex items-center gap-2">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition-all duration-200 font-medium"
              >
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/dashboard/profile"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition-all duration-200 font-medium"
              >
                <User size={18} />
                <span>Profil</span>
              </Link>
            </div>
          )}

          {/* Search Bar - Desktop */}
          {user && (
            <div className="hidden lg:flex flex-1 max-w-md mx-8 relative" ref={searchRef}>
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="text-white/70" size={20} />
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Konu ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.length >= 2 && searchResults.length > 0 && setShowResults(true)}
                  className="w-full pl-12 pr-10 py-2.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setShowResults(false);
                      inputRef.current?.focus();
                    }}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/70 hover:text-white transition-colors"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              {/* Search Results Dropdown */}
              {showResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 max-h-96 overflow-y-auto z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  {searchResults.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleResultClick(result.id)}
                      className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors group"
                    >
                      <div className="font-medium text-gray-900 group-hover:text-blue-600">
                        {result.lesson_name}
                        {result.unit && (
                          <span className="text-gray-500"> - {result.unit}</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-700 mt-1">{result.topic}</div>
                    </button>
                  ))}
                </div>
              )}

              {isSearching && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 text-center text-gray-800">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span>Aranıyor...</span>
                  </div>
                </div>
              )}

              {showResults && searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 text-center text-gray-800">
                  Sonuç bulunamadı
                </div>
              )}
            </div>
          )}

          {/* User - Desktop: tıklanınca profil sayfasına gider */}
          <div className="hidden md:flex items-center gap-3">
            {user && (
              <Link
                href="/dashboard/profile"
                className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-200 group"
              >
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-semibold text-sm group-hover:bg-white/30 transition-colors">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-medium text-white">{user.name}</p>
                  <p className="text-xs text-white/70">{user.email}</p>
                </div>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            {user && (
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
              >
                <Menu size={24} />
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && user && (
          <div className="md:hidden border-t border-white/20 py-4 animate-in slide-in-from-top duration-200">
            <div className="space-y-2">
              {/* Mobile Search */}
              <div className="relative mb-4" ref={searchRef}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70" size={20} />
                  <input
                    type="text"
                    placeholder="Konu ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
                {showResults && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl max-h-64 overflow-y-auto z-50">
                    {searchResults.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => {
                          handleResultClick(result.id);
                          setShowMobileMenu(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-100"
                      >
                        <div className="font-medium text-gray-900">{result.lesson_name}</div>
                        <div className="text-sm text-gray-700">{result.topic}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Link
                href="/dashboard"
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-white/10 transition-colors"
              >
                <LayoutDashboard size={20} />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/dashboard/gunluk-calisma"
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-white/10 transition-colors"
              >
                <Clock size={20} />
                <span>Günlük Çalışma</span>
              </Link>
              <Link
                href="/dashboard/konu-takip"
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-white/10 transition-colors"
              >
                <Target size={20} />
                <span>Konu Takip</span>
              </Link>
              <Link
                href="/dashboard/konular"
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-white/10 transition-colors"
              >
                <FileText size={20} />
                <span>Konular</span>
              </Link>
              <Link
                href="/dashboard/kitap-okuma"
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-white/10 transition-colors"
              >
                <Book size={20} />
                <span>Kitap Okuma</span>
              </Link>
              <Link
                href="/dashboard/oyun-takip"
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-white/10 transition-colors"
              >
                <Gamepad2 size={20} />
                <span>Oyun Takip</span>
              </Link>
              <Link
                href="/dashboard/disari-cikma"
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-white/10 transition-colors"
              >
                <MapPin size={20} />
                <span>Dışarı Çıkma</span>
              </Link>
              <Link
                href="/dashboard/ayarlar"
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-white/10 transition-colors"
              >
                <Settings size={20} />
                <span>Ayarlar</span>
              </Link>
              <Link
                href="/dashboard/profile"
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-white/10 transition-colors"
              >
                <User size={20} />
                <span>Profil</span>
              </Link>
              <div className="border-t border-white/20 my-2"></div>
              <button
                onClick={() => {
                  setShowMobileMenu(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-300 hover:bg-red-500/20 transition-colors"
              >
                <LogOut size={20} />
                <span>Çıkış Yap</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
