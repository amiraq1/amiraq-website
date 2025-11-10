import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Plus, Edit, Trash2, Eye, X } from 'lucide-react'

export function BlogManager() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPost, setEditingPost] = useState<any>(null)

  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (!error && data) {
      setPosts(data)
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المقال؟')) {
      await supabase.from('blog_posts').delete().eq('id', id)
      loadPosts()
    }
  }

  const togglePublish = async (post: any) => {
    await supabase
      .from('blog_posts')
      .update({ published: !post.published })
      .eq('id', post.id)
    loadPosts()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">إدارة المدونة</h2>
        <button
          onClick={() => {
            setEditingPost(null)
            setShowModal(true)
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          مقال جديد
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-600 mb-4">لا توجد مقالات حالياً</p>
          <button
            onClick={() => setShowModal(true)}
            className="text-blue-600 hover:underline"
          >
            إضافة مقال جديد
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg">{post.title}</h3>
                    {post.published ? (
                      <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-600">
                        منشور
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-600">
                        مسودة
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {post.excerpt || 'لا يوجد مقتطف'}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>الفئة: {post.category || 'عام'}</span>
                    <span>المشاهدات: {post.views || 0}</span>
                    <span>{new Date(post.created_at).toLocaleDateString('ar-SA')}</span>
                  </div>
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {post.tags.map((tag: string, idx: number) => (
                        <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 mr-4">
                  <button
                    onClick={() => togglePublish(post)}
                    className="p-2 hover:bg-gray-100 rounded"
                    title={post.published ? 'إلغاء النشر' : 'نشر'}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setEditingPost(post)
                      setShowModal(true)
                    }}
                    className="p-2 hover:bg-blue-50 text-blue-600 rounded"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="p-2 hover:bg-red-50 text-red-600 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <BlogPostModal
          post={editingPost}
          onClose={() => {
            setShowModal(false)
            setEditingPost(null)
          }}
          onSave={() => {
            setShowModal(false)
            setEditingPost(null)
            loadPosts()
          }}
        />
      )}
    </div>
  )
}

function BlogPostModal({ post, onClose, onSave }: any) {
  const [formData, setFormData] = useState({
    title: post?.title || '',
    content: post?.content || '',
    excerpt: post?.excerpt || '',
    category: post?.category || 'general',
    tags: post?.tags?.join(', ') || '',
    published: post?.published || false,
    author: post?.author || 'عمار محمد',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const tagsArray = formData.tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t)

      const postData = {
        ...formData,
        tags: tagsArray,
      }

      if (post) {
        await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', post.id)
      } else {
        await supabase
          .from('blog_posts')
          .insert([postData])
      }
      onSave()
    } catch (error) {
      console.error('خطأ في حفظ المقال:', error)
      alert('حدث خطأ في حفظ المقال')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
          <h3 className="text-xl font-bold">
            {post ? 'تعديل المقال' : 'مقال جديد'}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">عنوان المقال *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="عنوان جذاب للمقال"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">المقتطف</label>
            <textarea
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              rows={2}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="ملخص قصير للمقال..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">المحتوى *</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
              rows={12}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 font-arabic"
              placeholder="اكتب محتوى المقال هنا..."
            />
            <p className="text-xs text-gray-500 mt-1">يمكنك استخدام HTML للتنسيق</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">الفئة</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="general">عام</option>
                <option value="تقنية">تقنية</option>
                <option value="تصميم">تصميم</option>
                <option value="تطوير">تطوير</option>
                <option value="تسويق">تسويق</option>
                <option value="أخبار">أخبار</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">الكاتب</label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="اسم الكاتب"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">الوسوم (مفصولة بفاصلة)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="تقنية, برمجة, ذكاء اصطناعي"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="published"
              checked={formData.published}
              onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
              className="w-4 h-4 text-blue-600"
            />
            <label htmlFor="published" className="text-sm">
              نشر المقال فوراً
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'جاري الحفظ...' : 'حفظ المقال'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
