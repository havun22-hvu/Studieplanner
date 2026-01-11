# Freemium Model

> Gratis vs Premium functionaliteit

## Strategie

- **Gratis:** Volledige planning functionaliteit
- **Premium:** Automatisering en inzichten
- **Betaling:** Via website (havun.nl), NIET Play Store
- **Commissie:** 0% aan Google

---

## Gratis Features

### Vakken & Taken
- Onbeperkt vakken aanmaken
- Onbeperkt taken per vak
- Toetsdatums instellen
- Automatische planning genereren

### Agenda
- Volledige weekweergave
- Drag & drop blokken
- Plank voor ongeplande taken
- Blokken verplaatsen/verwijderen

### Timer
- Timer starten/pauzeren/stoppen
- Handmatig stoppen vereist
- Scherm moet aan blijven
- Geen achtergrond functionaliteit

### Resultaten
- Percentage voltooid invoeren
- Hoeveelheid gedaan invoeren
- Automatisch nieuw blok bij <100%

### Mentor
- Invite code genereren
- Mentor koppelen
- Basis synchronisatie

---

## Premium Features

### Alarmen & Notificaties
- **Alarm bij einde sessie**
  - Geluid (keuze uit systeemtonen)
  - Trillen
  - Ook als app in achtergrond
- **Waarschuwing X minuten voor einde**
  - Instelbaar (5/10/15 min)
- **Herinnering bij geplande sessie**
  - "Je hebt om 14:00 Nederlands gepland"
  - Push notificatie
- **Dagelijkse samenvatting**
  - "Vandaag 2 uur gestudeerd, 3 taken voltooid"
  - Instelbaar tijdstip

### Achtergrond Timer
- Timer loopt door als app gesloten
- Persistente notificatie met tijd
- Alarm werkt betrouwbaar

### Statistieken
- Totaal uren per week/maand
- Uren per vak (grafiek)
- Trend over tijd
- Voltooiingspercentages

### Leersnelheid Analyse
- Pagina's/uur per vak berekend
- Betere planning suggesties
- "Voor dit vak heb je gemiddeld 45 min per hoofdstuk nodig"

### Mentor Premium
- Real-time push notificaties
- Gedetailleerde statistieken per leerling

---

## Implementatie

### Premium Check
```typescript
// In elke premium feature
if (!user.isPremium) {
  showPremiumPaywall();
  return;
}
```

### Premium Status API
```
GET /api/premium/status
Response: { isPremium: boolean, expiresAt: string | null }
```

### Paywall UI
- Modal met premium voordelen
- Link naar havun.nl/studieplanner/premium
- "Je hebt premium tot [datum]" als actief

### Backend
```sql
users:
  is_premium: boolean (default false)
  premium_until: datetime (nullable)
```

---

## Prijsmodel (suggestie)

| Plan | Prijs | Features |
|------|-------|----------|
| Gratis | - | Basis planning |
| Maand | €2,99/maand | Alle premium |
| Jaar | €24,99/jaar | Alle premium (30% korting) |

Betalingen via Mollie op havun.nl.
