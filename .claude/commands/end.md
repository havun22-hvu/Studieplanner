# End Session Command

Voer de volgende stappen uit om de sessie netjes af te sluiten:

1. **Update CLAUDE.md** met nieuwe features/wijzigingen
2. **Commit alle wijzigingen** met duidelijke message
3. **Push naar origin**
4. **Deploy naar server:**
   ```bash
   ssh root@188.245.159.115 "cd /var/www/studieplanner/production && git pull origin master && npm ci && npm run build"
   ```
5. **Ruim branches op** (verwijder gemergte branches)
6. **Geef samenvatting** van wat er gedaan is

## Checklist voor commit message:
- Beschrijf WAT er gedaan is
- Beschrijf WAAROM (indien relevant)
- Gebruik Engels voor commit messages
