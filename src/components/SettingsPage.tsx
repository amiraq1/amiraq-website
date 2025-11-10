import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Save, Globe, Mail, Phone, MapPin, Loader } from 'lucide-react'

export function SettingsPage() {
  const [settings, setSettings] = useState({
    site_name: 'نبض AI',
    site_description: 'صناعة المحتوى الرقمي بأسلوب عصري',
    site_email: 'info@nabd-ai.com',
    site_phone: '+966 50 123 4567',
    site_address: 'الرياض، المملكة العربية السعودية',
    facebook_url: '',
    twitter_url: '',
    instagram_url: '',
    linkedin_url: '',
    meta_keywords: 'نبض AI, ذكاء اصطناعي, محتوى رقمي',
    meta_description: 'نبض AI - متخصصون في صناعة المحتوى الرقمي',
    google_analytics_id: '',
    enable_analytics: true,
    enable_auto_replies: true
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    const { data } = await supabase
      .from('site_settings')
      .select('*')
      .single()

    if (data) {
      setSettings({
        site_name: data.site_name || settings.site_name,
        site_description: data.site_description || settings.site_description,
        site_email: data.site_email || settings.site_email,
        site_phone: data.site_phone || settings.site_phone,
        site_address: data.site_address || settings.site_address,
        facebook_url: data.social_links?.facebook || '',
        twitter_url: data.social_links?.twitter || '',
        instagram_url: data.social_links?.instagram || '',
        linkedin_url: data.social_links?.linkedin || '',
        meta_keywords: data.seo_settings?.keywords || settings.meta_keywords,
        meta_description: data.seo_settings?.description || settings.meta_description,
        google_analytics_id: data.analytics_settings?.google_analytics_id || '',
        enable_analytics: data.analytics_settings?.enabled ?? true,
        enable_auto_replies: data.features?.auto_replies ?? true
      })
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          id: 1,
          site_name: settings.site_name,
          site_description: settings.site_description,
          site_email: settings.site_email,
          site_phone: settings.site_phone,
          site_address: settings.site_address,
          social_links: {
            facebook: settings.facebook_url,
            twitter: settings.twitter_url,
            instagram: settings.instagram_url,
            linkedin: settings.linkedin_url
          },
          seo_settings: {
            keywords: settings.meta_keywords,
            description: settings.meta_description
          },
          analytics_settings: {
            google_analytics_id: settings.google_analytics_id,
            enabled: settings.enable_analytics
          },
          features: {
            auto_replies: settings.enable_auto_replies
          },
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      setMessage('تم حفظ الإعدادات بنجاح')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('خطأ في حفظ الإعدادات:', error)
      setMessage('حدث خطأ في حفظ الإعدادات')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-bold mb-6">الإعدادات العامة</h2>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.includes('بنجاح') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* معلومات الموقع الأساسية */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5" />
            معلومات الموقع الأساسية
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اسم الموقع
              </label>
              <input
                type="text"
                value={settings.site_name}
                onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                وصف الموقع
              </label>
              <textarea
                value={settings.site_description}
                onChange={(e) => setSettings({ ...settings, site_description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* معلومات الاتصال */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5" />
            معلومات الاتصال
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                value={settings.site_email}
                onChange={(e) => setSettings({ ...settings, site_email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رقم الهاتف
              </label>
              <input
                type="tel"
                value={settings.site_phone}
                onChange={(e) => setSettings({ ...settings, site_phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                العنوان
              </label>
              <input
                type="text"
                value={settings.site_address}
                onChange={(e) => setSettings({ ...settings, site_address: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* روابط التواصل الاجتماعي */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">روابط التواصل الاجتماعي</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Facebook
              </label>
              <input
                type="url"
                value={settings.facebook_url}
                onChange={(e) => setSettings({ ...settings, facebook_url: e.target.value })}
                placeholder="https://facebook.com/..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Twitter
              </label>
              <input
                type="url"
                value={settings.twitter_url}
                onChange={(e) => setSettings({ ...settings, twitter_url: e.target.value })}
                placeholder="https://twitter.com/..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instagram
              </label>
              <input
                type="url"
                value={settings.instagram_url}
                onChange={(e) => setSettings({ ...settings, instagram_url: e.target.value })}
                placeholder="https://instagram.com/..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                LinkedIn
              </label>
              <input
                type="url"
                value={settings.linkedin_url}
                onChange={(e) => setSettings({ ...settings, linkedin_url: e.target.value })}
                placeholder="https://linkedin.com/..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* إعدادات SEO */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">إعدادات SEO</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الكلمات المفتاحية
              </label>
              <input
                type="text"
                value={settings.meta_keywords}
                onChange={(e) => setSettings({ ...settings, meta_keywords: e.target.value })}
                placeholder="كلمة1, كلمة2, كلمة3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                وصف Meta
              </label>
              <textarea
                value={settings.meta_description}
                onChange={(e) => setSettings({ ...settings, meta_description: e.target.value })}
                rows={3}
                placeholder="وصف مختصر للموقع يظهر في نتائج البحث"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* إعدادات الميزات */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">الميزات</h3>
          
          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.enable_analytics}
                onChange={(e) => setSettings({ ...settings, enable_analytics: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">تفعيل تتبع الإحصائيات</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.enable_auto_replies}
                onChange={(e) => setSettings({ ...settings, enable_auto_replies: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">تفعيل الردود التلقائية</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
          </button>
        </div>
      </form>
    </div>
  )
}
