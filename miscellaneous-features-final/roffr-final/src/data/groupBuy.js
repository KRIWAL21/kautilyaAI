import { fmtINRShort } from '@/data/properties.js'

const SAMPLE_JOINERS = [
  'Vikram K. · 4 hrs ago',
  'Rohit M. · yesterday',
  'Dr. Sharma · 2 days ago',
  'Priya S. · 1 hr ago',
  'Anil P. · 18 min ago',
  'Mehta family · 3 days ago',
  'Investor group · 2 hrs ago',
  'Raju Investments · 5 hrs ago',
  'Neeraj G. · 30 min ago',
  'Kapoor family · 6 hrs ago',
]

function hash(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0
  return Math.abs(h)
}

export function gbInfo(project) {
  if (!project || !project._id) return null
  const h = hash(project._id)

  const slotsChoices = [5, 8, 10, 12, 15, 20]
  const slots = slotsChoices[h % slotsChoices.length]
  const joined = 1 + (h % slots)

  const daysLeft = 3 + ((h >> 3) % 33)
  const discountPct = 3 + ((h >> 5) % 6)
  const viewing = 8 + ((h >> 2) % 90)

  const base = Math.max(project.minPrice || 5000000, 2000000)
  const savings = Math.round((base * discountPct) / 100)

  const pct = Math.round((joined / slots) * 100)
  const slotsLeft = slots - joined
  const closing = daysLeft <= 5 && pct >= 80
  const hot = !closing && pct >= 60

  let ribbon = ''
  if (closing) ribbon = `🔥 ONLY ${slotsLeft} SLOT${slotsLeft === 1 ? '' : 'S'} LEFT · ${daysLeft} DAYS`
  else if (hot) ribbon = `⚡ FILLING FAST · ${slotsLeft} slots left`
  else if (pct >= 50) ribbon = `◉ ${slotsLeft} slots left`

  return {
    slots,
    joined,
    slotsLeft,
    pct,
    daysLeft,
    discountPct,
    discount: `${discountPct}%`,
    rsSavings: fmtINRShort(savings),
    viewing,
    lastJoined: SAMPLE_JOINERS[h % SAMPLE_JOINERS.length],
    closing,
    hot,
    ribbon,
  }
}
