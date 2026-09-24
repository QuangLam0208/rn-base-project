import { inject, injectable } from "inversify"
import { runInAction } from "mobx"

import { Repository } from "@/data/Repository"
import { TYPES } from "@/di/types"
import { showError, showNormal, showSuccess, showWarning, ToastOptions } from "@/utils/toast"

/**
 * Every ViewModel calls the API (and, eventually, local storage), so
 * the shared dependency is injected as a property here instead of a
 * constructor param each subclass would otherwise have to re-declare
 * and forward via super(repository) — InversifyJS resolves property
 * injections by walking the whole prototype chain, so subclasses get
 * this for free with no @inject() of their own. Mirrors
 * ai-project-android's BaseFragmentViewModel(Repository repository, ...),
 * minus the per-subclass forwarding boilerplate constructor injection
 * would need here. Access endpoints via `this.repository.apiService`,
 * local storage via `this.repository.roomService`.
 *
 * No default value here (unlike every constructor-injected field
 * elsewhere in the DI graph) — the `!` is a definite assignment
 * assertion, not a promise the field starts populated. For a
 * *constructor* param, InversifyJS passes the resolved dependency as
 * a real argument, so a default value is simply never evaluated when
 * going through the container — only when nothing is passed (e.g.
 * `new X()` in a test). A *property* injection is different:
 * InversifyJS constructs the instance first (running any field
 * initializer unconditionally) and only assigns the resolved value
 * afterward, so a default value here would construct a real
 * `AppRepositoryImpl` on every single `container.get(XViewModel)`
 * call just to immediately discard it. Dropping the default avoids
 * that; the trade-off is `new XViewModel()` (tests, or any code that
 * doesn't go through the container) now needs to assign
 * `repository` itself before calling a method that reads it — see
 * any `*ViewModel.test.ts`'s `mockApiServiceOf()` helper.
 */
@injectable()
export abstract class BaseViewModel {
  isLoading = false
  error: string | null = null

  @inject(TYPES.Repository) protected repository!: Repository

  protected async runAction(fn: () => Promise<void>): Promise<void> {
    runInAction(() => {
      this.isLoading = true
      this.error = null
    })

    try {
      await fn()
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : "Unknown error"
      })
    } finally {
      runInAction(() => {
        this.isLoading = false
      })
    }
  }

  showSuccessMessage(message: string, options?: ToastOptions): void {
    showSuccess(message, options)
  }

  showErrorMessage(message: string, options?: ToastOptions): void {
    showError(message, options)
  }

  showWarningMessage(message: string, options?: ToastOptions): void {
    showWarning(message, options)
  }

  showNormalMessage(message: string, options?: ToastOptions): void {
    showNormal(message, options)
  }
}
