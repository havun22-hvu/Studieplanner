# Handover - Laatste Sessie

## Sessie: 2026-01-12

### Wat is gedaan:
- EAS Build opgezet voor Android APK distributie
- EAS Update (OTA) geconfigureerd met channels (development/preview/production)
- Backend gedeployed naar studieplanner.havun.nl met nginx reverse proxy
- Stats verplaatst naar aparte footer tab (was onder Settings)
- Versie info toegevoegd aan Settings scherm
- Error handling verbeterd voor vak opslaan debugging

### Openstaande items:
- [ ] **KRITIEK: Vak opslaan werkt niet** - Nieuwe APK heeft betere foutmelding, user moet testen
- [ ] OTA updates testen na nieuwe APK installatie

### Belangrijke context voor volgende keer:

**APK Distributie:**
- Preview APK: https://expo.dev/accounts/havun22/projects/studieplanner/builds/1b2edb2c-09d2-4a4e-9caa-a57f7c34448f
- OTA updates via: `npx eas update --channel preview --message "beschrijving"`

**Server Setup:**
- API: https://studieplanner.havun.nl/api/
- Laravel draait op port 8001 via systemd service `studieplanner-api`
- Nginx proxied /api/ naar Laravel

**Bekende issues:**
- Vak opslaan geeft fout - oorzaak nog onbekend, nieuwe APK toont echte error message
- OTA updates werkten niet op oude APK (nieuwe APK zou dit moeten fixen)

### Footer Navigatie (Student):
```
📚 Vakken │ 📅 Planning │ 📊 Stats │ ⚙️ Settings
```

Stats is premium-only, toont paywall voor gratis users.
