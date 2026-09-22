import { ApiResponse } from "apisauce"
import { inject, injectable } from "inversify"

import { getGeneralApiProblem } from "./apiProblem"
import { ApiService } from "./ApiService"

import { Api } from "./index"
import { PageResponse } from "@/data/model/api/PageResponse"
import { ResponseWrapper } from "@/data/model/api/ResponseWrapper"
import { LoginRequest } from "@/data/model/api/request/user/LoginRequest"
import { CourseResponse } from "@/data/model/api/response/course/CourseResponse"
import { SyllabusResponse } from "@/data/model/api/response/course/SyllabusResponse"
import { MentorResponse } from "@/data/model/api/response/mentor/MentorResponse"
import { CompanyResponse } from "@/data/model/api/response/company/CompanyResponse"
import { LoginResponse } from "@/data/model/api/response/user/LoginResponse"

/**
 * Concrete implementation of ApiService — the HTTP layer + response
 * mapping. ApiService.ts stays a pure interface (mirroring
 * ai-project-android's ApiService.java); this is where the actual
 * apisauce calls and DTO-to-domain-model mapping live.
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

  async getCourses(page = 0, size = 20): Promise<PageResponse<CourseResponse>> {
    const res = await this.request<ResponseWrapper<PageResponse<CourseResponse>>>(() =>
      this.api.apisauce.get<ResponseWrapper<PageResponse<CourseResponse>>>("/v1/course/list", {
        "pageable.page": page,
        "pageable.size": size,
      }),
    )
    return {
      content: res.data?.content ?? [],
      totalElements: res.data?.totalElements ?? 0,
      totalPages: res.data?.totalPages ?? 0,
    }
  }

  async getSyllabuses(courseId: number, page = 0, size = 20): Promise<PageResponse<SyllabusResponse>> {
    const res = await this.request<ResponseWrapper<PageResponse<SyllabusResponse>>>(() =>
      this.api.apisauce.get<ResponseWrapper<PageResponse<SyllabusResponse>>>(
        "/v1/syllabus/public/list",
        {
          courseId,
          page,
          size,
        },
        {
          headers: {
            IgnoreAuth: "1",
          },
        },
      ),
    )
    return {
      content: res.data?.content ?? [],
      totalElements: res.data?.totalElements ?? 0,
      totalPages: res.data?.totalPages ?? 0,
    }
  }

  async getPublicMentors(page = 0, size = 50): Promise<PageResponse<MentorResponse>> {
    const res = await this.request<ResponseWrapper<PageResponse<MentorResponse>>>(() =>
      this.api.apisauce.get<ResponseWrapper<PageResponse<MentorResponse>>>(
        "/v1/mentor/public/list",
        {
          page,
          size,
        },
        {
          headers: {
            IgnoreAuth: "1",
          },
        },
      ),
    )
    return {
      content: res.data?.content ?? [],
      totalElements: res.data?.totalElements ?? 0,
      totalPages: res.data?.totalPages ?? 0,
    }
  }

  async getMentors(page = 0, size = 10): Promise<PageResponse<MentorResponse>> {
    const res = await this.request<ResponseWrapper<PageResponse<MentorResponse>>>(() =>
      this.api.apisauce.get<ResponseWrapper<PageResponse<MentorResponse>>>(
        "/v1/mentor/list",
        {
          page,
          size,
        },
      ),
    )
    return {
      content: res.data?.content ?? [],
      totalElements: res.data?.totalElements ?? 0,
      totalPages: res.data?.totalPages ?? 0,
    }
  }

  async getMentor(id: number): Promise<MentorResponse> {
    const res = await this.request<ResponseWrapper<MentorResponse>>(() =>
      this.api.apisauce.get<ResponseWrapper<MentorResponse>>(`/v1/mentor/get/${id}`),
    )
    return res.data
  }

  async getPublicCompanies(page = 0, size = 50): Promise<PageResponse<CompanyResponse>> {
    const res = await this.request<ResponseWrapper<PageResponse<CompanyResponse>>>(() =>
      this.api.apisauce.get<ResponseWrapper<PageResponse<CompanyResponse>>>(
        "/v1/company/public/list",
        {
          page,
          size,
        },
        {
          headers: {
            IgnoreAuth: "1",
          },
        },
      ),
    )
    return {
      content: res.data?.content ?? [],
      totalElements: res.data?.totalElements ?? 0,
      totalPages: res.data?.totalPages ?? 0,
    }
  }
}
