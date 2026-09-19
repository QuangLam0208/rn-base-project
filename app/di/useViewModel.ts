import { useState } from "react"
import { interfaces } from "inversify"

import { container } from "./container"

/**
 * Resolves a ViewModel through the DI container once per screen mount —
 * the RN equivalent of Android's ViewModelProviderFactory. Use in place
 * of `useState(() => new XViewModel())`.
 */
export function useViewModel<T>(identifier: interfaces.ServiceIdentifier<T>): T {
  const [viewModel] = useState(() => container.get(identifier))
  return viewModel
}
