# Studieplanner - Claude Instructions

> **Role:** Studieplanner applicatie voor leerlingen
> **Type:** React/TypeScript PWA
> **URL:** https://studieplanner.havun.nl (nog te configureren)

## Rules (ALWAYS follow)

### Forbidden without permission
- SSH keys, credentials, .env files wijzigen
- npm packages installeren
- Systemd services, cron jobs aanpassen

### Communication
- Antwoord max 20-30 regels
- Bullet points, direct to the point
- Lange uitleg? Eerst samenvatting, details op vraag

### Workflow
- **Vraag eerst, codeer later**: Stel verduidelijkende vragen en WACHT op antwoord voordat je begint te coderen. Niet tegelijkertijd vragen stellen en al implementeren.
- Test lokaal eerst, dan deploy
- Na wijzigingen: git push naar server
- Atomic commits: 1 feature/fix = 1 commit

## Quick Reference

| Omgeving | Pad |
|----------|-----|
| Lokaal | D:\GitHub\Studieplanner |
| Server | /var/www/studieplanner/production |

**Server:** 188.245.159.115 (root, SSH key)

---

## App Beschrijving

### Doel
Een studieplanner app voor leerlingen om hun studietijd te plannen en bij te houden. Mentoren/ouders kunnen de voortgang volgen.

### Doelgroep
- **Leerlingen:** Plannen studietaken, starten timer, rapporteren resultaat
- **Mentoren/ouders:** Ontvangen meldingen, volgen voortgang

### Huidige Features (lokaal werkend)

#### Vakken & Taken
- Vakken toevoegen met naam, kleur, toetsdatum
- Studietaken per vak (beschrijving + geschatte minuten)
- Automatische verdeling over beschikbare dagen

#### Agenda View
- Weekweergave met dagen horizontaal
- Tijdslots 0:00-23:00 (24 uur), scrollt naar 8:00 by default
- Drag & drop taken naar tijdslots
- Toetsen worden getoond op examdatum
- Blokgrootte = tijdsduur (bijv. 2 uur = 120px)

#### Timer & Resultaten
- Klik op blok → Timer opent
- Start/Pauze/Stop knoppen
- Na stop: invullen % voltooid
- Bij <100%: nieuw blok toegevoegd aan plank

#### Instellingen
- Timer & Herinneringen (Pomodoro, dagelijkse reminder)
- Mentoren (invite code systeem)
- App (installeren, updates)
- Schoolsysteem koppeling (binnenkort)

### Gewenste Feature: Mentor Koppeling

#### Flow
1. Leerling voegt mentor toe (naam + email)
2. Mentor ontvangt uitnodiging (hoe?)
3. Mentor installeert app / opent link
4. Bij start studiesessie → mentor krijgt melding
5. Bij stop studiesessie → mentor krijgt resultaat

#### Beslissing HavunCore (2024-12)

**Backend:** Eigen Laravel API op /var/www/studieplanner/production

**API Endpoints:**
```
POST /api/session/start     → leerling start sessie
POST /api/session/stop      → leerling stopt sessie
GET  /api/session/active    → mentor pollt voor updates
```

**Database tabel:**
```sql
study_sessions: id, student_id, mentor_id, started_at, stopped_at, status
```

**Notificaties:**
- MVP: Polling elke 30 sec
- Later: Laravel WebPush voor instant notificaties
- Chat: ook via eigen backend mogelijk

**Geen Firebase nodig!**

---

## Tech Stack

### Frontend
- **React 18** + TypeScript
- **Vite** als build tool
- **PWA** met vite-plugin-pwa (installeerbaar)
- Geen UI framework, custom CSS

### State Management
- React useState + useLocalStorage hook
- Data opgeslagen in localStorage

