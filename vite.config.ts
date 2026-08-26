import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Serve public/demos/<id>/index.html for the directory URL /demos/<id>/.
 *
 * Without this the project cards in section 3 all open *this* portfolio.
 * Vite's dev server is appType 'spa', so its history-fallback middleware
 * answers any unmatched navigation — a bare directory path very much
 * included — with the root index.html, and returns 200 while doing it. The
 * static handler for public/ never gets to resolve the directory, so
 * /demos/nova/ silently renders the portfolio instead of the demo.
 *
 * Registered in the hook body rather than in a returned function, which is
 * what makes it a *pre* middleware: it has to rewrite the URL before the
 * fallback sees it. Applied to preview too, which has the same fallback.
 */
function serveDemoIndexes(): Plugin {
  const rewrite = (req: { url?: string }) => {
    const [pathname, query] = (req.url ?? '').split('?')
    const match = /^\/demos\/([a-z0-9][a-z0-9-]*)\/?$/.exec(pathname)
    if (match) req.url = `/demos/${match[1]}/index.html${query ? `?${query}` : ''}`
  }

  return {
    name: 'serve-demo-indexes',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        rewrite(req)
        next()
      })
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, _res, next) => {
        rewrite(req)
        next()
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), serveDemoIndexes()],
})
