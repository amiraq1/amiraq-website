import { useState, useEffect } from 'react'
import { useAuth } from './lib/auth'
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom'
import { AuthProvider } from './lib/auth'
import { supabase } from './lib/supabase'
import { BlogManager } from './components/BlogManager'
import { MediaManagerAdvanced } from './components/MediaManagerAdvanced'
import { ProjectModal } from './components/ProjectModal'
import { SettingsPage } from './components/SettingsPage'
import { MessagesManager } from './components/MessagesManager'
import { AnalyticsDashboardAdvanced } from './components/AnalyticsDashboardAdvanced'
import { AutoReplyManager } from './components/AutoReplyManager'
import { ThemeProvider, useTheme } from './lib/theme'
import { 
  LayoutDashboard, 
  FolderKanban, 
  FileText, 
  Image, 
  MessageSquare, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  X,
  Plus,
  Edit,
  Trash2,
  Eye,
  Upload,
  TrendingUp,
  MessageCircle,
  Moon,
  Sun
} from 'lucide-react'

// صفحة تسجيل الدخول
function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // التحقق من صحة البيانات المدخلة
    if (!email || !email.includes('@')) {
      setError('يرجى إدخال بريد إلكتروني صحيح')
      setLoading(false)
      return
    }

    if (!password || password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
      setLoading(false)
      return
    }

    try {
      await signIn(email, password)
      navigate('/dashboard')
    } catch (err: any) {
      // عرض رسائل خطأ واضحة ومفيدة
      if (err.message) {
        setError(err.message)
      } else if (err.error_description) {
        setError(err.error_description)
      } else {
        setError('حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.')
      }
      
      console.error('خطأ تسجيل الدخول:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 border border-gray-100">
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-blue-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">لوحة تحكم نبض AI</h1>
          <p className="text-gray-600">نظام إدارة المحتوى المتقدم</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-red-500 mt-0.5 ml-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="text-sm font-medium">حدث خطأ</h3>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="admin@nabd-ai.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              كلمة المرور
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                جاري تسجيل الدخول...
              </>
            ) : 'تسجيل الدخول'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            نظام آمن ومشفر
          </p>
        </div>
      </div>
    </div>
  )
}

// Layout الرئيسي
function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const menuItems = [
    { icon: LayoutDashboard, label: 'لوحة التحكم', path: '/dashboard' },
    { icon: FolderKanban, label: 'المشاريع', path: '/projects' },
    { icon: FileText, label: 'المدونة', path: '/blog' },
    { icon: Image, label: 'الوسائط', path: '/media' },
    { icon: MessageSquare, label: 'الرسائل', path: '/messages' },
    { icon: BarChart3, label: 'الإحصائيات', path: '/analytics' },
    { icon: MessageCircle, label: 'الردود التلقائية', path: '/auto-replies' },
    { icon: Settings, label: 'الإعدادات', path: '/settings' },
  ]

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 z-50 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-blue-600">نبض AI</h2>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">لوحة الإدارة</p>
        </div>

        <nav className="p-4">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-colors mb-1"
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold">
                {user?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700 truncate">
                {user?.email}
              </p>
              <p className="text-xs text-gray-500">مدير النظام</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      <div className="lg:mr-64">
        <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-30">
          <div className="px-4 py-4 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white">لوحة التحكم</h1>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={theme === 'dark' ? 'تفعيل الوضع النهاري' : 'تفعيل الوضع الليلي'}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>
        </header>

        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

// الصفحة الرئيسية
function DashboardPage() {
  const [stats, setStats] = useState({
    projects: 0,
    blog_posts: 0,
    messages: 0,
    views: 0
  })

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    const [projects, blog_posts, messages, analytics] = await Promise.all([
      supabase.from('projects').select('*', { count: 'exact', head: true }),
      supabase.from('blog_posts').select('*', { count: 'exact', head: true }),
      supabase.from('contact_messages').select('*', { count: 'exact', head: true }).eq('status', 'new'),
      supabase.from('site_analytics').select('visit_count')
    ])

    setStats({
      projects: projects.count || 0,
      blog_posts: blog_posts.count || 0,
      messages: messages.count || 0,
      views: analytics.data?.reduce((sum, item) => sum + (item.visit_count || 0), 0) || 0
    })
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">مرحباً في لوحة التحكم</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="إجمالي المشاريع" value={stats.projects.toString()} icon={FolderKanban} color="blue" />
        <StatCard title="المقالات" value={stats.blog_posts.toString()} icon={FileText} color="green" />
        <StatCard title="الرسائل الجديدة" value={stats.messages.toString()} icon={MessageSquare} color="yellow" />
        <StatCard title="إجمالي الزيارات" value={stats.views.toString()} icon={BarChart3} color="purple" />
      </div>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, color }: any) {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600',
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colors[color as keyof typeof colors]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <h3 className="text-2xl font-bold text-gray-800 mb-1">{value}</h3>
      <p className="text-sm text-gray-600">{title}</p>
    </div>
  )
}

