import { MentorsViewModel } from "./MentorsViewModel"

describe("MentorsViewModel", () => {
  const mockMentor1 = {
    id: 1,
    position: "Senior React Native Engineer",
    description: "5 years of experience in mobile development.",
    account: {
      id: 10,
      fullName: "Nguyen Van A",
      avatarPath: "/avatar/10.jpg",
    },
  }

  const mockMentor2 = {
    id: 2,
    position: "Backend Architect",
    description: "Cloud and microservices expert.",
    account: {
      id: 20,
      fullName: "Tran Van B",
      avatarPath: "/avatar/20.jpg",
    },
  }

  let vm: MentorsViewModel
  let mockApiService: {
    getMentors: jest.Mock
  }

  beforeEach(() => {
    mockApiService = {
      getMentors: jest.fn().mockResolvedValue({
        content: [mockMentor1],
        totalElements: 2,
        totalPages: 2,
      }),
    }

    vm = new MentorsViewModel()
    ;(vm as unknown as { repository: { apiService: typeof mockApiService } }).repository = {
      apiService: mockApiService,
    }
  })

  it("initializes with empty state and default pagination values", () => {
    expect(vm.mentors).toEqual([])
    expect(vm.isInitialLoading).toBe(false)
    expect(vm.isRefreshing).toBe(false)
    expect(vm.isLoadingMore).toBe(false)
    expect(vm.page).toBe(0)
    expect(vm.pageSize).toBe(10)
    expect(vm.totalPages).toBe(1)
    expect(vm.totalElements).toBe(0)
    expect(vm.error).toBeNull()
  })

  it("loads first page of mentors successfully", async () => {
    await vm.loadMentors()

    expect(mockApiService.getMentors).toHaveBeenCalledWith(0, 10)
    expect(vm.mentors).toHaveLength(1)
    expect(vm.mentors[0].position).toBe("Senior React Native Engineer")
    expect(vm.mentors[0].account?.fullName).toBe("Nguyen Van A")
    expect(vm.page).toBe(0)
    expect(vm.totalPages).toBe(2)
    expect(vm.totalElements).toBe(2)
    expect(vm.hasMorePages).toBe(true)
    expect(vm.isInitialLoading).toBe(false)
    expect(vm.error).toBeNull()
  })

  it("handles pull-to-refresh correctly", async () => {
    await vm.refreshMentors()

    expect(mockApiService.getMentors).toHaveBeenCalledWith(0, 10)
    expect(vm.mentors).toHaveLength(1)
    expect(vm.isRefreshing).toBe(false)
  })

  it("loads more mentors on next page and appends to list", async () => {
    await vm.loadMentors()

    mockApiService.getMentors.mockResolvedValueOnce({
      content: [mockMentor2],
      totalElements: 2,
      totalPages: 2,
    })

    await vm.loadMoreMentors()

    expect(mockApiService.getMentors).toHaveBeenCalledWith(1, 10)
    expect(vm.mentors).toHaveLength(2)
    expect(vm.mentors[0].id).toBe(1)
    expect(vm.mentors[1].id).toBe(2)
    expect(vm.page).toBe(1)
    expect(vm.hasMorePages).toBe(false)
    expect(vm.isLoadingMore).toBe(false)
  })

  it("does not load more when already on the last page", async () => {
    await vm.loadMentors()
    vm.page = 1
    vm.totalPages = 2 // page == totalPages - 1 -> no more pages

    mockApiService.getMentors.mockClear()
    await vm.loadMoreMentors()

    expect(mockApiService.getMentors).not.toHaveBeenCalled()
  })

  it("handles mentor loading failure gracefully", async () => {
    mockApiService.getMentors.mockRejectedValueOnce(new Error("network-error"))

    await vm.loadMentors()

    expect(vm.mentors).toEqual([])
    expect(vm.error).toBe("error-load-mentors")
    expect(vm.isInitialLoading).toBe(false)
  })
})
