import { addDays, differenceInCalendarDays, startOfDay } from 'date-fns'

const CHIAVE_ULTIMO = 'ultimoBackup'
const CHIAVE_RIMANDATO = 'backupRimandatoFinoA'
export const GIORNI_PROMEMORIA = 7

// localStorage può essere bloccato dal browser: in quel caso si comporta come "mai fatto"
function leggi(chiave: string): number | null {
  try {
    const valore = localStorage.getItem(chiave)
    return valore ? Number(valore) : null
  } catch {
    return null
  }
}

function scrivi(chiave: string, valore: number): void {
  try {
    localStorage.setItem(chiave, String(valore))
  } catch {
    // senza localStorage il promemoria semplicemente ricomparirà
  }
}

export const ultimoBackup = () => leggi(CHIAVE_ULTIMO)

export const segnaBackupFatto = () => scrivi(CHIAVE_ULTIMO, Date.now())

// "Più tardi": nascosto fino all'inizio di domani
export const rimandaPromemoria = () =>
  scrivi(CHIAVE_RIMANDATO, addDays(startOfDay(Date.now()), 1).getTime())

export function serveIlPromemoria(adesso: number): boolean {
  const rimandato = leggi(CHIAVE_RIMANDATO)
  if (rimandato !== null && adesso < rimandato) return false
  const ultimo = ultimoBackup()
  return ultimo === null || differenceInCalendarDays(adesso, ultimo) >= GIORNI_PROMEMORIA
}

export function descriviUltimoBackup(adesso: number): string {
  const ultimo = ultimoBackup()
  if (ultimo === null) return 'Nessun backup ancora'
  const giorni = differenceInCalendarDays(adesso, ultimo)
  if (giorni === 0) return 'Ultimo backup: oggi'
  if (giorni === 1) return 'Ultimo backup: ieri'
  return `Ultimo backup: ${giorni} giorni fa`
}