import { injectable } from "inversify"
import { actionBound, computed, makeObservable, observable } from "mobx"

import { MentorResponse } from "@/data/model/api/response/mentor/MentorResponse"
import { BaseViewModel } from "@/viewmodels/base/BaseViewModel"

@injectable()
export class MentorsViewModel extends BaseViewModel {
  mentors: MentorResponse[] = []
  isInitialLoading = false
  isRefreshing = false
  isLoadingMore = false

  page = 0
  readonly pageSize = 10
  totalPages = 1
  totalElements = 0

  constructor() {
    super()
    makeObservable(this, {
      mentors: observable,
      isInitialLoading: observable,
      isRefreshing: observable,
      isLoadingMore: observable,
      page: observable,
      totalPages: observable,
      totalElements: observable,
      isLoading: observable,
      error: observable,
      hasMorePages: computed,
      loadMentors: actionBound,
      loadMoreMentors: actionBound,
      refreshMentors: actionBound,
    })
  }

  get hasMorePages(): boolean {
    return this.page < this.totalPages - 1
  }

  async loadMentors(isPullToRefresh = false) {
    if (isPullToRefresh) {
      this.isRefreshing = true
    } else {
      this.isInitialLoading = true
    }
    this.error = null

    try {
      const pageData = await this.repository.apiService.getMentors(0, this.pageSize)
      this.mentors = pageData.content ?? []
      this.page = 0
      this.totalPages = pageData.totalPages ?? 1
      this.totalElements = pageData.totalElements ?? 0
    } catch (err) {
      this.error = "error-load-mentors"
    } finally {
      this.isInitialLoading = false
      this.isRefreshing = false
    }
  }

  async loadMoreMentors() {
    if (
      this.isLoadingMore ||
      this.isInitialLoading ||
      this.isRefreshing ||
      !this.hasMorePages
    ) {
      return
    }

    this.isLoadingMore = true
    const nextPage = this.page + 1

    try {
      const pageData = await this.repository.apiService.getMentors(nextPage, this.pageSize)
      this.mentors = [...this.mentors, ...(pageData.content ?? [])]
      this.page = nextPage
      this.totalPages = pageData.totalPages ?? this.totalPages
      this.totalElements = pageData.totalElements ?? this.totalElements
    } catch (err) {
      // Keep existing items, but stop loading more indicator
    } finally {
      this.isLoadingMore = false
    }
  }

  async refreshMentors() {
    await this.loadMentors(true)
  }
}
