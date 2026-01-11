# Deployment & Updates

> APK distributie en automatische updates

## Distributie Strategie

**Geen Play Store** - directe APK download via eigen server.

Voordelen:
- 0% commissie
- Geen review wachttijd
- Volledige controle over updates
- Kan verplichte updates pushen

## Server Setup

### Bestandsstructuur

```
/var/www/studieplanner/production/
├── public/
│   └── downloads/
│       ├── studieplanner-latest.apk      # Altijd nieuwste
│       ├── studieplanner-v1.0.0.apk      # Archief
│       ├── studieplanner-v1.1.0.apk
│       └── version.json                  # Versie info
```

### version.json

```json
{
  "version": "1.2.0",
  "versionCode": 120,
  "releaseDate": "2024-03-15",
  "downloadUrl": "https://studieplanner.havun.nl/downloads/studieplanner-latest.apk",
  "releaseNotes": "- Bugfixes timer\n- Nieuwe statistieken",
  "forceUpdate": false,
  "minVersion": "1.0.0"
}
```

| Veld | Beschrijving |
|------|--------------|
| `version` | Semver string (1.2.0) |
| `versionCode` | Android version code (integer) |
| `forceUpdate` | true = app blokkeren tot update |
| `minVersion` | Oudste toegestane versie |

---

## API Endpoint

### GET /api/app/version

Backend endpoint voor versie check.

**Response:**
```json
{
  "version": "1.2.0",
  "versionCode": 120,
  "downloadUrl": "https://studieplanner.havun.nl/downloads/studieplanner-latest.apk",
  "forceUpdate": false,
  "minVersion": "1.0.0",
  "releaseNotes": "- Bugfixes\n- Nieuwe features"
}
```

**Laravel implementatie:**
```php
// routes/api.php
Route::get('app/version', function () {
    return response()->json([
        'version' => config('app.mobile_version'),
        'versionCode' => config('app.mobile_version_code'),
        'downloadUrl' => url('/downloads/studieplanner-latest.apk'),
        'forceUpdate' => config('app.force_update', false),
        'minVersion' => config('app.min_mobile_version'),
        'releaseNotes' => config('app.release_notes'),
    ]);
});
```

---

## App Update Flow

### Bij app start

```typescript
// src/services/updateChecker.ts
import { Alert, Linking } from 'react-native';
import * as Application from 'expo-application';

interface VersionInfo {
  version: string;
  versionCode: number;
  downloadUrl: string;
  forceUpdate: boolean;
  minVersion: string;
  releaseNotes: string;
}

export async function checkForUpdates(): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/api/app/version`);
    const serverVersion: VersionInfo = await response.json();

    const currentVersion = Application.nativeApplicationVersion; // "1.1.0"
    const currentCode = Application.nativeBuildVersion; // "110"

    if (serverVersion.versionCode > parseInt(currentCode)) {
      showUpdateDialog(serverVersion);
    }
  } catch (error) {
    // Silently fail - don't block app if check fails
    console.log('Update check failed:', error);
  }
}

function showUpdateDialog(version: VersionInfo) {
  const buttons = version.forceUpdate
    ? [{ text: 'Updaten', onPress: () => downloadUpdate(version.downloadUrl) }]
    : [
        { text: 'Later', style: 'cancel' },
        { text: 'Updaten', onPress: () => downloadUpdate(version.downloadUrl) },
      ];

  Alert.alert(
    `Update beschikbaar (v${version.version})`,
    version.releaseNotes,
    buttons,
    { cancelable: !version.forceUpdate }
  );
}

function downloadUpdate(url: string) {
  Linking.openURL(url);
}
```

### In App.tsx

```typescript
// App.tsx
import { useEffect } from 'react';
import { checkForUpdates } from './services/updateChecker';

export default function App() {
  useEffect(() => {
    checkForUpdates();
  }, []);

  // ... rest of app
}
```

---

## Force Update (Blokkerende Update)

Voor kritieke updates of breaking API changes.

### Wanneer gebruiken
- Security fixes
- Breaking API changes
- Kritieke bugs

### Implementatie

```typescript
// src/screens/ForceUpdateScreen.tsx
export function ForceUpdateScreen({ downloadUrl }: { downloadUrl: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Update vereist</Text>
      <Text style={styles.message}>
        Er is een belangrijke update beschikbaar.
        Je moet updaten om de app te blijven gebruiken.
      </Text>
      <Button
        title="Download Update"
        onPress={() => Linking.openURL(downloadUrl)}
      />
    </View>
  );
}
```

### In App.tsx

```typescript
const [forceUpdate, setForceUpdate] = useState<string | null>(null);

useEffect(() => {
  checkForUpdates().then((result) => {
    if (result?.forceUpdate) {
      setForceUpdate(result.downloadUrl);
    }
  });
}, []);

if (forceUpdate) {
  return <ForceUpdateScreen downloadUrl={forceUpdate} />;
}
```

---

## Release Workflow

### 1. Build nieuwe versie

```bash
# Verhoog versie in app.json
# version: "1.2.0"
# android.versionCode: 120

