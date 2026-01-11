/**
 * Determine if text should be white or black based on background color
 * Uses relative luminance formula
 */
export function getContrastColor(hexColor: string): 'light' | 'dark' {
  // Remove # if present
  const hex = hexColor.replace('#', '');

  // Parse RGB values
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return 'light' for light backgrounds (need dark text)
  // Return 'dark' for dark backgrounds (need light text)
  return luminance > 0.5 ? 'light' : 'dark';
}

/**
 * Get text color (black or white) based on background
 */
export function getTextColorForBackground(hexColor: string): string {
  return getContrastColor(hexColor) === 'light' ? '#1e293b' : '#ffffff';
}

/**
 * Darken a hex color by a percentage
 */
export function darkenColor(hexColor: string, percent: number): string {
  const hex = hexColor.replace('#', '');
  const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - (255 * percent / 100));
  const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - (255 * percent / 100));
  const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - (255 * percent / 100));

  return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
}

/**
 * Lighten a hex color by a percentage
 */
export function lightenColor(hexColor: string, percent: number): string {
  const hex = hexColor.replace('#', '');
  const r = Math.min(255, parseInt(hex.substr(0, 2), 16) + (255 * percent / 100));
  const g = Math.min(255, parseInt(hex.substr(2, 2), 16) + (255 * percent / 100));
  const b = Math.min(255, parseInt(hex.substr(4, 2), 16) + (255 * percent / 100));

  return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
}

/**
 * Add alpha to a hex color
 */
export function addAlpha(hexColor: string, alpha: number): string {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
