import Config from "@/config"
import { Api } from "@/data/remote/api"
import { ApiServiceImpl } from "@/data/remote/api/ApiServiceImpl"
import { MasterApiService } from "@/data/remote/api/master/MasterApiService"
import { MasterApiServiceImpl } from "@/data/remote/api/master/MasterApiServiceImpl"
import { Repository } from "@/data/Repository"
import { HomeViewModel } from "@/screens/Home/HomeViewModel"

import { container } from "./container"
import { TYPES } from "./types"

/**
 * BaseViewModel injects `repository` as a property (not a constructor
 * param), so container.get(...) is the only thing that proves
 * InversifyJS actually walks the prototype chain and assigns it —
 * `new HomeViewModel()` alone only proves the class field's own
 * default value works, not that the DI wiring does.
 */
describe("container", () => {
  it("property-injects the shared repository singleton into a resolved ViewModel", () => {
    const vm = container.get(HomeViewModel)
    const repository = (vm as unknown as { repository: Repository }).repository

    expect(repository.apiService).toBeInstanceOf(ApiServiceImpl)
    expect(repository).toBe(container.get<Repository>(TYPES.Repository))
  })

  it("reuses the same repository singleton across different resolved ViewModels", () => {
    const homeVm1 = container.get(HomeViewModel)
    const homeVm2 = container.get(HomeViewModel)

    const repository1 = (homeVm1 as unknown as { repository: unknown }).repository
    const repository2 = (homeVm2 as unknown as { repository: unknown }).repository

    expect(repository1).toBe(repository2)
  })

  it("resolves ViewModels in transient scope (creates a new instance on every resolution)", () => {
    const homeVm1 = container.get(HomeViewModel)
    const homeVm2 = container.get(HomeViewModel)

    expect(homeVm1).not.toBe(homeVm2)
  })

  it("resolves MasterApiService against a separate Api instance pointed at the second base URL", () => {
    const mainApi = container.get(Api)
    const masterApi = container.get<Api>(TYPES.MasterApi)

    expect(masterApi).not.toBe(mainApi)
    expect(masterApi.config.url).toBe(Config.MASTER_API_URL)
    expect(mainApi.config.url).toBe(Config.API_URL)
    expect(mainApi.config.url).not.toBe(masterApi.config.url)

    const masterApiService = container.get<MasterApiService>(TYPES.MasterApiService)
    expect(masterApiService).toBeInstanceOf(MasterApiServiceImpl)
  })
})
