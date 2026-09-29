const fs = require("fs")
const path = require("path")

// Automatically load .env if available
const envPath = path.resolve(__dirname, ".env")
if (fs.existsSync(envPath) && typeof process.loadEnvFile === "function") {
  try {
    process.loadEnvFile(envPath)
  } catch (err) {
    console.warn("[app.config.js] Failed to load .env:", err.message)
  }
}

module.exports = ({ config }) => {
  const otaServerUrl = (process.env.OTA_SERVER_URL || "").trim().replace(/\/+$/, "")

  return {
    ...config,
    updates: {
      ...config.updates,
      ...(otaServerUrl ? { url: `${otaServerUrl}/api/manifest` } : {}),
    },
  }
}
