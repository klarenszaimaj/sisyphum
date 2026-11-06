import { db } from './db'
import type { Blocco, Materia } from './tipi'

export const VERSIONE_BACKUP = 1

export interface FileBackup {
  app: 'StudyFlow'
  versione: number
  esportatoIl: string
  materie: Materia[]
  blocchi: Blocco[]
}

// ---------- ESPORTAZIONE ----------

export async function creaBackup(): Promise<FileBackup> {
  const [materie, blocchi] = await Promise.all([
    db.materie.toArray(),
    db.blocchi.toArray(),
  ])
  return {
    app: 'StudyFlow',
    versione: VERSIONE_BACKUP,
    esportatoIl: new Date().toISOString(),
    materie,
    blocchi,
  }
}

// "2026-11-06_1145": data e ora locali, per il nome del file
function marcaTemporale(): string {
  const d = new Date()
  const due = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${due(d.getMonth() + 1)}-${due(d.getDate())}_${due(d.getHours())}${due(d.getMinutes())}`
}

export async function scaricaBackup(): Promise<FileBackup> {
  const backup = await creaBackup()
  const testo = JSON.stringify(backup, null, 2)
  const blob = new Blob([testo], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  // Si crea un link invisibile e lo si "clicca" per avviare il download
  const link = document.createElement('a')
  link.href = url
  link.download = `studyflow-backup-${marcaTemporale()}.json`
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)

  return backup
}

// ---------- IMPORTAZIONE ----------

function eOggetto(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null
}

// Controlla il testo del file; se qualcosa non va, lancia un errore con un messaggio chiaro
export function leggiBackup(testo: string): FileBackup {
  let dati: unknown
  try {
    dati = JSON.parse(testo)
  } catch {
    throw new Error('Il file non è un JSON valido.')
  }

  if (!eOggetto(dati) || dati.app !== 'StudyFlow') {
    throw new Error('Il file non è un backup di StudyFlow.')
  }
  if (typeof dati.versione !== 'number' || dati.versione > VERSIONE_BACKUP) {
    throw new Error('Questo backup proviene da una versione più recente di StudyFlow.')
  }
  if (!Array.isArray(dati.materie) || !Array.isArray(dati.blocchi)) {
    throw new Error('Il backup è incompleto.')
  }
  for (const m of dati.materie) {
    if (!eOggetto(m) || typeof m.id !== 'string' || typeof m.nome !== 'string') {
      throw new Error('Il backup contiene una materia non valida.')
    }
  }
  for (const b of dati.blocchi) {
    if (
      !eOggetto(b) ||
      typeof b.id !== 'string' ||
      typeof b.inizio !== 'number' ||
      typeof b.fine !== 'number'
    ) {
      throw new Error('Il backup contiene un blocco non valido.')
    }
  }

  return dati as unknown as FileBackup
}

// Sostituisce tutti i dati in un'unica transazione: o riesce tutto, o non cambia nulla
export async function ripristinaBackup(backup: FileBackup): Promise<void> {
  await db.transaction('rw', db.materie, db.blocchi, async () => {
    await db.materie.clear()
    await db.blocchi.clear()
    await db.materie.bulkAdd(backup.materie)
    await db.blocchi.bulkAdd(backup.blocchi)
  })
}