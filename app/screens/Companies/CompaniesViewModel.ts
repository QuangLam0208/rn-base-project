import { injectable } from "inversify"
import { actionBound, makeObservable, observable } from "mobx"

import { CompanyResponse } from "@/data/model/api/response/company/CompanyResponse"
import { BaseViewModel } from "@/viewmodels/base/BaseViewModel"

@injectable()
export class CompaniesViewModel extends BaseViewModel {
  companies: CompanyResponse[] = []
  isInitialLoading = false
  isRefreshing = false

  constructor() {
    super()
    makeObservable(this, {
      companies: observable,
      isInitialLoading: observable,
      isRefreshing: observable,
      isLoading: observable,
      error: observable,
      loadCompanies: actionBound,
      refreshCompanies: actionBound,
    })
  }

  async loadCompanies(isPullToRefresh = false) {
    if (isPullToRefresh) {
      this.isRefreshing = true
    } else {
      this.isInitialLoading = true
    }
    this.error = null

    try {
      const pageData = await this.repository.apiService.getPublicCompanies(0, 50)
      this.companies = pageData.content ?? []
    } catch (err) {
      this.error = "error-load-companies"
    } finally {
      this.isInitialLoading = false
      this.isRefreshing = false
    }
  }

  async refreshCompanies() {
    await this.loadCompanies(true)
  }
}
