export const WHATSAPP = '917035844444'

export function calcEMI(price, downPct, years, rate) {
  const down = price * downPct / 100
  const loan = price - down
  const r = rate / 12 / 100
  const n = years * 12
  const emi = r === 0 ? loan / n : (loan * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
  return Math.round(emi)
}

export function fmtINRShort(n) {
  if (!n) return '₹0'
  if (n >= 10000000) return '₹' + (n / 10000000).toFixed(2) + ' Cr'
  if (n >= 100000) return '₹' + (n / 100000).toFixed(1) + ' L'
  return '₹' + Math.round(n).toLocaleString('en-IN')
}
