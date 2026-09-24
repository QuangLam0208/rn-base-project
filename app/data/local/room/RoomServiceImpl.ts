import { injectable } from "inversify"

import { AppDatabase } from "./AppDatabase"
import { RoomService } from "./RoomService"
import { TodoDao } from "./TodoDao"
import { UserDao } from "./UserDao"

/**
 * Thin wrapper around AppDatabase's DAOs — mirrors
 * ai-project-android's AppDbService.java.
 */
@injectable()
export class RoomServiceImpl implements RoomService {
  constructor(private appDatabase: AppDatabase) {}

  userDao(): UserDao {
    return this.appDatabase.getUserDao()
  }

  todoDao(): TodoDao {
    return this.appDatabase.getTodoDao()
  }
}
