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
  Clock
} from 'lucide-react'

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

export function AnalyticsDashboard() {
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
  const [dateRange, setDateRange] = useState('7') // آخر 7 أيام

  useEffect(() => {
    loadAnalytics()
  }, [dateRange])

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      // حساب التواريخ
      const today = new Date()
      const startOfToday = new Date(today.setHours(0, 0, 0, 0)).toISOString()
      const daysAgo = new Date(Date.now() - parseInt(dateRange) * 24 * 60 * 60 * 1000).toISOString()
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString()

      // إحصائيات الزيارات
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

      // الزيارات حسب اليوم
      const visitsByDay = generateVisitsByDay(allVisits || [], parseInt(dateRange))

      // الرسائل حسب الخدمة
      const messagesByService = generateMessagesByService(allMessages || [])

      // الصفحات الأكثر زيارة
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
      .slice(0, 5)
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

  const maxVisits = Math.max(...analytics.visitsByDay.map(d => d.visits), 1)

  return (
    <div className="space-y-6">
      {/* فلتر المدة */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">الإحصائيات والتقارير</h2>
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
            {/* الزيارات حسب اليوم */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                الزيارات اليومية
              </h3>
              <div className="space-y-3">
                {analytics.visitsByDay.map((day, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{day.date}</span>
                      <span className="font-semibold text-gray-800">{day.visits}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${(day.visits / maxVisits) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* الرسائل حسب الخدمة */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-green-600" />
                الرسائل حسب الخدمة
              </h3>
              <div className="space-y-4">
                {analytics.messagesByService.length > 0 ? (
                  analytics.messagesByService.map((item, index) => {
                    const maxCount = Math.max(...analytics.messagesByService.map(m => m.count), 1)
                    return (
                      <div key={index} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-700 font-medium">{item.service}</span>
                          <span className="font-bold text-green-600">{item.count}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full transition-all"
                            style={{ width: `${(item.count / maxCount) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-gray-500 text-center py-8">لا توجد بيانات</p>
                )}
              </div>
            </div>
          </div>

          {/* الصفحات الأكثر زيارة */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              الصفحات الأكثر زيارة
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-right py-3 px-4 text-gray-600 font-semibold">#</th>
                    <th className="text-right py-3 px-4 text-gray-600 font-semibold">الصفحة</th>
                    <th className="text-right py-3 px-4 text-gray-600 font-semibold">عدد الزيارات</th>
                    <th className="text-right py-3 px-4 text-gray-600 font-semibold">النسبة</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.popularPages.length > 0 ? (
                    analytics.popularPages.map((page, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 text-gray-500">{index + 1}</td>
                        <td className="py-3 px-4 font-medium">{page.page}</td>
                        <td className="py-3 px-4 text-purple-600 font-semibold">{page.visits}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-purple-600 h-2 rounded-full"
                                style={{ 
                                  width: `${(page.visits / analytics.totalVisits) * 100}%` 
                                }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600 min-w-[50px] text-left">
                              {((page.visits / analytics.totalVisits) * 100).toFixed(1)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-gray-500">
                        لا توجد بيانات
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
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
