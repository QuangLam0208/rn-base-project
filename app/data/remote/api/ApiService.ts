import { PageResponse } from "@/data/model/api/PageResponse"
import { LoginRequest } from "@/data/model/api/request/user/LoginRequest"
import { CourseResponse } from "@/data/model/api/response/course/CourseResponse"
import { SyllabusResponse } from "@/data/model/api/response/course/SyllabusResponse"
import { LoginResponse } from "@/data/model/api/response/user/LoginResponse"

/**
 * Every backend endpoint this app calls — mirrors ai-project-android's
 * ApiService.java (a single Retrofit interface listing every request):
 * only method signatures, no HTTP or mapping logic.
 */
export interface ApiService {
  login(request: LoginRequest): Promise<LoginResponse>
  getCourses(page?: number, size?: number): Promise<PageResponse<CourseResponse>>
  getSyllabuses(courseId: number, page?: number, size?: number): Promise<PageResponse<SyllabusResponse>>
}
