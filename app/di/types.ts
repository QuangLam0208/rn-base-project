/**
 * Symbol tokens for bindings whose consumers depend on an interface
 * rather than a concrete class (TS interfaces don't exist at runtime,
 * so InversifyJS needs a token to bind against) — see
 * app/di/container.ts.
 */
export const TYPES = {
  ApiService: Symbol.for("ApiService"),
  RoomService: Symbol.for("RoomService"),
  Repository: Symbol.for("Repository"),
  /**
   * Second base URL demo (see CLAUDE.md's DI section): `Api` is a
   * concrete class, normally bound with itself as the token
   * (`bind(Api).toSelf()`) since there's only one instance. Two
   * differently-configured `Api` instances can't both claim that same
   * token, so the second one needs its own Symbol instead.
   */
  MasterApi: Symbol.for("MasterApi"),
  MasterApiService: Symbol.for("MasterApiService"),
}
