# Workflow Enforcement

> Strategie om Claude te dwingen docs-first te werken

## Het Probleem

Claude's instinct: "Ik help door snel code te schrijven"
Realiteit: Zonder context = inconsistente code over sessies

## De Oplossing: Gefaseerde Aanpak

Claude mag NIET naar fase 2 zonder fase 1 af te ronden.

---

## Fase 1: LEZEN (verplicht)

### Stap 1.1: Taak identificeren
```
USER: "Bouw het timer scherm"

CLAUDE MOET ANTWOORDEN:
"Taak: Timer scherm bouwen

Relevante docs:
- docs/ui/screens.md (TimerScreen sectie)
- docs/ui/components.md (TimerDisplay)
- docs/features.md (Timer & Alarmen)
- docs/data-types.md (TimerState)

Ik ga deze nu lezen."
```

### Stap 1.2: Docs citeren
```
CLAUDE MOET ANTWOORDEN:
"Uit docs/ui/screens.md:140-180:
- Timer telt OP (niet af)
- Start/Pauze/Stop knoppen
- Grote display MM:SS
- Geplande tijd eronder (kleiner)

Uit docs/ui/components.md (TimerDisplay):
- Props: elapsedSeconds, plannedSeconds, isRunning
- Font: monospace, 48px

Uit docs/data-types.md (TimerState):
interface TimerState {
  isRunning: boolean;
  sessionId: string | null;
  startTime: number | null;
  ...
}"
```

### Stap 1.3: Checklist bevestigen
```
CLAUDE MOET ANTWOORDEN:
"Checklist:
✓ Relevante docs gelezen
✓ UI specs geciteerd
✓ Data types genoteerd
✓ Geen conflicten gevonden

Klaar voor fase 2."
```

---

## Fase 2: PLAN (verplicht)

### Stap 2.1: Aanpak beschrijven
```
CLAUDE MOET ANTWOORDEN:
"Plan voor TimerScreen:

1. Bestand: src/screens/TimerScreen.tsx
2. Imports: useTimer hook, TimerDisplay component
3. Props via route: sessionId
4. Layout volgens docs/ui/screens.md wireframe
5. Styling uit docs/ui/styling.md (timer tokens)

Componenten nodig:
- TimerDisplay (bestaat al / moet gemaakt)
- Button (common component)

Vraag aan user: Mag ik beginnen met coderen?"
```

### Stap 2.2: User approval
```
USER: "Ja" / "Nee, eerst X aanpassen"
```

---

## Fase 3: CODEREN (pas na approval)

Nu mag Claude code schrijven, MET referenties:

```typescript
// TimerScreen.tsx
// Gebaseerd op: docs/ui/screens.md:140-180
// Data type: docs/data-types.md (TimerState)

export function TimerScreen() {
  // ...
}
```

---

## Enforcement Mechanismen

### 1. CLAUDE.md STOP Block (visueel)
Grote ASCII box die niet te missen is.

### 2. Trigger woorden detectie
Als Claude direct code begint zonder docs te citeren:
```
USER: "STOP. Je hebt de docs niet geciteerd.
Ga terug naar Fase 1."
```

### 3. Verplichte output format
Claude MOET dit format volgen:

```
## Fase 1: LEZEN
### Relevante docs:
- [lijst]

### Geciteerde specs:
- [quotes uit docs]

### Checklist:
- [ ] Docs gelezen
- [ ] Specs geciteerd
- [ ] Geen conflicten

## Fase 2: PLAN
### Aanpak:
- [stappen]

### Vraag:
Mag ik beginnen met coderen?

---
[WACHT OP USER APPROVAL]
---

## Fase 3: CODE
[pas na "ja" van user]
```

### 4. Anti-patterns blokkeren

