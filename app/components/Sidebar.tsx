'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { Clock, HelpCircle, BookOpen, Plus } from 'lucide-react';
import { Button } from './Button';

interface DailyStats {
  id: string | null;
  student_id: string;
  date: string;
  work_hours: number;
  questions_answered: number;
  topics_studied: string | null;
}

interface SidebarProps {
  onAddStats?: () => void;
}

export default function Sidebar({ onAddStats }: SidebarProps) {
  const [stats, setStats] = useState<DailyStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/students/daily-stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <aside className="w-64 bg-gray-50 border-r border-gray-200 p-4">
        <div className="text-gray-500 text-center">Yükleniyor...</div>
      </aside>
    );
  }

  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200 p-4 sticky top-16 max-h-[calc(100vh-64px)] overflow-y-auto">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-6">Bugün</h2>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="text-blue-500" size={20} />
              <CardTitle className="text-sm">Çalışma Süresi</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-blue-600">{stats?.work_hours || 0}</span>
              <span className="text-gray-600">saat</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <HelpCircle className="text-green-500" size={20} />
              <CardTitle className="text-sm">Yanıtlanan Sorular</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-green-600">{stats?.questions_answered || 0}</span>
              <span className="text-gray-600">soru</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BookOpen className="text-purple-500" size={20} />
              <CardTitle className="text-sm">Çalışılan Konular</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-700 break-words">
              {stats?.topics_studied ? (
                <p>{stats.topics_studied}</p>
              ) : (
                <p className="text-gray-500 italic">Henüz konu eklenmedi</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={onAddStats}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <Plus size={18} />
          Güncelle
        </Button>
      </div>
    </aside>
  );
}
