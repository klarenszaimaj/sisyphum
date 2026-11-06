import { addDays, addWeeks, format } from 'date-fns'
import { it } from 'date-fns/locale'
import { CircleCheck, CircleSlash, Repeat, type LucideIcon } from 'lucide-react'
import type { PianoCopia } from '../db/copiaSettimana'

interface Props {
  piano: PianoCopia
  onConferma: () => void
  onAnnulla: () => void
}

const giorno = (t: number | Date) => format(t, 'd MMM', { locale: it })

function Riga({ Icona, testo, evidenzia = false }: { Icona: LucideIcon; testo: string; evidenzia?: boolean }) {
  return (
    <li className={`flex items-center gap-2 ${evidenzia ? 'font-medium text-accento' : 'text-testo-tenue'}`}>
      <Icona size={16} className="shrink-0" />
      {testo}
    </li>
  )
}

export default function RiepilogoCopia({ piano, onConferma, onAnnulla }: Props) {
  const inizioPrecedente = addWeeks(piano.inizioSettimana, -1)
  const periodo = `${giorno(inizioPrecedente)} – ${giorno(addDays(inizioPrecedente, 6))}`
  const n = piano.daCopiare.length
  const blocchi = (k: number) => (k === 1 ? 'blocco' : 'blocchi')

  return (
    <div className="flex flex-col gap-4">
      {piano.origine === 0 ? (
        <p className="text-testo-tenue">
          La settimana precedente ({periodo}) è vuota: non c'è nulla da copiare.
        </p>
      ) : (
        <>
          <p className="text-testo-tenue">
            Settimana {periodo}: {piano.origine} {blocchi(piano.origine)}.
          </p>
          <ul className="flex flex-col gap-2 text-sm">
            <Riga Icona={CircleCheck} testo={`${n} da copiare`} evidenzia={n > 0} />
            {piano.giaCopiati > 0 && (
              <Riga Icona={Repeat} testo={`${piano.giaCopiati} già copiati in questa settimana (saltati)`} />
            )}
            {piano.sovrapposti > 0 && (
              <Riga Icona={CircleSlash} testo={`${piano.sovrapposti} sovrapposti a blocchi esistenti (saltati)`} />
            )}
          </ul>
          {n > 0 && (
            <p className="text-sm text-testo-tenue">
              I blocchi copiati ripartono come «Da fare». I blocchi già presenti non vengono toccati.
            </p>
          )}
        </>
      )}

      <div className="mt-2 flex justify-end gap-2">
        <button
          type="button"
          onClick={onAnnulla}
          className="rounded-lg border border-bordo px-4 py-2 text-sm font-medium hover:bg-hover"
        >
          {n > 0 ? 'Annulla' : 'Chiudi'}
        </button>
        {n > 0 && (
          <button
            type="button"
            onClick={onConferma}
            className="rounded-lg bg-neon px-4 py-2 text-sm font-medium text-white shadow-[0_0_16px_-4px_var(--color-neon)] hover:opacity-90"
          >
            Copia {n} {blocchi(n)}
          </button>
        )}
      </div>
    </div>
  )
}