import type { Blocco } from '../db/tipi'

export const durataMinuti = (b: Blocco) => Math.round((b.fine - b.inizio) / 60000)

// Minuti di studio pianificati: contano solo i blocchi di studio
export function minutiPianificati(b: Blocco): number {
  return b.tipo === 'studio' ? durataMinuti(b) : 0
}

// Minuti di studio svolti: conta solo ciò che hai segnato
export function minutiSvolti(b: Blocco): number {
  if (b.tipo !== 'studio') return 0
  if (b.stato === 'fatto') return durataMinuti(b)
  if (b.stato === 'parziale') return b.minutiEffettivi ?? 0
  return 0
}

// 330 → "5 h 30", 120 → "2 h", 45 → "45 min"
export function formatoOre(minuti: number): string {
  const h = Math.floor(minuti / 60)
  const m = minuti % 60
  if (h === 0) return `${m} min`
  return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, '0')}`
}