import { execSync } from "node:child_process"
import fs from "node:fs"
import path from "node:path"

// Automatically load .env if available
const envPath = path.resolve(".env")
if (fs.existsSync(envPath) && typeof process.loadEnvFile === "function") {
  try {
    process.loadEnvFile(envPath)
  } catch (err) {
    console.warn("[publish.mjs] Failed to load .env:", err.message)
  }
}

const channel = process.argv[2] || "production"
const serverUrl = (process.env.OTA_PUBLISH_URL || "http://localhost:3001").trim().replace(/\/+$/, "")
const token = process.env.OTA_PUBLISH_TOKEN || "baseapp-ota-secret-token-2026"

const appJsonPath = path.resolve("app.json")
if (!fs.existsSync(appJsonPath)) {
  console.error("Error: app.json not found in current directory.")
  process.exit(1)
}

const appJson = JSON.parse(fs.readFileSync(appJsonPath, "utf-8"))
const runtimeVersion = appJson.expo?.runtimeVersion || appJson.runtimeVersion || "1.1.0"

console.log("==========================================")
console.log(`📦 Publishing OTA Update`)
console.log(`   Runtime Version: ${runtimeVersion}`)
console.log(`   Channel:         ${channel}`)
console.log(`   Server URL:      ${serverUrl}`)
console.log("==========================================")

// 1. Export Android bundle
console.log("\n[1/3] Exporting bundle with Metro...")
execSync("npx expo export --platform android --output-dir dist", { stdio: "inherit" })

// 2. Compress dist folder to export.zip
console.log("\n[2/3] Compressing export directory...")
const zipPath = path.resolve("export.zip")
if (fs.existsSync(zipPath)) {
  fs.unlinkSync(zipPath)
}
execSync('powershell Compress-Archive -Path dist\\* -DestinationPath export.zip -Force', { stdio: "inherit" })

// 3. Upload to server
console.log("\n[3/3] Uploading export.zip to OTA server...")
const zipBuffer = fs.readFileSync(zipPath)
const uploadUrl = `${serverUrl}/publish?runtimeVersion=${encodeURIComponent(runtimeVersion)}&channel=${encodeURIComponent(channel)}`

try {
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/zip",
      "x-publish-token": token,
    },
    body: zipBuffer,
  })

  const result = await response.json()
  if (response.ok) {
    console.log("\n✅ OTA UPDATE PUBLISHED SUCCESSFULLY!")
    console.log(JSON.stringify(result, null, 2))
    console.log(`\nView dashboard at: ${serverUrl}`)
  } else {
    console.error(`\n❌ Publish failed with status ${response.status}:`, result)
    process.exit(1)
  }
} catch (err) {
  console.error("\n❌ Upload network error:", err.message)
  process.exit(1)
} finally {
  if (fs.existsSync(zipPath)) {
    fs.unlinkSync(zipPath)
  }
}