### Belangrijke Files
```
src/
├── App.tsx              # Hoofd component, state management, routing
├── App.css              # Alle styling
├── types/index.ts       # TypeScript types
├── utils/planning.ts    # Planning algoritme
├── hooks/useLocalStorage.ts
├── contexts/
│   └── AuthContext.tsx  # Auth state, login/register/logout
├── services/
│   └── api.ts           # API calls naar Laravel backend
├── components/
│   ├── AgendaView.tsx   # Week agenda met drag & drop
│   ├── AuthScreen.tsx   # Login/registratie (student + mentor)
│   ├── MentorDashboard.tsx  # Mentor dashboard met student-switcher
│   ├── StatsView.tsx    # Statistieken (blz/uur, opdrachten/uur)
│   ├── SubjectForm.tsx  # Vak toevoegen/bewerken
│   ├── SubjectCard.tsx  # Vak kaart met sessie-voortgang
│   ├── StudyTimer.tsx   # Timer modal
│   ├── SessionResultModal.tsx  # Resultaat invoer
│   ├── Settings.tsx     # Instellingen + deellink
│   ├── SharePage.tsx    # QR code om app te delen
│   ├── HelpSection.tsx  # FAQ accordion in instellingen
│   ├── TaskSplitDialog.tsx    # Keuze bij taak > dagelijkse tijd
│   ├── InstallPrompt.tsx      # PWA installatie prompt
│   └── UpdatePrompt.tsx       # PWA update prompt
```

### Data Types
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
  knowledgeRating?: number; // 1-10, na sessie
  alarm?: SessionAlarm;
}

