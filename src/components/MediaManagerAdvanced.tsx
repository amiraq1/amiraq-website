import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { 
  Upload, 
  Trash2, 
  Eye, 
  X, 
  Image as ImageIcon, 
  FolderOpen,
  Search,
  Download,
  Copy,
  Check,
  Grid3x3,
  List,
  Filter,
  Folder,
  FileImage
} from 'lucide-react'

interface MediaFile {
  id: string
  name: string
  url: string
  size: number
  created_at: string
  folder: string
}

// دالة ضغط الصور
const compressImage = async (file: File, maxSizeMB: number = 1): Promise<File> => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target?.result as string
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        // حساب الأبعاد الجديدة
        const maxDimension = 1920
        if (width > height && width > maxDimension) {
          height = (height * maxDimension) / width
          width = maxDimension
        } else if (height > maxDimension) {
          width = (width * maxDimension) / height
          height = maxDimension
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              })
              resolve(compressedFile)
            } else {
              resolve(file)
            }
          },
          'image/jpeg',
          0.8
        )
      }
    }
  })
}

export function MediaManagerAdvanced() {
  const [files, setFiles] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedFolder, setSelectedFolder] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)

  const folders = ['all', 'projects', 'blog', 'general']

  useEffect(() => {
    loadFiles()
  }, [selectedFolder])

  const loadFiles = async () => {
    setLoading(true)
    try {
      const { data: storageFiles, error } = await supabase
        .storage
        .from('nabd-ai-media')
        .list(selectedFolder === 'all' ? '' : selectedFolder, {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' }
        })

      if (!error && storageFiles) {
        const filesWithUrls = storageFiles
          .filter(f => f.name !== '.emptyFolderPlaceholder')
          .map(file => {
            const filePath = selectedFolder === 'all' ? file.name : `${selectedFolder}/${file.name}`
            return {
              id: file.id || file.name,
              name: file.name,
              url: supabase.storage.from('nabd-ai-media').getPublicUrl(filePath).data.publicUrl,
              size: file.metadata?.size || 0,
              created_at: file.created_at || new Date().toISOString(),
              folder: selectedFolder === 'all' ? 'general' : selectedFolder
            }
          })
        setFiles(filesWithUrls)
      }
    } catch (error) {
      console.error('خطأ في تحميل الملفات:', error)
    }
    setLoading(false)
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    if (droppedFiles.length > 0) {
      await handleUpload(droppedFiles)
    }
  }, [selectedFolder])

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (selectedFiles && selectedFiles.length > 0) {
      await handleUpload(Array.from(selectedFiles))
    }
  }

  const handleUpload = async (selectedFiles: File[]) => {
    if (selectedFolder === 'all') {
      alert('الرجاء اختيار مجلد محدد للرفع')
      return
    }

    setUploading(true)

    try {
      for (const file of selectedFiles) {
        // ضغط الصورة إذا كانت أكبر من 1MB
        let fileToUpload = file
        if (file.type.startsWith('image/') && file.size > 1024 * 1024) {
          fileToUpload = await compressImage(file)
          console.log(`تم ضغط الصورة من ${(file.size / 1024).toFixed(0)}KB إلى ${(fileToUpload.size / 1024).toFixed(0)}KB`)
        }

        const fileExt = fileToUpload.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `${selectedFolder}/${fileName}`

        const { error } = await supabase.storage
          .from('nabd-ai-media')
          .upload(filePath, fileToUpload, {
            cacheControl: '3600',
            upsert: false
          })

        if (error) {
          console.error('خطأ في رفع الملف:', error)
          alert(`فشل رفع ${file.name}: ${error.message}`)
        }
      }

      alert('تم رفع الملفات بنجاح!')
      loadFiles()
    } catch (error) {
      console.error('خطأ في معالجة الملفات:', error)
      alert('حدث خطأ أثناء رفع الملفات')
    } finally {
      setUploading(false)
    }
  }

  const deleteFile = async (file: MediaFile) => {
    if (!confirm(`هل أنت متأكد من حذف ${file.name}؟`)) return

    try {
      const filePath = file.folder === 'general' ? file.name : `${file.folder}/${file.name}`
      const { error } = await supabase.storage
        .from('nabd-ai-media')
        .remove([filePath])

      if (error) throw error

      alert('تم حذف الملف بنجاح')
      setSelectedFile(null)
      loadFiles()
    } catch (error) {
      console.error('خطأ في حذف الملف:', error)
      alert('فشل حذف الملف')
    }
  }

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    setCopiedUrl(url)
    setTimeout(() => setCopiedUrl(null), 2000)
  }

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* الرأسية والأدوات */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">مكتبة الوسائط</h2>
          <p className="text-gray-600 mt-1">إدارة متقدمة للصور والملفات</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
            }`}
          >
            <Grid3x3 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
            }`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">إجمالي الملفات</p>
              <p className="text-2xl font-bold text-blue-600">{files.length}</p>
            </div>
            <FileImage className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        {folders.slice(1).map((folder) => {
          const count = files.filter(f => f.folder === folder).length
          return (
            <div key={folder} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{folder}</p>
                  <p className="text-2xl font-bold text-gray-600">{count}</p>
                </div>
                <Folder className="w-8 h-8 text-gray-600" />
              </div>
            </div>
          )
        })}
      </div>

      {/* شريط البحث والفلاتر */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="بحث في الملفات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={selectedFolder}
            onChange={(e) => setSelectedFolder(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {folders.map((folder) => (
              <option key={folder} value={folder}>
                {folder === 'all' ? 'جميع المجلدات' : folder}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* منطقة الرفع */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
          disabled={uploading || selectedFolder === 'all'}
        />
        
        <Upload className={`w-12 h-12 mx-auto mb-4 ${dragActive ? 'text-blue-600' : 'text-gray-400'}`} />
        
        {selectedFolder === 'all' ? (
          <p className="text-gray-600 mb-4">الرجاء اختيار مجلد محدد للرفع</p>
        ) : (
          <>
            <p className="text-gray-700 mb-2 font-medium">
              اسحب وأفلت الملفات هنا أو انقر للرفع
            </p>
            <p className="text-sm text-gray-500 mb-4">
              سيتم الرفع إلى مجلد: <span className="font-semibold">{selectedFolder}</span>
            </p>
            <p className="text-xs text-gray-400 mb-4">
              الصور الكبيرة سيتم ضغطها تلقائياً لتحسين الأداء
            </p>
          </>
        )}

        <label
          htmlFor="file-upload"
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors cursor-pointer ${
            uploading || selectedFolder === 'all'
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {uploading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>جاري الرفع...</span>
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              <span>اختر الملفات</span>
            </>
          )}
        </label>
      </div>

      {/* قائمة الملفات */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">جاري التحميل...</p>
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">لا توجد ملفات</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              className="group relative bg-white rounded-lg border hover:shadow-lg transition-all cursor-pointer overflow-hidden"
              onClick={() => setSelectedFile(file)}
            >
              <div className="aspect-square overflow-hidden bg-gray-100">
                <img
                  src={file.url}
                  alt={file.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(0)} KB</p>
              </div>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    copyUrl(file.url)
                  }}
                  className="p-2 bg-white rounded-lg shadow-lg hover:bg-gray-100 transition-colors"
                  title="نسخ الرابط"
                >
                  {copiedUrl === file.url ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-600" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المعاينة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الاسم</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحجم</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التاريخ</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredFiles.map((file) => (
                <tr key={file.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <img src={file.url} alt={file.name} className="w-12 h-12 object-cover rounded" />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{file.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{(file.size / 1024).toFixed(0)} KB</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(file.created_at).toLocaleDateString('ar-SA')}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyUrl(file.url)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="نسخ الرابط"
                      >
                        {copiedUrl === file.url ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => setSelectedFile(file)}
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded transition-colors"
                        title="معاينة"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteFile(file)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* نافذة المعاينة */}
      {selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-xl font-bold">{selectedFile.name}</h3>
              <button
                onClick={() => setSelectedFile(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <img
                src={selectedFile.url}
                alt={selectedFile.name}
                className="w-full rounded-lg mb-6"
              />

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500">الحجم</p>
                  <p className="font-semibold">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">تاريخ الرفع</p>
                  <p className="font-semibold">{new Date(selectedFile.created_at).toLocaleString('ar-SA')}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500 mb-2">رابط الملف</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={selectedFile.url}
                      readOnly
                      className="flex-1 px-4 py-2 border rounded-lg bg-gray-50 text-sm"
                    />
                    <button
                      onClick={() => copyUrl(selectedFile.url)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      {copiedUrl === selectedFile.url ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>تم النسخ</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>نسخ</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <a
                  href={selectedFile.url}
                  download
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-center flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  تحميل
                </a>
                <button
                  onClick={() => deleteFile(selectedFile)}
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
