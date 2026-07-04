import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getFastApiError(error: any): string {
  if (!error) return "Неизвестная ошибка";
  if (typeof error.detail === "string") return error.detail;
  if (Array.isArray(error.detail) && error.detail.length > 0) return error.detail[0].msg;
  if (typeof error.message === "string") return error.message;
  return "Произошла ошибка при обработке запроса";
}