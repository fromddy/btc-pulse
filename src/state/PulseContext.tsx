import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { loadCachedPulse, loadPulse, type PulsePayload } from '../data/loadPulse'
import {
  advanceLoadSteps,
  completeLoadSteps,
  initialLoadSteps,
  type LoadStepState,
} from '../data/loadSteps'

interface PulseState {
  data: PulsePayload | null
  loading: boolean
  /** First open of the session: show thinking UI before revealing the verdict. */
  booting: boolean
  thinkingSteps: LoadStepState[]
  error: string | null
  refresh: (opts?: { force?: boolean }) => Promise<void>
}

const Ctx = createContext<PulseState | null>(null)

export function PulseProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<PulsePayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [booting, setBooting] = useState(true)
  const [thinkingSteps, setThinkingSteps] = useState<LoadStepState[]>(
    initialLoadSteps,
  )
  const [error, setError] = useState<string | null>(null)
  const hasBootedRef = useRef(false)

  const refresh = useCallback(async (opts?: { force?: boolean }) => {
    const force = opts?.force ?? false
    const paced = !hasBootedRef.current
    setLoading(true)
    setError(null)
    if (paced || !hasBootedRef.current) {
      setThinkingSteps(initialLoadSteps())
    }
    try {
      const payload = await loadPulse({
        force,
        paced,
        onStep: (step) => {
          setThinkingSteps((prev) => advanceLoadSteps(prev, step))
        },
      })
      setThinkingSteps((prev) => completeLoadSteps(prev))
      setData(payload)
    } catch (err) {
      const cached = loadCachedPulse()
      if (cached) {
        setData(cached)
        setError(err instanceof Error ? err.message : 'load failed')
      } else {
        setError(err instanceof Error ? err.message : 'load failed')
      }
    } finally {
      hasBootedRef.current = true
      setLoading(false)
      setBooting(false)
    }
  }, [])

  useEffect(() => {
    void refresh({ force: false })
  }, [refresh])

  const value = useMemo(
    () => ({ data, loading, booting, thinkingSteps, error, refresh }),
    [data, loading, booting, thinkingSteps, error, refresh],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function usePulse() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('usePulse outside provider')
  return ctx
}
