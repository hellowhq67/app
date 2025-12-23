import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function countWords(text: string): number {
  return text.trim().split(/\s+/).length;
}

export function mediaKindFromUrl(url: string): 'audio' | 'video' | 'image' | 'unknown' {
  if (!url) return 'unknown';
  if (url.match(/\.(m4a|mp3|wav|ogg)$/)) return 'audio';
  if (url.match(/\.(mp4|webm|mov)$/)) return 'video';
  if (url.match(/\.(jp(e?)g|png|gif|svg|webp)$/)) return 'image';
  return 'unknown';
}
