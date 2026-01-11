import { Platform } from 'react-native';

// Colors
export const colors = {
  // Primary
  primary: '#4f46e5',
  primaryDark: '#4338ca',
  primaryLight: '#e0e7ff',

  // Neutrals
  background: '#f8fafc',
  surface: '#ffffff',
  border: '#e2e8f0',

  // Text
  textPrimary: '#1e293b',
  textSecondary: '#64748b',
  textInverse: '#ffffff',

  // Semantic
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
};

// Subject colors
export const subjectColors = [
  '#4f46e5', // Indigo
  '#22c55e', // Green
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
  '#ec4899', // Pink
  '#64748b', // Slate
];

// Fonts
export const fonts = {
  regular: Platform.select({
    android: 'Roboto',
    default: 'System',
  }),
  medium: Platform.select({
    android: 'Roboto-Medium',
    default: 'System',
  }),
  bold: Platform.select({
    android: 'Roboto-Bold',
    default: 'System',
  }),
  mono: Platform.select({
    android: 'monospace',
    default: 'Courier',
  }),
};

// Typography
export const typography = {
  h1: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 34,
    color: colors.textPrimary,
  },
  h2: {
    fontSize: 22,
    fontWeight: '600' as const,
    lineHeight: 28,
    color: colors.textPrimary,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
    color: colors.textPrimary,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 22,
    color: colors.textPrimary,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
    color: colors.textPrimary,
  },
  label: {
    fontSize: 12,
    fontWeight: '500' as const,
    lineHeight: 16,
    color: colors.textSecondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
    color: colors.textSecondary,
  },
  timer: {
    fontSize: 48,
    fontWeight: '300' as const,
    fontFamily: fonts.mono,
    color: colors.textPrimary,
  },
  timerSmall: {
    fontSize: 24,
    fontWeight: '300' as const,
    fontFamily: fonts.mono,
    color: colors.textSecondary,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 20,
  },
  buttonSmall: {
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 18,
  },
};

// Spacing (8px base)
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Borders
export const borders = {
  width: {
    thin: 1,
    medium: 2,
  },
  radius: {
    sm: 4,
    md: 8,
    lg: 12,
    full: 9999,
  },
};

// Shadows
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
};

// Layout
export const layout = {
  screenPadding: 16,
  headerHeight: 56,
  tabBarHeight: 56,
  hourHeight: 60,
  shelfHeight: 80,
  cardPadding: 16,
  cardGap: 12,
  modalPadding: 24,
};

// Button sizes
export const buttonSizes = {
  small: {
    height: 32,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  medium: {
    height: 44,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  large: {
    height: 52,
    paddingHorizontal: 24,
    fontSize: 18,
  },
};

// Input size
export const inputSize = {
  height: 44,
  paddingHorizontal: 12,
  fontSize: 16,
  borderRadius: 8,
  borderWidth: 1,
};

// Icon sizes
export const iconSizes = {
  sm: 16,
  md: 24,
  lg: 32,
};

// Animation durations
export const animations = {
  fast: 150,
  normal: 250,
  slow: 400,
};

// Combined theme object
export const theme = {
  colors,
  subjectColors,
  fonts,
  typography,
  spacing,
  borders,
  shadows,
  layout,
  buttonSizes,
  inputSize,
  iconSizes,
  animations,
};
