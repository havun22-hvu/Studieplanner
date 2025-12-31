# Turnover: WebSocket Live Mentor Updates

**Datum:** 31 december 2024
**Status:** Code compleet, wacht op deployment en configuratie

---

## Wat is er gebouwd?

Real-time push-notificaties voor mentoren wanneer leerlingen een studiesessie starten of stoppen. Geen polling meer - updates komen direct binnen via WebSocket.

### Architectuur
```
Leerling start sessie
        │
        ▼
┌─────────────────┐     HTTP POST      ┌─────────────────┐
│ Studieplanner   │ ──────────────────▶│   HavunCore     │
│     API         │                    │ (Laravel Reverb)│
└─────────────────┘                    └────────┬────────┘
                                                │ WebSocket
                                                ▼
                                       ┌─────────────────┐
                                       │    Mentor       │
                                       │   Dashboard     │
                                       └─────────────────┘
```

---

## Gewijzigde bestanden

### HavunCore (D:\GitHub\HavunCore)
| Bestand | Actie | Beschrijving |
|---------|-------|--------------|
| `composer.json` | Gewijzigd | Laravel Reverb package toegevoegd |
| `config/reverb.php` | Nieuw | Reverb WebSocket server configuratie |
| `config/broadcasting.php` | Nieuw | Broadcasting driver configuratie |
| `config/services.php` | Gewijzigd | Studieplanner API key entry |
| `routes/channels.php` | Nieuw | Private channel definities |
| `routes/api.php` | Gewijzigd | Studieplanner broadcast endpoints |
| `bootstrap/app.php` | Gewijzigd | Channels routing toegevoegd |
| `app/Events/StudySessionUpdated.php` | Nieuw | Broadcast event class |
| `app/Http/Controllers/Api/StudySessionController.php` | Nieuw | Ontvang + broadcast controller |
| `.env.example` | Gewijzigd | Reverb + Studieplanner config vars |

### Studieplanner-api (D:\GitHub\Studieplanner-api)
| Bestand | Actie | Beschrijving |
|---------|-------|--------------|
| `app/Services/HavunCoreService.php` | Nieuw | HTTP client voor HavunCore |
| `app/Http/Controllers/Api/SessionController.php` | Gewijzigd | Broadcast bij start/stop |
| `config/services.php` | Gewijzigd | HavunCore URL + API key |
| `.env.example` | Gewijzigd | HAVUNCORE_URL en HAVUNCORE_API_KEY |

### Studieplanner Frontend (D:\GitHub\Studieplanner)
| Bestand | Actie | Beschrijving |
|---------|-------|--------------|
| `src/hooks/useLiveSession.ts` | Nieuw | WebSocket hook met Laravel Echo |
| `src/components/MentorDashboard.tsx` | Gewijzigd | Polling vervangen door WebSocket |
| `.env.development` | Gewijzigd | VITE_HAVUNCORE_URL + VITE_REVERB_APP_KEY |
| `.env.production` | Gewijzigd | VITE_HAVUNCORE_URL + VITE_REVERB_APP_KEY |
| `CLAUDE.md` | Gewijzigd | Documentatie WebSocket architectuur |

---

## Deployment Checklist

### 1. HavunCore Server

```bash
# SSH naar server
ssh root@188.245.159.115

# Ga naar HavunCore
cd /var/www/havuncore/production

# Pull changes
git pull origin master

# Install dependencies
composer install --no-dev

# Genereer Reverb keys
php artisan reverb:install  # Als nog niet gedaan

# Voeg toe aan .env:
```

**.env toevoegingen:**
```env
BROADCAST_CONNECTION=reverb

# Laravel Reverb
REVERB_APP_ID=studieplanner
REVERB_APP_KEY=<genereer-random-key>
REVERB_APP_SECRET=<genereer-random-secret>
REVERB_HOST=havuncore.havun.nl
REVERB_PORT=8080
REVERB_SCHEME=https

REVERB_SERVER_HOST=0.0.0.0
REVERB_SERVER_PORT=8080

# Studieplanner Integration
STUDIEPLANNER_API_KEY=<genereer-shared-secret>
```

