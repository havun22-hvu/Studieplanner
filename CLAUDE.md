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
- Tijdslots 8:00-20:00 verticaal
- Drag & drop taken naar tijdslots
- Toetsen worden getoond op examdatum
- Blokgrootte = tijdsduur (bijv. 2 uur = 120px)

#### Timer & Resultaten
- Klik op blok → Timer opent
- Start/Pauze/Stop knoppen
- Na stop: invullen % voltooid
- Bij <100%: nieuw blok toegevoegd aan plank

#### Instellingen
- Leerling naam
- Studietijd per dag
- Vrije dagen
- Mentoren (naam + email) - **nog niet gekoppeld**

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
├── App.tsx              # Hoofd component, state management
├── App.css              # Alle styling
├── types/index.ts       # TypeScript types
├── utils/planning.ts    # Planning algoritme
├── hooks/useLocalStorage.ts
├── components/
│   ├── AgendaView.tsx   # Week agenda met drag & drop
│   ├── SubjectForm.tsx  # Vak toevoegen/bewerken
│   ├── SubjectCard.tsx  # Vak kaart met sessie-voortgang
│   ├── StudyTimer.tsx   # Timer modal
│   ├── SessionResultModal.tsx  # Resultaat invoer
│   ├── Settings.tsx     # Instellingen + deellink
│   ├── MentorView.tsx   # Read-only agenda voor mentoren
│   ├── TaskSplitDialog.tsx    # Keuze bij taak > dagelijkse tijd
│   ├── InstallPrompt.tsx      # PWA installatie prompt
│   └── UpdatePrompt.tsx       # PWA update prompt
└── lib/
    └── (firebase.ts)    # VERWIJDERD - was Firebase poging
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
  hour?: number;        // undefined = op plank
  completed: boolean;
  alarm?: SessionAlarm;
}

interface Settings {
  dailyStudyMinutes: number;
  breakDays: number[];
  studentName: string;
  mentors: Mentor[];
  shareCode?: string;   // Voor mentor deellink
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

**TODO:**
- [ ] Dagelijkse evaluatie (eindtijd instellen)
- [ ] Mentor live sessies zien
- [ ] Email verificatie (optioneel, voor meerdere gebruikers)

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

### Starten
```bash
# Terminal 1: Backend
cd D:\GitHub\Studieplanner-api
php artisan serve --port=8000

# Terminal 2: Frontend
cd D:\GitHub\Studieplanner
npm run dev
```

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
