# Navigation

> App navigatie structuur en flow

## Navigatie Library

React Navigation v6:
- `@react-navigation/native`
- `@react-navigation/bottom-tabs`
- `@react-navigation/stack`

---

## Structuur Overzicht

```
RootNavigator
├── AuthStack (niet ingelogd)
│   └── AuthScreen
│
└── MainNavigator (ingelogd)
    │
    ├── [Student] BottomTabs
    │   ├── SubjectsStack
    │   │   ├── SubjectsScreen
    │   │   └── SubjectDetailScreen
    │   │
    │   ├── AgendaStack
    │   │   ├── AgendaScreen
    │   │   └── TimerScreen
    │   │
    │   ├── StatsScreen (premium)
│   │
│   └── SettingsStack
    │       ├── SettingsScreen
    │
    └── [Mentor] BottomTabs
        ├── StudentsScreen
        ├── StudentDetailScreen
        └── SettingsScreen
```

---

## Navigator Code

### RootNavigator

```typescript
// src/navigation/RootNavigator.tsx
function RootNavigator() {
  const { isAuthenticated, user } = useAuth();

  return (
    <NavigationContainer>
      {!isAuthenticated ? (
        <AuthStack />
      ) : user?.role === 'mentor' ? (
        <MentorNavigator />
      ) : (
        <StudentNavigator />
      )}
    </NavigationContainer>
  );
}
```

### StudentNavigator

```typescript
// src/navigation/StudentNavigator.tsx
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function SubjectsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SubjectsList" component={SubjectsScreen} />
      <Stack.Screen name="SubjectDetail" component={SubjectDetailScreen} />
    </Stack.Navigator>
  );
}

function AgendaStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AgendaView" component={AgendaScreen} />
      <Stack.Screen name="Timer" component={TimerScreen} />
    </Stack.Navigator>
  );
}

function SettingsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SettingsMain" component={SettingsScreen} />
    </Stack.Navigator>
  );
}

function StudentNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
      }}
    >
      <Tab.Screen
        name="Subjects"
        component={SubjectsStack}
        options={{
          tabBarLabel: 'Vakken',
          tabBarIcon: ({ color, size }) => (
            <BookIcon color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Agenda"
        component={AgendaStack}
        options={{
          tabBarLabel: 'Planning',
          tabBarIcon: ({ color, size }) => (
            <CalendarIcon color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsStack}
        options={{
          tabBarLabel: 'Instellingen',
          tabBarIcon: ({ color, size }) => (
            <SettingsIcon color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
```

---

## Screen Parameters

### Type Definitions

```typescript
// src/navigation/types.ts
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type StudentTabParamList = {
  Subjects: undefined;
  Agenda: undefined;
  Stats: undefined;
  Settings: undefined;
};

export type SubjectsStackParamList = {
  SubjectsList: undefined;
  SubjectDetail: { subjectId: string };
};

export type AgendaStackParamList = {
  AgendaView: { weekStart?: string };
  Timer: { sessionId: string };
};

export type SettingsStackParamList = {
  SettingsMain: undefined;
  Stats: undefined;
};

export type MentorTabParamList = {
  Students: undefined;
  Settings: undefined;
};

export type MentorStackParamList = {
  StudentsList: undefined;
  StudentDetail: { studentId: number };
};
```

### Navigation Hooks

```typescript
// In components
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Navigeren
const navigation = useNavigation<NativeStackNavigationProp<SubjectsStackParamList>>();
navigation.navigate('SubjectDetail', { subjectId: '123' });

// Route params lezen
const route = useRoute<RouteProp<SubjectsStackParamList, 'SubjectDetail'>>();
const { subjectId } = route.params;
```

---

## Tab Bar

### Weergave

```
┌─────────────────────────────────────┐
│  📚 Vakken  │  📅 Planning  │  ⚙️   │
└─────────────────────────────────────┘
```

### Styling

```typescript
const tabBarStyle = {
  height: 56,
  paddingBottom: 8,
  paddingTop: 8,
  backgroundColor: colors.surface,
  borderTopWidth: 1,
  borderTopColor: colors.border,
};
```

### Icons

Gebruik simpele icons (Expo Vector Icons of custom SVG):
- Vakken: `book` of `library`
- Planning: `calendar`
- Instellingen: `cog` of `settings`

---

## Navigatie Flows

### Flow 1: Vak toevoegen

```
SubjectsScreen
    │
    ├─ [+ FAB tap]
    │
    └─→ SubjectDetailScreen (nieuw vak)
        │
        ├─ [Opslaan]
        │
        └─→ SubjectsScreen (terug)
```

### Flow 2: Timer starten

```
AgendaScreen
    │
    ├─ [Tap op sessie blok]
    │
    └─→ TimerScreen
        │
        ├─ [Start → Stop]
        │
        └─→ ResultModal
            │
            ├─ [Opslaan]
            │
            └─→ AgendaScreen (terug)
```

### Flow 3: Mentor koppelen

```
SettingsScreen
    │
    ├─ [Code genereren]
    │
    └─→ Modal met code
        │
        └─→ Share sheet
```

### Flow 4: Stats bekijken (Premium)

```
SettingsScreen
    │
    ├─ [Statistieken tap]
    │
    ├─ isPremium?
    │   ├─ true → StatsScreen
    │   └─ false → PremiumPaywall modal
```

---

## Deep Linking

Niet nodig voor v1. Eventueel later voor:
- Invite code links
- Notificatie taps

---

## Modals

Niet als screen, maar als component:

```typescript
// In screen component
const [showResult, setShowResult] = useState(false);

return (
  <>
    <View>
      {/* Screen content */}
    </View>

    <ResultModal
      visible={showResult}
      onClose={() => setShowResult(false)}
      session={activeSession}
    />
  </>
);
```

### Modal Types
- `ResultModal` - Na timer stoppen
- `PremiumPaywall` - Premium upsell
- `ConfirmModal` - Bevestigingen (delete, stop timer)
- `InviteCodeModal` - Code weergave + share

---

## Gesture Handling

### Swipe back
- Enabled op iOS (default)
- Android: geen swipe back (hardware back button)

### Tab switching
- Geen swipe tussen tabs
- Alleen tap op tab icons

### Within screens
- AgendaScreen: horizontal swipe voor week navigatie
- Lists: swipe left voor delete action

---

## Screen Transitions

Standaard React Navigation transitions:
- Stack: slide from right (iOS) / fade (Android)
- Modal: slide from bottom
- Tab switch: geen animatie (instant)

Geen custom transitions nodig.
