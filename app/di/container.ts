import { Container } from "inversify"

import { dataModule } from "./modules/dataModule"
import { viewModelModule } from "./modules/viewModelModule"

/**
 * Composition root — mirrors ai-project-android's Dagger AppComponent,
 * assembled from ContainerModules the same way AppComponent combines
 * AppModule + FragmentModule. Screens never construct their own
 * dependency graph, they just resolve() through app/di/useViewModel.ts.
 */
export const container = new Container()

container.load(dataModule, viewModelModule)
