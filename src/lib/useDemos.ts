// Which project demos are actually built and sitting in public/demos/.
//
// The `demo` paths in site.ts are a *declaration* — they say where a build
// would live, not that one is there. This hook is the check: scripts/add-demo.mjs
// rewrites public/demos/manifest.json every time a build is copied in or
// re-synced, so the manifest is the only thing that knows the truth. A card
// whose id is missing from it falls back to its GitHub link instead of opening
// a page that isn't there.
//
// Deliberately *not* a per-demo probe of /demos/<id>/…: Vite's dev server
// answers *any* unknown path — extension or not, .json included — with this
// portfolio's own index.html and a 200, so a missing demo is indistinguishable
// from a present one by status code. Measured, not assumed. That leaves a
// manifest rewritten from disk as the only trustworthy signal, and it means
// this fetch has to survive being handed HTML: res.json() rejects on it, which
// the catch below turns into "nothing available".
import { useEffect, useState } from 'react'

interface DemoManifest {
  demos?: unknown
}

const EMPTY: ReadonlySet<string> = new Set()

export function useAvailableDemos(): ReadonlySet<string> {
  const [available, setAvailable] = useState<ReadonlySet<string>>(EMPTY)

  useEffect(() => {
    const controller = new AbortController()

    // Every failure path — no manifest yet, malformed JSON, an aborted unmount
    // — resolves to "nothing is available". Cards render Code-only, which is
    // the correct answer when we can't prove a demo exists.
    fetch('/demos/manifest.json', { cache: 'no-store', signal: controller.signal })
      .then((res) => (res.ok ? (res.json() as Promise<DemoManifest>) : null))
      .then((manifest) => {
        if (!manifest || !Array.isArray(manifest.demos)) return
        setAvailable(new Set(manifest.demos.filter((id): id is string => typeof id === 'string')))
      })
      .catch(() => {})

    return () => controller.abort()
  }, [])

  return available
}
