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

> **Type:** React Native + Expo (Android) + Laravel API
> **Play Store:** (komt nog)

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

- **App:** React Native + Expo (Android only)
- **Backend:** Laravel 12 API
- **Auth:** Naam + 4-cijferige pincode
- **Real-time:** WebSocket via HavunCore Reverb
- **Model:** Freemium (betaling via website, niet Play Store)

### Lokaal starten
```bash
# App (Android emulator of fysiek device)
npx expo start

# Backend
cd D:\GitHub\Studieplanner-api && php artisan serve --port=8000
```

## Knowledge Base

### Project Docs (lees eerst context.md!)

| Doc | Inhoud |
|-----|--------|
| `.claude/context.md` | Overzicht + links naar details |
| `.claude/docs/features.md` | Alle functionaliteit |
| `.claude/docs/freemium.md` | Gratis vs premium |
| `.claude/docs/api.md` | Alle endpoints |
| `.claude/docs/data-types.md` | Types + database |
| `.claude/docs/tech-stack.md` | Packages + config |
| `.claude/docs/ui/screens.md` | Alle schermen |
| `.claude/docs/ui/components.md` | UI componenten |
| `.claude/docs/ui/styling.md` | Kleuren, fonts |
| `.claude/docs/ui/navigation.md` | Navigatie flow |

### Externe KB
- **HavunCore KB:** `D:\GitHub\HavunCore\docs\kb\`
