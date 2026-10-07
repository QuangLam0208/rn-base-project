# PHÁT TRIỂN & PHÂN PHỐI REUSABLE NATIVE MODULE TRONG REACT NATIVE

---

## MỤC LỤC
1. [Quy Trình Triển Khai](#1-quy-trình-triển-khai)
   * [Giai đoạn 1: Khởi tạo Scaffold Thư viện Chuẩn](#giai-đoạn-1-khởi-tạo-scaffold-thư-viện-chuẩn)
   * [Giai đoạn 2: Hiện thực hóa Tầng Native (Android Java/Kotlin)](#giai-đoạn-2-hiện-thực-hóa-tầng-native-android-javakotlin)
   * [Giai đoạn 3: Hiện thực hóa Tầng Type-Safe Wrapper (TypeScript)](#giai-đoạn-3-hiện-thực-hóa-tầng-type-safe-wrapper-typescript)
   * [Giai đoạn 4: Kiểm thử Cục bộ](#giai-đoạn-4-kiểm-thử-cục-bộ)
   * [Giai đoạn 5: Đóng gói & Phân phối qua Git Repository](#giai-đoạn-5-đóng-gói--phân-phối-qua-git-repository)
   * [Đầu ra bắt buộc của Quy trình Triển khai](#đầu-ra-bắt-buộc-của-quy-trình-triển-khai-deliverables--artifacts)
2. [Quy Trình Tích Hợp Vào Ứng Dụng Consumer](#2-quy-trình-tích-hợp-vào-ứng-dụng-consumer)
   * [2.1. Phương pháp 1: Tích hợp qua Git Remote URL](#21-phương-pháp-1-tích-hợp-qua-git-remote-url-github--gitlab)
   * [2.2. Phương pháp 2: Tích hợp qua Local File Path (Dev & Debug nhanh)](#22-phương-pháp-2-tích-hợp-qua-local-file-path-phù-hợp-dev--debug-nhanh)
   * [2.3. Phương pháp 3: Tích hợp qua Monorepo Workspace](#23-phương-pháp-3-tích-hợp-qua-monorepo-workspace)
   * [2.4. Phương pháp 4: Tích hợp qua Private NPM Registry](#24-phương-pháp-4-tích-hợp-qua-private-npm-registry)
   * [2.5. Triển khai trong Tầng Giao Diện (UI Implementation)](#25-triển-khai-trong-tầng-giao-diện-ui-implementation)
3. [Đặc Tả Kỹ Thuật & Quản Lý Rủi Ro](#3-đặc-tả-kỹ-thuật--quản-lý-rủi-ro)

---
## 1. QUY TRÌNH TRIỂN KHAI

### Giai đoạn 1: Khởi tạo Scaffold Thư viện Chuẩn

Sử dụng bộ công cụ tiêu chuẩn cộng đồng `create-react-native-library` để thiết lập:

```bash
npx create-react-native-library@latest react-native-device-helper
```

**Thông số cấu hình:**
* **Package name:** `react-native-device-helper`
* **Library type:** `Turbo module` *(Hỗ trợ song song cả New Architecture TurboModule lẫn Backward Compatibility Bridge)*
* **Native languages:** `Kotlin & Objective-C` *(Hỗ trợ biên dịch đồng thời mã nguồn Java thuần)*
* **Example app:** `App with Expo CLI` *(Tối ưu hóa quy trình kiểm thử nội bộ)*
* **Quality tooling:** `ESLint, Prettier, Jest, Lefthook, Commitlint`


Thực hiện cài đặt dependencies gốc để nạp type definitions:
```bash
corepack yarn install
```

**Cấu trúc thư mục sau khởi tạo:**
```text
react-native-device-helper/
├── android/                             <-- Module Android độc lập
│   ├── build.gradle                     <-- Định nghĩa SDK compile & dependencies
│   └── src/main/java/com/devicehelper/
│       ├── DeviceHelperModule.java      <-- Business logic (RAM, Battery, Toast, Events)
│       └── DeviceHelperPackage.java     <-- ReactPackage interface cho Autolinking
├── ios/                                 <-- Module iOS (Podspec & Native code)
├── src/                                 <-- TypeScript Specification & Public APIs
│   ├── NativeDeviceHelper.ts            <-- Codegen Spec Interface
│   └── index.tsx                        <-- Public API Wrapper & Typings
├── example/                             <-- Ứng dụng kiểm thử độc lập
├── lib/                                 <-- Mã nguồn JS/D.TS đã biên dịch (Phục vụ phân phối)
└── package.json                         <-- Khai báo metadata và export maps
```

---

### Giai đoạn 2: Hiện thực hóa Tầng Native (Android Java/Kotlin)

> **Quy tắc:** Khi chuyển đổi sang Java, cần loại bỏ các file template `.kt` mặc định có cùng định danh lớp (`DeviceHelperModule.kt`, `DeviceHelperPackage.kt`) nhằm loại trừ lỗi `Duplicate class` trong quá trình Java compilation.

#### 1. Định nghĩa Module Logic: `DeviceHelperModule.java`
Đường dẫn: `android/src/main/java/com/devicehelper/DeviceHelperModule.java`

* **Quy chuẩn kế thừa:** `ReactContextBaseJavaModule`.
* **Quản lý luồng (Threading):** Các tác vụ can thiệp giao diện (Toast, Dialog) bắt buộc thực thi trên Android UI Thread thông qua `UiThreadUtil.runOnUiThread(...)`. Các tác vụ tính toán nặng hoặc đọc dữ liệu hệ thống thực thi trên background queue và trả về dữ liệu qua `Promise`.
* **Cơ chế Event Emitter:** Tích hợp `DeviceEventManagerModule.RCTDeviceEventEmitter` để dispatch sự kiện thời gian thực từ phần cứng lên tầng JS.

```java
package com.devicehelper;

import android.app.ActivityManager;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.BatteryManager;
import android.os.Build;
import android.widget.Toast;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.UiThreadUtil;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.util.HashMap;
import java.util.Map;

public class DeviceHelperModule extends ReactContextBaseJavaModule {

    private final ReactApplicationContext reactContext;

    public DeviceHelperModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @NonNull
    @Override
    public String getName() {
        return "DeviceHelperModule";
    }

    // 1. Cung cấp hằng số hệ thống đọc đồng bộ khi khởi tạo
    @Override
    public Map<String, Object> getConstants() {
        Map<String, Object> constants = new HashMap<>();
        constants.put("ANDROID_VERSION", Build.VERSION.RELEASE);
        constants.put("SDK_INT", Build.VERSION.SDK_INT);
        constants.put("MANUFACTURER", Build.MANUFACTURER);
        constants.put("MODEL", Build.MODEL);
        return constants;
    }

    // 2. Tác vụ bất đồng bộ: Thu thập số liệu RAM & Trạng thái Pin qua Promise
    @ReactMethod
    public void getHardwareInfo(Promise promise) {
        try {
            // Đọc thông số RAM hệ thống
            ActivityManager actManager = (ActivityManager) reactContext.getSystemService(Context.ACTIVITY_SERVICE);
            ActivityManager.MemoryInfo memInfo = new ActivityManager.MemoryInfo();
            if (actManager != null) {
                actManager.getMemoryInfo(memInfo);
            }
            double totalRamMb = memInfo.totalMem / (1024.0 * 1024.0);
            double availRamMb = memInfo.availMem / (1024.0 * 1024.0);

            // Đọc trạng thái Pin & Nguồn sạc
            IntentFilter filter = new IntentFilter(Intent.ACTION_BATTERY_CHANGED);
            Intent batteryStatus = reactContext.registerReceiver(null, filter);
            int level = batteryStatus != null ? batteryStatus.getIntExtra(BatteryManager.EXTRA_LEVEL, -1) : -1;
            int scale = batteryStatus != null ? batteryStatus.getIntExtra(BatteryManager.EXTRA_SCALE, -1) : -1;
            int batteryPct = (level >= 0 && scale > 0) ? (level * 100) / scale : -1;

            int status = batteryStatus != null ? batteryStatus.getIntExtra(BatteryManager.EXTRA_STATUS, -1) : -1;
            boolean isCharging = status == BatteryManager.BATTERY_STATUS_CHARGING ||
                                 status == BatteryManager.BATTERY_STATUS_FULL;

            // Đóng gói WritableMap truyền qua Bridge
            WritableMap map = Arguments.createMap();
            map.putDouble("totalRamMb", Math.round(totalRamMb));
            map.putDouble("availRamMb", Math.round(availRamMb));
            map.putInt("batteryLevel", batteryPct);
            map.putBoolean("isCharging", isCharging);
            map.putString("manufacturer", Build.MANUFACTURER);
            map.putString("model", Build.MODEL);
            map.putString("androidVersion", Build.VERSION.RELEASE);

            promise.resolve(map);
        } catch (Exception e) {
            promise.reject("HARDWARE_ERROR", "Lỗi truy xuất phần cứng thiết bị: " + e.getMessage(), e);
        }
    }

    // 3. Tác vụ giao diện: Điều hướng hiển thị thông báo Toast trên Main Thread
    @ReactMethod
    public void showToast(String message, int duration) {
        UiThreadUtil.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                int toastDuration = (duration == 1) ? Toast.LENGTH_LONG : Toast.LENGTH_SHORT;
                Toast.makeText(reactContext, message, toastDuration).show();
            }
        });
    }

    // 4. Phát tín hiệu sự kiện hai chiều (Native -> JS)
    @ReactMethod
    public void triggerNativePing(String customNote) {
        WritableMap eventData = Arguments.createMap();
        eventData.putString("message", "Ping từ Android: " + customNote);
        eventData.putDouble("timestamp", (double) System.currentTimeMillis());

        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
            .emit("onDeviceHelperPing", eventData);
    }

    // Bắt buộc tuân thủ giao thức NativeEventEmitter
    @ReactMethod
    public void addListener(String eventName) {}

    @ReactMethod
    public void removeListeners(Integer count) {}
}
```

#### 2. Định nghĩa Package Registry: `DeviceHelperPackage.java`
Đường dẫn: `android/src/main/java/com/devicehelper/DeviceHelperPackage.java`

Hiện thực hóa `ReactPackage` interface làm đầu mối cho trình phân giải Autolinking:

```java
package com.devicehelper;

import androidx.annotation.NonNull;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class DeviceHelperPackage implements ReactPackage {

    @NonNull
    @Override
    public List<NativeModule> createNativeModules(@NonNull ReactApplicationContext reactContext) {
        List<NativeModule> modules = new ArrayList<>();
        
        // 1. Đăng ký Module chính: RAM, Pin, Toast, Event Emitter
        modules.add(new DeviceHelperModule(reactContext));

        // 2. Đăng ký các Module Native khác nếu có thêm tính năng (VD: Cảm biến, Bluetooth, Bảo mật)
        // modules.add(new SensorHelperModule(reactContext));
        // modules.add(new BluetoothHelperModule(reactContext));
        // modules.add(new NetworkSecurityModule(reactContext));

        return modules;
    }

    @NonNull
    @Override
    public List<ViewManager> createViewManagers(@NonNull ReactApplicationContext reactContext) {
        // Trả về danh sách Native Custom Views nếu có (VD: Custom CameraView, VideoView)
        return Collections.emptyList();
    }
}
```

---

### Giai đoạn 3: Hiện thực hóa Tầng Type-Safe Wrapper (TypeScript)

Đường dẫn: `src/index.tsx`

* **Cơ chế Proxy Fail-safe:** Cung cấp thông báo lỗi minh bạch nếu lập trình viên quên build native binary trước khi chạy JavaScript.
* **Xử lý Listener Cleanup:** Định dạng callback trả về hàm `unsubscribe()` nhằm phòng tránh rò rỉ bộ nhớ (Memory Leak) trong React lifecycle.
* **Xử lý tương thích kiểu dữ liệu `TS2345`:** Chuẩn hóa kiểu signature của `NativeEventEmitter.addListener`.

```typescript
import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

export { multiply } from './multiply';

const LINKING_ERROR =
  `Thư viện 'react-native-device-helper' chưa được liên kết mã nguồn Native!\n\n` +
  Platform.select({ ios: "- Kiểm tra bước thực thi 'pod install' trên iOS.\n", default: '' }) +
  '- Hãy đảm bảo ứng dụng đã được build lại nhị phân (native binary).\n';

const DeviceHelperModule = NativeModules.DeviceHelperModule
  ? NativeModules.DeviceHelperModule
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

export interface HardwareInfo {
  totalRamMb: number;
  availRamMb: number;
  batteryLevel: number;
  isCharging: boolean;
  manufacturer: string;
  model: string;
  androidVersion: string;
}

export interface DeviceConstants {
  ANDROID_VERSION: string;
  SDK_INT: number;
  MANUFACTURER: string;
  MODEL: string;
}

// 1. Đọc hằng số cấu hình tĩnh
export const getDeviceConstants = (): DeviceConstants | null => {
  if (Platform.OS !== 'android') return null;
  return {
    ANDROID_VERSION: DeviceHelperModule.ANDROID_VERSION,
    SDK_INT: DeviceHelperModule.SDK_INT,
    MANUFACTURER: DeviceHelperModule.MANUFACTURER,
    MODEL: DeviceHelperModule.MODEL,
  };
};

// 2. Thu thập thông tin phần cứng qua Promise
export const getHardwareInfo = async (): Promise<HardwareInfo> => {
  return await DeviceHelperModule.getHardwareInfo();
};

// 3. Kích hoạt Toast UI trên Android
export const showToast = (message: string, isLong = false): void => {
  if (Platform.OS === 'android') {
    DeviceHelperModule.showToast(message, isLong ? 1 : 0);
  }
};

// 4. Kích hoạt phát tín hiệu từ Native
export const triggerNativePing = (note: string): void => {
  DeviceHelperModule.triggerNativePing(note);
};

// 5. Đăng ký theo dõi sự kiện với hàm dọn dẹp bộ nhớ tự động
let eventEmitter: NativeEventEmitter | null = null;
if (DeviceHelperModule) {
  eventEmitter = new NativeEventEmitter(DeviceHelperModule);
}

export const subscribeToDevicePing = (
  callback: (event: { message: string; timestamp: number }) => void
): (() => void) => {
  if (!eventEmitter) return () => {};
  const subscription = eventEmitter.addListener(
    'onDeviceHelperPing',
    (event: any) => callback(event)
  );
  return () => {
    subscription.remove();
  };
};
```

---

### Giai đoạn 4: Kiểm thử Cục bộ (Automated Check & Example App)

Trước khi phát hành, tiến hành thẩm định hai tầng:

1. **Kiểm tra kiểu dữ liệu tĩnh:**
   ```bash
   corepack yarn typecheck
   ```
2. **Kiểm thử trên ứng dụng mẫu tích hợp (`example/`):**
   ```bash
   corepack yarn example android
   ```

---

### Giai đoạn 5: Đóng gói & Phân phối qua Git Repository

> **Phạm vi áp dụng:**  
> * **Giai đoạn phát triển cục bộ (Local Dev / Debug):** Nếu chỉ đang phát triển và kiểm thử module trên máy tính cá nhân bằng đường dẫn tương đối (Phương pháp 2: `file:`), việc đẩy mã lên Remote Git là **tùy chọn (Optional)**.  
> * **Giai đoạn bàn giao & phân phối (Team Distribution / CI/CD):** Khi cần chia sẻ thư viện cho các thành viên hoặc cấu hình máy chủ tự động build APK (Phương pháp 1: Git URL), việc đóng gói và đẩy lên Git Remote là **bắt buộc (Mandatory)**.

Khi phân phối thư viện thông qua Remote Git URL (không qua public registry như npmjs), các package managers hiện đại (đặc biệt là `pnpm`) kích hoạt cơ chế bảo mật chặn thực thi build scripts (`ERR_PNPM_GIT_DEP_PREPARE_NOT_ALLOWED`). 

**Quy trình chuẩn hóa để đóng gói và phân phối qua Git:**

1. **Cấu hình `.gitignore` của thư viện:**  
   Bỏ qua việc ignore thư mục `lib/` để Git theo dõi toàn bộ JavaScript bundles và TypeScript definition files đã biên dịch:
   ```gitignore
   # Tracked for Git distribution
   # lib/
   ```

2. **Cấu hình `package.json` của thư viện:**  
   Tách biệt lifecycle script: chuyển `"prepare": "bob build"` thành `"build": "bob build"` và `"prepack": "bob build"`. Quy chuẩn này đảm bảo các ứng dụng consumer khi kéo mã nguồn qua Git không phải tự chạy lại build tool:
   ```json
   "scripts": {
     "clean": "del-cli lib",
     "build": "bob build",
     "prepack": "bob build",
     "typecheck": "tsc"
   }
   ```

3. **Thực thi biên dịch và xuất bản lên Git:**
   ```bash
   # Bước 1: Biên dịch mã nguồn ra thư mục lib/
   corepack yarn build

   # Bước 2: Commit mã nguồn kèm artifacts đã build
   git add .gitignore package.json lib
   git commit -m "build: compile lib bundle and configure scripts for git distribution"

   # Bước 3: Đẩy lên Git Repository trung tâm (chỉ cần khi phân phối qua Git)
   git push origin main
   ```

---

### Đầu ra bắt buộc của Quy trình Triển khai (Deliverables & Artifacts)

Sau khi hoàn tất quy trình triển khai module, sản phẩm kỹ thuật bàn giao bao gồm các thành phần artifacts sau:

| Thành phần Deliverable | Quy cách & Vị trí Artifact | Tiêu chuẩn Nghiệm thu Kỹ thuật | Mức độ Bắt buộc |
| :--- | :--- | :--- | :--- |
| **1. Mã nguồn Native Độc lập** | `android/src/main/java/.../` | • Kế thừa `ReactContextBaseJavaModule` và triển khai `ReactPackage`.<br>• Không tồn tại đồng thời file `.kt` và `.java` trùng tên (loại bỏ duplicate class).<br>• Tác vụ can thiệp UI (Toast, Dialog) bắt buộc bọc qua `UiThreadUtil.runOnUiThread`. | **Bắt buộc 100%** |
| **2. Bundle Biên dịch sẵn (`lib/`)** | `lib/module/` (JavaScript ESM)<br>`lib/typescript/` (Type definitions `.d.ts`) | • Được sinh tự động bởi lệnh `corepack yarn build` (react-native-builder-bob).<br>• Thư mục `lib/` được mở theo dõi trong `.gitignore` để sẵn sàng phân phối. | **Bắt buộc 100%** |
| **3. Cấu hình Phân phối (`package.json`)** | `package.json` | • Khai báo entry points: `"main": "./lib/module/index.js"`, `"types": "./lib/typescript/src/index.d.ts"`.<br>• Trường `"files"` bao gồm đầy đủ `["src", "lib", "android", "ios", ...]`.<br>• Tách script: Chuyển `"prepare": "bob build"` sang `"build"` / `"prepack"` để phòng ngừa lỗi bảo mật PNPM. | **Bắt buộc 100%** |
| **4. Kho lưu trữ Phân phối (Remote Repo)** | Git Repository (GitHub / GitLab) | • Push hoàn tất lên branch `main` hoặc gắn tag phiên bản SemVer (`v0.1.0`), sẵn sàng nạp qua Git URL cho toàn bộ team và CI/CD. | • **Bắt buộc** nếu dùng *Phương pháp 1 (Git URL)*.<br>• *Không bắt buộc* nếu dùng *Phương pháp 2 (Local File Path)*. |
| **5. Ứng dụng Kiểm thử Cục bộ (`example/`)** | `example/` (Expo / React Native App) | • Khởi chạy độc lập (`corepack yarn example android`) đạt kết quả kiểm thử toàn bộ tính năng Native trước khi cung cấp cho các ứng dụng consumer. | **Bắt buộc 100%** |

---

## 2. QUY TRÌNH TÍCH HỢP VÀO ỨNG DỤNG CONSUMER

Cơ chế **Autolinking** của React Native tự động nhận diện `DeviceHelperPackage` trong `node_modules` cho tất cả các phương pháp cài đặt dưới đây mà **hoàn toàn không cần can thiệp bất kỳ file nào trong thư mục `android/` hoặc `ios/`** của ứng dụng (không cần chỉnh sửa `MainApplication.kt`, `settings.gradle` hay `build.gradle`).

---

### 2.1. Phương pháp 1: Tích hợp qua Git Remote URL (GitHub / GitLab)
Phương pháp phân phối nhanh chóng, linh hoạt giữa nhiều kho lưu trữ độc lập mà không yêu cầu thiết lập máy chủ package registry riêng.

* **Chính sách Bảo mật (Private vs Public Repository):**  
  Thư viện **HOÀN TOÀN KHÔNG BẮT BUỘC PHẢI PUBLIC**. Trong môi trường doanh nghiệp, toàn bộ các module nội bộ đều được thiết lập ở chế độ **Private Repository** (GitHub, GitLab nội bộ, Bitbucket) để bảo vệ tài sản trí tuệ.  
  *Bản chất cơ chế:* Trình quản lý gói `pnpm` ủy quyền trực tiếp cho Git client của hệ điều hành thực hiện tác vụ `clone`/`fetch`. Do đó, bất kỳ môi trường nào có quyền đọc vào Private Repo đều có thể cài đặt và cập nhật bình thường.

* **Cơ chế Xác thực (Authentication) cho Private Repo:**
  1. **Xác thực qua SSH Key (Khuyến nghị chuẩn cho Kỹ sư):**
     ```bash
     pnpm add git+ssh://git@github.com:QuangLam0208/react-native-device-helper.git
     # Hoặc cú pháp rút gọn:
     pnpm add git@github.com:QuangLam0208/react-native-device-helper.git
     ```
     *Ưu điểm:* Tự động xác thực qua SSH Agent cục bộ (`~/.ssh/id_ed25519` hoặc `id_rsa`), an toàn tuyệt đối và không lưu token nhạy cảm trong mã nguồn.
  2. **Xác thực qua HTTPS với Git Credential Manager (GCM):**
     ```bash
     pnpm add git+https://github.com/QuangLam0208/react-native-device-helper.git
     ```
     *Ưu điểm:* Git tự động tận dụng phiên đăng nhập và token đã lưu trữ sẵn trong hệ điều hành (Windows Credential Manager / macOS Keychain).

* **Lệnh cài đặt cố định phiên bản (Release Tag):**
  ```bash
  # Khuyến nghị cho Production: Cố định theo tag phiên bản phát hành
  pnpm add git+https://github.com/QuangLam0208/react-native-device-helper.git#v0.1.0
  ```

* **Khai báo trong `package.json`:**
  ```json
  "dependencies": {
    "react-native-device-helper": "github:QuangLam0208/react-native-device-helper"
  }
  ```

* **Cơ chế vận hành:** `pnpm` tải toàn bộ repo từ Git, giải nén vào virtual store và tạo symlink vào `node_modules/react-native-device-helper`. Mã băm commit SHA được khóa trong `pnpm-lock.yaml` để bảo đảm tính tái lập (reproducible build) đồng nhất giữa toàn bộ thành viên trong dự án.

---

### 2.2. Phương pháp 2: Tích hợp qua Local File Path (Phù hợp Dev & Debug nhanh)
Phương pháp tối ưu trong giai đoạn đang trực tiếp phát triển song song cả module Native và ứng dụng consumer:

* **Lệnh cài đặt:**
  ```bash
  pnpm add file:../native-module/react-native-device-helper
  ```
* **Khai báo trong `package.json`:**
  ```json
  "dependencies": {
    "react-native-device-helper": "file:../native-module/react-native-device-helper"
  }
  ```
* **Cơ chế vận hành:** `pnpm` tạo liên kết symlink trực tiếp từ `node_modules` của consumer trỏ thẳng sang thư mục source code local của module. Mọi thay đổi mã nguồn (Java hoặc TypeScript) tại module sẽ được ứng dụng nhận diện ngay lập tức mà không cần commit hay đẩy mã lên Git.

---

### 2.5. Triển khai trong Tầng Giao Diện (UI Implementation)

Ví dụ tích hợp trong một Component (`NativeBridgeDemoCard.tsx`):

```tsx
import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator } from 'react-native';
import {
  getHardwareInfo,
  showToast,
  subscribeToDevicePing,
  triggerNativePing,
  type HardwareInfo,
} from 'react-native-device-helper';

export function NativeBridgeDemoCard() {
  const [hardwareInfo, setHardwareInfo] = useState<HardwareInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [eventLog, setEventLog] = useState<string>('Chưa có sự kiện.');

  useEffect(() => {
    // Đăng ký nhận sự kiện Native -> JS
    const unsubscribe = subscribeToDevicePing((event) => {
      setEventLog(`${event.message} (Timestamp: ${new Date(event.timestamp).toLocaleTimeString()})`);
    });

    // Cleanup khi component unmount
    return () => unsubscribe();
  }, []);

  const handleFetchMetrics = async () => {
    try {
      setLoading(true);
      const data = await getHardwareInfo();
      setHardwareInfo(data);
    } catch (error: any) {
      showToast('Lỗi truy xuất: ' + error.message, true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.header}>Quản Lý Phần Cứng (Native Module)</Text>

      <Button title="Đọc Thông Số RAM & Pin" onPress={handleFetchMetrics} />

      {loading && <ActivityIndicator style={{ marginTop: 10 }} />}

      {hardwareInfo && (
        <View style={styles.metricsBox}>
          <Text style={styles.metricText}>
            RAM Khả Dụng: {hardwareInfo.availRamMb} MB / {hardwareInfo.totalRamMb} MB
          </Text>
          <Text style={styles.metricText}>
            Mức Pin: {hardwareInfo.batteryLevel}% {hardwareInfo.isCharging ? '(Đang Sạc)' : '(Không Sạc)'}
          </Text>
          <Text style={styles.metricText}>
            Thiết Bị: {hardwareInfo.manufacturer} - {hardwareInfo.model} (Android {hardwareInfo.androidVersion})
          </Text>
        </View>
      )}

      <View style={{ height: 12 }} />
      <Button
        title="Hiển Thị Native Toast"
        onPress={() => showToast('Thông báo phát ra từ Native Module độc lập!')}
      />

      <View style={{ height: 12 }} />
      <Button
        title="Gửi Tín Hiệu Native Ping"
        onPress={() => triggerNativePing('Lệnh kiểm tra luồng hai chiều')}
      />

      <Text style={styles.eventText}>{eventLog}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, backgroundColor: '#ffffff', borderRadius: 12, elevation: 2 },
  header: { fontSize: 16, fontWeight: '700', marginBottom: 12, textAlign: 'center' },
  metricsBox: { marginTop: 12, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 8 },
  metricText: { fontSize: 14, color: '#333333', marginVertical: 2 },
  eventText: { marginTop: 12, fontSize: 12, color: '#008000', textAlign: 'center', fontStyle: 'italic' },
});
```

---

## 3. ĐẶC TẢ KỸ THUẬT & QUẢN LÝ RỦI RO

| Hiện tượng / Mã lỗi | Nguyên nhân gốc rễ (Root Cause) | Quy trình xử lý tiêu chuẩn (Remediation) |
| :--- | :--- | :--- |
| **`Duplicate class ... found in modules`** | Dự án tồn tại đồng thời cả file Java và Kotlin cùng tên class trong `android/src/main/java/...`. | Xóa bỏ các template `.kt` mặc định nếu quyết định triển khai bằng Java. |
| **`CalledFromWrongThreadException`** | `@ReactMethod` can thiệp các thành phần UI Android (Toast, Dialog, View hierarchy) nhưng chạy trên Native Background Thread. | Bắt buộc điều hướng qua `UiThreadUtil.runOnUiThread(new Runnable() { ... })`. |
| **`ERR_PNPM_GIT_DEP_PREPARE_NOT_ALLOWED`** | Package manager (`pnpm`) chặn tự động chạy `prepare: bob build` từ untrusted Git dependency vì lý do an ninh. | Biên dịch sẵn `lib/` bằng `yarn build`, un-ignore `lib/` trong `.gitignore`, chuyển script sang `prepack`/`build` và commit bản build lên Git. |
| **`TS2345: Argument of type ... is not assignable`** | Signature của `NativeEventEmitter.addListener` yêu cầu callback dạng `(...args: any[]) => void`. | Chuẩn hóa tầng TypeScript wrapper: `eventEmitter.addListener(EVENT_NAME, (event: any) => callback(event))`. |
| **Rò rỉ bộ nhớ (Memory Leak)** | Lắng nghe `NativeEventEmitter` mà không hủy đăng ký khi Component unmount. | Trả về hàm dọn dẹp `subscription.remove()` và kích hoạt trong hook `useEffect` cleanup. |
