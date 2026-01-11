# Features

> Volledige functionele specificaties

## Doelgroepen

### Leerlingen (Student)
- Plannen studietaken
- Timer starten voor sessies
- Resultaten rapporteren
- Voortgang bekijken

### Mentoren/Ouders
- Leerlingen koppelen via invite code
- Real-time voortgang volgen
- Notificaties ontvangen bij activiteit

---

## 1. Authenticatie

### Registreren
- Invoer: naam + 4-cijferige pincode
- Keuze: student of mentor
- Geen email vereist (simpel voor jongeren)

### Inloggen
- Naam + pincode
- Onthoud op device (AsyncStorage)

### Student Code
- Elke student krijgt unieke 12-character code
- Gebruikt voor mentor-koppeling
- Voorbeeld: `ABC123XYZ789`

---

## 2. Vakken & Taken

### Vak aanmaken
- **Naam:** vrij tekstveld (bijv. "Nederlands")
- **Kleur:** keuze uit 8 voorgedefinieerde kleuren
- **Toetsdatum:** datum picker

### Vak bewerken
- Alle velden aanpasbaar
- Verwijderen met bevestiging

### Taken per vak
- **Beschrijving:** wat moet geleerd worden
- **Hoeveelheid:** getal (bijv. 30)
- **Eenheid:** blz / opdrachten / min video
- **Geschatte tijd:** automatisch berekend of handmatig

### Automatische planning
- Taken worden verdeeld over dagen tot toetsdatum
- Rekening houdend met ingestelde dagelijkse studietijd
- Blokken verschijnen op de "plank" (ongepland)

---

## 3. Agenda

### Weekweergave
- 7 dagen horizontaal (ma-zo)
- Huidige week standaard, swipe voor vorige/volgende
- Tijdslots 0:00-23:00 verticaal
- Scrollt automatisch naar 08:00

### Tijdslots
- Grid van 60 minuten per slot
- Visuele hoogte = duur (30 min = 30px, 60 min = 60px)

### Plank
- Bovenaan: ongeplande blokken
- Drag & drop naar tijdslot om te plannen
- Drag terug naar plank om te de-plannen

### Blokken
- Tonen: vaknaam + taak beschrijving
- Kleur: vakkleur
- Tap: opent timer scherm

### Toetsen
- Getoond als speciaal blok op toetsdatum
- Niet verplaatsbaar
- Visueel onderscheid (icon/rand)

---

## 4. Timer

### Starten
- Tap op gepland blok in agenda
- Timer scherm opent met:
  - Vaknaam + taak
  - Geplande tijd
  - Grote timer display (MM:SS)
  - Start knop

### Tijdens sessie
- Timer telt op (niet af)
- Pauze/Hervat knop
- Stop knop (bevestiging vragen)
- Scherm blijft aan tijdens actieve timer

### Achtergrond (Premium)
- Timer loopt door als app in achtergrond
- Notificatie toont lopende tijd
- Alarm bij einde geplande tijd

### Stoppen
- Handmatig: stop knop
- Automatisch: bij einde tijd (premium)
- Opent resultaat invoer

---

## 5. Resultaat invoer

### Na elke sessie
- **Hoeveel gedaan:** getal + eenheid (bijv. "15 blz")
- **Percentage voltooid:** slider 0-100%
- **Kennisbeoordeling:** 1-10 sterren (optioneel)

### Bij <100% voltooid
- Automatisch nieuw blok aangemaakt
- Resterende hoeveelheid berekend
- Blok verschijnt op plank

### Opslaan
- Lokaal in AsyncStorage
- Sync naar backend

---

## 6. Mentor Koppeling

### Invite code genereren (Student)
- Genereert 6-character code
- 24 uur geldig
- Delen via share sheet (WhatsApp, SMS, etc.)

### Code accepteren (Mentor)
- Voer code in
- Leerling verschijnt in lijst
- Kan meerdere leerlingen koppelen

### Ontkoppelen
- Student of mentor kan ontkoppelen
- Bevestiging vereist

### Real-time updates
- Mentor ziet wanneer student:
  - Sessie start
  - Sessie stopt
  - Resultaat invoert
- Via WebSocket (Laravel Reverb)

---

## 7. Statistieken (Premium)

### Overzicht
- Totaal gestudeerde uren (week/maand)
- Uren per vak (pie chart)
- Trend grafiek (lijn)

### Per vak
- Gemiddelde sessieduur
- Voltooiingspercentage
- Kennisbeoordeling trend

### Leersnelheid
- Pagina's/uur per vak
- Gebruikt voor betere planning suggesties

---

## 8. Instellingen

### Profiel
- Naam wijzigen
- Pincode wijzigen

### Studie
- Dagelijkse studietijd (minuten)
- Vrije dagen (weekenden uit/aan)

### Notificaties (Premium)
- Alarm geluid: keuze uit systeemtonen of uit
- Trillen: aan/uit
- Herinnering voor geplande sessie: aan/uit
- Dagelijkse samenvatting: aan/uit + tijd

### Data
- Backup naar cloud
- Restore van backup
- Wis alle data

---

## Status / TODO

### Must build
- [ ] Expo project setup
- [ ] Auth scherm (login/register)
- [ ] Vakken CRUD
- [ ] Taken CRUD
- [ ] Agenda view met drag & drop
- [ ] Timer basis (start/pauze/stop)
- [ ] Resultaat invoer modal
- [ ] Instellingen scherm
- [ ] Mentor koppeling flow
- [ ] API integratie

### Premium features
- [ ] Background timer service
- [ ] Alarm notificaties
- [ ] Statistieken schermen
- [ ] Leersnelheid berekening
- [ ] Premium paywall

### Backend aanpassingen
- [ ] Premium status API
- [ ] Learning speed API
