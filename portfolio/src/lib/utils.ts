import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Join class names and let later Tailwind classes override earlier ones (shadcn/ui convention). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
