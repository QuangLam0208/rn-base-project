# base-react-native — MVVM + Ignite Base

A reusable React Native starting point: [Ignite](https://github.com/infinitered/ignite)'s
Expo stack (navigation, theming, i18n, MMKV, apisauce) with an MVVM
layer (`BaseViewModel`, MobX) and InversifyJS dependency injection on
top — mirroring the Dagger 2 `AppComponent` pattern from the
`source-base-android` reference project — so new projects don't start
from scratch.

There is no login/auth screen and no business feature in this
project — it's meant to be copied as a starting point, not stripped
down from a real app. The app opens through a `Splash` screen and
resets straight into a single-tab bottom navigation (`Home`), which
shows a minimal MVVM example (a counter) and a gear icon to the
stack-pushed `Settings` screen (language/theme/OTA update). See
CLAUDE.md for the full architecture writeup.

`authStore` and `Api`'s Bearer-token attachment are kept even though
nothing sets a token yet — they're the plumbing a real login screen
would plug into later (see CLAUDE.md's DI section).

## Tech Stack

| Library | Category | Version | Notes |
|---|---|---|---|
| Expo | Framework/SDK | 54.0.37 | See note below on why SDK 54, not 55 |
| React Native | Mobile framework | 0.81.5 | |
| React | UI framework | 19.1.0 | |
| TypeScript | Language | ~5.9.2 | strict mode |
| MobX + mobx-react-lite | State (MVVM) | ^7.0.3 / ^5.0.3 | Powers every ViewModel + `authStore` |
| InversifyJS | Dependency injection | 6.0.2 | `app/di/container.ts` — see CLAUDE.md's DI section |
| React Navigation | Navigation | ^7.x | native-stack + bottom-tabs |
| apisauce | REST client | 3.1.1 | Wrapped by `ApiService` |
| expo-sqlite | Local SQLite | 16.0.10 | `app/data/local/room/` — scaffold, not wired into any screen yet |
| react-native-mmkv | Local storage | 3.3.3 | `app/data/local/storage`, backs `authStore` |
| react-i18next / i18next | i18n | ^15.0.1 / ^23.14.0 | `app/i18n/en.ts` + `vi.ts`, Vietnamese is the default locale |
| react-native-reanimated | Animation | 4.1.7 | |
| react-native-keyboard-controller | Keyboard handling | 1.18.5 | Used by the `Screen` component |

**Why Expo SDK 54, not 55:** SDK 55's `expo-modules-core` requires Swift
6.2, which this machine's Xcode (16.4, Swift 6.1.2) cannot compile. SDK
54 is the highest version compatible with that toolchain. Revisit this
once Xcode ships a Swift 6.2-capable release.

## Getting Started

This project was copied from an existing app and stripped of its
business-specific parts — a few things need to be redone for a new
project:

1. `pnpm install` (there's no committed lockfile yet).
2. Rename the app further if needed: `app.json`'s `name`/`slug`/`scheme`,
   `ios.bundleIdentifier`, `android.package` are currently `BaseApp`/
   `com.baseapp`.
3. If you want OTA updates (`expo-updates`) or EAS builds, run `eas init`
   yourself — this project has no `extra.eas.projectId`/`updates.url`
   configured (deliberately, since those are tied to a specific Expo
   account/project).
4. If you want crash reporting (`@react-native-firebase/crashlytics`),
   register the app in your own Firebase console and drop in your own
   `google-services.json`/`GoogleService-Info.plist` — see CLAUDE.md's
   "Logging and crash reporting" section.

```bash
pnpm install
pnpm run start
```

To build for the iOS simulator on a Mac:

```bash
LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 npx expo run:ios
```

(The `LANG` env vars work around a CocoaPods encoding bug that surfaces
on some machines during `pod install`.)

## Project Structure

```tree
app
├── di/
│   ├── container.ts               # composition root — new Container() + container.load(...modules)
│   ├── types.ts                    # Symbol tokens for interface bindings (e.g. TYPES.ApiService)
│   ├── useViewModel.ts             # container.get() through a useState() hook, for screens
│   └── modules/                     # ContainerModules (dataModule, viewModelModule) — see CLAUDE.md
├── data/
│   ├── Repository.ts                    # interface: { apiService; roomService; storageService } — see CLAUDE.md
│   ├── AppRepositoryImpl.ts              # impl; property-injected onto BaseViewModel as repository
│   ├── remote/api/                       # Api client + ApiService (empty interface) + ApiServiceImpl (request() helper)
│   │   └── master/                        # second base URL demo: MasterApiService(Impl) — see CLAUDE.md
│   ├── model/api/
│   │   └── ResponseWrapper.ts, PageResponse.ts   # generic envelope DTOs — add item/ and response/ subfolders as you add endpoints
│   └── local/
│       ├── room/                          # AppDatabase/RoomService(Impl)/UserDao(Impl) — SQLite scaffold, see CLAUDE.md
│       └── storage/                       # MMKV load/save/remove + StorageService (DI wrapper)
├── viewmodels/
│   └── base/
│       └── BaseViewModel.ts     # isLoading/error + runAction() + protected repository — every screen ViewModel extends this
├── stores/
│   └── authStore.ts               # MobX singleton — token + username; unused until a real login screen sets it
├── screens/
│   ├── Splash/                     # AppNavigator's initialRouteName — no auth gate, resets straight to MainTabs
│   ├── Home/                       # the one example tab — copy this pattern for new screens
│   │   ├── HomeScreen.tsx            # View + styles in one file: JSX + observer(), no business logic
│   │   └── HomeViewModel.ts           # All screen logic/state (MobX) — a minimal counter example
│   ├── Settings/                    # stack-pushed (not a tab): language/theme/OTA update, no ViewModel
│   └── ErrorScreen/                    # Ignite's built-in error boundary UI, unchanged
├── navigators/                          # AppNavigator (Splash/MainTabs/Settings) + MainTabNavigator (one Home tab)
├── components/                           # Shared UI (Screen, Text, Button, Icon, TextField, ...)
├── theme/                                 # colors, spacing, typography — ThemedStyle functions
├── i18n/                                   # en.ts / vi.ts + translate()
├── config/                                 # env-specific config (API_URL, exitRoutes, ...)
├── devtools/                                # Reactotron setup
└── utils/                                   # date formatting, etc. — no data-layer code here
```

Native code (`ios/`, `android/`) is generated by Expo prebuild — don't
hand-edit it, it's regenerated and gitignored.

## Adding a New Screen (MVVM)

Follow `app/screens/Home/` as the worked example. To add a screen called `Wishlist`:

1. **Create the folder:** `app/screens/Wishlist/`
2. **`WishlistViewModel.ts`** — the logic, extending `BaseViewModel`:

   ```typescript
   import { injectable } from "inversify"
   import { actionBound, makeObservable, observable } from "mobx"

   import { BaseViewModel } from "@/viewmodels/base/BaseViewModel"

   @injectable()
   export class WishlistViewModel extends BaseViewModel {
     name = ""

     constructor() {
       super() // BaseViewModel property-injects `this.repository` — nothing to pass here
       // makeAutoObservable rejects classes with a superclass — always use
       // makeObservable with explicit annotations here, covering both this
       // class's own fields and the inherited isLoading/error.
       makeObservable(this, {
         name: observable,
         isLoading: observable,
         error: observable,
         setName: actionBound,
       })
     }

     setName(value: string) {
       this.name = value
     }
   }
   ```

   Use `actionBound` (not plain `action`) for methods that get passed
   directly to event props (e.g. `onChangeText={viewModel.setName}`) —
   it auto-binds `this`, so the handler works without a manual
   `.bind(viewModel)` at the call site. Plain `action` methods are only
   safe when called from an inline arrow function. This is the same
   annotation MobX's docs call `action.bound`, exposed here as the
   named export `actionBound` — the installed mobx version in this
   project doesn't attach `.bound` to the `action` function at runtime,
   so import `actionBound` directly instead.

   If the screen calls an API: add its endpoint signature to
   `app/data/remote/api/ApiService.ts` (currently an empty interface),
   give it a domain shape under `data/model/api/item/` and a wire DTO
   under `data/model/api/response/<domain>/` if needed, and implement
   it in `ApiServiceImpl.ts` (see the worked example in that file's own
   doc comment) rather than creating a new repository class.
   `this.repository.apiService` is already available (property-injected by
   `BaseViewModel` via the shared `Repository` — see CLAUDE.md's DI
   section) — just call it from
   `this.runAction(async () => { ... })`.

3. **`WishlistScreen.tsx`** — the View **and** its styles, in one file:
   resolve the ViewModel with `useViewModel(WishlistViewModel)`
   (`@/di/useViewModel`), wrap the component in `observer()` from `mobx-react-lite`, render
   from the ViewModel's observable fields, and apply styles via
   `themed($name)` — with the `$name: ThemedStyle<T>` constants declared
   below the component in the same file (see `Home/HomeScreen.tsx`).
   There's no separate `style.ts`/`index.tsx`.
4. **Register the route** in `app/navigators/MainTabNavigator.tsx` (for a
   tab) or `app/navigators/AppNavigator.tsx` (for a stack-only screen),
   importing from `@/screens/Wishlist/WishlistScreen` (not the folder
   path — there's no `index.tsx` to resolve implicitly), and add the
   corresponding entry to `app/navigators/navigationTypes.ts`.
5. **Add its ViewModel binding** to `app/di/modules/viewModelModule.ts`
   (`bind(WishlistViewModel).toSelf()`).
6. **Add i18n keys** to both `app/i18n/en.ts` and `app/i18n/vi.ts`.

A piece of UI worth its own file but only used by one screen (a grown
`renderItem`, a repeated block) goes in a local `components/` subfolder
next to that screen — see CLAUDE.md's sub-component convention.
Promote it to the shared `app/components/` only once a second screen
needs it.
