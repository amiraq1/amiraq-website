import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { 
  Mail, 
  Search, 
  Filter, 
  Trash2, 
  Eye, 
  EyeOff, 
  Archive, 
  Reply,
  CheckCircle,
  Clock,
  X,
  Phone,
  User,
  Calendar,
  Tag,
  Download,
  MessageCircle
} from 'lucide-react'

interface Message {
  id: string
  name: string
  email: string
  phone?: string
  service?: string
  message: string
  status: 'new' | 'read' | 'replied' | 'archived'
  created_at: string
  replied_at?: string
  notes?: string
}

export function MessagesManager() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [showReplyModal, setShowReplyModal] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    loadMessages()
  }, [filterStatus])

  const loadMessages = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false })

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus)
      }

      const { data, error } = await query

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error('خطأ في تحميل الرسائل:', error)
    }
    setLoading(false)
  }

  const updateMessageStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ status })
        .eq('id', id)

      if (error) throw error
      loadMessages()
    } catch (error) {
      console.error('خطأ في تحديث حالة الرسالة:', error)
    }
  }

  const deleteMessage = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الرسالة؟')) return

    try {
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', id)

      if (error) throw error
      loadMessages()
      setSelectedMessage(null)
    } catch (error) {
      console.error('خطأ في حذف الرسالة:', error)
    }
  }

  const handleReply = async () => {
    if (!selectedMessage || !replyText.trim()) return

    try {
      // يمكن إضافة منطق إرسال البريد الإلكتروني هنا
      // في الوقت الحالي، سنقوم فقط بتحديث الحالة
      const { error } = await supabase
        .from('contact_messages')
        .update({ 
          status: 'replied',
          replied_at: new Date().toISOString(),
          notes: notes || null
        })
        .eq('id', selectedMessage.id)

      if (error) throw error

      alert('تم الرد بنجاح!')
      setShowReplyModal(false)
      setReplyText('')
      setNotes('')
      loadMessages()
    } catch (error) {
      console.error('خطأ في الرد:', error)
      alert('حدث خطأ في الرد')
    }
  }

  const exportToCSV = () => {
    const headers = ['الاسم', 'البريد الإلكتروني', 'الهاتف', 'الخدمة', 'الرسالة', 'الحالة', 'التاريخ']
    const rows = messages.map(msg => [
      msg.name,
      msg.email,
      msg.phone || '',
      msg.service || '',
      msg.message,
      msg.status,
      new Date(msg.created_at).toLocaleDateString('ar-SA')
    ])

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `messages-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const filteredMessages = messages.filter(msg =>
    msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.message.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stats = {
    total: messages.length,
    new: messages.filter(m => m.status === 'new').length,
    read: messages.filter(m => m.status === 'read').length,
    replied: messages.filter(m => m.status === 'replied').length,
    archived: messages.filter(m => m.status === 'archived').length
  }

  return (
    <div className="space-y-6">
      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">الإجمالي</p>
              <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            </div>
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">جديدة</p>
              <p className="text-2xl font-bold text-green-600">{stats.new}</p>
            </div>
            <MessageCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">مقروءة</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.read}</p>
            </div>
            <Eye className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">تم الرد</p>
              <p className="text-2xl font-bold text-purple-600">{stats.replied}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">مؤرشفة</p>
              <p className="text-2xl font-bold text-gray-600">{stats.archived}</p>
            </div>
            <Archive className="w-8 h-8 text-gray-600" />
          </div>
        </div>
      </div>

      {/* شريط البحث والتصفية */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="بحث في الرسائل..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">جميع الحالات</option>
            <option value="new">جديدة</option>
            <option value="read">مقروءة</option>
            <option value="replied">تم الرد</option>
            <option value="archived">مؤرشفة</option>
          </select>

          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            تصدير CSV
          </button>
        </div>
      </div>

      {/* قائمة الرسائل */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">جاري التحميل...</p>
        </div>
      ) : filteredMessages.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">لا توجد رسائل</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredMessages.map((message) => (
            <div
              key={message.id}
              className={`bg-white p-6 rounded-lg shadow-sm border transition-all hover:shadow-md cursor-pointer ${
                message.status === 'new' ? 'border-r-4 border-r-green-500' : ''
              }`}
              onClick={() => {
                setSelectedMessage(message)
                if (message.status === 'new') {
                  updateMessageStatus(message.id, 'read')
                }
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <User className="w-5 h-5 text-gray-400" />
                    <h3 className="font-semibold text-lg">{message.name}</h3>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        message.status === 'new'
                          ? 'bg-green-100 text-green-700'
                          : message.status === 'read'
                          ? 'bg-yellow-100 text-yellow-700'
                          : message.status === 'replied'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {message.status === 'new' ? 'جديدة' : 
                       message.status === 'read' ? 'مقروءة' :
                       message.status === 'replied' ? 'تم الرد' : 'مؤرشفة'}
                    </span>
                  </div>

                  <div className="space-y-1 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span>{message.email}</span>
                    </div>
                    {message.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>{message.phone}</span>
                      </div>
                    )}
                    {message.service && (
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        <span className="font-medium">{message.service}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(message.created_at).toLocaleString('ar-SA')}</span>
                    </div>
                  </div>

                  <p className="text-gray-700 line-clamp-2">{message.message}</p>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedMessage(message)
                      setShowReplyModal(true)
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="رد"
                  >
                    <Reply className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      updateMessageStatus(
                        message.id,
                        message.status === 'archived' ? 'read' : 'archived'
                      )
                    }}
                    className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                    title={message.status === 'archived' ? 'إلغاء الأرشفة' : 'أرشفة'}
                  >
                    <Archive className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteMessage(message.id)
                    }}
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

      {/* نافذة الرد */}
      {showReplyModal && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-xl font-bold">الرد على الرسالة</h3>
              <button
                onClick={() => {
                  setShowReplyModal(false)
                  setReplyText('')
                  setNotes('')
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-semibold mb-2">{selectedMessage.name}</p>
                <p className="text-sm text-gray-600 mb-2">{selectedMessage.email}</p>
                <p className="text-gray-700">{selectedMessage.message}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نص الرد
                </label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="اكتب ردك هنا..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ملاحظات داخلية (اختياري)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="ملاحظات للفريق..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleReply}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  إرسال الرد
                </button>
                <button
                  onClick={() => {
                    setShowReplyModal(false)
                    setReplyText('')
                    setNotes('')
                  }}
                  className="px-6 py-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* نافذة تفاصيل الرسالة */}
      {selectedMessage && !showReplyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-xl font-bold">تفاصيل الرسالة</h3>
              <button
                onClick={() => setSelectedMessage(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">الاسم</label>
                <p className="text-lg font-semibold">{selectedMessage.name}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">البريد الإلكتروني</label>
                <p className="text-lg">{selectedMessage.email}</p>
              </div>

              {selectedMessage.phone && (
                <div>
                  <label className="text-sm font-medium text-gray-500">الهاتف</label>
                  <p className="text-lg">{selectedMessage.phone}</p>
                </div>
              )}

              {selectedMessage.service && (
                <div>
                  <label className="text-sm font-medium text-gray-500">الخدمة المطلوبة</label>
                  <p className="text-lg">{selectedMessage.service}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-500">التاريخ</label>
                <p className="text-lg">{new Date(selectedMessage.created_at).toLocaleString('ar-SA')}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">الرسالة</label>
                <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>
              </div>

              {selectedMessage.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-500">ملاحظات</label>
                  <div className="mt-2 p-4 bg-yellow-50 rounded-lg">
                    <p className="text-gray-700">{selectedMessage.notes}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowReplyModal(true)
                  }}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center gap-2"
                >
                  <Reply className="w-5 h-5" />
                  رد
                </button>
                <button
                  onClick={() => deleteMessage(selectedMessage.id)}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-5 h-5" />
                  حذف
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