interface Settings {
  dailyStudyMinutes: number;
  breakDays: number[];
  studentName: string;
  mentors: Mentor[];
  shareCode?: string;   // Voor mentor deellink
  alarmEnabled?: boolean;
  alarmMinutesBefore?: number; // default 10
}
```

---

## Deployment

```bash
# Op server
cd /var/www/studieplanner/production
git pull origin master
npm ci
npm run build
```

## Related Projects

| Project | Relatie |
|---------|---------|
| HavunCore | Centrale hub, Task Queue API - mogelijk te gebruiken voor mentor sync? |

---

## Status

**Werkend:**
- Volledige lokale app met authenticatie
- Vakken, taken, agenda, timer, resultaten
- PWA installeerbaar
- Backend API voor sessie tracking
- Stats pagina met studiesnelheid analyse

**Voltooid (december 2024):**
- [x] Mentor view via deellink (read-only agenda)
- [x] Task split dialog
- [x] Laravel backend authenticatie (naam + 4-cijferige pincode)
- [x] Sessie start/stop tracking naar database
- [x] Timer loopt door op achtergrond (localStorage)
- [x] 15-min check-in "Studeer je nog?"
- [x] Geluid bij tijd voorbij
- [x] Stats pagina met tempo analyse
- [x] Blz/opdrachten tracking per sessie
- [x] Mentor dashboard met multi-student support
- [x] Mentor kan meerdere leerlingen volgen
- [x] Uitnodigingscode systeem voor mentor-leerling koppeling
- [x] UUID-based student_code voor veilige URLs
- [x] Settings modal scroll fix (mobiel)
- [x] Help en About naar aparte modals (dropdown menu bij ⚙️)
- [x] Havun © copyright in About modal
- [x] Instellingen vereenvoudigd (geen naam/studietijd/vrije dagen meer)
- [x] Sticky header met sluitknop in instellingen
- [x] Mentor secties samengevoegd (alleen invite code systeem)
- [x] QR code/delen verplaatst naar About modal
- [x] Agenda uitgebreid naar 24 uur (0:00-23:00), scrollt naar 8:00
- [x] 'min video' als taak-eenheid naast blz en opdrachten
- [x] Kennisbeoordeling (1-10) na sessie voltooien
- [x] % sneller/langzamer indicator in voltooide blokken
- [x] Auto-sync subjects en sessions naar backend bij elke wijziging
- [x] Handmatige Sync knop in leerling-instellingen
- [x] Mentor dashboard: leerlingen als horizontale tabs
- [x] Mentor dashboard: instellingen dropdown (toevoegen, about, logout)
- [x] Mentor dashboard: compacte vakken-view met taken als tags
- [x] Update knop herlaadt app direct (PWA fix)
- [x] Mentor vakken: taakdetails tonen (hoeveelheid, eenheid, tijd)
- [x] Swipe navigatie tussen Vakken/Agenda/Stats (op header)
- [x] Long press (0.8s) voor drag in agenda, anders scrollen
- [x] Sticky task-pool boven agenda
- [x] Dag detail modal bij klik op dag header
- [x] Datum/tijd tonen bij taken in Vakken tab
- [x] Update knop verplaatst van Instellingen naar About modal
- [x] Globale alarm instelling (aan/uit + minuten van tevoren)
- [x] Drag & drop fix: refs voor directe state toegang, touch-action CSS
- [x] PWA update fix: service worker hernoemd naar sw-v2.js (bypass cached sw.js)
- [x] SubjectForm in fullscreen modal met sticky header en sluitknop
- [x] Body scroll lock wanneer modal open is
- [x] Nginx config: no-cache headers voor sw-v2.js en index.html
- [x] Timer crash fix: validatie corrupt/verlopen localStorage state (max 24u)
- [x] Dag detail modal z-index fix (1000) voor correcte weergave op PC
- [x] Notificaties sectie in instellingen met status en instructies
- [x] Productie API URL configuratie (.env.production)
- [x] SubjectForm auto-save bij sluiten, Enter key voor taken, taken optioneel
- [x] Sticky tabs met subtiele shadow

**Uitgeschakeld (wacht op werkende API):**
- [ ] SOMtoday integratie (code aanwezig in SchoolSystemSettings.tsx)
- [ ] Magister integratie (code aanwezig in services/magister.ts)
- [ ] Privacy notice voor schoolsysteem koppeling (AVG-compliant, klaar voor gebruik)

**Voltooid (december 2024 - WebSocket):**
- [x] Mentor live sessies via WebSocket (HavunCore + Laravel Reverb)
- [x] Real-time push updates bij sessie start/stop
- [x] useLiveSession hook voor WebSocket verbinding
- [x] Fallback check voor bestaande actieve sessies

**TODO:**
- [ ] Dagelijkse evaluatie (eindtijd instellen)
- [ ] Email verificatie (optioneel, voor meerdere gebruikers)
- [ ] SOMtoday/Magister activeren wanneer API beschikbaar is

---

## Authenticatie (gepland)

### Flow
1. Registreer met naam + email + kies pincode
2. Verificatie-link naar email (via HavunCore)
3. Klik link → account actief
4. Login met email + pincode
5. Pincode vergeten → reset-link naar email

### Backend nodig
- **studieplanner-api** Laravel project aanmaken
- Of: HavunCore module voor Studieplanner auth
- Email reset via HavunCore email systeem

### API Endpoints (gepland)
```
POST /api/auth/register   → naam, email, pincode
POST /api/auth/verify     → email verificatie
POST /api/auth/login      → email + pincode
POST /api/auth/reset      → pincode reset via email
```

---

## Authenticatie (ACTUEEL - december 2024)

### Huidige situatie (vereenvoudigd voor 1 gebruiker)
- Login met **naam + 4-cijferige pincode**
- Geen email verificatie nodig
- Backend: `D:\GitHub\Studieplanner-api` (Laravel 12)

### Sessie Tracking API
```
POST /api/session/start   → start studiesessie (datum/tijd naar DB)
POST /api/session/stop    → stop sessie (datum/tijd + resultaat)
GET  /api/session/active  → actieve sessies (voor mentor)
GET  /api/session/history → sessie geschiedenis
```

### Mentor API Endpoints
```
GET  /api/mentor/students           → lijst van gekoppelde leerlingen
GET  /api/mentor/student/{id}       → volledige data van leerling (subjects, tasks, sessions)
POST /api/mentor/accept-student     → accepteer leerling via invite code
DELETE /api/mentor/student/{id}     → ontkoppel leerling
```

### Student API Endpoints
```
POST /api/student/subjects/sync     → sync alle subjects + tasks naar backend
POST /api/student/sessions/sync     → sync alle sessions naar backend
POST /api/student/invite            → genereer invite code voor mentor (24u geldig)
GET  /api/student/mentors           → lijst van gekoppelde mentoren
```

### Database Tabellen
```sql
users: id, name, pincode, role (student/mentor), student_code (UUID 12 chars)
mentor_students: mentor_id, student_id (pivot tabel)
subjects: id, user_id, name, color, exam_date
tasks: id, subject_id, description, estimated_minutes, planned_amount, unit, completed
planned_sessions: id, user_id, subject_id, task_id, date, hour, minutes_planned, minutes_actual,
                  amount_planned, amount_actual, unit, completed, knowledge_rating
