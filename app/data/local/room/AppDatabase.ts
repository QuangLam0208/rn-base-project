import { openDatabaseSync, SQLiteDatabase } from "expo-sqlite"
import { injectable } from "inversify"

import {
  createLatestSchema,
  DATABASE_VERSION,
  runMigrations,
} from "./migrations"
import { TodoDao } from "./TodoDao"
import { TodoDaoImpl } from "./TodoDaoImpl"
import { UserDao } from "./UserDao"
import { UserDaoImpl } from "./UserDaoImpl"

const DATABASE_NAME = "room.db"

export { DATABASE_VERSION }

/**
 * Opens the local SQLite database and owns its DAOs — mirrors
 * Android's Room database AppDatabase.java.
 * Schema migration logic is decoupled into `./migrations`.
 */
@injectable()
export class AppDatabase {
  private readonly db: SQLiteDatabase
  private readonly userDaoInstance: UserDao
  private readonly todoDaoInstance: TodoDao

  constructor() {
    this.db = openDatabaseSync(DATABASE_NAME)
    this.migrate()
    this.userDaoInstance = new UserDaoImpl(this.db)
    this.todoDaoInstance = new TodoDaoImpl(this.db)
  }

  private migrate(): void {
    const result = this.db.getFirstSync
      ? this.db.getFirstSync<{ user_version: number }>("PRAGMA user_version")
      : null
    const currentVersion = result?.user_version ?? 0

    if (currentVersion === 0) {
      createLatestSchema(this.db)
      this.db.execSync(`PRAGMA user_version = ${DATABASE_VERSION}`)
    } else if (currentVersion < DATABASE_VERSION) {
      runMigrations(this.db, currentVersion, DATABASE_VERSION)
      this.db.execSync(`PRAGMA user_version = ${DATABASE_VERSION}`)
    }
  }

  getUserDao(): UserDao {
    return this.userDaoInstance
  }

  getTodoDao(): TodoDao {
    return this.todoDaoInstance
  }
}
