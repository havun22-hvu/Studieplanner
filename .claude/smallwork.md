# Smallwork Log

> Kleine technische fixes die niet in permanente docs hoeven.

---

## Sessie: 2026-01-12

### Fix: Error handling verbetering SubjectDetailScreen
- **Type:** Bug fix
- **Wat:** Generieke foutmelding vervangen door echte error message
- **Waarom:** Debugging - "Kon vak niet opslaan" gaf geen details
- **Bestanden:** `src/screens/SubjectDetailScreen.tsx`
- **Naar permanente docs?** ☑ Nee

### Fix: Stats sectie verwijderd uit SettingsScreen
- **Type:** Refactor
- **Wat:** Stats link weggehaald (is nu aparte footer tab)
- **Bestanden:** `src/screens/SettingsScreen.tsx`
- **Naar permanente docs?** ☑ Ja → navigation.md, screens.md (gedaan)

### Fix: Versie info toegevoegd aan SettingsScreen
- **Type:** Feature
- **Wat:** App versie + OTA update ID onderaan settings
- **Bestanden:** `src/screens/SettingsScreen.tsx`
- **Naar permanente docs?** ☑ Ja → screens.md (gedaan)

---

<!--
TEMPLATE voor nieuwe entry:

### Fix: [korte titel]
- **Type:** Bug fix / Performance / Refactor / Typo / Update
- **Wat:** [wat aangepast]
- **Waarom:** [reden]
- **Bestanden:** [welke files gewijzigd]
- **Naar permanente docs?** ☐ Ja → [welke doc] / ☑ Nee

-->
