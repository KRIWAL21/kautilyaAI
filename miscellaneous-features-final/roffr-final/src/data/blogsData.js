import rawData from '@/data/1000_blogs.json'

// ── Curated Unsplash real-estate image pool ──────────────────────────────────
// 20 specific photo IDs — stable URLs, no API key needed.
// They cycle by blog_number so each of the 100 blogs gets a distinct cover.
const UNSPLASH = [
  // exterior homes & buildings
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80&fit=crop',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80&fit=crop',
  'https://images.unsplash.com/photo-1570129477492-45c003edd2f0?w=800&q=80&fit=crop',
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80&fit=crop',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80&fit=crop',
  'https://images.unsplash.com/photo-1582407947304-d02f8f82b326?w=800&q=80&fit=crop',
  'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80&fit=crop',
  'https://images.unsplash.com/photo-1484154218959-e519c3e46374?w=800&q=80&fit=crop',
  // interiors & luxury
  'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80&fit=crop',
  'https://images.unsplash.com/photo-1605276374104-dee6a582c4aa?w=800&q=80&fit=crop',
  'https://images.unsplash.com/photo-1567496898372-16a4bdd2f4b2?w=800&q=80&fit=crop',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80&fit=crop',
  'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80&fit=crop',
  // city skylines & investment
  'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80&fit=crop',
  'https://images.unsplash.com/photo-1524230572899-a752b3a038d9?w=800&q=80&fit=crop',
  'https://images.unsplash.com/photo-1545324418-5b87c2c0fa30?w=800&q=80&fit=crop',
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80&fit=crop',
  // agents / keys / deal-making
  'https://images.unsplash.com/photo-1460467407225-6b5ca2929527?w=800&q=80&fit=crop',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80&fit=crop',
  'https://images.unsplash.com/photo-1504615755583-2916b52192a3?w=800&q=80&fit=crop',
]

// Secondary per-category fallback (project-local images — always available)
const CATEGORY_FALLBACK = {
  'Market Trends & News':          '/images/heroSection/hero-bg.webp',
  'City Intelligence: Raipur':     '/images/heroSection/building-hero.webp',
  'Investment & ROI':              '/images/HomePage/dealSection/home-img.webp',
  'Broker & Channel Partner':      '/images/GroupBuy/community.webp',
  'Data & Micro-Market Analysis':  '/images/HomePage/dealSection/bg-image.webp',
  'Marketing & Lead Generation':   '/images/AboutPage/groupBuy/group-buy.webp',
}
const FALLBACK = '/images/heroSection/hero-bg.webp'

export const blogs = rawData.blogs.map(b => {
  const tags = Array.isArray(b.tags) ? b.tags : []
  // Use blog_number (1-based) to pick from the Unsplash pool so each blog
  // gets a distinct image and the pattern repeats every 20 blogs.
  const img = UNSPLASH[(( b.blog_number ?? 1) - 1) % UNSPLASH.length]
              ?? CATEGORY_FALLBACK[b.category]
              ?? FALLBACK

  return {
    // identifiers
    blog_id:          b.blog_id,
    id:               b.blog_id,
    blog_number:      b.blog_number  || 0,
    num_label:        b.num_label    || '',

    // routing
    slug:             b.slug,

    // display
    title:            b.title        || '',
    description:      b.description  || b.seo?.meta_description || '',
    meta_description: b.seo?.meta_description || b.description || '',

    // content
    content:          b.content_text || '',
    content_html:     b.content_html || '',

    // taxonomy
    category:         b.category     || '',
    city:             '',
    locality:         '',
    property_type:    '',
    bhk:              '',
    price_range:      '',
    amenity:          '',

    // tags / search
    tags,
    keywords:         tags,

    // meta
    reading_time_min: Math.max(1, Math.ceil((b.word_count || 200) / 200)),
    word_count:       b.word_count   || 0,
    language:         b.language     || 'Hinglish',

    // cover image — Unsplash photo unique per blog, local fallback if offline
    img,
  }
})

export const CATEGORIES     = rawData.meta?.categories ?? []
export const CITIES         = []
export const PROPERTY_TYPES = []