FOUT (direct coderen):
```
USER: "Bouw timer scherm"
CLAUDE: "```typescript
export function TimerScreen() {
```"
```

FOUT (vage referentie):
```
CLAUDE: "Volgens de docs moet ik..."
[geen specifieke citaten]
```

GOED:
```
CLAUDE: "Uit docs/ui/screens.md:140:
'Timer telt OP (niet af)'

Dit betekent dat ik..."
```

---

## CLAUDE.md Update

Vervang de huidige STOP block met:

```
╔════════════════════════════════════════════════════════════════════╗
║  ⛔ VERPLICHTE WORKFLOW - GEEN UITZONDERINGEN                      ║
╠════════════════════════════════════════════════════════════════════╣
║                                                                    ║
║  FASE 1: LEZEN                                                     ║
║  □ Noem ALLE relevante docs voor deze taak                         ║
║  □ CITEER specifieke regels (niet parafraseren)                    ║
║  □ Bevestig: "Checklist compleet"                                  ║
║                                                                    ║
║  FASE 2: PLAN                                                      ║
║  □ Beschrijf exacte aanpak                                         ║
║  □ Vraag: "Mag ik beginnen met coderen?"                           ║
║  □ WACHT op user "ja"                                              ║
║                                                                    ║
║  FASE 3: CODE                                                      ║
║  □ Pas na approval                                                 ║
║  □ Met referenties naar docs in comments                           ║
║                                                                    ║
║  ⚠️  CODE ZONDER FASE 1+2 = ONGELDIG                               ║
║  ⚠️  User zal zeggen "STOP" en je terugsturen                      ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
```

---

## User Commands

Snelle correcties als Claude afdwaalt:

| Command | Betekenis |
|---------|-----------|
| `STOP` | Terug naar Fase 1 |
| `DOCS?` | Welke docs heb je gelezen? |
| `CITEER` | Geef exacte quotes |
| `PLAN?` | Wat is je aanpak? |
| `OK` | Ga door naar volgende fase |

---

## Waarom dit werkt

1. **Geen ruimte voor interpretatie** - Elke stap is expliciet
2. **Verplichte output** - Claude moet format volgen
3. **User gatekeeper** - Approval nodig voor code
4. **Makkelijk corrigeren** - "STOP" stuurt terug
5. **Zichtbare checklist** - Makkelijk te valideren

---

## Voorbeeld Sessie

```
USER: Bouw het auth scherm

CLAUDE:
## Fase 1: LEZEN

### Relevante docs:
- docs/ui/screens.md (AuthScreen sectie)
- docs/ui/components.md (Input, Button, PinInput)
- docs/features.md (Authenticatie)
- docs/api.md (POST /api/auth/login, /register)
- docs/data-types.md (User)

### Geciteerde specs:

docs/ui/screens.md:23-45:
"Layout:
- Logo: Simpel, tekst "Studieplanner" in primary color
- Naam input: Text input, placeholder
- Pincode input: 4 losse vakjes, numeric keyboard
- Mentor checkbox: Alleen bij registreren
- Submit button: Full width, primary color"

docs/ui/components.md (PinInput):
"interface PinInputProps {
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
}"

docs/api.md:15-30:
"POST /api/auth/login
Request: { name, pincode }
Response: { user, token }"

### Checklist:
✓ Docs gelezen
✓ Specs geciteerd
✓ Geen conflicten

## Fase 2: PLAN

### Aanpak:
1. Maak src/screens/AuthScreen.tsx
2. Gebruik bestaande Input, Button components
3. Maak PinInput component (bestaat nog niet)
4. State: name, pincode, isLogin/isRegister, isMentor
5. API call via useAuth hook
6. Navigate naar MainNavigator na success

### Bestanden:
- NIEUW: src/screens/AuthScreen.tsx
- NIEUW: src/components/PinInput.tsx
- BESTAAT: src/components/common/Input.tsx
- BESTAAT: src/components/common/Button.tsx

Mag ik beginnen met coderen?

USER: ja

CLAUDE:
## Fase 3: CODE

// src/components/PinInput.tsx
// Gebaseerd op: docs/ui/components.md (PinInput)
...
```
