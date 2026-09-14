/**
 * Sitemap generator — run before `vite build` to produce public/sitemap.xml.
 *
 * Static pages are hardcoded below.
 * Dynamic pages are fetched from the API at build time; if the API is offline
 * those sections are skipped and a warning is printed (the build still succeeds).
 *
 * Usage:
 *   node scripts/generate-sitemap.js        # standalone
 *   npm run build                           # automatically runs this first
 */

import { writeFileSync, readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { blogs } from '../src/data/blogs.js'
import { news } from '../src/data/news.js'
import { caseStudies } from '../src/dummyData/case-study.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const SITE = 'https://roffr.com'
const TODAY = new Date().toISOString().slice(0, 10)

// ── Load .env ────────────────────────────────────────────────────────────────

function loadEnv() {
  const p = resolve(ROOT, '.env')
  if (!existsSync(p)) return {}
  return Object.fromEntries(
    readFileSync(p, 'utf-8')
      .split('\n')
      .map(l => l.trim())
      .filter(l => l && !l.startsWith('#') && l.includes('='))
      .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] }),
  )
}

const env = loadEnv()
const API = (env.VITE_API_BASE_URL || 'http://localhost:3333').replace(/\/$/, '')

// ── Helpers ──────────────────────────────────────────────────────────────────

async function apiFetch(path) {
  try {
    const res = await fetch(`${API}${path}`, { signal: AbortSignal.timeout(12000) })
    if (!res.ok) {
      console.warn(`  ⚠  API ${path} → HTTP ${res.status}`)
      return null
    }
    return res.json()
  } catch (err) {
    console.warn(`  ⚠  API ${path} unreachable: ${err.message}`)
    return null
  }
}

function toDate(val) {
  if (!val) return TODAY
  const d = new Date(val)
  return isNaN(d.getTime()) ? TODAY : d.toISOString().slice(0, 10)
}

function urlEntry(loc, { lastmod = TODAY, changefreq = 'weekly', priority = '0.5' } = {}) {
  return (
    '  <url>\n' +
    `    <loc>${SITE}${loc}</loc>\n` +
    `    <lastmod>${lastmod}</lastmod>\n` +
    `    <changefreq>${changefreq}</changefreq>\n` +
    `    <priority>${priority}</priority>\n` +
    '  </url>'
  )
}

// ── Static pages ─────────────────────────────────────────────────────────────

const STATIC_PAGES = [
  ['/',                 { changefreq: 'daily',   priority: '1.0' }],
  ['/project',         { changefreq: 'daily',   priority: '0.9' }],
  ['/properties',      { changefreq: 'daily',   priority: '0.9' }],
  ['/search',          { changefreq: 'daily',   priority: '0.8' }],
  ['/channel-partners',{ changefreq: 'weekly',  priority: '0.8' }],
  ['/builders',        { changefreq: 'weekly',  priority: '0.8' }],
  ['/broker-list',     { changefreq: 'weekly',  priority: '0.7' }],
  ['/resources',       { changefreq: 'weekly',  priority: '0.7' }],
  ['/articles',        { changefreq: 'weekly',  priority: '0.7' }],
  ['/news',            { changefreq: 'daily',   priority: '0.7' }],
  ['/case-study',      { changefreq: 'weekly',  priority: '0.6' }],
  ['/loan',            { changefreq: 'monthly', priority: '0.7' }],
  ['/corporate',       { changefreq: 'monthly', priority: '0.6' }],
  ['/group',           { changefreq: 'weekly',  priority: '0.6' }],
  ['/channel-partner', { changefreq: 'monthly', priority: '0.6' }],
  ['/about',           { changefreq: 'monthly', priority: '0.5' }],
  ['/contact',         { changefreq: 'monthly', priority: '0.5' }],
]

// ── Main ─────────────────────────────────────────────────────────────────────

