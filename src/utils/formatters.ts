import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { nl } from 'date-fns/locale';

/**
 * Format date as "15 mrt" or "15 maart 2024"
 */
export function formatDate(dateStr: string, long = false): string {
  const date = parseISO(dateStr);
  return format(date, long ? 'd MMMM yyyy' : 'd MMM', { locale: nl });
}

/**
 * Format time as "14:30"
 */
export function formatTime(hour: number, minute = 0): string {
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

/**
 * Format duration as "1u 30m" or "45m"
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours}u`;
  }
  return `${hours}u ${mins}m`;
}

/**
 * Format seconds as "MM:SS"
 */
export function formatTimer(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Format relative time as "2 uur geleden"
 */
export function formatRelative(dateStr: string): string {
  const date = parseISO(dateStr);
  return formatDistanceToNow(date, { addSuffix: true, locale: nl });
}

/**
 * Format amount with unit as "30 blz" or "15 opdrachten"
 */
export function formatAmount(amount: number, unit: string): string {
  return `${amount} ${unit}`;
}

/**
 * Format percentage as "85%"
 */
export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

/**
 * Format hours as "5,5 uur"
 */
export function formatHours(hours: number): string {
  return `${hours.toFixed(1).replace('.', ',')} uur`;
}
