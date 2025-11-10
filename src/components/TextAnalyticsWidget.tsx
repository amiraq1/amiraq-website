import React from 'react';
import { BarChart3, Clock, Type, Layers } from 'lucide-react';
import { analyzeText, formatReadingTime } from '../utils/textAnalytics';

interface TextAnalyticsWidgetProps {
  text: string;
}

export function TextAnalyticsWidget({ text }: TextAnalyticsWidgetProps) {
  const analytics = analyzeText(text);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* عدد الكلمات */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
        <div className="flex items-center justify-between mb-2">
          <Type className="w-5 h-5 text-blue-600" />
          <span className="text-xs text-blue-600 font-semibold">الكلمات</span>
        </div>
        <p className="text-2xl font-bold text-blue-900">{analytics.wordCount}</p>
        <p className="text-xs text-blue-700 mt-1">كلمة</p>
      </div>

      {/* وقت القراءة */}
      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
        <div className="flex items-center justify-between mb-2">
          <Clock className="w-5 h-5 text-green-600" />
          <span className="text-xs text-green-600 font-semibold">الوقت</span>
        </div>
        <p className="text-2xl font-bold text-green-900">{analytics.readingTime}</p>
        <p className="text-xs text-green-700 mt-1">دقيقة</p>
      </div>

      {/* عدد الأحرف */}
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
        <div className="flex items-center justify-between mb-2">
          <BarChart3 className="w-5 h-5 text-purple-600" />
          <span className="text-xs text-purple-600 font-semibold">الأحرف</span>
        </div>
        <p className="text-2xl font-bold text-purple-900">{analytics.characterCount}</p>
        <p className="text-xs text-purple-700 mt-1">حرف</p>
      </div>

      {/* عدد الفقرات */}
      <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
        <div className="flex items-center justify-between mb-2">
          <Layers className="w-5 h-5 text-orange-600" />
          <span className="text-xs text-orange-600 font-semibold">الفقرات</span>
        </div>
        <p className="text-2xl font-bold text-orange-900">{analytics.paragraphCount}</p>
        <p className="text-xs text-orange-700 mt-1">فقرة</p>
      </div>
    </div>
  );
}
