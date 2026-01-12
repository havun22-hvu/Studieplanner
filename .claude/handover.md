# Handover - Laatste Sessie

## Sessie: 2026-01-12

### Wat is gedaan:
- EAS Build + Update opgezet voor Android APK distributie
- Backend gedeployed naar studieplanner.havun.nl
- Stats verplaatst naar aparte footer tab
- Versie info toegevoegd aan Settings scherm
- **UUID bug gefixed** - `uuid` vervangen door `expo-crypto` (crypto.getRandomValues error)

### Openstaande items:
- [ ] Test vak opslaan na OTA update (fix gepusht, niet getest)

### Belangrijke context voor volgende keer:

**APK:**
- Laatste build: https://expo.dev/accounts/havun22/projects/studieplanner/builds/1b2edb2c-09d2-4a4e-9caa-a57f7c34448f

**OTA Updates:**
- `npx eas update --channel preview --message "beschrijving"`
- Laatste update: uuid crypto fix

**Server:**
- API: https://studieplanner.havun.nl/api/
- Laravel op port 8001 via systemd `studieplanner-api`

### Footer Navigatie (Student):
```
📚 Vakken │ 📅 Planning │ 📊 Stats │ ⚙️ Settings
```
