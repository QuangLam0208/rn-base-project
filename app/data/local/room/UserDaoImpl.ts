import { SQLiteDatabase } from "expo-sqlite"

import { UserEntity } from "@/data/model/room/UserEntity"

import { UserDao } from "./UserDao"

interface UserRow {
  user_id: number
}

function toEntity(row: UserRow): UserEntity {
  return { userId: row.user_id }
}

/**
 * expo-sqlite-backed implementation of UserDao — mirrors
 * ai-project-android's DbUserDao query set (insert/insertAll/loadAll/
 * findById/delete against the `user` table).
 */
export class UserDaoImpl implements UserDao {
  constructor(private db: SQLiteDatabase) {}

  async insert(user: UserEntity): Promise<void> {
    await this.db.runAsync("INSERT OR REPLACE INTO user (user_id) VALUES (?)", user.userId)
  }

  async insertAll(users: UserEntity[]): Promise<void> {
    await this.db.withTransactionAsync(async () => {
      for (const user of users) {
        await this.insert(user)
      }
    })
  }

  async loadAll(): Promise<UserEntity[]> {
    const rows = await this.db.getAllAsync<UserRow>("SELECT * FROM user")
    return rows.map(toEntity)
  }

  async findById(id: number): Promise<UserEntity | null> {
    const row = await this.db.getFirstAsync<UserRow>("SELECT * FROM user WHERE user_id = ?", id)
    return row ? toEntity(row) : null
  }

  async delete(user: UserEntity): Promise<void> {
    await this.db.runAsync("DELETE FROM user WHERE user_id = ?", user.userId)
  }
}
