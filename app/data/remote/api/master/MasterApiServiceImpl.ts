import { ApiResponse } from "apisauce"
import { injectable } from "inversify"

import Config from "@/config"
import { PostItem } from "@/data/model/api/item/PostItem"
import { PostResponse } from "@/data/model/api/response/post/PostResponse"
import { TYPES } from "@/di/types"

import { getGeneralApiProblem } from "../apiProblem"
import { Api } from "../index"
import { MasterApiService } from "./MasterApiService"

const MASTER_API_CONFIG = { url: Config.MASTER_API_URL, timeout: 10000 }

/**
 * Concrete implementation of MasterApiService — the HTTP layer for
 * the second base URL, same "interface + impl" split as
 * ApiService/ApiServiceImpl. Injects a *different* Api instance
 * (bound under TYPES.MasterApi, configured with Config.MASTER_API_URL)
 * than ApiServiceImpl does.
 */
@injectable()
export class MasterApiServiceImpl implements MasterApiService {
  constructor(private api: Api) {}

  private async request<T>(fn: () => Promise<ApiResponse<T>>): Promise<T> {
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

  async getPosts(): Promise<PostItem[]> {
    const posts = await this.request(() => this.api.apisauce.get<PostResponse[]>("/posts"))

    return posts.map((post) => ({
      id: String(post.id),
      title: post.title,
      body: post.body,
    }))
  }
}
