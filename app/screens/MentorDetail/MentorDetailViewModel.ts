import { injectable } from "inversify"
import { actionBound, makeObservable, observable, runInAction } from "mobx"

import { MentorResponse } from "@/data/model/api/response/mentor/MentorResponse"
import { BaseViewModel } from "@/viewmodels/base/BaseViewModel"

@injectable()
export class MentorDetailViewModel extends BaseViewModel {
  mentor: MentorResponse | null = null
  isLoadingDetail = false
  detailError: string | null = null

  constructor() {
    super()
    makeObservable(this, {
      mentor: observable,
      isLoadingDetail: observable,
      detailError: observable,
      isLoading: observable,
      error: observable,
      loadMentor: actionBound,
    })
  }

  async loadMentor(id: number, initialMentor?: MentorResponse) {
    if (initialMentor) {
      this.mentor = initialMentor
    }

    if (!this.mentor) {
      this.isLoadingDetail = true
    }
    this.detailError = null

    try {
      const data = await this.repository.apiService.getMentor(id)
      runInAction(() => {
        this.mentor = data
      })
    } catch (err) {
      runInAction(() => {
        this.detailError = "error-load-mentor-detail"
      })
    } finally {
      runInAction(() => {
        this.isLoadingDetail = false
      })
    }
  }
}
