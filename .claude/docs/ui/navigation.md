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
    ├── [Student] BottomTabs (4 tabs)
    │   ├── SubjectsStack
    │   │   ├── SubjectsScreen
    │   │   └── SubjectDetailScreen
    │   │
    │   ├── AgendaStack
    │   │   ├── AgendaScreen
    │   │   └── TimerScreen
    │   │
    │   ├── StatsScreen (premium, aparte tab)
    │   │
    │   └── SettingsStack
    │       └── SettingsScreen
    │
    └── [Mentor] BottomTabs
        ├── StudentsScreen
        ├── StudentDetailScreen
        └── SettingsScreen
```

### Footer Tabs (Student)

```
┌─────────────────────────────────────┐
│ 📚 Vakken │ 📅 Planning │ 📊 Stats │ ⚙️ │
└─────────────────────────────────────┘
```

- **Vakken:** Vakkenoverzicht
- **Planning:** Weekagenda
- **Stats:** Statistieken (premium)
- **Instellingen:** App settings

---

## Type Definitions

```typescript
// src/navigation/types.ts
export type RootStackParamList = {
  Auth: undefined;
  StudentMain: undefined;
  MentorMain: undefined;
};

export type StudentTabParamList = {
  Subjects: undefined;
  Agenda: undefined;
  Stats: undefined;      // Aparte tab, NIET onder Settings
  Settings: undefined;
};

export type SubjectsStackParamList = {
  SubjectsList: undefined;
  SubjectDetail: { subjectId: string | null };
};

export type AgendaStackParamList = {
  AgendaView: undefined;
  Timer: { sessionId: string };
};

export type SettingsStackParamList = {
  SettingsMain: undefined;
};

export type MentorTabParamList = {
  Students: undefined;
  Settings: undefined;
};
```

---

## Screen Transitions

- Stack: slide from right (iOS) / fade (Android)
- Modal: slide from bottom
- Tab switch: geen animatie (instant)
