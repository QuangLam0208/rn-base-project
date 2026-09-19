import { openDatabaseSync, SQLiteDatabase } from "expo-sqlite"
import { injectable } from "inversify"

import { UserDao } from "./UserDao"
import { UserDaoImpl } from "./UserDaoImpl"

const DATABASE_NAME = "room.db"

/**
 * Opens the local SQLite database and owns its schema — mirrors
 * ai-project-android's AppDatabase.java (a Room database with a
 * single `user` table/DAO, not yet wired into any real feature).
 * Room's codegen would normally implement getUserDao() for you; here
 * that's just UserDaoImpl constructed against the same connection.
 */
@injectable()
export class AppDatabase {
  private readonly db: SQLiteDatabase
  private readonly userDaoInstance: UserDao

  constructor() {
    this.db = openDatabaseSync(DATABASE_NAME)
    this.db.execSync("CREATE TABLE IF NOT EXISTS user (user_id INTEGER PRIMARY KEY NOT NULL)")
    this.userDaoInstance = new UserDaoImpl(this.db)
  }

  getUserDao(): UserDao {
    return this.userDaoInstance
  }
}