// صفحة المشاريع
function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProject, setEditingProject] = useState<any>(null)

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (!error && data) {
      setProjects(data)
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المشروع؟')) {
      await supabase.from('projects').delete().eq('id', id)
      loadProjects()
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">إدارة المشاريع</h2>
        <button
          onClick={() => {
            setEditingProject(null)
            setShowModal(true)
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          مشروع جديد
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <FolderKanban className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 mb-4">لا توجد مشاريع حالياً</p>
          <button
            onClick={() => setShowModal(true)}
            className="text-blue-600 hover:underline"
          >
            إضافة مشروع جديد
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="bg-white rounded-lg shadow overflow-hidden">
              {project.images && project.images.length > 0 && (
                <img
                  src={project.images[0]}
                  alt={project.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">{project.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {project.description}
                </p>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    project.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {project.status === 'active' ? 'نشط' : 'غير نشط'}
                  </span>
                  <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-600">
                    {project.category || 'عام'}
                  </span>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => {
                      setEditingProject(project)
                      setShowModal(true)
                    }}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                  >
                    <Edit className="w-4 h-4" />
                    تعديل
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100"
                  >
                    <Trash2 className="w-4 h-4" />
                    حذف
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <ProjectModal
          project={editingProject}
          onClose={() => {
            setShowModal(false)
            setEditingProject(null)
          }}
          onSave={() => {
            setShowModal(false)
            setEditingProject(null)
            loadProjects()
          }}
        />
      )}
    </div>
  )
}


// صفحات كاملة
function BlogPage() { 
  return <BlogManager />
}

function MediaPage() { 
  return <MediaManagerAdvanced />
}

// صفحة الرسائل
function MessagesPage() {
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    loadMessages()
  }, [filter])

  const loadMessages = async () => {
    setLoading(true)
    let query = supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (filter !== 'all') {
      query = query.eq('status', filter)
    }

    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (!error && data) {
      setMessages(data)
    }
    setLoading(false)
  }

  const updateStatus = async (id: string, status: string) => {
    await supabase
      .from('contact_messages')
      .update({ status })
      .eq('id', id)
    loadMessages()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">الرسائل</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            الكل
          </button>
          <button
            onClick={() => setFilter('new')}
            className={`px-4 py-2 rounded-lg ${filter === 'new' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            جديدة
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : messages.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">لا توجد رسائل</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{message.name}</h3>
                  <p className="text-sm text-gray-600">{message.email}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs ${
                  message.status === 'new' ? 'bg-blue-100 text-blue-600' :
                  message.status === 'read' ? 'bg-yellow-100 text-yellow-600' :
                  'bg-green-100 text-green-600'
                }`}>
                  {message.status === 'new' ? 'جديدة' : message.status === 'read' ? 'مقروءة' : 'تم الرد'}
                </span>
              </div>

              <p className="text-gray-700 mb-4">{message.message}</p>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{new Date(message.created_at).toLocaleString('ar-SA')}</span>
                <div className="flex gap-2">
                  {message.status === 'new' && (
                    <button
                      onClick={() => updateStatus(message.id, 'read')}
                      className="px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                    >
                      تحديد كمقروءة
                    </button>
                  )}
                  {message.status !== 'replied' && (
                    <button
                      onClick={() => updateStatus(message.id, 'replied')}
                      className="px-3 py-1 bg-green-50 text-green-600 rounded hover:bg-green-100"
                    >
                      تم الرد
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function AnalyticsPage() { 
  const [analytics, setAnalytics] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    const { data, error } = await supabase
      .from('site_analytics')
      .select('*')
      .order('visit_count', { ascending: false })
    
    if (!error && data) {
      setAnalytics(data)
    }
    setLoading(false)
  }

  const totalVisits = analytics.reduce((sum, item) => sum + item.visit_count, 0)

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">الإحصائيات</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm text-gray-600 mb-2">إجمالي الزيارات</h3>
          <p className="text-3xl font-bold text-blue-600">{totalVisits}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm text-gray-600 mb-2">عدد الصفحات</h3>
          <p className="text-3xl font-bold text-green-600">{analytics.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm text-gray-600 mb-2">متوسط الزيارات</h3>
          <p className="text-3xl font-bold text-purple-600">
            {analytics.length > 0 ? Math.round(totalVisits / analytics.length) : 0}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  الصفحة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  عدد الزيارات
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  آخر زيارة
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {analytics.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 text-sm text-gray-900">{item.page_path}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{item.visit_count}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(item.last_visit).toLocaleString('ar-SA')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// المكون الرئيسي
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute><DashboardLayout><DashboardPage /></DashboardLayout></ProtectedRoute>
          } />
          
          <Route path="/projects" element={
            <ProtectedRoute><DashboardLayout><ProjectsPage /></DashboardLayout></ProtectedRoute>
          } />
          
          <Route path="/blog" element={
            <ProtectedRoute><DashboardLayout><BlogPage /></DashboardLayout></ProtectedRoute>
          } />
          
          <Route path="/media" element={
            <ProtectedRoute><DashboardLayout><MediaPage /></DashboardLayout></ProtectedRoute>
          } />
          
          <Route path="/messages" element={
            <ProtectedRoute><DashboardLayout><MessagesManager /></DashboardLayout></ProtectedRoute>
          } />
          
          <Route path="/analytics" element={
            <ProtectedRoute><DashboardLayout><AnalyticsDashboardAdvanced /></DashboardLayout></ProtectedRoute>
          } />
          
          <Route path="/auto-replies" element={
            <ProtectedRoute><DashboardLayout><AutoReplyManager /></DashboardLayout></ProtectedRoute>
          } />
          
          <Route path="/settings" element={
            <ProtectedRoute><DashboardLayout><SettingsPage /></DashboardLayout></ProtectedRoute>
          } />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export default App
