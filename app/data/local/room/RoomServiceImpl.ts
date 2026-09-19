import { inject, injectable } from "inversify"

import { AppDatabase } from "./AppDatabase"
import { RoomService } from "./RoomService"
import { UserDao } from "./UserDao"

/**
 * Thin wrapper around AppDatabase's DAOs — mirrors
 * ai-project-android's AppDbService.java.
 */
@injectable()
export class RoomServiceImpl implements RoomService {
  constructor(@inject(AppDatabase) private appDatabase: AppDatabase = new AppDatabase()) {}

  userDao(): UserDao {
    return this.appDatabase.getUserDao()
  }
}
