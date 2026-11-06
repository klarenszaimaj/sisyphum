import Dexie, { type EntityTable } from 'dexie'
import type { Blocco, Materia } from './tipi'
import { materieIniziali } from './datiIniziali'

// Genera un id univoco. randomUUID esiste solo su https o localhost:
// il ripiego serve se un giorno apri l'app di sviluppo dall'iPad in rete locale.
export function nuovoId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export const db = new Dexie('StudyFlow') as Dexie & {
  materie: EntityTable<Materia, 'id'>
  blocchi: EntityTable<Blocco, 'id'>
}

// Schema versione 1: prima la chiave primaria, poi i campi indicizzati.
// Gli altri campi vengono salvati comunque, solo non sono indicizzati.
db.version(1).stores({
  materie: 'id, nome',
  blocchi: 'id, inizio, materiaId',
})

// Eseguito UNA sola volta, quando il database viene creato
db.on('populate', (tx) => {
  tx.table('materie').bulkAdd(materieIniziali(nuovoId))
})