import { RoomService } from "@/data/local/room/RoomService"
import { StorageService } from "@/data/local/storage/StorageService"
import { ApiService } from "@/data/remote/api/ApiService"

/**
 * Facade bundling every data-layer service a ViewModel needs — mirrors
 * ai-project-android's Repository.java
 * (getApiService()/getRoomService()/getSharedPreferences()), exposed
 * here as plain properties instead of getters. Pure interface, no
 * logic — see AppRepositoryImpl.ts for the implementation.
 */
export interface Repository {
  readonly apiService: ApiService
  readonly roomService: RoomService
  readonly storageService: StorageService
}
