import { ContainerModule } from "inversify"

import { HomeViewModel } from "@/screens/Home/HomeViewModel"

/**
 * ViewModel bindings — mirrors ai-project-android's Dagger
 * FragmentModule (per-screen ViewModel providers). Loaded into the
 * composition root via container.load() in container.ts. Add a new
 * ViewModel's binding here as you add screens.
 */
export const viewModelModule = new ContainerModule((bind) => {
  bind(HomeViewModel).toSelf()
})