# Build APK
eas build --platform android --profile production
```

### 2. Upload naar server

```bash
# Download APK van Expo
# Upload naar server

scp studieplanner-v1.2.0.apk root@188.245.159.115:/var/www/studieplanner/production/public/downloads/

# Update symlink
ssh root@188.245.159.115 "cd /var/www/studieplanner/production/public/downloads && ln -sf studieplanner-v1.2.0.apk studieplanner-latest.apk"
```

### 3. Update version.json

```bash
ssh root@188.245.159.115 "cat > /var/www/studieplanner/production/public/downloads/version.json << 'EOF'
{
  \"version\": \"1.2.0\",
  \"versionCode\": 120,
  \"releaseDate\": \"$(date +%Y-%m-%d)\",
  \"downloadUrl\": \"https://studieplanner.havun.nl/downloads/studieplanner-latest.apk\",
  \"releaseNotes\": \"- Nieuwe feature X\\n- Bugfix Y\",
  \"forceUpdate\": false,
  \"minVersion\": \"1.0.0\"
}
EOF"
```

### 4. (Optioneel) Push notificatie

Stuur push naar alle gebruikers: "Nieuwe versie beschikbaar!"

---

## Download Pagina (Web)

Voor gebruikers die de link delen of via browser komen.

### Route: /download

```blade
{{-- resources/views/download.blade.php --}}
<!DOCTYPE html>
<html>
<head>
    <title>Studieplanner Downloaden</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body { font-family: system-ui; max-width: 480px; margin: 0 auto; padding: 20px; }
        .button { display: block; background: #4f46e5; color: white; text-align: center;
                  padding: 16px; border-radius: 8px; text-decoration: none; margin: 20px 0; }
        .steps { background: #f8fafc; padding: 16px; border-radius: 8px; }
        .steps li { margin: 8px 0; }
    </style>
</head>
<body>
    <h1>📚 Studieplanner</h1>
    <p>Versie {{ config('app.mobile_version') }}</p>

    <a href="/downloads/studieplanner-latest.apk" class="button">
        Download APK
    </a>

    <div class="steps">
        <h3>Installatie</h3>
        <ol>
            <li>Download de APK</li>
            <li>Open het gedownloade bestand</li>
            <li>Sta "Installeren van onbekende bronnen" toe als gevraagd</li>
            <li>Tik op Installeren</li>
        </ol>
    </div>

    <h3>Release notes</h3>
    <pre>{{ config('app.release_notes') }}</pre>
</body>
</html>
```

---

## Nginx Config

```nginx
location /downloads/ {
    alias /var/www/studieplanner/production/public/downloads/;

    # Force download (niet in browser openen)
    types { }
    default_type application/octet-stream;

    # CORS voor API calls
    add_header Access-Control-Allow-Origin *;
}
```

---

## Checklist Nieuwe Release

- [ ] Versie verhogen in `app.json`
- [ ] `eas build --platform android`
- [ ] APK downloaden van Expo
- [ ] Upload naar server `/downloads/`
- [ ] Symlink `studieplanner-latest.apk` updaten
- [ ] `version.json` updaten
- [ ] Testen: download + installatie
- [ ] (Optioneel) Push notificatie sturen
- [ ] (Optioneel) Release notes op website

---

## OTA Updates (EAS Update)

> Snelle JavaScript/asset updates zonder nieuwe APK

### Wanneer OTA vs APK

| Type wijziging | Update methode |
|----------------|----------------|
| JS code, styling, images | OTA (instant) |
| Nieuwe native modules | APK (rebuild) |
| App.json config changes | APK (rebuild) |
| Expo SDK upgrade | APK (rebuild) |

### Channels

| Channel | Branch | Gebruik |
|---------|--------|---------|
| `development` | development | Dev builds |
| `preview` | preview | Testversie APK |
| `production` | production | Release APK |

### OTA Update Pushen

```bash
# Preview channel (test APK)
npx eas update --channel preview --message "Beschrijving"

# Production channel (release APK)  
npx eas update --channel production --message "Beschrijving"
```

### Hoe werkt het

1. App start op
2. `expo-updates` checkt EAS server
3. Als nieuwe update: download op achtergrond
4. Volgende app start: nieuwe versie actief

### Configuratie

**app.json:**
```json
{
  "expo": {
    "updates": {
      "url": "https://u.expo.dev/[PROJECT_ID]"
    },
    "runtimeVersion": {
      "policy": "appVersion"
    }
  }
}
```

**eas.json:**
```json
{
  "build": {
    "preview": {
      "channel": "preview"
    },
    "production": {
      "channel": "production"
    }
  }
}
```

### Checklist OTA Release

- [ ] Code wijzigingen getest lokaal
- [ ] Geen native changes (anders: nieuwe APK)
- [ ] `npx eas update --channel [preview|production]`
- [ ] Verify op EAS Dashboard

### Links

- Dashboard: https://expo.dev/accounts/havun22/projects/studieplanner/updates
- Builds: https://expo.dev/accounts/havun22/projects/studieplanner/builds
