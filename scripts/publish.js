#!/usr/bin/env node
/* eslint-env node */
/**
 * Publish an OTA (JS-only) update for this app to a self-hosted OTA server.
 *
 *   npm run ota:publish -- production
 *
 * Requires ota-server/.env.example's client-side variables (OTA_SERVER_URL,
 * OTA_PUBLISH_TOKEN) to be set in this project's .env — see scripts/.env.example.
 */
const AdmZip = require("adm-zip")
const { execSync } = require("child_process")
const dotenv = require("dotenv")
const fs = require("fs")
const path = require("path")

dotenv.config({ path: path.join(__dirname, "..", ".env") })

const PROJECT_ROOT = path.resolve(__dirname, "..")
const EXPORT_TMP_DIR = path.join(__dirname, ".export-tmp")

function readRuntimeVersion(appJsonPath = path.join(PROJECT_ROOT, "app.json")) {
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, "utf-8"))
  if (typeof appJson.runtimeVersion === "string") {
    return appJson.runtimeVersion
  }
  if (!appJson.version) {
    throw new Error(`Could not read "version" from ${appJsonPath}`)
  }
  return appJson.version
}

function createZipBuffer(sourceDir) {
  const zip = new AdmZip()
  zip.addLocalFolder(sourceDir)
  return zip.toBuffer()
}

async function uploadBundle({ serverUrl, token, runtimeVersion, channel, zipBuffer }) {
  const url = `${serverUrl.replace(/\/$/, "")}/publish?runtimeVersion=${encodeURIComponent(
    runtimeVersion,
  )}&channel=${encodeURIComponent(channel)}`

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/zip",
      "x-publish-token": token || "",
    },
    body: zipBuffer,
  })

  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(`Publish failed (${res.status}): ${body.error || res.statusText}`)
  }
  return body
}

function runExpoExport(outputDir) {
  fs.rmSync(outputDir, { recursive: true, force: true })
  execSync(`npx expo export --platform android --output-dir ${outputDir}`, {
    cwd: PROJECT_ROOT,
    stdio: "inherit",
  })
}

async function main() {
  const channel = process.argv[2] || "production"
  const runtimeVersion = readRuntimeVersion()
  const serverUrl = process.env.OTA_PUBLISH_URL || process.env.OTA_SERVER_URL || "http://localhost:3001"
  const token = process.env.OTA_PUBLISH_TOKEN

  if (!token) {
    throw new Error(
      "OTA_PUBLISH_TOKEN is not set. Create .env at the project root (see scripts/.env.example) or export it before running this script.",
    )
  }

  console.log(`Exporting JS bundle for runtimeVersion=${runtimeVersion} channel=${channel}...`)
  runExpoExport(EXPORT_TMP_DIR)

  console.log("Zipping exported bundle...")
  const zipBuffer = createZipBuffer(EXPORT_TMP_DIR)
  fs.rmSync(EXPORT_TMP_DIR, { recursive: true, force: true })

  console.log(`Uploading to ${serverUrl}...`)
  const result = await uploadBundle({ serverUrl, token, runtimeVersion, channel, zipBuffer })

  console.log(`Published update: ${JSON.stringify(result)}`)
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message)
    process.exitCode = 1
  })
}

module.exports = { readRuntimeVersion, createZipBuffer, uploadBundle }
