import { ContainerModule } from "inversify"

import Config from "@/config"
import { AppRepositoryImpl } from "@/data/AppRepositoryImpl"
import { AppDatabase } from "@/data/local/room/AppDatabase"
import { RoomService } from "@/data/local/room/RoomService"
import { RoomServiceImpl } from "@/data/local/room/RoomServiceImpl"
import { StorageService } from "@/data/local/storage/StorageService"
import { Api } from "@/data/remote/api"
import { ApiService } from "@/data/remote/api/ApiService"
import { ApiServiceImpl } from "@/data/remote/api/ApiServiceImpl"
import { MasterApiService } from "@/data/remote/api/master/MasterApiService"
import { MasterApiServiceImpl } from "@/data/remote/api/master/MasterApiServiceImpl"
import { Repository } from "@/data/Repository"
import { authStore, AuthStore } from "@/stores/authStore"

import { TYPES } from "../types"

/**
 * Data-layer bindings — mirrors ai-project-android's Dagger AppModule
 * (app-scope services: preferences, network, database, repository).
 * Loaded into the composition root via container.load() in container.ts.
 */
export const dataModule = new ContainerModule((bind) => {
  bind(StorageService).toSelf().inSingletonScope()
  // Reuse the module-level authStore instance (not a fresh toSelf()) so
  // every consumer — DI-resolved or directly imported — shares one token.
  bind(AuthStore).toConstantValue(authStore)
  bind(Api).toSelf().inSingletonScope()
  bind<ApiService>(TYPES.ApiService).to(ApiServiceImpl).inSingletonScope()

  // Second base URL demo (see CLAUDE.md's DI section) — a different Api
  // instance, same Api class, so it can't share Api's own toSelf()
  // binding above. Bound behind its own Symbol token instead, the way a
  // second @Named/qualifier Retrofit provider would work in Dagger.
  bind<Api>(TYPES.MasterApi)
    .toDynamicValue(() => new Api(authStore, { url: Config.MASTER_API_URL, timeout: 10000 }))
    .inSingletonScope()
  bind<MasterApiService>(TYPES.MasterApiService).to(MasterApiServiceImpl).inSingletonScope()

  // Local SQLite scaffold (mirrors Dagger's Room bindings in
  // ai-project-android) — not yet consumed by any ViewModel or screen.
  bind(AppDatabase).toSelf().inSingletonScope()
  bind<RoomService>(TYPES.RoomService).to(RoomServiceImpl).inSingletonScope()

  // Facade over ApiService + RoomService + StorageService — mirrors
  // Dagger's Repository binding. BaseViewModel property-injects this
  // (not the individual services directly), so every ViewModel reaches
  // them via this.repository.apiService / .roomService / .storageService.
  bind<Repository>(TYPES.Repository).to(AppRepositoryImpl).inSingletonScope()
})