async function generate() {
  console.log(`\n🗺  Generating sitemap for ${SITE}`)
  console.log(`   API: ${API}\n`)

  const entries = []

  // Static pages
  for (const [loc, opts] of STATIC_PAGES) {
    entries.push(urlEntry(loc, { lastmod: TODAY, ...opts }))
  }
  console.log(`  ✓ ${STATIC_PAGES.length} static pages`)

  // ── Projects ──────────────────────────────────────────────────────────────
  const projRes = await apiFetch('/projects?type=project&limit=2000&page=1')
  const projects = projRes?.data?.projects ?? projRes?.projects ?? []
  if (projects.length) {
    for (const p of projects) {
      const id = p._id ?? p.id
      if (!id) continue
      entries.push(urlEntry(`/project-details/${id}`, {
        lastmod: toDate(p.updatedAt ?? p.createdAt),
        changefreq: 'weekly',
        priority: '0.8',
      }))
    }
    console.log(`  ✓ ${projects.length} projects`)
  } else {
    console.warn('  ⚠  Projects skipped (API offline or empty)')
  }

  // ── Properties ────────────────────────────────────────────────────────────
  const propRes = await apiFetch('/projects?type=property&limit=2000&page=1')
  const properties =
    propRes?.data?.results ??
    propRes?.results ??
    propRes?.data?.projects ??
    []
  if (properties.length) {
    for (const p of properties) {
      const id = p._id ?? p.id
      if (!id) continue
      entries.push(urlEntry(`/property-details/${id}`, {
        lastmod: toDate(p.updatedAt ?? p.createdAt),
        changefreq: 'weekly',
        priority: '0.8',
      }))
    }
    console.log(`  ✓ ${properties.length} properties`)
  } else {
    console.warn('  ⚠  Properties skipped (API offline or empty)')
  }

  // ── Builders ──────────────────────────────────────────────────────────────
  const builderRes = await apiFetch('/company?pageNumber=1&pageSize=2000')
  const builders =
    builderRes?.data?.companies ??
    (Array.isArray(builderRes?.data) ? builderRes.data : null) ??
    []
  if (builders.length) {
    for (const b of builders) {
      const id = b._id ?? b.id
      if (!id) continue
      entries.push(urlEntry(`/builders/${id}`, {
        lastmod: toDate(b.updatedAt ?? b.createdAt),
        changefreq: 'monthly',
        priority: '0.7',
      }))
    }
    console.log(`  ✓ ${builders.length} builders`)
  } else {
    console.warn('  ⚠  Builders skipped (API offline or empty)')
  }

  // ── Brokers / Channel Partners ────────────────────────────────────────────
  const brokerRes = await apiFetch('/users?pageNumber=1&pageSize=2000')
  const brokers =
    brokerRes?.data?.users ??
    (Array.isArray(brokerRes?.data) ? brokerRes.data : null) ??
    []
  if (brokers.length) {
    for (const b of brokers) {
      const id = b._id ?? b.id
      if (!id) continue
      const lastmod = toDate(b.updatedAt ?? b.createdAt)
      // Both URL shapes point to the same detail component
      entries.push(urlEntry(`/broker-details/${id}`,    { lastmod, changefreq: 'monthly', priority: '0.7' }))
      entries.push(urlEntry(`/channel-partners/${id}`,  { lastmod, changefreq: 'monthly', priority: '0.7' }))
    }
    console.log(`  ✓ ${brokers.length} brokers (×2 URL shapes)`)
  } else {
    console.warn('  ⚠  Brokers skipped (API offline or empty)')
  }

  // ── Static-data: blogs ────────────────────────────────────────────────────
  for (const b of blogs) {
    if (!b.slug) continue
    entries.push(urlEntry(`/blog-details/${b.slug}`, {
      lastmod: TODAY,
      changefreq: 'monthly',
      priority: '0.6',
    }))
  }
  console.log(`  ✓ ${blogs.length} blogs (static data)`)

  // ── Static-data: news ─────────────────────────────────────────────────────
  for (const n of news) {
    if (!n.id) continue
    entries.push(urlEntry(`/news/${n.id}`, {
      lastmod: toDate(n.date?.iso),
      changefreq: 'monthly',
      priority: '0.6',
    }))
  }
  console.log(`  ✓ ${news.length} news items (static data)`)

  // ── Static-data: case studies ─────────────────────────────────────────────
  for (const c of caseStudies) {
    const id = c._id ?? c.slug
    if (!id) continue
    entries.push(urlEntry(`/case-details/${id}`, {
      lastmod: toDate(c.createdAt),
      changefreq: 'monthly',
      priority: '0.6',
    }))
  }
  console.log(`  ✓ ${caseStudies.length} case studies (static data)`)

  // ── Write file ────────────────────────────────────────────────────────────
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<!-- Generated ${new Date().toISOString()} — run "npm run sitemap" to refresh -->`,
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    '</urlset>',
  ].join('\n')

  const out = resolve(ROOT, 'public', 'sitemap.xml')
  writeFileSync(out, xml, 'utf-8')
  console.log(`\n✅ Wrote ${entries.length} URLs → public/sitemap.xml\n`)
}

generate().catch(err => {
  console.error('❌ Sitemap generation failed:', err)
  process.exit(1)
})
