import { Api } from "./index"
import { AuthStore } from "@/stores/authStore"
import { StorageService } from "@/data/local/storage/StorageService"

describe("Api request transform", () => {
  let storageService: StorageService
  let authStore: AuthStore
  let api: Api

  beforeEach(() => {
    storageService = new StorageService()
    authStore = new AuthStore(storageService)
    api = new Api(authStore)
  })

  afterEach(() => {
    authStore.clearToken()
  })

  it("attaches Bearer token to request headers when user is authenticated", async () => {
    authStore.setToken("test_jwt_token_123")

    // Simulate apisauce request transform callback
    const request: { headers: Record<string, string> } = { headers: {} }

    // Grab the async request transforms from apisauce instance
    // apisauce.asyncRequestTransforms is an array of transform functions
    const transforms = (api.apisauce as unknown as { asyncRequestTransforms: Array<(req: unknown) => Promise<void>> }).asyncRequestTransforms
    expect(transforms.length).toBeGreaterThan(0)

    for (const transform of transforms) {
      await transform(request)
    }

    expect(request.headers.Authorization).toBe("Bearer test_jwt_token_123")
    expect(request.headers["X-tenant"]).toBe("moviehub")
  })

  it("does not attach Bearer token when not authenticated", async () => {
    authStore.clearToken()

    const request: { headers: Record<string, string> } = { headers: {} }
    const transforms = (api.apisauce as unknown as { asyncRequestTransforms: Array<(req: unknown) => Promise<void>> }).asyncRequestTransforms

    for (const transform of transforms) {
      await transform(request)
    }

    expect(request.headers.Authorization).toBeUndefined()
  })
})
