/**
 * أداة تحليل النصوص - حساب عدد الكلمات ووقت القراءة
 */

export interface TextAnalytics {
  wordCount: number;
  readingTime: number;
  characterCount: number;
  paragraphCount: number;
}

export function countWords(text: string): number {
  if (!text) return 0;
  const cleanText = text.replace(/<[^>]*>/g, '');
  const words = cleanText.trim().split(/\s+/).filter(word => word.length > 0);
  return words.length;
}

export function calculateReadingTime(text: string): number {
  const wordCount = countWords(text);
  const wordsPerMinute = 200;
  const readingTime = Math.ceil(wordCount / wordsPerMinute);
  return Math.max(1, readingTime);
}

export function countCharacters(text: string): number {
  if (!text) return 0;
  const cleanText = text.replace(/<[^>]*>/g, '');
  return cleanText.length;
}

export function countParagraphs(text: string): number {
  if (!text) return 0;
  const cleanText = text.replace(/<[^>]*>/g, '');
  const paragraphs = cleanText.split(/\n\n+/).filter(p => p.trim().length > 0);
  return paragraphs.length;
}

export function analyzeText(text: string): TextAnalytics {
  return {
    wordCount: countWords(text),
    readingTime: calculateReadingTime(text),
    characterCount: countCharacters(text),
    paragraphCount: countParagraphs(text),
  };
}

export function formatReadingTime(minutes: number): string {
  if (minutes < 1) return 'أقل من دقيقة';
  if (minutes === 1) return 'دقيقة واحدة';
  return `${minutes} دقائق`;
}
