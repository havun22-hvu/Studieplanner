# Components

> Herbruikbare UI componenten met props en gedrag

## Design Principes

- Geen externe UI library (geen React Native Paper, NativeBase, etc.)
- Custom componenten, minimalistisch
- Props strict getypeerd
- Geen default styling overrides nodig

---

## Common Components

### Button

Primaire actie knop.

```typescript
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
}
```

**Variants:**
- `primary`: Indigo achtergrond, witte tekst
- `secondary`: Witte achtergrond, indigo tekst, border
- `danger`: Rode achtergrond, witte tekst
- `ghost`: Transparant, indigo tekst

**Sizes:**
- `small`: 32px hoogte, 14px tekst
- `medium`: 44px hoogte, 16px tekst (default)
- `large`: 52px hoogte, 18px tekst

---

### Input

Tekst invoerveld.

```typescript
interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'numeric' | 'email-address';
  autoCapitalize?: 'none' | 'sentences' | 'words';
  maxLength?: number;
}
```

**Styling:**
- Label boven input (grijs, klein)
- Input: witte achtergrond, border, 44px hoogte
- Error: rode tekst onder input
- Focus: indigo border

---

### PinInput

4-cijferige pincode invoer.

```typescript
interface PinInputProps {
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
}
```

**Weergave:**
- 4 losse vierkante vakjes
- Automatisch focus naar volgende
- Numeric keyboard
- Dots of cijfers tonen

---

### Card

Container voor content.

```typescript
interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
}
```

**Styling:**
- Witte achtergrond
- Border radius 8px
- Lichte shadow
- Padding 16px

---

### Modal

Overlay modal.

```typescript
interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}
```

**Weergave:**
- Donkere overlay (50% opacity)
- Witte modal centered
- X knop rechtsboven (optioneel)
- Slide up animatie

---

### Header

Scherm header.

```typescript
interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightIcon?: string;
  onRightPress?: () => void;
}
```

**Weergave:**
- Hoogte: 56px
- Titel gecentreerd
- Back arrow links (als showBack)
- Icon rechts (optioneel)

---

## Domain Components

### SubjectCard

Vak kaart op overzicht scherm.

```typescript
interface SubjectCardProps {
  subject: Subject;
  onPress: () => void;
}
```

**Weergave:**
```
┌─────────────────────────┐
│ ■ Nederlands            │  ← Kleur indicator + naam
│ Toets: 15 mrt           │  ← Datum
│ 3/5 taken klaar         │  ← Voortgang tekst
│ ████████░░ 60%          │  ← Progress bar
└─────────────────────────┘
```

**Berekeningen:**
- Progress = completed tasks / total tasks
- Datum formatting: "15 mrt" (kort)

---

### TaskItem

Taak in vak detail.

```typescript
interface TaskItemProps {
  task: StudyTask;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}
```

**Weergave:**
```
┌─────────────────────────┐
│ ☐ Hoofdstuk 1-3         │  ← Checkbox + beschrijving
│   30 blz · 90 min       │  ← Hoeveelheid + tijd
└─────────────────────────┘
```

**Interacties:**
- Tap checkbox: toggle completed
- Tap item: edit
- Swipe left: delete

---

### SessionBlock

Studieblok in agenda.

```typescript
interface SessionBlockProps {
  session: PlannedSession;
  subject: Subject;
  onPress: () => void;
  onLongPress: () => void;
  isDragging?: boolean;
}
```

**Weergave:**
```
┌────────────┐
│ NL         │  ← Subject naam (max 10 chars)
│ H1-3       │  ← Task beschrijving (afgekort)
│ 45m        │  ← Duur
└────────────┘
```

**Styling:**
- Achtergrond: subject.color
- Tekst: wit of zwart (contrast berekend)
- Hoogte: session.minutesPlanned (1px per minuut, min 30px)
- Border radius: 4px
- Dragging: opacity 0.7, slight scale up

---

### WeekView

Week agenda grid.

```typescript
interface WeekViewProps {
  sessions: PlannedSession[];
  subjects: Subject[];
  weekStart: string;  // YYYY-MM-DD (Monday)
  onSessionPress: (session: PlannedSession) => void;
  onSessionMove: (sessionId: string, date: string, hour: number) => void;
  onSlotPress: (date: string, hour: number) => void;
}
```

**Layout:**
- Header: dag namen (Ma, Di, Wo, Do, Vr, Za, Zo)
- Linker kolom: uren (00-23)
- Grid: 7 kolommen x 24 rijen
- Scroll: verticaal, start bij 08:00

**Interacties:**
- Drag block: onSessionMove callback
- Tap empty slot: onSlotPress
- Tap block: onSessionPress

---

### Shelf

Plank met ongeplande blokken.

```typescript
interface ShelfProps {
  sessions: PlannedSession[];  // sessions where hour === null
  subjects: Subject[];
  onSessionPress: (session: PlannedSession) => void;
  onSessionDragStart: (session: PlannedSession) => void;
}
```

**Weergave:**
- Horizontaal scrollbaar
- Mini SessionBlocks
- Label "Plank" of "Ongepland"

---

### TimerDisplay

Grote timer weergave.

```typescript
interface TimerDisplayProps {
  elapsedSeconds: number;
  plannedSeconds?: number;
  isRunning: boolean;
}
```

**Weergave:**
```
   23:45
  / 45:00
```

**Styling:**
- Elapsed: groot (48px), bold
- Planned: kleiner (24px), muted color
- Monospace font

---

### ProgressBar

Horizontale voortgangsbalk.

```typescript
interface ProgressBarProps {
  progress: number;  // 0-1
  color?: string;
  height?: number;
  showPercentage?: boolean;
}
```

**Weergave:**
- Track: lichtgrijs achtergrond
- Fill: color prop of primary
- Percentage rechts (optioneel)

---

### ColorPicker

Kleur selectie voor vakken.

```typescript
interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  colors?: string[];
}
```

**Weergave:**
- 8 cirkels in een rij
- Geselecteerde: check icon of ring
- Default colors uit SUBJECT_COLORS constant

---

### StarRating

Sterren beoordeling.

```typescript
interface StarRatingProps {
  value: number;      // 0-10
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: number;
}
```

**Weergave:**
- 10 sterren
- Filled = value bereikt
- Tap om te selecteren (als niet readonly)

---

### PremiumBadge

Premium indicator.

```typescript
interface PremiumBadgeProps {
  size?: 'small' | 'medium';
}
```

**Weergave:**
- Klein: 🔒 icon
- Medium: "Premium" label met achtergrond

---

### EmptyState

Lege lijst placeholder.

```typescript
interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}
```

**Weergave:**
```
     📚

Nog geen vakken

Voeg je eerste vak
toe om te beginnen

[+ Vak toevoegen]
```

---

## Form Components

### Select

Dropdown selectie.

```typescript
interface SelectProps {
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
}
```

---

### DatePicker

Datum selectie.

```typescript
interface DatePickerProps {
  value: string;  // YYYY-MM-DD
  onChange: (date: string) => void;
  label?: string;
  minDate?: string;
}
```

**Implementatie:** Native Android DatePicker

---

### Slider

Waarde slider.

```typescript
interface SliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  showValue?: boolean;
  formatValue?: (value: number) => string;
}
```

---

### Switch

Toggle switch.

```typescript
interface SwitchProps {
  value: boolean;
  onChange: (value: boolean) => void;
  label?: string;
  disabled?: boolean;
}
```
