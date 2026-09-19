import { ApiResponse } from "apisauce"

import { Api } from "../index"
import { MasterApiServiceImpl } from "./MasterApiServiceImpl"

function mockApi(): jest.Mocked<Api> {
  return {
    apisauce: {
      get: jest.fn(),
    },
  } as unknown as jest.Mocked<Api>
}

function okResponse<T>(data: T): ApiResponse<T> {
  return { ok: true, data, problem: null, originalError: null } as ApiResponse<T>
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

describe("MasterApiServiceImpl.getPosts", () => {
  it("maps a successful response into PostItems", async () => {
    const api = mockApi()
    ;(api.apisauce.get as jest.Mock).mockResolvedValue(
      okResponse([{ id: 1, title: "Hello", body: "World" }]),
    )
    const service = new MasterApiServiceImpl(api)

    const posts = await service.getPosts()

    expect(api.apisauce.get).toHaveBeenCalledWith("/posts")
    expect(posts).toEqual([{ id: "1", title: "Hello", body: "World" }])
  })

  it("throws on a failed HTTP response", async () => {
    const api = mockApi()
    ;(api.apisauce.get as jest.Mock).mockResolvedValue(networkErrorResponse())
    const service = new MasterApiServiceImpl(api)

    await expect(service.getPosts()).rejects.toThrow("cannot-connect")
  })
})
