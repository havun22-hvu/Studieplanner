# Context - Studieplanner

> Alle technische details en specificaties

## App Beschrijving

### Doel
Een studieplanner app voor leerlingen om hun studietijd te plannen en bij te houden. Mentoren/ouders kunnen de voortgang volgen.

### Doelgroep
- **Leerlingen:** Plannen studietaken, starten timer, rapporteren resultaat
- **Mentoren/ouders:** Ontvangen meldingen, volgen voortgang

## Features

### Vakken & Taken
- Vakken toevoegen met naam, kleur, toetsdatum
- Studietaken per vak (beschrijving + geschatte minuten)
- Automatische verdeling over beschikbare dagen

### Agenda View
- Weekweergave met dagen horizontaal
- Tijdslots 0:00-23:00 (24 uur), scrollt naar 8:00 by default
- Drag & drop taken naar tijdslots
- Toetsen worden getoond op examdatum
- Blokgrootte = tijdsduur (bijv. 2 uur = 120px)

### Timer & Resultaten
- Klik op blok → Timer opent
- Start/Pauze/Stop knoppen
- Na stop: invullen % voltooid
- Bij <100%: nieuw blok toegevoegd aan plank

### Mentor Koppeling
- Leerling genereert invite code (24u geldig)
- Mentor accepteert via code
- Real-time updates via WebSocket

## Tech Stack

### Frontend
- **React 18** + TypeScript
- **Vite** als build tool
- **PWA** met vite-plugin-pwa (installeerbaar)
- Geen UI framework, custom CSS

### State Management
- React useState + useLocalStorage hook
- Data opgeslagen in localStorage
- Auto-sync naar backend

### Backend
- **Studieplanner-api:** Laravel 12 (`D:\GitHub\Studieplanner-api`)
- Database: MySQL

## Belangrijke Files

```
src/
├── App.tsx              # Hoofd component, state management
├── App.css              # Alle styling
├── types/index.ts       # TypeScript types
├── utils/planning.ts    # Planning algoritme
├── hooks/useLocalStorage.ts
├── contexts/
│   └── AuthContext.tsx  # Auth state
├── services/
│   └── api.ts           # API calls naar Laravel backend
├── components/
│   ├── AgendaView.tsx   # Week agenda met drag & drop
│   ├── AuthScreen.tsx   # Login/registratie
│   ├── MentorDashboard.tsx  # Mentor dashboard
│   ├── StatsView.tsx    # Statistieken
│   ├── SubjectForm.tsx  # Vak toevoegen/bewerken
│   ├── StudyTimer.tsx   # Timer modal
│   └── Settings.tsx     # Instellingen
```

## Data Types

```typescript
interface Subject {
  id: string;
  name: string;
  color: string;
  examDate: string;
  tasks: StudyTask[];
}

interface PlannedSession {
  id: string;
  date: string;
  taskId: string;
  subjectId: string;
  minutesPlanned: number;
  minutesActual?: number;
  amountPlanned: number;
  amountActual?: number;
  unit: string;           // 'blz' | 'opdrachten' | 'min video'
  hour?: number;          // undefined/null = op plank
  completed: boolean;
  knowledgeRating?: number; // 1-10
}
```

## Authenticatie

### Huidige situatie
- Login met **naam + 4-cijferige pincode**
- Geen email verificatie nodig
- Backend: `D:\GitHub\Studieplanner-api`

## API Endpoints

### Sessie Tracking
```
POST /api/session/start   → start studiesessie
POST /api/session/stop    → stop sessie + resultaat
GET  /api/session/active  → actieve sessies (voor mentor)
GET  /api/session/history → sessie geschiedenis
```

### Mentor API
```
GET  /api/mentor/students           → gekoppelde leerlingen
GET  /api/mentor/student/{id}       → volledige data van leerling
POST /api/mentor/accept-student     → accepteer via invite code
DELETE /api/mentor/student/{id}     → ontkoppel leerling
```

### Student API
```
POST /api/student/subjects/sync     → sync subjects + tasks
POST /api/student/sessions/sync     → sync sessions
POST /api/student/invite            → genereer invite code (24u)
GET  /api/student/mentors           → gekoppelde mentoren
```

## Database Tabellen

```sql
users: id, name, pincode, role (student/mentor), student_code (UUID 12 chars)
mentor_students: mentor_id, student_id (pivot)
subjects: id, user_id, name, color, exam_date
tasks: id, subject_id, description, estimated_minutes, planned_amount, unit, completed
planned_sessions: id, user_id, subject_id, task_id, date, hour, minutes_planned, etc.
```

## Real-time WebSocket

### Architectuur
```
Leerling Frontend → Studieplanner-api → HavunCore (Reverb) → Mentor Dashboard
```

### Configuratie nodig
- HavunCore: Laravel Reverb op poort 8080
- Studieplanner-api: HAVUNCORE_URL en API_KEY in .env

### Bestanden
- `HavunCore/app/Events/StudySessionUpdated.php`
- `Studieplanner-api/app/Services/HavunCoreService.php`
- `Studieplanner/src/hooks/useLiveSession.ts`

## Lokaal starten

```bash
# Terminal 1: Backend
cd D:\GitHub\Studieplanner-api
php artisan serve --port=8000

# Terminal 2: Frontend
cd D:\GitHub\Studieplanner
npm run dev

# Terminal 3: WebSocket (optioneel, voor live mentor updates)
cd D:\GitHub\HavunCore
php artisan reverb:start
```

## Deployment

```bash
cd /var/www/studieplanner/production
git pull origin master
npm ci
npm run build
```

## Status

### Werkend
- Volledige lokale app met authenticatie
- Vakken, taken, agenda, timer, resultaten
- PWA installeerbaar
- Backend API voor sessie tracking
- Mentor dashboard met multi-student support
- Real-time updates via WebSocket

### TODO
- [ ] SOMtoday/Magister integratie (code aanwezig, wacht op API)
- [ ] Email verificatie (voor meerdere gebruikers)
- [ ] Dagelijkse evaluatie

## Email Verificatie (TODO voor later)

### Activeren wanneer nodig:
1. Backend .env: MAIL_* configureren
2. AuthController: email validatie + is_verified
3. Frontend: email veld toevoegen
