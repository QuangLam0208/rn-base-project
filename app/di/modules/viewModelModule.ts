import { ContainerModule } from "inversify"

import { CompaniesViewModel } from "@/screens/Companies/CompaniesViewModel"
import { CoursesViewModel } from "@/screens/Courses/CoursesViewModel"
import { HomeViewModel } from "@/screens/Home/HomeViewModel"
import { LoginViewModel } from "@/screens/Login/LoginViewModel"
import { MentorsViewModel } from "@/screens/Mentors/MentorsViewModel"
import { MentorDetailViewModel } from "@/screens/MentorDetail/MentorDetailViewModel"
import { TodoListViewModel } from "@/screens/TodoList/TodoListViewModel"

/**
 * ViewModel bindings — mirrors ai-project-android's Dagger
 * FragmentModule (per-screen ViewModel providers). Loaded into the
 * composition root via container.load() in container.ts. Add a new
 * ViewModel's binding here as you add screens.
 */
export const viewModelModule = new ContainerModule((bind) => {
  bind(HomeViewModel).toSelf()
  bind(LoginViewModel).toSelf()
  bind(CoursesViewModel).toSelf()
  bind(MentorsViewModel).toSelf()
  bind(MentorDetailViewModel).toSelf()
  bind(CompaniesViewModel).toSelf()
  bind(TodoListViewModel).toSelf()
})
