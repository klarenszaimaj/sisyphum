import { addWeeks } from 'date-fns'
import { db, nuovoId } from './db'
import type { Blocco } from './tipi'

export interface PianoCopia {
  inizioSettimana: number // lunedì 00:00 della settimana di destinazione
  origine: number // blocchi presenti nella settimana precedente
  daCopiare: Blocco[]
  giaCopiati: number
  sovrapposti: number
}

// +1 settimana di calendario (non +168 ore): corretto anche al cambio dell'ora legale
const settimanaDopo = (t: number) => addWeeks(t, 1).getTime()

const siSovrappongono = (a: Blocco, b: Blocco) => a.inizio < b.fine && b.inizio < a.fine

// Calcola cosa verrebbe copiato, senza modificare nulla
export async function preparaCopia(inizioSettimana: number): Promise<PianoCopia> {
  const inizioPrecedente = addWeeks(inizioSettimana, -1).getTime()
  const fineSettimana = settimanaDopo(inizioSettimana)

  const [sorgente, esistenti] = await Promise.all([
    db.blocchi.where('inizio').between(inizioPrecedente, inizioSettimana).sortBy('inizio'),
    db.blocchi.where('inizio').between(inizioSettimana, fineSettimana).toArray(),
  ])

  // Gli id dei blocchi originali che hanno già una copia in questa settimana
  const giaPresenti = new Set(esistenti.map((b) => b.origineId))
  const adesso = Date.now()
  const piano: PianoCopia = {
    inizioSettimana,
    origine: sorgente.length,
    daCopiare: [],
    giaCopiati: 0,
    sovrapposti: 0,
  }

  for (const b of sorgente) {
    if (giaPresenti.has(b.id)) {
      piano.giaCopiati++
      continue
    }
    const copia: Blocco = {
      ...b,
      id: nuovoId(),
      inizio: settimanaDopo(b.inizio),
      fine: settimanaDopo(b.fine),
      stato: 'pianificato',
      minutiEffettivi: undefined,
      origineId: b.id,
      updatedAt: adesso,
    }
    if (esistenti.some((e) => siSovrappongono(e, copia))) {
      piano.sovrapposti++
      continue
    }
    piano.daCopiare.push(copia)
  }

  return piano
}

// Esegue la copia: ricalcola il piano dentro la transazione, così non si creano mai doppioni
export async function eseguiCopia(inizioSettimana: number): Promise<number> {
  return db.transaction('rw', db.blocchi, async () => {
    const piano = await preparaCopia(inizioSettimana)
    await db.blocchi.bulkAdd(piano.daCopiare)
    return piano.daCopiare.length
  })
}