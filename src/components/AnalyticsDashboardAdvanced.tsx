// @ts-nocheck
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { 
  TrendingUp, 
  Users, 
  Eye, 
  MessageSquare, 
  FolderKanban,
  FileText,
  Calendar,
  BarChart3,
  Activity,
  Clock,
  Download
} from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

interface AnalyticsData {
  totalVisits: number
  todayVisits: number
  totalMessages: number
  totalProjects: number
  totalBlogPosts: number
  messagesThisMonth: number
  projectsCompleted: number
  visitsByDay: { date: string; visits: number }[]
  messagesByService: { service: string; count: number }[]
  popularPages: { page: string; visits: number }[]
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export function AnalyticsDashboardAdvanced() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalVisits: 0,
    todayVisits: 0,
    totalMessages: 0,
    totalProjects: 0,
    totalBlogPosts: 0,
    messagesThisMonth: 0,
    projectsCompleted: 0,
    visitsByDay: [],
    messagesByService: [],
    popularPages: []
  })
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('7')

  useEffect(() => {
    loadAnalytics()
  }, [dateRange])

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      const today = new Date()
      const startOfToday = new Date(today.setHours(0, 0, 0, 0)).toISOString()
      const daysAgo = new Date(Date.now() - parseInt(dateRange) * 24 * 60 * 60 * 1000).toISOString()
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString()

      // الزيارات
      const { data: allVisits } = await supabase
        .from('site_analytics')
        .select('*')
      
      const { data: todayVisitsData } = await supabase
        .from('site_analytics')
        .select('*')
        .gte('created_at', startOfToday)

      // الرسائل
      const { data: allMessages } = await supabase
        .from('contact_messages')
        .select('*')

      const { data: messagesThisMonthData } = await supabase
        .from('contact_messages')
        .select('*')
        .gte('created_at', startOfMonth)

      // المشاريع
      const { data: allProjects } = await supabase
        .from('projects')
        .select('*')

      const { data: completedProjects } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'completed')

      // المقالات
      const { data: blogPosts } = await supabase
        .from('blog_posts')
        .select('*')

      const visitsByDay = generateVisitsByDay(allVisits || [], parseInt(dateRange))
      const messagesByService = generateMessagesByService(allMessages || [])
      const popularPages = generatePopularPages(allVisits || [])

      setAnalytics({
        totalVisits: allVisits?.length || 0,
        todayVisits: todayVisitsData?.length || 0,
        totalMessages: allMessages?.length || 0,
        totalProjects: allProjects?.length || 0,
        totalBlogPosts: blogPosts?.length || 0,
        messagesThisMonth: messagesThisMonthData?.length || 0,
        projectsCompleted: completedProjects?.length || 0,
        visitsByDay,
        messagesByService,
        popularPages
      })
    } catch (error) {
      console.error('خطأ في تحميل الإحصائيات:', error)
    }
    setLoading(false)
  }

  const generateVisitsByDay = (visits: any[], days: number) => {
    const result: { date: string; visits: number }[] = []
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split('T')[0]
      const visitsCount = visits.filter(v => v.created_at?.startsWith(dateStr)).length
      result.push({
        date: date.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' }),
        visits: visitsCount
      })
    }
    return result
  }

  const generateMessagesByService = (messages: any[]) => {
    const services: { [key: string]: number } = {}
    messages.forEach(msg => {
      const service = msg.service || 'عام'
      services[service] = (services[service] || 0) + 1
    })
    return Object.entries(services)
      .map(([service, count]) => ({ service, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
  }

  const generatePopularPages = (visits: any[]) => {
    const pages: { [key: string]: number } = {}
    visits.forEach(visit => {
      const page = visit.page || 'الصفحة الرئيسية'
      pages[page] = (pages[page] || 0) + 1
    })
    return Object.entries(pages)
      .map(([page, visits]) => ({ page, visits }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 5)
  }

  const exportData = () => {
    const dataToExport = {
      summary: {
        totalVisits: analytics.totalVisits,
        totalMessages: analytics.totalMessages,
        totalProjects: analytics.totalProjects,
        totalBlogPosts: analytics.totalBlogPosts
      },
      visitsByDay: analytics.visitsByDay,
      messagesByService: analytics.messagesByService,
      popularPages: analytics.popularPages
    }

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `analytics-${new Date().toISOString().split('T')[0]}.json`
    link.click()
  }

  return (
    <div className="space-y-6">
      {/* فلتر المدة */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">الإحصائيات والتقارير</h2>
          <p className="text-gray-600 mt-1">تحليلات متقدمة بالرسوم البيانية التفاعلية</p>
        </div>
        <div className="flex gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7">آخر 7 أيام</option>
            <option value="14">آخر 14 يوم</option>
            <option value="30">آخر 30 يوم</option>
            <option value="90">آخر 3 أشهر</option>
          </select>
          <button
            onClick={exportData}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            تصدير
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">جاري تحميل الإحصائيات...</p>
        </div>
      ) : (
        <>
          {/* البطاقات الإحصائية */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-blue-100 text-sm">إجمالي الزيارات</p>
                  <p className="text-3xl font-bold">{analytics.totalVisits}</p>
                </div>
                <Eye className="w-12 h-12 text-blue-200" />
              </div>
              <div className="flex items-center gap-2 text-blue-100 text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>اليوم: {analytics.todayVisits}</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-green-100 text-sm">إجمالي الرسائل</p>
                  <p className="text-3xl font-bold">{analytics.totalMessages}</p>
                </div>
                <MessageSquare className="w-12 h-12 text-green-200" />
              </div>
              <div className="flex items-center gap-2 text-green-100 text-sm">
                <Calendar className="w-4 h-4" />
                <span>هذا الشهر: {analytics.messagesThisMonth}</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-purple-100 text-sm">المشاريع</p>
                  <p className="text-3xl font-bold">{analytics.totalProjects}</p>
                </div>
                <FolderKanban className="w-12 h-12 text-purple-200" />
              </div>
              <div className="flex items-center gap-2 text-purple-100 text-sm">
                <Activity className="w-4 h-4" />
                <span>مكتمل: {analytics.projectsCompleted}</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-lg shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-orange-100 text-sm">المقالات</p>
                  <p className="text-3xl font-bold">{analytics.totalBlogPosts}</p>
                </div>
                <FileText className="w-12 h-12 text-orange-200" />
              </div>
              <div className="flex items-center gap-2 text-orange-100 text-sm">
                <Clock className="w-4 h-4" />
                <span>منشور</span>
              </div>
            </div>
          </div>

          {/* الرسوم البيانية */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* رسم بياني للزيارات */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                الزيارات اليومية
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analytics.visitsByDay}>
                  <defs>
                    <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="visits" stroke="#3b82f6" fillOpacity={1} fill="url(#colorVisits)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* رسم بياني للرسائل */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-green-600" />
                الرسائل حسب الخدمة
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                {analytics.messagesByService.length > 0 ? (
                  <PieChart>
                    <Pie
                      data={analytics.messagesByService}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({service, percent}) => `${service} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {analytics.messagesByService.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <p>لا توجد بيانات</p>
                  </div>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* رسم بياني خطي للزيارات */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              اتجاه الزيارات
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.visitsByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="visits" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 5 }} activeDot={{ r: 8 }} name="الزيارات" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* الصفحات الأكثر زيارة */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              الصفحات الأكثر زيارة
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.popularPages} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="page" type="category" width={150} />
                <Tooltip />
                <Bar dataKey="visits" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* معلومات إضافية */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">معدل التحويل</h4>
              <p className="text-2xl font-bold text-blue-600">
                {analytics.totalVisits > 0 
                  ? ((analytics.totalMessages / analytics.totalVisits) * 100).toFixed(2)
                  : 0}%
              </p>
              <p className="text-sm text-blue-700 mt-1">من الزيارات إلى رسائل</p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-900 mb-2">متوسط الرسائل اليومية</h4>
              <p className="text-2xl font-bold text-green-600">
                {parseInt(dateRange) > 0 
                  ? (analytics.totalMessages / parseInt(dateRange)).toFixed(1)
                  : 0}
              </p>
              <p className="text-sm text-green-700 mt-1">رسالة في اليوم</p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-900 mb-2">معدل إكمال المشاريع</h4>
              <p className="text-2xl font-bold text-purple-600">
                {analytics.totalProjects > 0 
                  ? ((analytics.projectsCompleted / analytics.totalProjects) * 100).toFixed(0)
                  : 0}%
              </p>
              <p className="text-sm text-purple-700 mt-1">من المشاريع مكتملة</p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
