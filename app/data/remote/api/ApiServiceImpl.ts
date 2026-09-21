import { ApiResponse } from "apisauce"
import { inject, injectable } from "inversify"

import { getGeneralApiProblem } from "./apiProblem"
import { ApiService } from "./ApiService"

import { Api } from "./index"
import { LoginRequest } from "@/data/model/api/request/user/LoginRequest"
import { LoginResponse } from "@/data/model/api/response/user/LoginResponse"

/**
 * Concrete implementation of ApiService — the HTTP layer + response
 * mapping. ApiService.ts stays a pure interface (mirroring
 * ai-project-android's ApiService.java); this is where the actual
 * apisauce calls and DTO-to-domain-model mapping live.
 *
 * Empty in this base project (ApiService.ts declares no endpoints yet)
 * — `request()` below is the reusable "unwrap an apisauce response or
 * throw" helper every endpoint method should go through. A worked
 * example of adding a real endpoint:
 *
 * ```ts
 * async getSomething(): Promise<SomethingItem[]> {
 *   const data = await this.request(() =>
 *     this.api.apisauce.get<SomethingResponse[]>("/v1/something"),
 *   )
 *   return data.map((item) => ({ id: String(item.id), name: item.name }))
 * }
 * ```
 */
@injectable()
export class ApiServiceImpl implements ApiService {
  constructor(@inject(Api) private api: Api = new Api()) {}

  protected async request<T>(fn: () => Promise<ApiResponse<T>>): Promise<T> {
    const response = await fn()

    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      throw new Error(problem?.kind ?? "unknown")
    }

    if (response.data === undefined) {
      throw new Error("bad-data")
    }

    return response.data
  }

  async login(request: LoginRequest): Promise<LoginResponse> {
    return this.request<LoginResponse>(() =>
      this.api.apisauce.post<LoginResponse>("/api/token", request, {
        headers: {
          UseBasicAuth: "1",
        },
      }),
    )
  }
}
