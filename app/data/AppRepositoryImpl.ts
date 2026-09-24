import { injectable } from "inversify"

import { AppDatabase } from "@/data/local/room/AppDatabase"
import { RoomService } from "@/data/local/room/RoomService"
import { RoomServiceImpl } from "@/data/local/room/RoomServiceImpl"
import { StorageService } from "@/data/local/storage/StorageService"
import { ApiService } from "@/data/remote/api/ApiService"
import { ApiServiceImpl } from "@/data/remote/api/ApiServiceImpl"

import { Repository } from "./Repository"

/**
 * Mirrors ai-project-android's AppRepository.java — wraps ApiService,
 * RoomService, and StorageService (Android's PreferencesService)
 * behind one object so BaseViewModel only needs to hold `repository`,
 * not a separate field per service.
 *
 * `roomService` is lazy (constructed on first access, not in the
 * constructor): RoomServiceImpl opens a real expo-sqlite connection,
 * which crashes under Jest (no native module mock — see
 * data/local/room/AppDatabase.test.ts's comment). Every ViewModel
 * gets `repository` via BaseViewModel, so an eager construction here
 * would drag every ViewModel test into that crash even though nothing
 * calls `repository.roomService` yet. `storageService` has no such
 * problem (MMKV works fine under Jest — see
 * data/local/storage/storage.test.ts) so it's a plain eager field like
 * `apiService`.
 */
@injectable()
export class AppRepositoryImpl implements Repository {
  private _roomService?: RoomService

  constructor(
    readonly apiService: ApiService,
    readonly storageService: StorageService,
  ) {}

  get roomService(): RoomService {
    if (!this._roomService) {
      this._roomService = new RoomServiceImpl(new AppDatabase())
    }
    return this._roomService
  }
}
