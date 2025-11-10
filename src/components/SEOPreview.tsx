import React from 'react';
import { Eye, AlertCircle, CheckCircle } from 'lucide-react';

interface SEOPreviewProps {
  title: string;
  description: string;
  slug: string;
  keywords: string;
}

export function SEOPreview({ title, description, slug, keywords }: SEOPreviewProps) {
  const isValidTitle = title.length > 0 && title.length <= 60;
  const isValidDescription = description.length > 0 && description.length <= 160;
  const isValidSlug = slug.length > 0;
  const hasKeywords = keywords.length > 0;

  const seoScore = [
    isValidTitle,
    isValidDescription,
    isValidSlug,
    hasKeywords,
  ].filter(Boolean).length;

  const scorePercentage = (seoScore / 4) * 100;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Eye className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold">معاينة SEO</h3>
      </div>

      {/* درجة SEO */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">درجة SEO</span>
          <span className="text-sm font-bold text-blue-600">{scorePercentage.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              scorePercentage >= 75
                ? 'bg-green-500'
                : scorePercentage >= 50
                ? 'bg-yellow-500'
                : 'bg-red-500'
            }`}
            style={{ width: `${scorePercentage}%` }}
          />
        </div>
      </div>

      {/* معاينة العنوان */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {isValidTitle ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-500" />
          )}
          <span className="text-sm font-medium">العنوان</span>
          <span className="text-xs text-gray-500">({title.length}/60)</span>
        </div>
        <div className="bg-gray-50 p-3 rounded border border-gray-200">
          <p className="text-sm text-blue-600 truncate">{title || 'العنوان هنا'}</p>
          <p className="text-xs text-gray-500 mt-1">{slug || 'url-slug'}</p>
        </div>
        {!isValidTitle && (
          <p className="text-xs text-red-600">العنوان يجب أن يكون بين 30-60 حرف</p>
        )}
      </div>

      {/* معاينة الوصف */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {isValidDescription ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-500" />
          )}
          <span className="text-sm font-medium">الوصف</span>
          <span className="text-xs text-gray-500">({description.length}/160)</span>
        </div>
        <div className="bg-gray-50 p-3 rounded border border-gray-200">
          <p className="text-sm text-gray-700 line-clamp-2">
            {description || 'وصف المقالة هنا'}
          </p>
        </div>
        {!isValidDescription && (
          <p className="text-xs text-red-600">الوصف يجب أن يكون بين 120-160 حرف</p>
        )}
      </div>

      {/* الكلمات المفتاحية */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {hasKeywords ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-500" />
          )}
          <span className="text-sm font-medium">الكلمات المفتاحية</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {keywords
            .split(',')
            .map((keyword) => keyword.trim())
            .filter((k) => k.length > 0)
            .map((keyword, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
              >
                {keyword}
              </span>
            ))}
        </div>
        {!hasKeywords && (
          <p className="text-xs text-red-600">أضف كلمات مفتاحية مفصولة بفواصل</p>
        )}
      </div>

      {/* نصائح SEO */}
      <div className="bg-blue-50 border border-blue-200 rounded p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">نصائح لتحسين SEO:</h4>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>✓ استخدم عنوان جذاب يحتوي على الكلمة المفتاحية الرئيسية</li>
          <li>✓ اكتب وصفاً واضحاً يشجع المستخدمين على النقر</li>
          <li>✓ استخدم كلمات مفتاحية ذات صلة بالمحتوى</li>
          <li>✓ تأكد من أن الرابط (Slug) قصير وواضح</li>
        </ul>
      </div>
    </div>
  );
}
