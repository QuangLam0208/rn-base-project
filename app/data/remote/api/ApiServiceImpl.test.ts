import { ApiResponse } from "apisauce"

import { ApiServiceImpl } from "./ApiServiceImpl"

import { Api } from "./index"

function mockApi(): jest.Mocked<Api> {
  return {
    apisauce: {
      get: jest.fn(),
      post: jest.fn(),
    },
  } as unknown as jest.Mocked<Api>
}

function okResponse<T>(data: T): ApiResponse<T> {
  return { ok: true, data, problem: null, originalError: null } as ApiResponse<T>
}

function notFoundResponse(): ApiResponse<unknown> {
  return {
    ok: false,
    problem: "CLIENT_ERROR",
    status: 404,
    data: undefined,
    originalError: null,
  } as unknown as ApiResponse<unknown>
}

function networkErrorResponse(): ApiResponse<unknown> {
  return {
    ok: false,
    problem: "NETWORK_ERROR",
    status: undefined,
    data: undefined,
    originalError: null,
  } as unknown as ApiResponse<unknown>
}

// request() is `protected` — exposing it through a trivial test
// subclass is the standard way to unit-test a protected helper without
// making it part of ApiServiceImpl's real public API. This is the one
// piece of real logic ApiServiceImpl has until a concrete endpoint is
// added (see ApiService.ts) — every future endpoint method routes
// through this same helper.
class TestApiService extends ApiServiceImpl {
  callRequest<T>(fn: () => Promise<ApiResponse<T>>): Promise<T> {
    return this.request(fn)
  }
}

describe("ApiServiceImpl.request", () => {
  it("returns the response data on success", async () => {
    const api = mockApi()
    const service = new TestApiService(api)

    const data = await service.callRequest(() => Promise.resolve(okResponse({ hello: "world" })))

    expect(data).toEqual({ hello: "world" })
  })

  it("normalizes a failed HTTP response into an Error with the problem kind as its message", async () => {
    const api = mockApi()
    const service = new TestApiService(api)

    await expect(service.callRequest(() => Promise.resolve(notFoundResponse()))).rejects.toThrow(
      "not-found",
    )
  })

  it("normalizes a network error the same way", async () => {
    const api = mockApi()
    const service = new TestApiService(api)

    await expect(
      service.callRequest(() => Promise.resolve(networkErrorResponse())),
    ).rejects.toThrow("cannot-connect")
  })

  it("throws bad-data when the response is ok but carries no data", async () => {
    const api = mockApi()
    const service = new TestApiService(api)

    await expect(
      service.callRequest(() =>
        Promise.resolve({
          ok: true,
          data: undefined,
          problem: null,
          originalError: null,
        } as ApiResponse<unknown>),
      ),
    ).rejects.toThrow("bad-data")
  })
})
