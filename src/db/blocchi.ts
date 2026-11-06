import { db, nuovoId } from './db'
import type { Blocco } from './tipi'

// I campi del modulo (id e updatedAt li gestisce l'app)
export type DatiBlocco = Omit<Blocco, 'id' | 'updatedAt'>

export async function creaBlocco(dati: DatiBlocco): Promise<string> {
  const id = nuovoId()
  await db.blocchi.add({ ...dati, id, updatedAt: Date.now() })
  return id
}

export async function aggiornaBlocco(
  id: string,
  modifiche: Partial<Omit<Blocco, 'id'>>,
): Promise<void> {
  await db.blocchi.update(id, { ...modifiche, updatedAt: Date.now() })
}

export async function eliminaBlocco(id: string): Promise<void> {
  await db.blocchi.delete(id)
}