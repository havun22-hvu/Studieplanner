# Studieplanner - Claude Instructions

> **Role:** Studieplanner applicatie
> **Type:** Vue/TypeScript applicatie
> **URL:** https://studieplanner.havun.nl (nog te configureren)

## Rules (ALWAYS follow)

### Forbidden without permission
- SSH keys, credentials, .env files wijzigen
- npm packages installeren
- Systemd services, cron jobs aanpassen

### Communication
- Antwoord max 20-30 regels
- Bullet points, direct to the point
- Lange uitleg? Eerst samenvatting, details op vraag

### Workflow
- Test lokaal eerst, dan deploy
- Na wijzigingen: git push naar server
- Atomic commits: 1 feature/fix = 1 commit

## Quick Reference

| Omgeving | Pad |
|----------|-----|
| Lokaal | D:\GitHub\Studieplanner |
| Server | /var/www/studieplanner/production |

**Server:** 188.245.159.115 (root, SSH key)

## Project Context

Dit is een relatief eenvoudig project voor studieplanning.

### Tech Stack
- Vue + TypeScript
- Vite

### Deployment
```bash
# Op server
cd /var/www/studieplanner/production
git pull origin master
npm ci
npm run build
```

## Related Projects

| Project | Relatie |
|---------|---------|
| HavunCore | Centrale hub, Task Queue API |
