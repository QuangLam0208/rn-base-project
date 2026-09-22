import { PageResponse } from "@/data/model/api/PageResponse"
import { LoginRequest } from "@/data/model/api/request/user/LoginRequest"
import { CourseResponse } from "@/data/model/api/response/course/CourseResponse"
import { SyllabusResponse } from "@/data/model/api/response/course/SyllabusResponse"
import { MentorResponse } from "@/data/model/api/response/mentor/MentorResponse"
import { CompanyResponse } from "@/data/model/api/response/company/CompanyResponse"
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
  getPublicMentors(page?: number, size?: number): Promise<PageResponse<MentorResponse>>
  getMentors(page?: number, size?: number): Promise<PageResponse<MentorResponse>>
  getMentor(id: number): Promise<MentorResponse>
  getPublicCompanies(page?: number, size?: number): Promise<PageResponse<CompanyResponse>>
}
