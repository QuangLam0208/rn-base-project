import { injectable } from "inversify"
import { actionBound, makeObservable, observable } from "mobx"

import { BaseViewModel } from "@/viewmodels/base/BaseViewModel"

/**
 * Minimal example ViewModel — a counter, just enough to show the MVVM
 * wiring (makeObservable + actionBound) working end to end. Replace
 * with real state/logic; see CLAUDE.md's "MVVM screen convention" and
 * "ApiService" sections for how to add a real endpoint-backed screen.
 */
@injectable()
export class HomeViewModel extends BaseViewModel {
  count = 0

  constructor() {
    super()
    makeObservable(this, {
      count: observable,
      isLoading: observable,
      error: observable,
      increment: actionBound,
    })
  }

  increment() {
    this.count += 1
  }
}
