# BaseApp — React Native MVVM + Self-Hosted OTA Updates

A production-grade React Native base project: built on [Ignite](https://github.com/infinitered/ignite)'s Expo stack (theming, i18n, MMKV, Apisauce) combined with a clean **MVVM architecture** (`BaseViewModel`, MobX) and **InversifyJS** Dependency Injection — paired with a fully **self-hosted Over-The-Air (OTA) update system** compliant with the Expo Updates Protocol (v1).

---

## Tech Stack

| Library | Category | Version | Notes |
|---|---|---|---|
| **Expo** | Mobile Platform SDK | ~57.0.x | |
| **React Native** | Core Framework | 0.86.3 | Hermes engine, New Architecture ready |
| **TypeScript** | Language | ~6.0.x | Strict mode |
| **MobX & mobx-react-lite** | State Management | ^7.0.3 / ^5.0.3 | Powers every ViewModel and global Store |
| **InversifyJS** | Dependency Injection | 6.0.2 | IoC container in `app/di/container.ts` |
| **React Navigation** | Routing | ^7.x | Native stack + bottom tabs |
| **expo-updates** | OTA Updates | ~57.0.23 | Self-hosted manifest protocol v1, RSA code signing |
| **react-native-mmkv** | High-Speed Storage | 3.3.3 | Key-value storage for auth and preferences |
| **react-i18next / i18next** | Internationalization | ^15.0.1 / ^23.14.0 | Dynamic dictionaries (`en.ts`, `vi.ts`) |
| **Apisauce** | Network Client | 3.1.1 | Axios wrapper in `ApiService` |
| **expo-sqlite** | Local Database | ~57.0.3 | Embedded SQLite storage |

---

## Project Structure

```
rn/
├── app.json                  # App version, runtimeVersion, OTA + code signing config
├── .env                      # OTA_SERVER_URL, OTA_PUBLISH_URL, OTA_PUBLISH_TOKEN
├── keys/
│   └── certificate.pem       # Public cert for OTA code signing (embedded at build time)
├── scripts/
│   └── publish.js            # OTA publish script (expo export → zip → POST /publish)
├── app/
│   ├── di/                   # Inversify IoC container, types, useViewModel hook
│   ├── data/                 # Repositories, API clients, local storage (MMKV, SQLite)
│   ├── viewmodels/           # BaseViewModel and screen ViewModels
│   ├── stores/               # Global MobX singletons (authStore)
│   ├── screens/              # LoginScreen, HomeScreen, TodoListScreen, SettingsScreen
│   ├── navigators/           # AppNavigator, MainTabNavigator, navigation types
│   ├── components/           # Design system primitives (Screen, Button, Text, TextField)
│   ├── theme/                # Dynamic themes, colors, typography
│   ├── i18n/                 # Localization dictionaries (en.ts, vi.ts)
│   └── utils/                # AppUpdates.ts, formatting, storage helpers
```

---

## Getting Started

**Prerequisites:** Node.js ≥ 20, Android SDK + JDK 17/11 (`ANDROID_HOME` set).

```bash
npm install       # install dependencies
npm run start     # start Metro bundler
npm run android   # run on Android device/emulator (dev client)
```

---

## OTA Update System

This project ships with a self-hosted OTA system — deliver JS/asset updates directly to installed devices **without app store review or a native rebuild**.

### Quick workflow

```bash
# 1. Publish a JS change
pnpm run ota:publish production

# 2. Open the app on your device (twice if fallbackToCacheTimeout is 0; once if set to 5000)
```

### Detailed documentation

| Document | Contents |
|---|---|
| [`docs/OTA_SERVER.md`](docs/OTA_SERVER.md) | Server API, Docker setup, rollback, storage layout, troubleshooting |
| [`docs/OTA_CLIENT_SETUP.md`](docs/OTA_CLIENT_SETUP.md) | `app.json` config, publish script, `checkForUpdate()` utility, day-to-day workflow |
| [`docs/OTA_CODE_SIGNING.md`](docs/OTA_CODE_SIGNING.md) | RSA key generation, server signing, app verification, key rotation |

---

## Adding a New Screen (MVVM Guide)

Follow `app/screens/Home/` as the canonical pattern:

1. **Create directory** `app/screens/FeatureName/`
2. **ViewModel** (`FeatureNameViewModel.ts`): extend `BaseViewModel`, decorate with `@injectable()`, declare observables with `makeObservable`.
3. **Screen** (`FeatureNameScreen.tsx`): resolve the ViewModel via `useViewModel(FeatureNameViewModel)`, wrap component in `observer()`.
4. **Register DI binding**: add `bind(FeatureNameViewModel).toSelf()` in `app/di/modules/viewModelModule.ts`.
5. **Register route**: add definition to `app/navigators/AppNavigator.tsx` and `navigationTypes.ts`.
