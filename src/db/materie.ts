import { db, nuovoId } from './db'
import type { Materia } from './tipi'

// I campi che compili nel modulo (id, archiviata e updatedAt li gestisce l'app)
export type DatiMateria = Omit<Materia, 'id' | 'archiviata' | 'updatedAt'>

export async function creaMateria(dati: DatiMateria): Promise<void> {
  await db.materie.add({
    ...dati,
    id: nuovoId(),
    archiviata: false,
    updatedAt: Date.now(),
  })
}

export async function aggiornaMateria(
  id: string,
  modifiche: Partial<Omit<Materia, 'id'>>,
): Promise<void> {
  await db.materie.update(id, { ...modifiche, updatedAt: Date.now() })
}

// Restituisce false (e non elimina) se la materia ha blocchi nel calendario
export async function eliminaMateria(id: string): Promise<boolean> {
  const quantiBlocchi = await db.blocchi.where('materiaId').equals(id).count()
  if (quantiBlocchi > 0) return false
  await db.materie.delete(id)
  return true
}