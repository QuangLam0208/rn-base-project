import { injectable } from "inversify"
import { actionBound, makeObservable, observable } from "mobx"

import { CourseResponse } from "@/data/model/api/response/course/CourseResponse"
import { SyllabusResponse } from "@/data/model/api/response/course/SyllabusResponse"
import { BaseViewModel } from "@/viewmodels/base/BaseViewModel"

@injectable()
export class CoursesViewModel extends BaseViewModel {
  courses: CourseResponse[] = []
  isInitialLoading = false
  isRefreshing = false
  expandedCourseIds: Record<number, boolean> = {}
  syllabusMap: Record<number, SyllabusResponse[]> = {}
  syllabusLoadingMap: Record<number, boolean> = {}
  expandedSyllabusItemIds: Record<number, boolean> = {}

  constructor() {
    super()
    makeObservable(this, {
      courses: observable,
      isInitialLoading: observable,
      isRefreshing: observable,
      expandedCourseIds: observable,
      syllabusMap: observable,
      syllabusLoadingMap: observable,
      expandedSyllabusItemIds: observable,
      isLoading: observable,
      error: observable,
      loadCourses: actionBound,
      refreshCourses: actionBound,
      toggleCourseSyllabus: actionBound,
      toggleSyllabusItem: actionBound,
    })
  }

  async loadCourses(isPullToRefresh = false) {
    if (isPullToRefresh) {
      this.isRefreshing = true
    } else {
      this.isInitialLoading = true
    }
    this.error = null

    try {
      const pageData = await this.repository.apiService.getCourses(0, 20)
      this.courses = pageData.content ?? []
    } catch (err) {
      this.error = "error-load-courses"
    } finally {
      this.isInitialLoading = false
      this.isRefreshing = false
    }
  }

  async refreshCourses() {
    await this.loadCourses(true)
  }

  async toggleCourseSyllabus(courseId: number) {
    const isCurrentlyExpanded = !!this.expandedCourseIds[courseId]
    this.expandedCourseIds = {
      ...this.expandedCourseIds,
      [courseId]: !isCurrentlyExpanded,
    }

    if (!isCurrentlyExpanded && !this.syllabusMap[courseId]) {
      this.syllabusLoadingMap = {
        ...this.syllabusLoadingMap,
        [courseId]: true,
      }
      try {
        const pageData = await this.repository.apiService.getSyllabuses(courseId, 0, 20)
        this.syllabusMap = {
          ...this.syllabusMap,
          [courseId]: pageData.content ?? [],
        }
      } catch (err) {
        this.syllabusMap = {
          ...this.syllabusMap,
          [courseId]: [],
        }
      } finally {
        this.syllabusLoadingMap = {
          ...this.syllabusLoadingMap,
          [courseId]: false,
        }
      }
    }
  }

  toggleSyllabusItem(syllabusId: number) {
    this.expandedSyllabusItemIds = {
      ...this.expandedSyllabusItemIds,
      [syllabusId]: !this.expandedSyllabusItemIds[syllabusId],
    }
  }
}
