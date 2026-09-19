/**
 * One post item from GET /posts on the "master" demo backend
 * (jsonplaceholder.typicode.com) — a stand-in for a second,
 * unrelated backend to exercise the two-base-URL DI pattern. Only
 * the fields this screen renders are declared.
 */
export interface PostResponse {
  id: number
  title: string
  body: string
}
