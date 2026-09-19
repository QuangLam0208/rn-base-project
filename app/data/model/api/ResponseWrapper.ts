/**
 * The envelope every ai-project backend response body is wrapped in
 * (mirrors ai-project-android's data/model/api/ResponseWrapper.java).
 */
export interface ResponseWrapper<T> {
  result: boolean
  data: T
  message: string
  code: string
}
