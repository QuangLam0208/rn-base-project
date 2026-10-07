import fs from "node:fs"
import os from "node:os"
import path from "node:path"

// scripts/publish.js is a plain CommonJS Node script, not part of the app/
// TypeScript surface — required directly, same as the app's own require()
// calls for native-only modules.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const AdmZip = require("adm-zip")

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { readRuntimeVersion, createZipBuffer, uploadBundle } = require("../../scripts/publish.js")

describe("scripts/publish.js", () => {
  describe("readRuntimeVersion", () => {
    it("reads the version field from app.json", () => {
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ota-appjson-"))
      const appJsonPath = path.join(dir, "app.json")
      fs.writeFileSync(appJsonPath, JSON.stringify({ version: "3.1.0" }))

      expect(readRuntimeVersion(appJsonPath)).toBe("3.1.0")
    })

    it("throws when app.json has no version field", () => {
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ota-appjson-"))
      const appJsonPath = path.join(dir, "app.json")
      fs.writeFileSync(appJsonPath, JSON.stringify({}))

      expect(() => readRuntimeVersion(appJsonPath)).toThrow(/Could not read "version"/)
    })
  })

  describe("createZipBuffer", () => {
    it("zips every file in a directory, including subfolders", () => {
      const sourceDir = fs.mkdtempSync(path.join(os.tmpdir(), "ota-export-"))
      fs.writeFileSync(path.join(sourceDir, "metadata.json"), "{}")
      fs.mkdirSync(path.join(sourceDir, "assets"))
      fs.writeFileSync(path.join(sourceDir, "assets", "bundle.js"), "console.log(1)")

      const zipBuffer = createZipBuffer(sourceDir)

      expect(Buffer.isBuffer(zipBuffer)).toBe(true)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const entryNames = new AdmZip(zipBuffer).getEntries().map((entry: any) => entry.entryName)
      expect(entryNames).toContain("metadata.json")
      expect(entryNames).toContain("assets/bundle.js")
    })
  })

  describe("uploadBundle", () => {
    // `fetch` here is React Native's polyfilled global (not Node's), and it
    // has no working network stack under Jest — so these tests mock it
    // directly rather than hitting a real HTTP server, verifying uploadBundle
    // builds the right request and handles the response/error shape.
    const originalFetch = global.fetch

    afterEach(() => {
      global.fetch = originalFetch
    })

    it("POSTs the zip to <serverUrl>/publish with the runtimeVersion/channel query and token header", async () => {
      const mockJson = jest.fn().mockResolvedValue({
        runtimeVersion: "2.2.2",
        channel: "production",
        timestamp: "1700000000",
      })
      const mockFetch = jest.fn().mockResolvedValue({ ok: true, status: 200, json: mockJson })
      global.fetch = mockFetch as unknown as typeof fetch

      const zipBuffer = Buffer.from("fake-zip-bytes")
      const result = await uploadBundle({
        serverUrl: "http://example.com",
        token: "secret-token",
        runtimeVersion: "2.2.2",
        channel: "production",
        zipBuffer,
      })

      expect(result).toEqual({
        runtimeVersion: "2.2.2",
        channel: "production",
        timestamp: "1700000000",
      })
      expect(mockFetch).toHaveBeenCalledWith(
        "http://example.com/publish?runtimeVersion=2.2.2&channel=production",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "content-type": "application/zip",
            "x-publish-token": "secret-token",
          }),
          body: zipBuffer,
        }),
      )
    })

    it("strips a trailing slash from serverUrl before building the request URL", async () => {
      const mockFetch = jest
        .fn()
        .mockResolvedValue({ ok: true, status: 200, json: jest.fn().mockResolvedValue({}) })
      global.fetch = mockFetch as unknown as typeof fetch

      await uploadBundle({
        serverUrl: "http://example.com/",
        token: "secret-token",
        runtimeVersion: "2.2.2",
        channel: "production",
        zipBuffer: Buffer.from("x"),
      })

      expect(mockFetch).toHaveBeenCalledWith(
        "http://example.com/publish?runtimeVersion=2.2.2&channel=production",
        expect.anything(),
      )
    })

    it("throws a clear error when the server responds with a non-2xx status", async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: jest.fn().mockResolvedValue({ error: "Invalid or missing publish token." }),
      })
      global.fetch = mockFetch as unknown as typeof fetch

      await expect(
        uploadBundle({
          serverUrl: "http://example.com",
          token: "wrong-token",
          runtimeVersion: "2.2.2",
          channel: "production",
          zipBuffer: Buffer.from("x"),
        }),
      ).rejects.toThrow(/Publish failed \(401\)/)
    })
  })
})
