import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date/time to Brazilian standards (Brasília Time: UTC-3)
 * Forced UTC-3 to avoid server/client timezone discrepancies.
 */
export function formatDateTime(date: Date | string | number) {
  if (!date) return '-';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';

  // Forçar ajuste manual de -3 horas (Brasília)
  const brt = new Date(d.getTime() - 3 * 3600000);
  
  const day = brt.getUTCDate().toString().padStart(2, '0');
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const month = months[brt.getUTCMonth()];
  const year = brt.getUTCFullYear();
  const hours = brt.getUTCHours().toString().padStart(2, '0');
  const minutes = brt.getUTCMinutes().toString().padStart(2, '0');
  
  return `${day} de ${month} de ${year}, ${hours}:${minutes}`;
}

/**
 * Formats a date (DD/MM) to Brazilian standards (UTC-3)
 */
export function formatDate(date: Date | string | number) {
  if (!date) return '-';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';

  const brt = new Date(d.getTime() - 3 * 3600000);
  const day = brt.getUTCDate().toString().padStart(2, '0');
  const month = (brt.getUTCMonth() + 1).toString().padStart(2, '0');
  
  return `${day}/${month}`;
}

/**
 * Formats a full date to Brazilian standards (UTC-3)
 */
export function formatFullDate(date: Date | string | number) {
  if (!date) return '-';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';

  const brt = new Date(d.getTime() - 3 * 3600000);
  const day = brt.getUTCDate().toString().padStart(2, '0');
  const months = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ];
  const month = months[brt.getUTCMonth()];
  const year = brt.getUTCFullYear();
  
  return `${day} de ${month} de ${year}`;
}
