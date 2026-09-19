import { UserDao } from "./UserDao"

/**
 * Facade over the local database's DAOs — mirrors
 * ai-project-android's RoomService.java. Pure interface, no logic
 * (same "interface + impl" split as ApiService — see CLAUDE.md).
 */
export interface RoomService {
  userDao(): UserDao
}
