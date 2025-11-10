import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { Upload, Trash2, Eye, X, Image as ImageIcon, FolderOpen } from 'lucide-react'

export function MediaManager() {
  const [files, setFiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedFolder, setSelectedFolder] = useState('all')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadFiles()
  }, [selectedFolder])

  const loadFiles = async () => {
    setLoading(true)
    try {
      const { data: storageFiles, error: storageError } = await supabase
        .storage
        .from('nabd-ai-media')
        .list('', {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' }
        })

      if (!storageError && storageFiles) {
        const filesWithUrls = storageFiles.map(file => ({
          ...file,
          url: supabase.storage.from('nabd-ai-media').getPublicUrl(file.name).data.publicUrl
        }))
        setFiles(filesWithUrls)
      }
    } catch (error) {
      console.error('خطأ في تحميل الملفات:', error)
    }
    setLoading(false)
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (!selectedFiles || selectedFiles.length === 0) return

    setUploading(true)

    try {
      for (const file of Array.from(selectedFiles)) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        
        const { error } = await supabase.storage
          .from('nabd-ai-media')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (error) {
          console.error('خطأ في رفع الملف:', error)
          alert(`فشل رفع الملف: ${file.name}`)
        }
      }

      loadFiles()
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('خطأ في عملية الرفع:', error)
      alert('حدث خطأ أثناء رفع الملفات')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (fileName: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الملف؟')) return

    try {
      const { error } = await supabase.storage
        .from('nabd-ai-media')
        .remove([fileName])

      if (!error) {
        loadFiles()
      } else {
        alert('فشل حذف الملف')
      }
    } catch (error) {
      console.error('خطأ في حذف الملف:', error)
      alert('حدث خطأ أثناء حذف الملف')
    }
  }

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url)
    alert('تم نسخ الرابط!')
  }

  const folders = ['all', 'images', 'documents', 'videos']

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">إدارة الوسائط</h2>
        <div className="flex gap-3">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,application/pdf"
            onChange={handleUpload}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className={`flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer ${
              uploading ? 'opacity-50 pointer-events-none' : ''
            }`}
          >
            <Upload className="w-4 h-4" />
            {uploading ? 'جاري الرفع...' : 'رفع ملفات'}
          </label>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex gap-2">
          {folders.map((folder) => (
            <button
              key={folder}
              onClick={() => setSelectedFolder(folder)}
              className={`px-4 py-2 rounded-lg ${
                selectedFolder === folder
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {folder === 'all' ? 'الكل' : folder === 'images' ? 'صور' : folder === 'documents' ? 'مستندات' : 'فيديو'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : files.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 mb-4">لا توجد ملفات حالياً</p>
          <label
            htmlFor="file-upload"
            className="text-blue-600 hover:underline cursor-pointer"
          >
            ارفع أول ملف
          </label>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {files.map((file) => (
            <div key={file.name} className="bg-white rounded-lg shadow overflow-hidden group">
              <div className="relative aspect-square bg-gray-100">
                {file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                  <img
                    src={file.url}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FolderOpen className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => window.open(file.url, '_blank')}
                    className="p-2 bg-white rounded-full hover:bg-gray-100"
                    title="عرض"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(file.name)}
                    className="p-2 bg-white rounded-full hover:bg-red-50 text-red-600"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-gray-900 truncate" title={file.name}>
                  {file.name}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {(file.metadata?.size / 1024).toFixed(1)} KB
                </p>
                <button
                  onClick={() => copyToClipboard(file.url)}
                  className="text-xs text-blue-600 hover:underline mt-2"
                >
                  نسخ الرابط
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">معلومات مهمة:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>- الحد الأقصى لحجم الملف: 10 ميجابايت</li>
          <li>- الأنواع المدعومة: صور (JPG, PNG, GIF, WebP), فيديو، PDF</li>
          <li>- يمكنك رفع عدة ملفات في نفس الوقت</li>
          <li>- جميع الملفات متاحة للعامة عبر الرابط</li>
        </ul>
      </div>
    </div>
  )
}
