import { UserEntity } from "@/data/model/room/UserEntity"

/**
 * CRUD surface for the local `user` table — mirrors
 * ai-project-android's DbUserDao.java (Room's generated DAO
 * implementation; here it's hand-written against expo-sqlite).
 */
export interface UserDao {
  insert(user: UserEntity): Promise<void>
  insertAll(users: UserEntity[]): Promise<void>
  loadAll(): Promise<UserEntity[]>
  findById(id: number): Promise<UserEntity | null>
  delete(user: UserEntity): Promise<void>
}
