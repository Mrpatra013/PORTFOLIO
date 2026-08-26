#!/usr/bin/env node
// Copy a project's production build into public/demos/<id>/ so the deck card in
// section 3 can open it at http://localhost:5173/demos/<id>/ — no second dev
// server, nothing deployed.
//
//   node scripts/add-demo.mjs nova ~/code/nova/dist
//   npm run demos:sync          # rebuild the manifest after deleting a folder
//
// IMPORTANT: build each project with a matching base path first, or its asset
// URLs resolve against the portfolio root and the page loads blank:
//
//   npx vite build --base=/demos/nova/     # Vite
//   "homepage": "/demos/nova/"             # CRA, in its package.json
//   basePath + output: 'export'            # Next.js (static export only)
//
// After copying, uncomment that project's `demo:` line in src/data/site.ts.
import { existsSync } from 'node:fs'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const demosDir = path.join(root, 'public', 'demos')

const fail = (message) => {
  console.error(`add-demo: ${message}`)
  process.exit(1)
}

/**
 * Rewrites public/demos/manifest.json from whatever is actually on disk. Each
 * demo folder carries a demo.json sentinel, so a half-copied or hand-deleted
 * folder can't leave a phantom entry behind.
 */
async function syncManifest() {
  await fs.mkdir(demosDir, { recursive: true })
  const entries = await fs.readdir(demosDir, { withFileTypes: true })

  const demos = []
  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const hasSentinel = existsSync(path.join(demosDir, entry.name, 'demo.json'))
    const hasIndex = existsSync(path.join(demosDir, entry.name, 'index.html'))
    if (hasSentinel && hasIndex) demos.push(entry.name)
  }
  demos.sort()

  await fs.writeFile(
    path.join(demosDir, 'manifest.json'),
    `${JSON.stringify({ demos }, null, 2)}\n`,
  )
  return demos
}

async function addDemo(id, srcDir) {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(id)) {
    fail(`id "${id}" must be lowercase letters, digits and dashes — it becomes the URL path.`)
  }

  const src = path.resolve(srcDir)
  if (!existsSync(src)) fail(`no such directory: ${src}`)
  if (!existsSync(path.join(src, 'index.html'))) {
    fail(`${src} has no index.html — point this at the project's build output (usually dist/), not its source.`)
  }

  const dest = path.join(demosDir, id)
  // Replace rather than merge: leftovers from a previous build would sit next
  // to the new hashed assets forever.
  await fs.rm(dest, { recursive: true, force: true })
  await fs.mkdir(dest, { recursive: true })
  await fs.cp(src, dest, { recursive: true })

  await fs.writeFile(
    path.join(dest, 'demo.json'),
    `${JSON.stringify({ id, builtAt: new Date().toISOString() }, null, 2)}\n`,
  )

  const html = await fs.readFile(path.join(dest, 'index.html'), 'utf8')
  if (/(src|href)="\/(?!demos\/)/.test(html)) {
    console.warn(
      `add-demo: warning — ${id}/index.html references root-absolute assets (e.g. src="/assets/...").\n` +
        `           Rebuild it with a base of /demos/${id}/ or the demo will load blank.`,
    )
  }

  const demos = await syncManifest()
  console.log(`add-demo: ${id} → public/demos/${id}/  (open http://localhost:5173/demos/${id}/)`)
  console.log(`add-demo: manifest now lists ${demos.length} demo(s): ${demos.join(', ') || 'none'}`)
  console.log(`add-demo: uncomment  demo: '/demos/${id}/'  on the "${id}" entry in src/data/site.ts`)
}

const [first, second] = process.argv.slice(2)

if (first === '--sync') {
  const demos = await syncManifest()
  console.log(`add-demo: manifest lists ${demos.length} demo(s): ${demos.join(', ') || 'none'}`)
} else if (first && second) {
  await addDemo(first, second)
} else {
  fail('usage: node scripts/add-demo.mjs <id> <path-to-build-output>   |   node scripts/add-demo.mjs --sync')
}
