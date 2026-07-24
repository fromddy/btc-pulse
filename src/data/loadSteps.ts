export const LOAD_STEP_IDS = [
  'connect',
  'price',
  'sentiment',
  'indicators',
  'verdict',
] as const

export type LoadStepId = (typeof LOAD_STEP_IDS)[number]

export type LoadStepStatus = 'pending' | 'active' | 'done'

export interface LoadStepState {
  id: LoadStepId
  status: LoadStepStatus
}

export function initialLoadSteps(): LoadStepState[] {
  return LOAD_STEP_IDS.map((id, index) => ({
    id,
    status: index === 0 ? 'active' : 'pending',
  }))
}

export function advanceLoadSteps(
  steps: LoadStepState[],
  activeId: LoadStepId,
): LoadStepState[] {
  const activeIndex = LOAD_STEP_IDS.indexOf(activeId)
  return steps.map((step, index) => {
    if (index < activeIndex) return { ...step, status: 'done' }
    if (index === activeIndex) return { ...step, status: 'active' }
    return { ...step, status: 'pending' }
  })
}

export function completeLoadSteps(steps: LoadStepState[]): LoadStepState[] {
  return steps.map((step) => ({ ...step, status: 'done' }))
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
