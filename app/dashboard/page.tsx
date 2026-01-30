'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/auth/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/Card';
import Sidebar from '@/app/components/Sidebar';
import Navbar from '@/app/components/Navbar';
import { 
  BookOpen, 
  Clock, 
  Target, 
  Book, 
  LogOut, 
  TrendingUp,
  Calendar,
  Award,
  Zap,
  Flame,
  Trophy,
  Gamepad2
} from 'lucide-react';
import Link from 'next/link';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface DailyStatsData {
  date: string;
  fullDate: string;
  work_minutes: number;
  questions_answered: number;
  topic: string | null;
  lesson_name: string | null;
}

export default function DashboardPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    dailyStats: null as any,
    totalBooks: 0,
    totalPages: 0,
    totalGoingOut: 0,
    totalGoingOutHours: 0,
    totalTopicTracking: 0,
    totalStudyHours: 0,
    totalQuestions: 0,
    totalGameSessions: 0,
    totalGameMinutes: 0,
    totalGames: 0,
  });
  const [chartData, setChartData] = useState<DailyStatsData[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      fetchAllStats();
    }
  }, [user]);

  const fetchAllStats = async () => {
    setLoadingStats(true);
    try {
      // Fetch daily stats
      const dailyStatsRes = await fetch('/api/students/daily-stats?today=true');
      const dailyStats = dailyStatsRes.ok ? await dailyStatsRes.json() : null;

      // Fetch last 30 days for charts
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      const startDateStr = startDate.toISOString().split('T')[0];
      
      const chartDataRes = await fetch(
        `/api/students/daily-stats?start_date=${startDateStr}&end_date=${endDate}`
      );
      const chartDataResponse = chartDataRes.ok ? await chartDataRes.json() : { stats: [], uniqueTopics: 0 };
      // Handle both new format (with stats and uniqueTopics) and old format (direct array)
      const chartDataArray = Array.isArray(chartDataResponse) ? chartDataResponse : (chartDataResponse.stats || []);
      const uniqueTopics = chartDataResponse.uniqueTopics || 0;
      
      // Process chart data
      const processedData = (Array.isArray(chartDataArray) ? chartDataArray : []).map((item: any) => {
        const workMinutes = Number(item.work_minutes) || 0;
        const questionsAnswered = Number(item.questions_answered) || 0;
        return {
          date: new Date(item.date).toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' }),
          fullDate: item.date,
          work_minutes: workMinutes,
          work_hours: (workMinutes / 60).toFixed(1),
          questions_answered: questionsAnswered,
          topic: item.topic || '',
          lesson_name: item.lesson_name || '',
        };
      }).sort((a: any, b: any) => 
        new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime()
      );
      
      setChartData(processedData);

      // Fetch books
      const booksRes = await fetch('/api/books');
      const books = booksRes.ok ? await booksRes.json() : [];
      const totalPages = books.reduce((sum: number, b: any) => sum + (b.pages_read || 0), 0);
      const totalBooks = new Set(books.map((b: any) => b.book_title)).size;

      // Fetch going out
      const goingOutRes = await fetch('/api/going-out');
      const goingOut = goingOutRes.ok ? await goingOutRes.json() : [];
      const totalGoingOutHours = goingOut.reduce((sum: number, g: any) => sum + (g.duration_hours || 0), 0);

      // Fetch games
      const gamesRes = await fetch('/api/games');
      const games = gamesRes.ok ? await gamesRes.json() : [];
      const totalGameMinutes = games.reduce((sum: number, g: any) => sum + (g.duration_minutes || 0), 0);
      const totalGames = new Set(games.map((g: any) => g.game_name)).size;

      // Calculate stats from daily_stats (günlük çalışma tablosu)
      const dataArray = Array.isArray(chartDataArray) ? chartDataArray : [];
      const totalWorkMinutes = dataArray.reduce((sum: number, item: any) => sum + (Number(item.work_minutes) || 0), 0);
      const totalStudyHours = totalWorkMinutes / 60;
      const totalQuestions = dataArray.reduce((sum: number, item: any) => sum + (Number(item.questions_answered) || 0), 0);
      // Use uniqueTopics from API response, or calculate from data if not available
      const uniqueTopicsCount = uniqueTopics > 0 ? uniqueTopics : new Set(dataArray.filter((item: any) => item.topic_id).map((item: any) => item.topic_id)).size;

      setStats({
        dailyStats,
        totalBooks,
        totalPages,
        totalGoingOut: goingOut.length,
        totalGoingOutHours,
        totalTopicTracking: uniqueTopicsCount,
        totalStudyHours,
        totalQuestions,
        totalGameSessions: games.length,
        totalGameMinutes,
        totalGames,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  // Calculate motivation metrics
  const calculateMotivation = () => {
    const last7Days = chartData.slice(-7);
    const last7DaysMinutes = last7Days.reduce((sum, d) => sum + d.work_minutes, 0);
    const last7DaysQuestions = last7Days.reduce((sum, d) => sum + d.questions_answered, 0);
    const avgDailyMinutes = last7DaysMinutes / 7;
    const avgDailyQuestions = last7DaysQuestions / 7;
    
    const totalMinutes = chartData.reduce((sum, d) => sum + d.work_minutes, 0);
    const totalQuestions = chartData.reduce((sum, d) => sum + d.questions_answered, 0);
    const activeDays = chartData.filter(d => d.work_minutes > 0 || d.questions_answered > 0).length;
    const consistency = chartData.length > 0 ? (activeDays / chartData.length) * 100 : 0;

    // Streak calculation
    let currentStreak = 0;
    const today = new Date().toISOString().split('T')[0];
    for (let i = chartData.length - 1; i >= 0; i--) {
      const item = chartData[i];
      if (item.work_minutes > 0 || item.questions_answered > 0) {
        currentStreak++;
      } else {
        break;
      }
    }

    return {
      last7DaysMinutes,
      last7DaysQuestions,
      avgDailyMinutes,
      avgDailyQuestions,
      totalMinutes,
      totalQuestions,
      activeDays,
      consistency,
      currentStreak,
    };
  };

  const motivation = calculateMotivation();
  const totalHours = Math.floor(motivation.totalMinutes / 60);
  const totalRemainingMinutes = motivation.totalMinutes % 60;

  // Get top performing days
  const topDays = [...chartData]
    .sort((a, b) => (b.work_minutes + b.questions_answered * 10) - (a.work_minutes + a.questions_answered * 10))
    .slice(0, 3);

  // Motivation message
  const getMotivationMessage = () => {
    if (motivation.currentStreak >= 7) {
      return { 
        message: 'Harika! 7 günlük seri devam ediyor! 🔥', 
        icon: Flame, 
        color: 'text-red-600' 
      };
    } else if (motivation.currentStreak >= 3) {
      return { 
        message: 'Güzel gidiyor! Seri devam ediyor! 💪', 
        icon: Zap, 
        color: 'text-yellow-600' 
      };
    } else if (motivation.consistency >= 70) {
      return { 
        message: 'Tutarlı çalışma gösteriyorsun! 🌟', 
        icon: Award, 
        color: 'text-blue-600' 
      };
    } else if (motivation.consistency >= 50) {
      return { 
        message: 'İyi gidiyorsun, daha fazla çalışabilirsin! 📚', 
        icon: TrendingUp, 
        color: 'text-green-600' 
      };
    } else {
      return { 
        message: 'Başlamak için bugün mükemmel bir gün! 🚀', 
        icon: Target, 
        color: 'text-purple-600' 
      };
    }
  };

  const motivationMsg = getMotivationMessage();
  const MotivationIcon = motivationMsg.icon;

  // Chart colors
  const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'];

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

  if (!user) {
    return null;
  }

  const today = new Date().toLocaleDateString('tr-TR', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const todayStats = stats.dailyStats;
  const todayMinutes = todayStats?.work_minutes || 0;
  const todayHours = Math.floor(todayMinutes / 60);
  const todayRemainingMinutes = todayMinutes % 60;

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden w-full max-w-full">
      <Navbar />
      <div className="flex overflow-x-hidden w-full max-w-full pt-16">
        <Sidebar />
        <div className="flex-1 md:ml-64 w-full max-w-full overflow-x-hidden">
          <main className="w-full max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-x-hidden">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-800 mt-2 flex items-center gap-2">
                <Calendar size={18} />
                {today}
              </p>
            </div>

            {/* Motivation Section */}
            <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-white rounded-full p-4 shadow-lg">
                      <MotivationIcon className={motivationMsg.color} size={32} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{motivationMsg.message}</h3>
                      <div className="flex gap-4 mt-2 text-sm">
                        <span className="text-gray-700">
                          <span className="font-semibold">Seri:</span> {motivation.currentStreak} gün
                        </span>
                        <span className="text-gray-700">
                          <span className="font-semibold">Tutarlılık:</span> {motivation.consistency.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-white rounded-lg p-3 shadow">
                      <p className="text-xs text-gray-600">Son 7 Gün</p>
                      <p className="text-lg font-bold text-blue-600">
                        {Math.floor(motivation.last7DaysMinutes / 60)}s {motivation.last7DaysMinutes % 60}dk
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow">
                      <p className="text-xs text-gray-600">Ortalama/Gün</p>
                      <p className="text-lg font-bold text-green-600">
                        {Math.floor(motivation.avgDailyMinutes / 60)}s {Math.floor(motivation.avgDailyMinutes % 60)}dk
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow">
                      <p className="text-xs text-gray-600">Toplam Soru</p>
                      <p className="text-lg font-bold text-purple-600">{motivation.totalQuestions}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Today's Stats */}
            {todayStats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="border-l-4 border-l-blue-600">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-800 text-sm font-medium">Bugünkü Çalışma</p>
                        <p className="text-3xl font-bold text-blue-600 mt-2">
                          {todayHours > 0 ? `${todayHours}s ` : ''}{todayRemainingMinutes}dk
                        </p>
                      </div>
                      <Clock className="text-blue-500" size={48} />
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-green-600">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-800 text-sm font-medium">Çözülen Sorular</p>
                        <p className="text-3xl font-bold text-green-600 mt-2">
                          {todayStats.questions_answered || 0}
                        </p>
                        <p className="text-gray-800 text-xs mt-1">soru</p>
                      </div>
                      <Target className="text-green-500" size={48} />
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-purple-600">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-800 text-sm font-medium">Çalışılan Konu</p>
                        <p className="text-lg font-semibold text-purple-600 mt-2 line-clamp-2">
                          {todayStats.lesson_name && todayStats.topic 
                            ? `${todayStats.lesson_name} - ${todayStats.topic}`
                            : 'Henüz konu eklenmedi'}
                        </p>
                      </div>
                      <BookOpen className="text-purple-500" size={48} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ApexCharts - Last 7 Days + Next 3 Days */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Son 7 Gün ve Sonraki 3 Gün - Çalışma Süresi ve Soru Sayısı</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  // Get last 7 days data
                  const today = new Date();
                  const last7DaysData: any[] = [];
                  const next3DaysData: any[] = [];
                  
                  // Last 7 days (including today)
                  for (let i = 6; i >= 0; i--) {
                    const date = new Date(today);
                    date.setDate(date.getDate() - i);
                    const dateStr = date.toISOString().split('T')[0];
                    // Find matching data - handle both string and date formats
                    const found = chartData.find(d => {
                      const dataDate = typeof d.fullDate === 'string' ? d.fullDate : new Date(d.fullDate).toISOString().split('T')[0];
                      return dataDate === dateStr;
                    });
                    last7DaysData.push({
                      date: date.toLocaleDateString('tr-TR', { month: 'short', day: 'numeric', weekday: 'short' }),
                      work_minutes: Number(found?.work_minutes) || 0,
                      questions_answered: Number(found?.questions_answered) || 0,
                    });
                  }
                  
                  // Next 3 days
                  for (let i = 1; i <= 3; i++) {
                    const date = new Date(today);
                    date.setDate(date.getDate() + i);
                    next3DaysData.push({
                      date: date.toLocaleDateString('tr-TR', { month: 'short', day: 'numeric', weekday: 'short' }),
                      work_minutes: 0,
                      questions_answered: 0,
                    });
                  }
                  
                  const combinedData = [...last7DaysData, ...next3DaysData];
                  const categories = combinedData.map(d => d.date);
                  const workMinutesData = combinedData.map(d => d.work_minutes);
                  const questionsData = combinedData.map(d => d.questions_answered);
                  
                  const chartOptions: any = {
                    chart: {
                      type: 'bar',
                      height: 400,
                      foreColor: '#111827',
                      toolbar: {
                        show: true,
                      },
                      zoom: {
                        enabled: false,
                      },
                    },
                    theme: {
                      mode: 'light',
                      palette: 'palette1',
                    },
                    plotOptions: {
                      bar: {
                        horizontal: false,
                        columnWidth: '60%',
                        borderRadius: 8,
                        borderRadiusApplication: 'end',
                        dataLabels: {
                          position: 'top',
                        },
                      },
                    },
                    dataLabels: {
                      enabled: true,
                      formatter: (val: number, opts: any) => {
                        if (opts.seriesIndex === 0) {
                          // Work minutes - show as hours:minutes
                          if (val === 0) return '';
                          const hours = Math.floor(val / 60);
                          const minutes = val % 60;
                          return hours > 0 ? `${hours}s ${minutes}dk` : minutes > 0 ? `${minutes}dk` : '';
                        }
                        return val > 0 ? val.toString() : '';
                      },
                      offsetY: -20,
                      style: {
                        fontSize: '11px',
                        colors: ['#111827'],
                        fontWeight: 600,
                      },
                    },
                    stroke: {
                      show: true,
                      width: 2,
                      colors: ['transparent'],
                    },
                    xaxis: {
                      categories,
                      labels: {
                        style: {
                          colors: '#111827',
                          fontSize: '12px',
                          fontWeight: 600,
                        },
                      },
                    },
                    yaxis: [
                        {
                          title: {
                            text: 'Çalışma Süresi (Dakika)',
                            style: {
                              color: '#111827',
                              fontSize: '13px',
                              fontWeight: 600,
                            },
                          },
                          labels: {
                            style: {
                              colors: '#111827',
                            },
                            formatter: (val: number) => {
                              const hours = Math.floor(val / 60);
                              const minutes = val % 60;
                              return hours > 0 ? `${hours}s ${minutes}dk` : `${minutes}dk`;
                            },
                          },
                        },
                        {
                          opposite: true,
                          title: {
                            text: 'Soru Sayısı',
                            style: {
                              color: '#111827',
                              fontSize: '13px',
                              fontWeight: 600,
                            },
                          },
                          labels: {
                            style: {
                              colors: '#111827',
                            },
                          },
                        },
                      ],
                    fill: {
                      opacity: 1,
                      type: 'gradient',
                      gradient: {
                        shade: 'light',
                        type: 'vertical',
                        shadeIntensity: 0.25,
                        gradientToColors: ['#2563eb', '#059669'],
                        inverseColors: false,
                        opacityFrom: 0.9,
                        opacityTo: 0.6,
                        stops: [0, 100],
                      },
                    },
                    tooltip: {
                      theme: 'light',
                      style: {
                        fontSize: '12px',
                      },
                      y: {
                        formatter: (val: number, opts: any) => {
                          if (opts.seriesIndex === 0) {
                            const hours = Math.floor(val / 60);
                            const minutes = val % 60;
                            return `${hours > 0 ? `${hours}s ` : ''}${minutes}dk`;
                          }
                          return `${val} soru`;
                        },
                      },
                    },
                    legend: {
                      position: 'top',
                      horizontalAlign: 'right',
                      fontSize: '14px',
                      fontWeight: 600,
                      labels: {
                        colors: '#111827',
                      },
                      itemMargin: {
                        horizontal: 12,
                        vertical: 4,
                      },
                    },
                    colors: ['#3b82f6', '#10b981'],
                    grid: {
                      borderColor: '#e5e7eb',
                      strokeDashArray: 4,
                      xaxis: {
                        lines: {
                          show: true,
                        },
                      },
                      yaxis: {
                        lines: {
                          show: true,
                        },
                      },
                    },
                  };
                  
                  const chartSeries = [
                    {
                      name: 'Çalışma Süresi (dk)',
                      data: workMinutesData,
                    },
                    {
                      name: 'Çözülen Sorular',
                      data: questionsData,
                    },
                  ];
                  
                  return (
                    <div className="w-full text-gray-900" style={{ color: '#111827' }}>
                      <Chart
                        options={chartOptions}
                        series={chartSeries}
                        type="bar"
                        height={400}
                      />
                    </div>
                  );
                })()}
              </CardContent>
            </Card>

            {/* Charts Section */}
            {chartData.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Work Minutes Line Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Çalışma Süresi (Son 30 Gün)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="date" 
                          stroke="#111827"
                          fontSize={12}
                          tick={{ fill: '#111827', fontWeight: 600 }}
                        />
                        <YAxis 
                          stroke="#111827"
                          fontSize={12}
                          tick={{ fill: '#111827', fontWeight: 600 }}
                          label={{ value: 'Dakika', angle: -90, position: 'insideLeft', fill: '#111827', fontWeight: 600 }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#fff', 
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            color: '#111827',
                            fontWeight: 600
                          }}
                          formatter={(value: any) => {
                            const hours = Math.floor(value / 60);
                            const minutes = value % 60;
                            return `${hours > 0 ? `${hours}s ` : ''}${minutes}dk`;
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="work_minutes" 
                          stroke="#3b82f6" 
                          fillOpacity={1} 
                          fill="url(#colorMinutes)"
                          name="Çalışma Süresi"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Questions Bar Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Çözülen Sorular (Son 30 Gün)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="date" 
                          stroke="#111827"
                          fontSize={12}
                          tick={{ fill: '#111827', fontWeight: 600 }}
                        />
                        <YAxis 
                          stroke="#111827"
                          fontSize={12}
                          tick={{ fill: '#111827', fontWeight: 600 }}
                          label={{ value: 'Soru', angle: -90, position: 'insideLeft', fill: '#111827', fontWeight: 600 }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#fff', 
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            color: '#111827',
                            fontWeight: 600
                          }}
                        />
                        <Bar 
                          dataKey="questions_answered" 
                          fill="#10b981"
                          radius={[8, 8, 0, 0]}
                          name="Çözülen Sorular"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Combined Line Chart */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Çalışma Süresi ve Soru Sayısı Karşılaştırması</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="date" 
                          stroke="#111827"
                          fontSize={12}
                          tick={{ fill: '#111827', fontWeight: 600 }}
                        />
                        <YAxis 
                          yAxisId="left"
                          stroke="#111827"
                          fontSize={12}
                          tick={{ fill: '#111827', fontWeight: 600 }}
                          label={{ value: 'Dakika', angle: -90, position: 'insideLeft', fill: '#111827', fontWeight: 600 }}
                        />
                        <YAxis 
                          yAxisId="right" 
                          orientation="right"
                          stroke="#111827"
                          fontSize={12}
                          tick={{ fill: '#111827', fontWeight: 600 }}
                          label={{ value: 'Soru', angle: 90, position: 'insideRight', fill: '#111827', fontWeight: 600 }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#fff', 
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            color: '#111827',
                            fontWeight: 600
                          }}
                          formatter={(value: any, name: string) => {
                            if (name === 'Çalışma Süresi') {
                              const hours = Math.floor(value / 60);
                              const minutes = value % 60;
                              return [`${hours > 0 ? `${hours}s ` : ''}${minutes}dk`, name];
                            }
                            return [value, name];
                          }}
                        />
                        <Legend wrapperStyle={{ color: '#111827', fontWeight: 600 }} />
                        <Line 
                          yAxisId="left"
                          type="monotone" 
                          dataKey="work_minutes" 
                          stroke="#3b82f6" 
                          strokeWidth={3}
                          dot={{ fill: '#3b82f6', r: 4 }}
                          activeDot={{ r: 6 }}
                          name="Çalışma Süresi (dk)"
                        />
                        <Line 
                          yAxisId="right"
                          type="monotone" 
                          dataKey="questions_answered" 
                          stroke="#10b981" 
                          strokeWidth={3}
                          dot={{ fill: '#10b981', r: 4 }}
                          activeDot={{ r: 6 }}
                          name="Çözülen Sorular"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Overall Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              <Link href="/dashboard/kitap-okuma">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer border-t-4 border-t-blue-600">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Book className="text-blue-600 mx-auto mb-2" size={32} />
                      <p className="text-gray-800 text-sm font-medium">Okunan Kitap</p>
                      <p className="text-3xl font-bold text-blue-600 mt-2">{stats.totalBooks}</p>
                      <p className="text-gray-800 text-xs mt-1">{stats.totalPages} sayfa</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/dashboard/konu-takip">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer border-t-4 border-t-green-600">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Target className="text-green-600 mx-auto mb-2" size={32} />
                      <p className="text-gray-800 text-sm font-medium">Konu Takip</p>
                      <p className="text-3xl font-bold text-green-600 mt-2">
                        {stats.totalTopicTracking}
                      </p>
                      <p className="text-gray-800 text-xs mt-1">
                        {stats.totalStudyHours.toFixed(1)} saat, {stats.totalQuestions} soru
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/dashboard/disari-cikma">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer border-t-4 border-t-purple-600">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <LogOut className="text-purple-600 mx-auto mb-2" size={32} />
                      <p className="text-gray-800 text-sm font-medium">Dışarı Çıkma</p>
                      <p className="text-3xl font-bold text-purple-600 mt-2">
                        {stats.totalGoingOut}
                      </p>
                      <p className="text-gray-800 text-xs mt-1">
                        {stats.totalGoingOutHours.toFixed(1)} saat
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/dashboard/gunluk-calisma">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer border-t-4 border-t-orange-600">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <TrendingUp className="text-orange-600 mx-auto mb-2" size={32} />
                      <p className="text-gray-800 text-sm font-medium">Günlük Çalışma</p>
                      <p className="text-3xl font-bold text-orange-600 mt-2">
                        {totalHours > 0 ? `${totalHours}s ` : ''}{totalRemainingMinutes}dk
                      </p>
                      <p className="text-gray-800 text-xs mt-1">toplam</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/dashboard/oyun-takip">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer border-t-4 border-t-purple-600">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Gamepad2 className="text-purple-600 mx-auto mb-2" size={32} />
                      <p className="text-gray-800 text-sm font-medium">Oyun Oynama</p>
                      <p className="text-3xl font-bold text-purple-600 mt-2">
                        {Math.floor(stats.totalGameMinutes / 60)}s {stats.totalGameMinutes % 60}dk
                      </p>
                      <p className="text-gray-800 text-xs mt-1">{stats.totalGames} oyun, {stats.totalGameSessions} kayıt</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>

            {/* Top Performing Days */}
            {topDays.length > 0 && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="text-yellow-600" size={24} />
                    En İyi Performans Günleri
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {topDays.map((day, index) => {
                      const hours = Math.floor(day.work_minutes / 60);
                      const minutes = day.work_minutes % 60;
                      return (
                        <div
                          key={index}
                          className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-gray-800">{day.date}</span>
                            <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                              #{index + 1}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Çalışma:</span>{' '}
                              {hours > 0 ? `${hours}s ` : ''}{minutes}dk
                            </p>
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Soru:</span> {day.questions_answered}
                            </p>
                            {day.lesson_name && (
                              <p className="text-xs text-gray-600 mt-2">
                                {day.lesson_name} {day.topic && `- ${day.topic}`}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Hızlı İşlemler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <Link
                    href="/dashboard/gunluk-calisma"
                    className="p-4 border rounded-lg hover:bg-gray-50 transition text-center hover:shadow-md"
                  >
                    <Clock className="text-blue-600 mx-auto mb-2" size={24} />
                    <p className="font-medium text-gray-900">Günlük Çalışma</p>
                    <p className="text-sm text-gray-800">İstatistikleri güncelle</p>
                  </Link>
                  <Link
                    href="/dashboard/konu-takip"
                    className="p-4 border rounded-lg hover:bg-gray-50 transition text-center hover:shadow-md"
                  >
                    <Target className="text-green-600 mx-auto mb-2" size={24} />
                    <p className="font-medium text-gray-900">Konu Takip</p>
                    <p className="text-sm text-gray-800">Yeni konu ekle</p>
                  </Link>
                  <Link
                    href="/dashboard/kitap-okuma"
                    className="p-4 border rounded-lg hover:bg-gray-50 transition text-center hover:shadow-md"
                  >
                    <Book className="text-blue-600 mx-auto mb-2" size={24} />
                    <p className="font-medium text-gray-900">Kitap Okuma</p>
                    <p className="text-sm text-gray-800">Yeni kayıt ekle</p>
                  </Link>
                  <Link
                    href="/dashboard/ayarlar"
                    className="p-4 border rounded-lg hover:bg-gray-50 transition text-center hover:shadow-md"
                  >
                    <TrendingUp className="text-purple-600 mx-auto mb-2" size={24} />
                    <p className="font-medium text-gray-900">Ayarlar</p>
                    <p className="text-sm text-gray-800">Konu içe aktar</p>
                  </Link>
                  <Link
                    href="/dashboard/oyun-takip"
                    className="p-4 border rounded-lg hover:bg-gray-50 transition text-center hover:shadow-md"
                  >
                    <Gamepad2 className="text-purple-600 mx-auto mb-2" size={24} />
                    <p className="font-medium text-gray-900">Oyun Takip</p>
                    <p className="text-sm text-gray-800">Oyun oynama ekle</p>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
}
