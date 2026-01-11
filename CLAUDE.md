# Studieplanner - Claude Instructions

```
╔════════════════════════════════════════════════════════════════════╗
║  ⛔ VERPLICHTE WORKFLOW - GEEN UITZONDERINGEN                      ║
╠════════════════════════════════════════════════════════════════════╣
║                                                                    ║
║  FASE 1: LEZEN (verplicht VOOR code)                               ║
║  □ Noem ALLE relevante docs voor deze taak                         ║
║  □ CITEER specifieke regels (copy-paste, niet parafraseren)        ║
║  □ Zeg: "Checklist Fase 1 compleet"                                ║
║                                                                    ║
║  FASE 2: PLAN (verplicht VOOR code)                                ║
║  □ Beschrijf exacte aanpak + bestanden                             ║
║  □ Vraag: "Mag ik beginnen met coderen?"                           ║
║  □ WACHT op user "ja" - NIET doorgaan zonder approval              ║
║                                                                    ║
║  FASE 3: CODE (pas na "ja")                                        ║
║  □ Verwijs naar docs in code comments                              ║
║                                                                    ║
║  ════════════════════════════════════════════════════════════════  ║
║  ⚠️  CODE ZONDER FASE 1+2 = ONGELDIG                               ║
║  ⚠️  User zegt "STOP" → terug naar Fase 1                          ║
║  ⚠️  Geen uitzonderingen, ook niet voor "kleine" taken             ║
║                                                                    ║
║  📖 Volledige uitleg: .claude/docs/workflow-enforcement.md         ║
╚════════════════════════════════════════════════════════════════════╝
```

## User Commando's

| Commando | Actie |
|----------|-------|
| `STOP` | Direct stoppen, terug naar Fase 1 |
| `DOCS?` | Welke docs heb je gelezen? Citeer. |
| `PLAN?` | Wat is je exacte aanpak? |
| `OK` / `JA` | Door naar volgende fase |

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
| `.claude/docs/deployment.md` | APK distributie + auto-updates |
| `.claude/docs/backend-todo.md` | Backend aanpassingen |

### Externe KB
- **HavunCore KB:** `D:\GitHub\HavunCore\docs\kb\`
