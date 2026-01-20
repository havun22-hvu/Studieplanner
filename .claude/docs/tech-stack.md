# Tech Stack

> Packages, configuratie en project setup

## Platform

- **Target:** Android only (voorlopig)
- **Min SDK:** Android 8.0 (API 26)
- **Framework:** React Native + Expo

---

## Core Dependencies

### Expo SDK
```json
{
  "expo": "~50.0.0",
  "expo-status-bar": "~1.11.0",
  "react": "18.2.0",
  "react-native": "0.73.0"
}
```

### Navigation
```json
{
  "@react-navigation/native": "^6.x",
  "@react-navigation/bottom-tabs": "^6.x",
  "@react-navigation/stack": "^6.x",
  "react-native-screens": "~3.29.0",
  "react-native-safe-area-context": "4.8.0"
}
```

### Notifications & Background
```json
{
  "expo-notifications": "~0.27.0",
  "expo-background-fetch": "~11.6.0",
  "expo-task-manager": "~11.6.0"
}
```

### Storage
```json
{
  "@react-native-async-storage/async-storage": "1.21.0"
}
```

### UI/Gestures
```json
{
  "react-native-gesture-handler": "~2.14.0",
  "react-native-reanimated": "~3.6.0"
}
```

### Utilities
```json
{
  "date-fns": "^3.0.0",
  "expo-crypto": "~12.8.0"
}
```

> **Note:** `uuid` package vervangen door `expo-crypto` (jan 2026) vanwege compatibiliteit met Expo. Gebruik `Crypto.randomUUID()` voor UUID generatie.

---

## Project Structuur

```
studieplanner/
├── app.json                # Expo config
├── App.tsx                 # Entry point
├── babel.config.js
├── tsconfig.json
├── package.json
│
├── src/
│   ├── navigation/
│   │   └── AppNavigator.tsx
│   │
│   ├── screens/
│   │   ├── AuthScreen.tsx
│   │   ├── SubjectsScreen.tsx
│   │   ├── AgendaScreen.tsx
│   │   ├── TimerScreen.tsx
│   │   ├── StatsScreen.tsx
│   │   ├── SettingsScreen.tsx
│   │   └── MentorScreen.tsx
│   │
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Modal.tsx
│   │   ├── SubjectCard.tsx
│   │   ├── TaskItem.tsx
│   │   ├── SessionBlock.tsx
│   │   ├── WeekView.tsx
│   │   ├── TimerDisplay.tsx
│   │   └── PremiumPaywall.tsx
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useSubjects.ts
│   │   ├── useSessions.ts
│   │   ├── useTimer.ts
│   │   ├── useNotifications.ts
│   │   └── useApi.ts
│   │
│   ├── services/
│   │   ├── api.ts
│   │   ├── storage.ts
│   │   ├── notifications.ts
│   │   └── backgroundTimer.ts
│   │
│   ├── store/
│   │   ├── index.ts
│   │   ├── authStore.ts
│   │   ├── subjectStore.ts
│   │   └── timerStore.ts
│   │
│   ├── types/
│   │   └── index.ts
│   │
│   ├── utils/
│   │   ├── planning.ts
│   │   ├── formatters.ts
│   │   └── colors.ts
│   │
│   └── constants/
│       ├── colors.ts
│       └── config.ts
│
└── assets/
    ├── icon.png
    ├── splash.png
    └── adaptive-icon.png
```

---

## Configuratie

### app.json
```json
{
  "expo": {
    "name": "Studieplanner",
    "slug": "studieplanner",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#4f46e5"
    },
    "android": {
      "package": "nl.havun.studieplanner",
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#4f46e5"
      },
      "permissions": [
        "RECEIVE_BOOT_COMPLETED",
        "VIBRATE",
        "WAKE_LOCK",
        "FOREGROUND_SERVICE"
      ]
    },
    "plugins": [
      [
        "expo-notifications",
        {
          "sounds": []
        }
      ]
    ]
  }
}
```

### tsconfig.json
```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx"]
}
```

### babel.config.js
```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      [
        'module-resolver',
        {
          alias: {
            '@': './src',
          },
        },
      ],
    ],
  };
};
```

---

## Environment

### Development
```bash
# .env.development
API_URL=http://localhost:8000
WS_URL=ws://localhost:8080
```

### Production
```bash
# .env.production
API_URL=https://api.studieplanner.havun.nl
WS_URL=wss://ws.studieplanner.havun.nl
```

---

## Commands

### Development
```bash
# Start Expo dev server
npx expo start

# Run on Android emulator
npx expo start --android

# Run on physical device (via Expo Go)
npx expo start --tunnel
```

### Building
```bash
# Configure EAS
eas build:configure

# Build APK for testing
eas build --platform android --profile preview

# Build AAB for Play Store
eas build --platform android --profile production
```

### Submitting
```bash
# Submit to Play Store
eas submit --platform android
```

---

## State Management

Simpele aanpak met React Context + hooks:

```
AuthContext     → User, token, login/logout
SubjectsContext → Subjects, CRUD operations
SessionsContext → Sessions, CRUD operations
TimerContext    → Timer state, start/pause/stop
SettingsContext → App settings, notifications
```

Geen Redux/Zustand nodig - app is niet complex genoeg.

---

## API Service

```typescript
// src/services/api.ts
const API_URL = process.env.API_URL;

class ApiService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new ApiError(response.status, await response.json());
    }

    return response.json();
  }

  // Auth
  login(name: string, pincode: string) { ... }
  register(name: string, pincode: string, role: string) { ... }

  // Subjects
  getSubjects() { ... }
  createSubject(data: CreateSubjectDTO) { ... }

  // etc.
}

export const api = new ApiService();
```

---

## Background Timer

```typescript
// src/services/backgroundTimer.ts
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import * as Notifications from 'expo-notifications';

const TIMER_TASK = 'STUDY_TIMER_TASK';

TaskManager.defineTask(TIMER_TASK, async () => {
  // Check if timer should trigger alarm
  const timerState = await getTimerState();

  if (timerState.isRunning) {
    const elapsed = Date.now() - timerState.startTime;
    const planned = timerState.totalSeconds * 1000;

    if (elapsed >= planned) {
      await triggerAlarm();
    }
  }

  return BackgroundFetch.BackgroundFetchResult.NewData;
});
```
