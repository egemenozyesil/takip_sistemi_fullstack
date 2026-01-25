'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/auth/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/Card';
import { Input } from '@/app/components/Input';
import Sidebar from '@/app/components/Sidebar';
import Navbar from '@/app/components/Navbar';
import { BookOpen, Search, ChevronDown, ChevronRight } from 'lucide-react';

interface Topic {
  id: string;
  lesson_id: string;
  unit: string | null;
  topic: string;
  meb_kazanim: string | null;
  alt_kazanimlar: string | null;
  soru_tipleri: string | null;
  lesson_name: string;
}

interface Lesson {
  id: string;
  name: string;
  topics: Topic[];
}

export default function TopicsPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set());
  const [selectedLesson, setSelectedLesson] = useState<string>('');

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      fetchTopics();
    }
  }, [user, selectedLesson]);

  const fetchTopics = async () => {
    setLoadingTopics(true);
    try {
      let url = '/api/topics';
      if (selectedLesson) {
        url += `?lesson_id=${selectedLesson}`;
      }

      const response = await fetch(url);
      if (response.ok) {
        const topics: Topic[] = await response.json();
        
        // Group topics by lesson
        const lessonsMap = new Map<string, Lesson>();
        
        topics.forEach((topic) => {
          if (!lessonsMap.has(topic.lesson_id)) {
            lessonsMap.set(topic.lesson_id, {
              id: topic.lesson_id,
              name: topic.lesson_name,
              topics: [],
            });
          }
          lessonsMap.get(topic.lesson_id)!.topics.push(topic);
        });

        const lessonsArray = Array.from(lessonsMap.values());
        setLessons(lessonsArray);
        
        // Auto-expand all lessons initially
        if (expandedLessons.size === 0) {
          setExpandedLessons(new Set(lessonsArray.map(l => l.id)));
        }
      }
    } catch (error) {
      console.error('Error fetching topics:', error);
    } finally {
      setLoadingTopics(false);
    }
  };

  const toggleLesson = (lessonId: string) => {
    const newExpanded = new Set(expandedLessons);
    if (newExpanded.has(lessonId)) {
      newExpanded.delete(lessonId);
    } else {
      newExpanded.add(lessonId);
    }
    setExpandedLessons(newExpanded);
  };

  const filteredLessons = lessons.map(lesson => ({
    ...lesson,
    topics: lesson.topics.filter(topic => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        topic.topic.toLowerCase().includes(query) ||
        topic.lesson_name.toLowerCase().includes(query) ||
        (topic.unit && topic.unit.toLowerCase().includes(query)) ||
        (topic.meb_kazanim && topic.meb_kazanim.toLowerCase().includes(query))
      );
    })
  })).filter(lesson => lesson.topics.length > 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-800">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden w-full max-w-full">
      <Navbar />
      <div className="flex overflow-x-hidden w-full max-w-full">
        <Sidebar />
        <div className="flex-1 md:ml-64 w-full max-w-full overflow-x-hidden">
          <main className="w-full max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-x-hidden">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <BookOpen className="text-blue-600" size={32} />
                Konular
              </h1>
              <p className="text-gray-800 mt-2">Veritabanındaki tüm dersleri ve konuları görüntüleyin.</p>
            </div>

            {/* Search and Filter */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <Input
                      type="text"
                      placeholder="Konu, ders veya ünite ara..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="w-64">
                    <select
                      value={selectedLesson}
                      onChange={(e) => setSelectedLesson(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Tüm Dersler</option>
                      {lessons.map((lesson) => (
                        <option key={lesson.id} value={lesson.id}>
                          {lesson.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-gray-800 text-sm font-medium">Toplam Ders</p>
                    <p className="text-4xl font-bold text-blue-600 mt-2">{lessons.length}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-gray-800 text-sm font-medium">Toplam Konu</p>
                    <p className="text-4xl font-bold text-green-600 mt-2">
                      {lessons.reduce((sum, l) => sum + l.topics.length, 0)}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-gray-800 text-sm font-medium">Filtrelenmiş Konu</p>
                    <p className="text-4xl font-bold text-purple-600 mt-2">
                      {filteredLessons.reduce((sum, l) => sum + l.topics.length, 0)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Lessons and Topics List */}
            {loadingTopics ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8 text-gray-700">Yükleniyor...</div>
                </CardContent>
              </Card>
            ) : filteredLessons.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8 text-gray-700">
                    {searchQuery ? 'Arama sonucu bulunamadı.' : 'Henüz konu bulunmuyor.'}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredLessons.map((lesson) => (
                  <Card key={lesson.id}>
                    <CardHeader>
                      <button
                        onClick={() => toggleLesson(lesson.id)}
                        className="flex items-center justify-between w-full text-left"
                      >
                        <div className="flex items-center gap-3">
                          {expandedLessons.has(lesson.id) ? (
                            <ChevronDown className="text-gray-600" size={20} />
                          ) : (
                            <ChevronRight className="text-gray-600" size={20} />
                          )}
                          <CardTitle className="text-xl">{lesson.name}</CardTitle>
                          <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                            {lesson.topics.length} konu
                          </span>
                        </div>
                      </button>
                    </CardHeader>
                    {expandedLessons.has(lesson.id) && (
                      <CardContent>
                        <div className="space-y-3">
                          {lesson.topics.map((topic) => (
                            <div
                              key={topic.id}
                              className="border rounded-lg p-4 hover:bg-gray-50 transition"
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h3 className="font-semibold text-gray-900">{topic.topic}</h3>
                                    {topic.unit && (
                                      <span className="text-xs text-gray-600 bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                        {topic.unit}
                                      </span>
                                    )}
                                  </div>
                                  <div className="space-y-1 text-sm text-gray-700">
                                    {topic.meb_kazanim && (
                                      <p>
                                        <span className="font-medium">MEB Kazanımı:</span> {topic.meb_kazanim}
                                      </p>
                                    )}
                                    {topic.alt_kazanimlar && (
                                      <p>
                                        <span className="font-medium">Alt Kazanımlar:</span> {topic.alt_kazanimlar}
                                      </p>
                                    )}
                                    {topic.soru_tipleri && (
                                      <p>
                                        <span className="font-medium">Soru Tipleri:</span> {topic.soru_tipleri}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
