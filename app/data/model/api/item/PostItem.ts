/**
 * Domain shape a screen renders for one post — mapped from
 * PostResponse (see app/data/model/api/response/post/PostResponse.ts)
 * by MasterApiServiceImpl.getPosts().
 */
export interface PostItem {
  id: string
  title: string
  body: string
}
