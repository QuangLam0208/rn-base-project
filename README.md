# BaseApp — React Native MVVM + Self-Hosted OTA Updates

A production-grade, highly extensible React Native base project: built upon [Ignite](https://github.com/infinitered/ignite)'s proven Expo stack (theming, i18n, MMKV, Apisauce) combined with a clean **MVVM architecture** (`BaseViewModel`, MobX) and **InversifyJS** Dependency Injection — paired with a fully **Self-Hosted Over-The-Air (OTA) Update System** compliant with the Expo Updates Protocol (v1).

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Architecture & Directory Structure](#project-architecture--directory-structure)
- [Getting Started](#getting-started)
- [Over-The-Air (OTA) Update System](#over-the-air-ota-update-system)
  - [Publishing Mechanics (3-Step Pipeline)](#publishing-mechanics-3-step-pipeline)
  - [Remote Device Update Resolution](#remote-device-update-resolution)
  - [Runtime Version Matching & Safety Isolation](#runtime-version-matching--safety-isolation)
  - [Update Eligibility: OTA vs. Native Rebuild](#update-eligibility-ota-vs-native-rebuild)
- [Standard Developer Workflows](#standard-developer-workflows)
  - [Workflow 1: Publishing a JS/Asset OTA Update (No Native Rebuild)](#workflow-1-publishing-a-jsasset-ota-update-no-native-rebuild)
  - [Workflow 2: Releasing a Native Update (APK/AAB Rebuild)](#workflow-2-releasing-a-native-update-apkaab-rebuild)
- [Production Deployment Runbook](#production-deployment-runbook)
  - [Part 1: Client Configuration (`rn`)](#part-1-client-configuration-rn)
  - [Part 2: Cloud Server Setup (VPS / Docker / Nginx / SSL)](#part-2-cloud-server-setup-vps--docker--nginx--ssl)
  - [Part 3: Automated CI/CD Pipeline (GitHub Actions)](#part-3-automated-cicd-pipeline-github-actions)
- [Adding a New Screen (MVVM Guide)](#adding-a-new-screen-mvvm-guide)

---

## Tech Stack

| Library | Category | Version | Notes |
|---|---|---|---|
| **Expo** | Mobile Platform SDK | ~57.0.x | Expo SDK 52/57 compatible |
| **React Native** | Core Framework | 0.86.3 | New Architecture ready, Hermes engine |
| **React** | UI Runtime | 19.2.3 | React 19 concurrent features |
| **TypeScript** | Language | ~6.0.x | Strict mode |
| **MobX & mobx-react-lite** | State Management | ^7.0.3 / ^5.0.3 | Powers every ViewModel and global Store |
| **InversifyJS** | Dependency Injection | 6.0.2 | IoC Container in `app/di/container.ts` |
| **React Navigation** | Routing | ^7.x | `@react-navigation/native-stack` + `bottom-tabs` |
| **expo-updates** | OTA Updates | ~57.0.23 | Self-hosted manifest protocol v1 |
| **react-native-mmkv** | High-Speed Storage | 3.3.3 | Key-value storage backing auth and preferences |
| **react-i18next / i18next** | Internationalization | ^15.0.1 / ^23.14.0 | Fully dynamic dictionaries (`en.ts`, `vi.ts`) |
| **Apisauce** | Network Client | 3.1.1 | Axios wrapper encapsulated in `ApiService` |
| **expo-sqlite** | Local Database | ~57.0.3 | Embedded SQLite storage scaffold |
| **react-native-reanimated**| Animation Engine | 4.5.1 | Declarative native animations |

---

## Project Architecture & Directory Structure

```tree
rn
├── .env                           # Local environment config (OTA_SERVER_URL, OTA_PUBLISH_URL)
├── .env.example                   # Environment template committed to repository
├── app.config.js                  # Expo dynamic config (dynamically injects OTA updates.url)
├── app.json                       # Single Source of Truth for App Version, Runtime Version & Name
├── index.tsx                      # Application bootstrap & entry point
├── scripts/
│   └── publish.mjs                # Multi-platform OTA bundle exporter and upload tool
├── android/
│   ├── app/build.gradle           # Auto-reads versionCode, versionName, and EXPO_UPDATE_URL
│   └── app/src/main/AndroidManifest.xml # References dynamic manifest placeholders
├── app/
│   ├── di/                        # Inversify IoC container, types, and useViewModel hook
│   ├── data/                      # Repositories, remote API clients, and local storage (MMKV, SQLite)
│   ├── viewmodels/                # BaseViewModel (loading, error, DI repository) and screen ViewModels
│   ├── stores/                    # Global MobX singletons (authStore)
│   ├── screens/                   # Screens (LoginScreen, HomeScreen, TodoListScreen, SettingsScreen)
│   ├── navigators/                # AppNavigator, MainTabNavigator, navigation typings
│   ├── components/                # Reusable design system primitives (Screen, Button, Text, TextField)
│   ├── theme/                     # Dynamic themes, colors, typography, and ThemedStyle functions
│   ├── i18n/                      # Localization dictionaries (en.ts, vi.ts)
│   └── utils/                     # Formatting, storage helpers, and pure utilities
```

---

## Getting Started

### 1. Prerequisites
- **Node.js**: `v20.0.0` or higher
- **Package Manager**: `npm` or `pnpm`
- **Android SDK & JDK 17/11**: Set in your system environment (`ANDROID_HOME`)

### 2. Installation
```bash
npm install
```

### 3. Local Development
```bash
# Start Metro bundler with Expo dev client
npm run start

# Run Android native application
npm run android
```

---

## Over-The-Air (OTA) Update System

This project features a self-hosted OTA system allowing instant delivery of JavaScript bundles and asset updates directly to physical devices over 4G/5G/Wi-Fi **without waiting for app store approval or building a new native APK**.

### Publishing Mechanics (3-Step Pipeline)

When running `npm run ota:publish -- production`, the build script ([`scripts/publish.mjs`](file:///D:/RN/rn/scripts/publish.mjs)) executes three distinct steps:

1. **Metro Export (`npx expo export`)**:
   - Traverses the dependency graph starting from `index.tsx`.
   - Compiles TypeScript and JavaScript into optimized **Hermes Bytecode (`.hbc`)**.
   - Extracts all static assets (fonts, PNGs, SVGs) and computes their SHA-256 hashes.
   - Generates the root index manifest: `dist/metadata.json`.
2. **Package Compression**:
   - Compresses the contents of `dist/` into a temporary `export.zip` archive.
3. **HTTP Upload**:
   - Transmits the archive to the update server:
     - **Method**: `POST`
     - **Target URL**: `http://localhost:3001/publish?runtimeVersion=1.1.0&channel=production`
     - **Headers**:
       - `Content-Type: application/zip`
       - `x-publish-token: <PUBLISH_TOKEN>`
     - **Body**: Raw binary stream of `export.zip`.

---

### Remote Device Update Resolution

When an installed application launches, `expo-updates` performs the following handshake:

```text
Physical Device (4G/5G)                       OTA Server (Docker / Cloud)
       |                                                  |
       |--- 1. GET /api/manifest ------------------------>|
       |    Headers:                                      |
       |      expo-platform: android                      |
       |      expo-runtime-version: 1.1.0                 |
       |      expo-current-update-id: <UUID>              |
       |                                                  |
       |    [Server locates latest bundle for 1.1.0]      |
       |    [Compares manifestId with currentUpdateId]    |
       |                                                  |
       |    If currentUpdateId == manifestId:             |
       |<-- HTTP 200 Multipart Directive -----------------|
       |    { "type": "noUpdateAvailable" }               |
       |                                                  |
       |    If new update exists:                         |
       |<-- HTTP 200 Multipart Manifest ------------------|
       |    { id, launchAsset, assets, createdAt }        |
       |                                                  |
       |--- 2. GET /api/assets?asset=.../index.hbc ------>|
       |<-- HTTP 200 Binary Stream (Hermes bytecode) -----|
       |                                                  |
       | [App caches bundle locally and restarts]         |
```

---

### Runtime Version Matching & Safety Isolation

The server guarantees **Strict Version Isolation**:
- Updates published under `runtimeVersion: "1.1.0"` are stored exclusively in `updates/1.1.0/`.
- A client requesting `expo-runtime-version: 1.1.0` will **never** receive a bundle published under `1.2.0`.
- This prevents fatal runtime crashes caused by incompatible native modules or missing Java/Kotlin bridges.

---

### Update Eligibility: OTA vs. Native Rebuild

```
┌────────────────────────────────────────────────────────────────────────┐
│                        UPDATE ELIGIBILITY MATRIX                       │
├──────────────────────────────────┬─────────────────────────────────────┤
│   ✅ Allowed via OTA Update      │   ❌ Requires Full Native Rebuild   │
├──────────────────────────────────┼─────────────────────────────────────┤
│ • JavaScript & TypeScript logic  │ • Adding/updating native libraries  │
│ • React components & screens     │ • Modifying AndroidManifest.xml     │
│ • Styles, layout, and theming    │ • Changes to gradle, Java, Kotlin   │
│ • Localization (en.ts, vi.ts)    │ • Adding native device permissions  │
│ • Static assets (PNG, SVG, JPG)  │ • Upgrading React Native / Expo SDK │
└──────────────────────────────────┴─────────────────────────────────────┘
```

---

## Standard Developer Workflows

### Workflow 1: Publishing a JS/Asset OTA Update (No Native Rebuild)

Use this workflow for UI bug fixes, feature enhancements, translation changes, or styling adjustments.

1. **Modify Code**: Edit your components, screens, or i18n files (`app/i18n/vi.ts`, `app/i18n/en.ts`).
2. **Verify Version**: Ensure `runtimeVersion` in `app.json` matches the installed base (e.g., `"1.1.0"`).
3. **Execute Publish Command**:
   ```powershell
   npm run ota:publish -- production
   ```
4. **Verification**: Open the application on your physical device. The app downloads the update in the background and applies the changes.

---

### Workflow 2: Releasing a Native Update (APK/AAB Rebuild)

Use this workflow whenever you add native libraries, modify native permissions, or perform a major release.

1. **Update Version in [`app.json`](file:///D:/RN/rn/app.json)** (Single Source of Truth):
   ```json
   {
     "version": "1.2.0",
     "runtimeVersion": "1.2.0",
     "android": {
       "versionCode": 2
     }
   }
   ```
   > **Note**: Gradle automatically reads `versionCode` (2), `versionName` ("1.2.0"), and `EXPO_RUNTIME_VERSION` ("1.2.0") directly from `app.json`. You do not need to edit `build.gradle` or `strings.xml`.

2. **Build Release APK**:
   ```powershell
   cd android
   .\gradlew assembleRelease
   ```
   Output binary location: `android/app/build/outputs/apk/release/app-release.apk`

3. **Install / Distribute to Devices**:
   ```powershell
   adb install -r app/build/outputs/apk/release/app-release.apk
   ```

4. **Future OTA Updates for Version 1.2.0**:
   Publish subsequent JS updates with `runtimeVersion: "1.2.0"`.

---

## Production Deployment Runbook

### Part 1: Client Configuration (`rn`)

All server URLs and tokens are centralized in the project's [`.env`](file:///D:/RN/rn/.env) file:

```dotenv
# .env in D:\RN\rn\

# Public URL used by physical devices to fetch manifests & assets over 4G/5G
OTA_SERVER_URL=https://ota.mycompany.com

# Local URL for CLI publish script (direct local upload bypassing network throttling)
OTA_PUBLISH_URL=http://localhost:3001

# Shared secret authorization token
OTA_PUBLISH_TOKEN=mycompany-super-secret-ota-token-2026-xyz!@#
```

#### How the Single Source of Truth Operates:
1. **[`app.config.js`](file:///D:/RN/rn/app.config.js)**: Dynamically injects `OTA_SERVER_URL` into `updates.url` during bundling.
2. **[`android/app/build.gradle`](file:///D:/RN/rn/android/app/build.gradle)**: Reads `OTA_SERVER_URL` from `.env` and passes it to `manifestPlaceholders = [EXPO_UPDATE_URL: ...]`.
3. **[`android/app/src/main/AndroidManifest.xml`](file:///D:/RN/rn/android/app/src/main/AndroidManifest.xml)**: References `${EXPO_UPDATE_URL}` and `${EXPO_RUNTIME_VERSION}` dynamically.
4. **[`scripts/publish.mjs`](file:///D:/RN/rn/scripts/publish.mjs)**: Automatically reads `OTA_PUBLISH_URL` for instant local uploads.

> [!IMPORTANT]
> **Vital Note Regarding Native Binaries:**
> Because the OTA server URL is embedded in the native binary of the APK upon compilation, **after switching `OTA_SERVER_URL` to your official production domain, you must build and distribute a new APK/AAB (`assembleRelease`) to users for their initial installation**. All future updates will be delivered automatically over-the-air through `https://ota.mycompany.com`.

---

### Part 2: Cloud Server Setup (VPS / Docker / Nginx / SSL)

When deploying `ota-server` to a cloud server (Ubuntu/Debian on AWS, GCP, DigitalOcean, or Hetzner):

#### 1. Server Environment Configuration (`.env`)
Create `.env` in the root of `ota-server`:
```dotenv
PORT=3001
PUBLISH_TOKEN=mycompany-super-secret-ota-token-2026-xyz!@#
```

#### 2. Server Docker Compose (`docker-compose.yml`)
On a cloud server with a public static IP, the temporary `ota-tunnel` container is **not needed**. Run only the production `ota-server` container:

```yaml
services:
  ota-server:
    build: .
    container_name: ota-server
    restart: unless-stopped
    ports:
      - "3001:3001"
    environment:
      - PORT=3001
      - PUBLISH_TOKEN=${PUBLISH_TOKEN}
    volumes:
      # Crucial: Persists all published updates across container restarts
      - ./updates:/app/updates
```

Launch with:
```bash
docker compose up -d
```

#### 3. Nginx Reverse Proxy with SSL (Certbot)
Route public HTTPS port `443` to local container port `3001`:

```nginx
server {
    server_name ota.mycompany.com;

    # Allow up to 100MB zip file uploads during publishing
    client_max_body_size 100M;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }

    listen 443 ssl http2;
    ssl_certificate /etc/letsencrypt/live/ota.mycompany.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ota.mycompany.com/privkey.pem;
}
```

---

### Part 3: Automated CI/CD Pipeline (GitHub Actions)

To automate OTA deployment upon pushing or merging to the `main` branch:

#### 1. Configure Repository Secrets
In your GitHub repository settings (**Settings > Secrets and variables > Actions**), add:
- `OTA_SERVER_URL`: `https://ota.mycompany.com`
- `OTA_PUBLISH_TOKEN`: `mycompany-super-secret-ota-token-2026-xyz!@#`

#### 2. Workflow Definition (`.github/workflows/ota.yml`)
```yaml
name: Publish OTA Update

on:
  push:
    branches:
      - main

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Publish OTA Update
        env:
          OTA_PUBLISH_URL: ${{ secrets.OTA_SERVER_URL }}
          OTA_PUBLISH_TOKEN: ${{ secrets.OTA_PUBLISH_TOKEN }}
        run: npm run ota:publish -- production
```

---

## Adding a New Screen (MVVM Guide)

Follow `app/screens/Home/` as the canonical implementation pattern:

1. **Create Directory**: `app/screens/FeatureName/`
2. **ViewModel Implementation** (`FeatureNameViewModel.ts`):
   ```typescript
   import { injectable } from "inversify"
   import { actionBound, makeObservable, observable } from "mobx"
   import { BaseViewModel } from "@/viewmodels/base/BaseViewModel"

   @injectable()
   export class FeatureNameViewModel extends BaseViewModel {
     query = ""

     constructor() {
       super()
       makeObservable(this, {
         query: observable,
         isLoading: observable,
         error: observable,
         setQuery: actionBound,
       })
     }

     setQuery(value: string) {
       this.query = value
     }
   }
   ```
3. **Screen Implementation** (`FeatureNameScreen.tsx`):
   Resolve the ViewModel using `useViewModel(FeatureNameViewModel)` and wrap the component in `observer()`.
4. **Register DI Binding**: Add `bind(FeatureNameViewModel).toSelf()` in `app/di/modules/viewModelModule.ts`.
5. **Register Navigation Route**: Add route definition to `app/navigators/AppNavigator.tsx` and `navigationTypes.ts`.
