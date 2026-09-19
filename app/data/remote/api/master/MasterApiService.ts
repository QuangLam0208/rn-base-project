import { PostItem } from "@/data/model/api/item/PostItem"

/**
 * Endpoints on the "master" demo backend — a second, unrelated base
 * URL (jsonplaceholder.typicode.com), kept as its own interface + impl
 * pair exactly like `ApiService`/`ApiServiceImpl` for the main
 * backend. Pure interface — no apisauce calls, no mapping logic here,
 * see `MasterApiServiceImpl.ts`.
 */
export interface MasterApiService {
  getPosts(): Promise<PostItem[]>
}
