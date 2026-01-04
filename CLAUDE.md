# Studieplanner - Claude Instructions

```
╔══════════════════════════════════════════════════════════════════╗
║  ⛔ STOP! LEES DIT VOORDAT JE IETS DOET                          ║
║                                                                   ║
║  GEEN CODE SCHRIJVEN VOORDAT JE ANTWOORD GEEFT OP:               ║
║                                                                   ║
║  1. "Wat staat er in de docs over dit onderwerp?"                ║
║  2. "Waar staat dat?" (geef bestandsnaam + regelnummer)          ║
║  3. "Is er iets inconsistent of ontbrekend?"                     ║
║                                                                   ║
║  PAS DAARNA mag je code voorstellen.                             ║
║  Gebruiker moet EERST akkoord geven.                             ║
║                                                                   ║
║  ⚠️  Bij twijfel: /kb of vraag aan gebruiker                     ║
╚══════════════════════════════════════════════════════════════════╝
```

> **Type:** React/TypeScript PWA + Laravel API
> **URL:** https://studieplanner.havun.nl

## Rules (ALWAYS follow)

### LEES-DENK-DOE-DOCUMENTEER (Kritiek!)

> **Volledige uitleg:** `HavunCore/docs/kb/runbooks/claude-werkwijze.md`

**Bij ELKE taak:**
1. **LEES** - Hiërarchisch: CLAUDE.md → relevante code/docs voor de taak
2. **DENK** - Analyseer, begrijp, stel vragen bij twijfel
3. **DOE** - Pas dan uitvoeren, rustig, geen haast
4. **DOCUMENTEER** - Sla nieuwe kennis op in de juiste plek

**Kernregels:**
- Kwaliteit boven snelheid - liever 1x goed dan 3x fout
- Bij twijfel: VRAAG en WACHT op antwoord
- Nooit aannemen, altijd verifiëren
- Als gebruiker iets herhaalt: direct opslaan in docs

### Forbidden without permission
- SSH keys, credentials, .env files wijzigen
- npm packages installeren
- Systemd services, cron jobs aanpassen

### Communication
- Antwoord max 20-30 regels
- Bullet points, direct to the point

### Workflow
- **Vraag eerst, codeer later**: WACHT op antwoord voordat je codeert
- Test lokaal eerst, dan deploy
- Atomic commits: 1 feature/fix = 1 commit

## Quick Reference

| Omgeving | Pad |
|----------|-----|
| Frontend | D:\GitHub\Studieplanner |
| Backend | D:\GitHub\Studieplanner-api |
| Server | /var/www/studieplanner/production |

**Server:** 188.245.159.115 (root, SSH key)

## Dit Project

- **Frontend:** React PWA met Vite
- **Backend:** Laravel 12 API
- **Auth:** Naam + 4-cijferige pincode
- **Real-time:** WebSocket via HavunCore Reverb

### Lokaal starten
```bash
# Backend
cd D:\GitHub\Studieplanner-api && php artisan serve --port=8000

# Frontend
cd D:\GitHub\Studieplanner && npm run dev
```

## Knowledge Base

Voor uitgebreide info:
- **Context:** `.claude/context.md` (features, API's, database)
- **HavunCore KB:** `D:\GitHub\HavunCore\docs\kb\`
