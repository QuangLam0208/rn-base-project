import { CompaniesViewModel } from "./CompaniesViewModel"

describe("CompaniesViewModel", () => {
  const mockCompanies = [
    {
      id: 1,
      name: "TMA Solutions",
      avatar: "/companies/tma.png",
    },
  ]

  let vm: CompaniesViewModel
  let mockApiService: {
    getPublicCompanies: jest.Mock
  }

  beforeEach(() => {
    mockApiService = {
      getPublicCompanies: jest.fn().mockResolvedValue({
        content: mockCompanies,
        totalElements: 1,
        totalPages: 1,
      }),
    }

    vm = new CompaniesViewModel()
    ;(vm as unknown as { repository: { apiService: typeof mockApiService } }).repository = {
      apiService: mockApiService,
    }
  })

  it("initializes with empty state", () => {
    expect(vm.companies).toEqual([])
    expect(vm.isInitialLoading).toBe(false)
    expect(vm.isRefreshing).toBe(false)
    expect(vm.error).toBeNull()
  })

  it("loads companies successfully", async () => {
    await vm.loadCompanies()

    expect(mockApiService.getPublicCompanies).toHaveBeenCalledWith(0, 50)
    expect(vm.companies).toHaveLength(1)
    expect(vm.companies[0].name).toBe("TMA Solutions")
    expect(vm.isInitialLoading).toBe(false)
    expect(vm.error).toBeNull()
  })

  it("handles pull-to-refresh correctly", async () => {
    await vm.refreshCompanies()

    expect(mockApiService.getPublicCompanies).toHaveBeenCalledWith(0, 50)
    expect(vm.companies).toHaveLength(1)
    expect(vm.isRefreshing).toBe(false)
  })

  it("handles company loading failure gracefully", async () => {
    mockApiService.getPublicCompanies.mockRejectedValueOnce(new Error("network-error"))

    await vm.loadCompanies()

    expect(vm.companies).toEqual([])
    expect(vm.error).toBe("error-load-companies")
    expect(vm.isInitialLoading).toBe(false)
  })
})
