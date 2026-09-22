import { MentorDetailViewModel } from "./MentorDetailViewModel"

describe("MentorDetailViewModel", () => {
  const mockMentor = {
    id: 9722085258788864,
    position: "Leader",
    description: "Experienced mentor in mobile and backend development.",
    account: {
      id: 9722085258788864,
      fullName: "chien mentor",
      email: "chienmentor@gmail.com",
      phone: "0978727227",
      avatarPath: "/LOGO/LOGO_T0Y7kwgANC.jpg",
      group: {
        id: 9702288396681216,
        name: "ROLE MENTOR",
      },
    },
  }

  let vm: MentorDetailViewModel
  let mockApiService: {
    getMentor: jest.Mock
  }

  beforeEach(() => {
    mockApiService = {
      getMentor: jest.fn().mockResolvedValue(mockMentor),
    }

    vm = new MentorDetailViewModel()
    ;(vm as unknown as { repository: { apiService: typeof mockApiService } }).repository = {
      apiService: mockApiService,
    }
  })

  it("initializes with null mentor and idle state", () => {
    expect(vm.mentor).toBeNull()
    expect(vm.isLoadingDetail).toBe(false)
    expect(vm.detailError).toBeNull()
  })

  it("uses initialMentor immediately while fetching latest profile", async () => {
    const initialMentor = {
      id: 9722085258788864,
      position: "Leader",
      account: { id: 9722085258788864, fullName: "chien mentor" },
    }

    const promise = vm.loadMentor(9722085258788864, initialMentor)
    // Check initial assignment before async resolution
    expect(vm.mentor).toEqual(initialMentor)
    expect(vm.isLoadingDetail).toBe(false) // Not blocking since initial data exists

    await promise
    expect(mockApiService.getMentor).toHaveBeenCalledWith(9722085258788864)
    expect(vm.mentor?.account?.email).toBe("chienmentor@gmail.com")
  })

  it("sets isLoadingDetail when no initial mentor provided", async () => {
    await vm.loadMentor(9722085258788864)

    expect(mockApiService.getMentor).toHaveBeenCalledWith(9722085258788864)
    expect(vm.mentor).toEqual(mockMentor)
    expect(vm.isLoadingDetail).toBe(false)
    expect(vm.detailError).toBeNull()
  })

  it("handles getMentor error gracefully", async () => {
    mockApiService.getMentor.mockRejectedValueOnce(new Error("network error"))

    await vm.loadMentor(9722085258788864)

    expect(vm.mentor).toBeNull()
    expect(vm.detailError).toBe("error-load-mentor-detail")
    expect(vm.isLoadingDetail).toBe(false)
  })
})
