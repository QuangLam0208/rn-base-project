import { CoursesViewModel } from "./CoursesViewModel"

describe("CoursesViewModel", () => {
  const mockCourses = [
    {
      id: 1,
      name: "ReactJS GraphQL Course",
      price: 7500000,
      shortDescription: "• Lazy loading\n• GraphQL",
      avatar: "https://example.com/avatar.png",
    },
  ]

  const mockSyllabuses = [
    {
      id: 101,
      name: "Stage 1: Fundamentals",
      description: "Basics of React and GraphQL",
    },
  ]

  let vm: CoursesViewModel
  let mockApiService: {
    getCourses: jest.Mock
    getSyllabuses: jest.Mock
  }

  beforeEach(() => {
    mockApiService = {
      getCourses: jest.fn().mockResolvedValue({
        content: mockCourses,
        totalElements: 1,
        totalPages: 1,
      }),
      getSyllabuses: jest.fn().mockResolvedValue({
        content: mockSyllabuses,
        totalElements: 1,
        totalPages: 1,
      }),
    }

    vm = new CoursesViewModel()
    ;(vm as unknown as { repository: { apiService: typeof mockApiService } }).repository = {
      apiService: mockApiService,
    }
  })

  it("initializes with empty state", () => {
    expect(vm.courses).toEqual([])
    expect(vm.isInitialLoading).toBe(false)
    expect(vm.isRefreshing).toBe(false)
    expect(vm.error).toBeNull()
  })

  it("loads courses successfully", async () => {
    await vm.loadCourses()

    expect(mockApiService.getCourses).toHaveBeenCalledWith(0, 20)
    expect(vm.courses).toHaveLength(1)
    expect(vm.courses[0].name).toBe("ReactJS GraphQL Course")
    expect(vm.isInitialLoading).toBe(false)
    expect(vm.error).toBeNull()
  })

  it("handles course loading failure gracefully", async () => {
    mockApiService.getCourses.mockRejectedValueOnce(new Error("network-error"))

    await vm.loadCourses()

    expect(vm.courses).toEqual([])
    expect(vm.error).toBe("error-load-courses")
    expect(vm.isInitialLoading).toBe(false)
  })

  it("toggles course syllabus and fetches data when expanded for the first time", async () => {
    await vm.loadCourses()

    expect(vm.expandedCourseIds[1]).toBeFalsy()

    await vm.toggleCourseSyllabus(1)

    expect(vm.expandedCourseIds[1]).toBe(true)
    expect(mockApiService.getSyllabuses).toHaveBeenCalledWith(1, 0, 20)
    expect(vm.syllabusMap[1]).toEqual(mockSyllabuses)

    // Collapsing should not re-fetch
    await vm.toggleCourseSyllabus(1)
    expect(vm.expandedCourseIds[1]).toBe(false)
    expect(mockApiService.getSyllabuses).toHaveBeenCalledTimes(1)
  })

  it("toggles individual syllabus items", () => {
    expect(vm.expandedSyllabusItemIds[101]).toBeFalsy()
    vm.toggleSyllabusItem(101)
    expect(vm.expandedSyllabusItemIds[101]).toBe(true)
    vm.toggleSyllabusItem(101)
    expect(vm.expandedSyllabusItemIds[101]).toBe(false)
  })
})
