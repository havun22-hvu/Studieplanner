# Studieplanner - Context

> Overzicht van het project. Details in de [docs/](docs/) map.

## Wat is het?

Een mobiele studieplanner (Android) voor leerlingen om studietijd te plannen, timen en bij te houden. Mentoren/ouders volgen de voortgang real-time.

## Tech Stack

| Component | Technologie |
|-----------|-------------|
| App | React Native + Expo |
| Backend | Laravel 12 API |
| Database | MySQL |
| Real-time | Laravel Reverb (WebSocket) |
| Auth | Naam + 4-cijferige pincode |

## Business Model

**Freemium** - betaling via website (0% Play Store commissie)

| Gratis | Premium |
|--------|---------|
| Vakken/taken beheren | Alarmen & notificaties |
| Agenda met drag & drop | Statistieken |
| Timer (handmatig) | Leersnelheid analyse |
| Mentor koppeling | Herinneringen |

## Documentatie

### Functioneel
- [Features](docs/features.md) - Alle functionaliteit uitgewerkt
- [Freemium](docs/freemium.md) - Gratis vs premium details

### Technisch
- [Tech Stack](docs/tech-stack.md) - Packages, configuratie
- [API](docs/api.md) - Alle endpoints met request/response
- [Data Types](docs/data-types.md) - TypeScript types + database schema

### UI/UX
- [Screens](docs/ui/screens.md) - Alle schermen beschreven
- [Components](docs/ui/components.md) - Herbruikbare componenten
- [Navigation](docs/ui/navigation.md) - Navigatie flow
- [Styling](docs/ui/styling.md) - Kleuren, fonts, spacing

## Quick Start

```bash
# App starten
npx expo start

# Backend
cd D:\GitHub\Studieplanner-api && php artisan serve --port=8000
```

## Status

Zie [features.md](docs/features.md) voor de volledige TODO checklist.
