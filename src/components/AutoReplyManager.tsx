import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Plus, Edit, Trash2, Save, X, MessageCircle, CheckCircle, ToggleLeft, ToggleRight } from 'lucide-react'

interface AutoReply {
  id: string
  service_type: string
  subject: string
  message_template: string
  is_active: boolean
  delay_minutes: number
  created_at: string
}

export function AutoReplyManager() {
  const [replies, setReplies] = useState<AutoReply[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingReply, setEditingReply] = useState<AutoReply | null>(null)
  const [formData, setFormData] = useState({
    service_type: '',
    subject: '',
    message_template: '',
    is_active: true,
    delay_minutes: 0
  })

  useEffect(() => {
    loadReplies()
  }, [])

  const loadReplies = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('auto_replies')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setReplies(data || [])
    } catch (error) {
      console.error('خطأ في تحميل الردود التلقائية:', error)
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingReply) {
        // تحديث
        const { error } = await supabase
          .from('auto_replies')
          .update(formData)
          .eq('id', editingReply.id)

        if (error) throw error
      } else {
        // إضافة جديد
        const { error } = await supabase
          .from('auto_replies')
          .insert([formData])

        if (error) throw error
      }

      alert('تم الحفظ بنجاح!')
      resetForm()
      loadReplies()
    } catch (error) {
      console.error('خطأ في الحفظ:', error)
      alert('حدث خطأ في الحفظ')
    }
  }

  const deleteReply = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الرد التلقائي؟')) return

    try {
      const { error } = await supabase
        .from('auto_replies')
        .delete()
        .eq('id', id)

      if (error) throw error
      loadReplies()
    } catch (error) {
      console.error('خطأ في الحذف:', error)
      alert('حدث خطأ في الحذف')
    }
  }

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('auto_replies')
        .update({ is_active: !currentStatus })
        .eq('id', id)

      if (error) throw error
      loadReplies()
    } catch (error) {
      console.error('خطأ في تحديث الحالة:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      service_type: '',
      subject: '',
      message_template: '',
      is_active: true,
      delay_minutes: 0
    })
    setEditingReply(null)
    setShowModal(false)
  }

  const openEditModal = (reply: AutoReply) => {
    setEditingReply(reply)
    setFormData({
      service_type: reply.service_type,
      subject: reply.subject,
      message_template: reply.message_template,
      is_active: reply.is_active,
      delay_minutes: reply.delay_minutes
    })
    setShowModal(true)
  }

  const serviceTypes = [
    { value: 'general', label: 'عام' },
    { value: 'web', label: 'تطوير ويب' },
    { value: 'mobile', label: 'تطبيقات موبايل' },
    { value: 'design', label: 'تصميم' },
    { value: 'ai', label: 'ذكاء اصطناعي' },
    { value: 'marketing', label: 'تسويق رقمي' }
  ]

  return (
    <div className="space-y-6">
      {/* الرأسية */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">إدارة الردود التلقائية</h2>
          <p className="text-gray-600 mt-1">إعداد رسائل الرد التلقائي للخدمات المختلفة</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          إضافة رد تلقائي
        </button>
      </div>

      {/* الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">الردود النشطة</p>
              <p className="text-2xl font-bold text-green-600">
                {replies.filter(r => r.is_active).length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">الردود غير النشطة</p>
              <p className="text-2xl font-bold text-gray-600">
                {replies.filter(r => !r.is_active).length}
              </p>
            </div>
            <ToggleLeft className="w-8 h-8 text-gray-600" />
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">إجمالي الردود</p>
              <p className="text-2xl font-bold text-blue-600">{replies.length}</p>
            </div>
            <MessageCircle className="w-8 h-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* قائمة الردود */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">جاري التحميل...</p>
        </div>
      ) : replies.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">لا توجد ردود تلقائية</p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            إضافة أول رد تلقائي
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {replies.map((reply) => (
            <div
              key={reply.id}
              className={`bg-white p-6 rounded-lg shadow-sm border transition-all ${
                reply.is_active ? 'border-green-300' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="font-bold text-lg">{reply.subject}</h3>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                      {serviceTypes.find(s => s.value === reply.service_type)?.label || reply.service_type}
                    </span>
                    <button
                      onClick={() => toggleActive(reply.id, reply.is_active)}
                      className="flex items-center gap-2"
                    >
                      {reply.is_active ? (
                        <ToggleRight className="w-6 h-6 text-green-600" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-gray-400" />
                      )}
                    </button>
                  </div>

                  <p className="text-gray-700 mb-3 whitespace-pre-wrap line-clamp-3">
                    {reply.message_template}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>التأخير: {reply.delay_minutes} دقيقة</span>
                    <span>•</span>
                    <span>
                      تم الإنشاء: {new Date(reply.created_at).toLocaleDateString('ar-SA')}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => openEditModal(reply)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="تعديل"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => deleteReply(reply.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="حذف"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* نافذة الإضافة/التعديل */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-xl font-bold">
                {editingReply ? 'تعديل الرد التلقائي' : 'إضافة رد تلقائي جديد'}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نوع الخدمة *
                </label>
                <select
                  value={formData.service_type}
                  onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">اختر نوع الخدمة</option>
                  {serviceTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  موضوع الرسالة *
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="مثال: شكراً لاختيارك خدماتنا"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نص الرسالة *
                </label>
                <textarea
                  value={formData.message_template}
                  onChange={(e) => setFormData({ ...formData, message_template: e.target.value })}
                  required
                  rows={8}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="مرحباً {name}،&#10;&#10;شكراً لتواصلك معنا...&#10;&#10;يمكنك استخدام المتغيرات: {name}, {email}, {service}"
                />
                <p className="text-sm text-gray-500 mt-1">
                  المتغيرات المتاحة: {'{'}name{'}'}, {'{'}email{'}'}, {'{'}service{'}'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  التأخير قبل الإرسال (بالدقائق)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.delay_minutes}
                  onChange={(e) => setFormData({ ...formData, delay_minutes: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
                <p className="text-sm text-gray-500 mt-1">
                  0 = إرسال فوري، أي رقم آخر = تأخير قبل الإرسال
                </p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                  تفعيل الرد التلقائي
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {editingReply ? 'حفظ التعديلات' : 'إضافة الرد التلقائي'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
