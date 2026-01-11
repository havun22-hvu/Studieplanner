# Styling

> Design tokens, kleuren, typography en spacing

## Design Filosofie

- **Strak:** Geen onnodige decoratie
- **Rustig:** Gedempte kleuren, geen felle accenten
- **Functioneel:** Elk element heeft een doel
- **Consistent:** Dezelfde spacing/kleuren overal

---

## Kleuren

### Primary Palette

```typescript
const colors = {
  // Primary
  primary: '#4f46e5',      // Indigo - main actions
  primaryDark: '#4338ca',  // Indigo dark - pressed state
  primaryLight: '#e0e7ff', // Indigo light - subtle backgrounds

  // Neutrals
  background: '#f8fafc',   // Page background
  surface: '#ffffff',      // Cards, modals
  border: '#e2e8f0',       // Borders, dividers

  // Text
  textPrimary: '#1e293b',  // Main text
  textSecondary: '#64748b', // Secondary/muted text
  textInverse: '#ffffff',  // Text on dark backgrounds

  // Semantic
  success: '#22c55e',      // Green - completed, positive
  warning: '#f59e0b',      // Amber - attention needed
  danger: '#ef4444',       // Red - errors, delete
  info: '#3b82f6',         // Blue - informational

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)', // Modal backdrop
};
```

### Subject Colors

8 vaste kleuren voor vakken:

```typescript
const subjectColors = [
  '#4f46e5', // Indigo
  '#22c55e', // Green
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
  '#ec4899', // Pink
  '#64748b', // Slate
];
```

### Dark Mode

Niet geïmplementeerd in v1. Eventueel later toevoegen.

---

## Typography

### Font Family

System fonts (geen custom fonts):

```typescript
const fonts = {
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
```

### Text Styles

```typescript
const typography = {
  // Headers
  h1: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
    color: colors.textPrimary,
  },
  h2: {
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 28,
    color: colors.textPrimary,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
    color: colors.textPrimary,
  },

  // Body
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 22,
    color: colors.textPrimary,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    color: colors.textPrimary,
  },

  // UI
  label: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    color: colors.textSecondary,
  },

  // Special
  timer: {
    fontSize: 48,
    fontWeight: '300',
    fontFamily: fonts.mono,
    color: colors.textPrimary,
  },
  timerSmall: {
    fontSize: 24,
    fontWeight: '300',
    fontFamily: fonts.mono,
    color: colors.textSecondary,
  },

  // Buttons
  button: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
  },
  buttonSmall: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
  },
};
```

---

## Spacing

8px base unit systeem:

```typescript
const spacing = {
  xs: 4,   // 0.5x
  sm: 8,   // 1x
  md: 16,  // 2x
  lg: 24,  // 3x
  xl: 32,  // 4x
  xxl: 48, // 6x
};
```

### Gebruik

- **Padding in cards:** `md` (16px)
- **Gap tussen items:** `sm` (8px) of `md` (16px)
- **Sectie spacing:** `lg` (24px) of `xl` (32px)
- **Screen padding:** `md` (16px) horizontal

---

## Borders & Radius

```typescript
const borders = {
  width: {
    thin: 1,
    medium: 2,
  },
  radius: {
    sm: 4,   // Small elements (chips, tags)
    md: 8,   // Cards, inputs
    lg: 12,  // Modals
    full: 9999, // Circular
  },
};
```

---

## Shadows

Minimaal gebruik van shadows:

```typescript
const shadows = {
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
```

### Gebruik
- **Cards:** `sm`
- **Modals:** `lg`
- **FAB:** `md`
- **Meeste elementen:** geen shadow

---

## Component Sizes

### Buttons

```typescript
const buttonSizes = {
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
```

### Inputs

```typescript
const inputSize = {
  height: 44,
  paddingHorizontal: 12,
  fontSize: 16,
  borderRadius: 8,
  borderWidth: 1,
};
```

### Icons

```typescript
const iconSizes = {
  sm: 16,
  md: 24,
  lg: 32,
};
```

### Touch Targets

Minimum 44x44px voor alle interactieve elementen.

---

## Layout Constants

```typescript
const layout = {
  // Screen
  screenPadding: 16,
  maxWidth: 480, // Max content width (niet nodig voor mobile)

  // Header
  headerHeight: 56,

  // Tab Bar
  tabBarHeight: 56,

  // Agenda
  hourHeight: 60,      // Pixels per uur
  dayWidth: 'flex',    // Gelijke verdeling
  shelfHeight: 80,     // Plank hoogte

  // Cards
  cardPadding: 16,
  cardGap: 12,

  // Modal
  modalPadding: 24,
};
```

---

## States

### Interactive States

```typescript
const states = {
  // Disabled
  disabled: {
    opacity: 0.5,
  },

  // Pressed
  pressed: {
    opacity: 0.8,
    // Of: backgroundColor darken
  },

  // Focus (input)
  focus: {
    borderColor: colors.primary,
    borderWidth: 2,
  },

  // Error
  error: {
    borderColor: colors.danger,
  },

  // Loading
  loading: {
    opacity: 0.7,
  },
};
```

### Session Block States

```typescript
const sessionStates = {
  default: {
    opacity: 1,
  },
  completed: {
    opacity: 0.6,
    // Strikethrough op tekst
  },
  active: {
    // Pulsing border of glow
    borderWidth: 2,
    borderColor: colors.primary,
  },
  dragging: {
    opacity: 0.7,
    transform: [{ scale: 1.05 }],
  },
};
```

---

## Animations

Minimaal - alleen waar functioneel nodig:

```typescript
const animations = {
  // Timing
  fast: 150,
  normal: 250,
  slow: 400,

  // Transitions
  press: {
    duration: 100,
    useNativeDriver: true,
  },
  modal: {
    duration: 250,
    useNativeDriver: true,
  },
};
```

### Waar wel animeren
- Modal open/close (slide up)
- Button press feedback
- List item swipe actions

### Waar niet animeren
- Page transitions (instant)
- Loaders (static of simple spinner)
- Geen decoratieve animaties

---

## Theme Object

Alles gecombineerd:

```typescript
// src/constants/theme.ts
export const theme = {
  colors,
  typography,
  spacing,
  borders,
  shadows,
  layout,
  animations,
};

// Usage
import { theme } from '@/constants/theme';

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  title: {
    ...theme.typography.h2,
  },
});
```