```

### Data Sync
Frontend slaat data op in localStorage én synct naar backend:
- **Auto-sync**: Bij elke wijziging aan subjects/sessions
- **Handmatige sync**: Via Sync knop in instellingen
- **Volgorde**: Subjects EERST (maakt ID mappings), daarna sessions
- **ID Mapping**: Frontend gebruikt UUIDs, backend numerieke IDs. Mapping via Laravel cache (5 min TTL)

### Starten
```bash
# Terminal 1: Backend
cd D:\GitHub\Studieplanner-api
php artisan serve --port=8000

# Terminal 2: Frontend
cd D:\GitHub\Studieplanner
npm run dev

# Terminal 3: HavunCore WebSocket (voor live mentor updates)
cd D:\GitHub\HavunCore
php artisan reverb:start
```

---

## Real-time Mentor Updates (WebSocket)

### Architectuur
```
┌─────────────────┐     HTTP POST      ┌─────────────────┐
│ Studieplanner   │ ──────────────────▶│   HavunCore     │
│     API         │  /session/broadcast│ (Laravel Reverb)│
└─────────────────┘                    └────────┬────────┘
       ▲                                        │
       │ HTTP                                   │ WebSocket
       │                                        ▼
┌─────────────────┐                    ┌─────────────────┐
│   Leerling      │                    │    Mentor       │
│   Frontend      │                    │   Dashboard     │
└─────────────────┘                    └─────────────────┘
```

### Flow
1. Leerling start/stopt studiesessie
2. Studieplanner-api → POST naar HavunCore `/api/studieplanner/session/broadcast`
3. HavunCore broadcast event via Laravel Reverb WebSocket
4. Mentor dashboard ontvangt real-time update via `useLiveSession` hook

### Configuratie
**HavunCore (.env):**
```env
BROADCAST_CONNECTION=reverb
REVERB_APP_ID=studieplanner
REVERB_APP_KEY=your-key
REVERB_APP_SECRET=your-secret
REVERB_SERVER_HOST=0.0.0.0
REVERB_SERVER_PORT=8080
STUDIEPLANNER_API_KEY=shared-secret-key
```

**Studieplanner-api (.env):**
```env
HAVUNCORE_URL=https://havuncore.havun.nl
HAVUNCORE_API_KEY=shared-secret-key
```

**Studieplanner frontend (.env.production):**
```env
VITE_HAVUNCORE_URL=https://havuncore.havun.nl:8080
VITE_REVERB_APP_KEY=studieplanner
```

### Bestanden
- `HavunCore/app/Events/StudySessionUpdated.php` - Broadcast event
- `HavunCore/app/Http/Controllers/Api/StudySessionController.php` - Ontvang + broadcast
- `Studieplanner-api/app/Services/HavunCoreService.php` - Push naar HavunCore
- `Studieplanner/src/hooks/useLiveSession.ts` - WebSocket client hook

---

## Email Verificatie Activeren (TODO voor later)

Wanneer je meerdere gebruikers wilt ondersteunen:

### Stap 1: Backend .env configureren
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.havun.nl
MAIL_PORT=587
MAIL_USERNAME=noreply@studieplanner.havun.nl
MAIL_PASSWORD=xxx
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@studieplanner.havun.nl
```

### Stap 2: AuthController.php aanpassen
Bestand: `Studieplanner-api/app/Http/Controllers/Api/AuthController.php`

**Register:** email validatie + is_verified=false + sendVerificationEmail()
**Login:** email i.p.v. name + is_verified check

### Stap 3: Frontend aanpassen
- `api.ts`: email parameter toevoegen
- `AuthScreen.tsx`: email veld + verify stap

### Backend functies (al aanwezig, alleen uitgeschakeld)
- verifyEmail(), forgotPassword(), resetPassword()
- resendVerification(), sendVerificationEmail()
