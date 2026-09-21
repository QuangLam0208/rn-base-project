import { LoginRequest } from "@/data/model/api/request/user/LoginRequest";
import { LoginResponse } from "@/data/model/api/response/user/LoginResponse";

/**
 * Every backend endpoint this app calls — mirrors ai-project-android's
 * ApiService.java (a single Retrofit interface listing every request):
 * only method signatures, no HTTP or mapping logic. See
 * ApiServiceImpl.ts for the concrete implementation, bound in
 * app/di/container.ts.
 *
 * Deliberately empty in this base project — there is no real backend
 * wired up yet. Add your first endpoint here as a method signature
 * (e.g. `getSomething(): Promise<SomethingItem[]>`), give it a domain
 * shape under `data/model/api/item/`, a wire-shape DTO under
 * `data/model/api/response/<domain>/` if the response needs mapping,
 * and implement it in `ApiServiceImpl.ts` — see CLAUDE.md's
 * "`ApiService`: interface + impl, one DTO per file" section for the
 * full convention and a worked example.
 */
export interface ApiService {
  login(request: LoginRequest): Promise<LoginResponse>
}
