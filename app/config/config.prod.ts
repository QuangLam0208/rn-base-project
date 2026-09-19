/**
 * These are configuration settings for the production environment.
 *
 * Do not include API secrets in this file or anywhere in your JS.
 *
 * https://reactnative.dev/docs/security#storing-sensitive-info
 */
export default {
  API_URL: "https://ai-project-api.moviehub.io.vn",
  /**
   * A second, unrelated backend — demonstrates the two-base-URL DI
   * pattern (see CLAUDE.md's DI section) with a real public API
   * instead of a stub. Not part of ai-project's own backend.
   */
  MASTER_API_URL: "https://jsonplaceholder.typicode.com",
}
