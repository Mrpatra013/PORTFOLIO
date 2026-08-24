import { createContext, useContext, useState, type ReactNode } from 'react'

interface IntroReadyContextValue {
  ready: boolean
  setReady: (value: boolean) => void
}

const IntroReadyContext = createContext<IntroReadyContextValue | null>(null)

export function IntroReadyProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  return (
    <IntroReadyContext.Provider value={{ ready, setReady }}>
      {children}
    </IntroReadyContext.Provider>
  )
}

export function useIntroReady() {
  const ctx = useContext(IntroReadyContext)
  if (!ctx) throw new Error('useIntroReady must be used within an IntroReadyProvider')
  return ctx
}