```bash
# Clear caches
php artisan config:clear
php artisan cache:clear

# Start Reverb server (of via supervisor)
php artisan reverb:start --host=0.0.0.0 --port=8080
```

### 2. Studieplanner-api Server

```bash
cd /var/www/studieplanner/production

git pull origin master

composer install --no-dev
```

**.env toevoegingen:**
```env
HAVUNCORE_URL=https://havuncore.havun.nl
HAVUNCORE_API_KEY=<zelfde-shared-secret-als-havuncore>
```

```bash
php artisan config:clear
php artisan cache:clear
```

### 3. Studieplanner Frontend

```bash
cd /var/www/studieplanner-frontend  # of waar frontend staat

git pull origin master

npm ci
npm run build
```

De `.env.production` is al geconfigureerd in git.

### 4. Firewall / Nginx

**Optie A: Direct (poort 8080 open)**
```bash
ufw allow 8080/tcp
```

**Optie B: Nginx reverse proxy (aanbevolen voor SSL)**
```nginx
# /etc/nginx/sites-available/havuncore
location /app {
    proxy_pass http://127.0.0.1:8080;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

Dan in frontend `.env.production`:
```env
VITE_HAVUNCORE_URL=https://havuncore.havun.nl
```

### 5. Supervisor (optioneel maar aanbevolen)

```ini
# /etc/supervisor/conf.d/reverb.conf
[program:reverb]
command=php /var/www/havuncore/production/artisan reverb:start --host=0.0.0.0 --port=8080
autostart=true
autorestart=true
user=www-data
redirect_stderr=true
stdout_logfile=/var/log/reverb.log
```

```bash
supervisorctl reread
supervisorctl update
supervisorctl start reverb
```

---

## Testen

### Lokaal testen
```bash
# Terminal 1: HavunCore
cd D:\GitHub\HavunCore
php artisan reverb:start

# Terminal 2: Studieplanner-api
cd D:\GitHub\Studieplanner-api
php artisan serve --port=8000

# Terminal 3: Frontend
cd D:\GitHub\Studieplanner
npm run dev
```

1. Open mentor dashboard in browser
2. Open console (F12) - zie "[LiveSession] WebSocket connected"
3. Start een studiesessie als leerling
4. Mentor dashboard moet direct "Bezig met studeren" tonen

### Productie testen
1. Check Reverb draait: `supervisorctl status reverb`
2. Check logs: `tail -f /var/log/reverb.log`
3. Browser console moet "[LiveSession] WebSocket connected" tonen

---

## Fallback

Als WebSocket niet werkt, valt de app terug op:
- Initiële check bij laden dashboard
- Handmatige refresh knop werkt nog steeds

De oude polling code is verwijderd maar kan indien nodig hersteld worden uit git history.

---

## API Keys Genereren

```bash
# Op server of lokaal
php -r "echo bin2hex(random_bytes(32));"
```

Gebruik dezelfde key voor:
- HavunCore: `STUDIEPLANNER_API_KEY`
- Studieplanner-api: `HAVUNCORE_API_KEY`

En genereer aparte keys voor:
- `REVERB_APP_KEY` (publiek, frontend ziet dit)
- `REVERB_APP_SECRET` (privé, alleen backend)

---

## Contactpunten Code

| Wat | Waar |
|-----|------|
| WebSocket hook | `Studieplanner/src/hooks/useLiveSession.ts` |
| Mentor UI | `Studieplanner/src/components/MentorDashboard.tsx:124-130` |
| Event broadcast | `HavunCore/app/Events/StudySessionUpdated.php` |
| API endpoint | `HavunCore/routes/api.php:139-148` |
| Push trigger | `Studieplanner-api/app/Http/Controllers/Api/SessionController.php:44-53` |

---

## Bekende Limitaties

1. **Geen authenticatie op WebSocket** - channels zijn "private" maar auth check is simpel (user ID match)
2. **Geen reconnect UI** - als verbinding wegvalt, geen melding aan gebruiker
3. **Single server** - Reverb draait op 1 server, geen Redis scaling geconfigureerd

Deze kunnen later verbeterd worden indien nodig.
