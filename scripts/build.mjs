// Build the site into dist/: the pages and assets here, with the tutorials bundled under tutorials/.
//
//   node scripts/build.mjs                         # tutorials from ../tutorials (the workspace layout)
//   node scripts/build.mjs --tutorials <folder>    # from anywhere else, e.g. a CI checkout
//   node scripts/build.mjs --out <folder>          # somewhere other than dist/
//   node scripts/build.mjs --no-releases           # skip the releases snapshot
//
// It also writes assets/releases.json, a snapshot of every tool's GitHub
// releases, which the pages read before asking GitHub themselves. It uses
// GITHUB_TOKEN when set (the Pages workflow sets it), else the local gh login,
// else no token at all; a repository it cannot read is left out, and the
// pages then ask GitHub for that one directly.
//
// The tutorials are their own repository (projectdigidream/digidream-tutorials)
// and stay a plain static site: everything in them is relative, so copying the
// folder under tutorials/ is all bundling takes. Their authoring files, tools
// and history are left out.
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync, readdirSync, statSync, readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import vm from 'node:vm'
import { dirname, join, resolve, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const arg = (name, fallback) => { const i = process.argv.indexOf(name); return i > 0 ? resolve(process.argv[i + 1]) : fallback }
const OUT = arg('--out', join(ROOT, 'dist'))
const TUT = arg('--tutorials', resolve(ROOT, '..', 'tutorials'))

const SITE = ['index.html', 'downloads.html', 'assets']
const SKIP_IN_TUTORIALS = new Set(['.git', '.github', 'node_modules', 'tools', 'AUTHORING.md', 'README.md', '.gitignore', '.DS_Store'])

if (!existsSync(join(TUT, 'assets', 'nav.js'))) {
  console.error(`no tutorials at ${TUT} (expected assets/nav.js there); pass --tutorials <folder>`)
  process.exit(1)
}
rmSync(OUT, { recursive: true, force: true })
mkdirSync(OUT, { recursive: true })
for (const f of SITE) cpSync(join(ROOT, f), join(OUT, f), { recursive: true, filter: (p) => basename(p) !== '.DS_Store' })
cpSync(TUT, join(OUT, 'tutorials'), { recursive: true, filter: (p) => p === TUT || !SKIP_IN_TUTORIALS.has(basename(p)) })
writeFileSync(join(OUT, '.nojekyll'), '') // GitHub Pages: serve files as they are

if (!process.argv.includes('--no-releases')) await snapshotReleases(join(OUT, 'assets', 'releases.json'))

async function snapshotReleases (file) {
  // the repository list is the one the pages use: run releases.js with just enough of a browser
  const ctx = { window: {}, document: { currentScript: null }, location: { href: 'https://example.invalid/' }, navigator: { userAgent: '' }, URL }
  vm.runInNewContext(readFileSync(join(ROOT, 'assets', 'releases.js'), 'utf8'), ctx)
  const R = ctx.window.DNP_RELEASES
  let token = process.env.GITHUB_TOKEN || ''
  if (!token) { try { token = execFileSync('gh', ['auth', 'token'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim() } catch (e) {} }
  const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'digidream-website-build', ...(token ? { Authorization: 'Bearer ' + token } : {}) }
  const slim = (rel) => ({
    tag_name: rel.tag_name, name: rel.name, published_at: rel.published_at, prerelease: rel.prerelease, draft: rel.draft, html_url: rel.html_url, body: rel.body,
    assets: rel.assets.map((a) => ({ name: a.name, size: a.size, download_count: a.download_count, browser_download_url: a.browser_download_url }))
  })
  const repos = {}
  for (const t of R.TOOLS) {
    const repo = R.repoOf(t)
    try {
      const res = await fetch(`https://api.github.com/repos/${repo}/releases?per_page=30`, { headers })
      if (!res.ok) throw new Error('HTTP ' + res.status)
      repos[repo] = (await res.json()).filter((x) => !x.draft).map(slim)
      console.log(`  releases: ${repo}: ${repos[repo].length}`)
    } catch (e) { console.warn(`  releases: ${repo}: not read (${e.message}); the pages will ask GitHub for it`) }
  }
  writeFileSync(file, JSON.stringify({ at: new Date().toISOString(), repos }) + '\n')
}

let files = 0; let bytes = 0
const walk = (d) => { for (const f of readdirSync(d)) { const p = join(d, f); const s = statSync(p); if (s.isDirectory()) walk(p); else { files++; bytes += s.size } } }
walk(OUT)
console.log(`built ${OUT}: ${files} files, ${(bytes / 1048576).toFixed(1)} MB (tutorials from ${TUT})`)
