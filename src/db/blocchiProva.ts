import { addDays, startOfWeek } from 'date-fns'
import { db, nuovoId } from './db'
import type { Blocco, StatoBlocco, TipoBlocco } from './tipi'

// [giorno (0 = lunedì), inizio, fine, tipo, indice materia o null, obiettivo, stato]
type Voce = [number, string, string, TipoBlocco, number | null, string, StatoBlocco]

const voci: Voce[] = [
  [0, '09:00', '11:00', 'studio', 0, 'Ripasso teoria', 'fatto'],
  [0, '11:00', '11:20', 'pausa', null, '', 'pianificato'],
  [0, '11:20', '13:00', 'studio', 1, 'Esercizi', 'parziale'],
  [0, '16:00', '18:00', 'studio', 2, 'Capitolo 3', 'saltato'],
  [1, '09:00', '12:30', 'studio', 3, "Esercizi d'esame", 'pianificato'],
  [2, '15:30', '17:30', 'studio', 4, 'Introduzione', 'pianificato'],
  [5, '09:00', '11:00', 'studio', 0, 'Simulazione', 'pianificato'],
  [6, '15:00', '19:00', 'libero', null, '', 'pianificato'],
]

export async function creaBlocchiProva(): Promise<void> {
  const materie = await db.materie.filter((m) => !m.archiviata).toArray()
  if (materie.length === 0) return

  const lunedi = startOfWeek(new Date(), { weekStartsOn: 1 })
  const istante = (giorno: number, hhmm: string) => {
    const [hh, mm] = hhmm.split(':').map(Number)
    const d = addDays(lunedi, giorno)
    d.setHours(hh, mm, 0, 0)
    return d.getTime()
  }

  const adesso = Date.now()
  const blocchi: Blocco[] = voci.map(([g, da, a, tipo, im, obiettivo, stato]) => ({
    id: nuovoId(),
    tipo,
    materiaId: im === null ? undefined : materie[im % materie.length].id,
    inizio: istante(g, da),
    fine: istante(g, a),
    obiettivo,
    stato,
    updatedAt: adesso,
  }))

  await db.blocchi.bulkAdd(blocchi)
}

export async function svuotaBlocchi(): Promise<void> {
  await db.blocchi.clear()
}