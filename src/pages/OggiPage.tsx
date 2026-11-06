import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { addDays, addWeeks, format, startOfDay, startOfWeek } from 'date-fns'
import { it } from 'date-fns/locale'
import { Plus } from 'lucide-react'
import { db } from '../db/db'
import { useAdesso } from '../hooks/useAdesso'
import { formatoOre, minutiPianificati, minutiSvolti } from '../lib/ore'
import SessioneOggi from '../components/SessioneOggi'
import FinestraBlocco, { type Apertura } from '../components/FinestraBlocco'

const ORA = 60 * 60 * 1000
const somma = (valori: number[]) => valori.reduce((a, b) => a + b, 0)

// Orario proposto per una nuova sessione: la prossima mezz'ora, tra le 9 e le 18
function orarioProposto(adesso: number) {
  const d = new Date(adesso)
  d.setMinutes(d.getMinutes() < 30 ? 30 : 60, 0, 0)
  if (d.getHours() < 9) d.setHours(9, 0, 0, 0)
  if (d.getHours() > 18) d.setHours(18, 0, 0, 0)
  return { inizio: d.getTime(), fine: d.getTime() + 2 * ORA }
}

export default function OggiPage() {
  const adesso = useAdesso()
  const inizioGiorno = startOfDay(adesso).getTime()
  const fineGiorno = addDays(inizioGiorno, 1).getTime()
  const inizioSettimana = startOfWeek(adesso, { weekStartsOn: 1 }).getTime()
  const fineSettimana = addWeeks(inizioSettimana, 1).getTime()

  const [apertura, setApertura] = useState<Apertura>(null)
  const materie = useLiveQuery(() => db.materie.toArray())
  // Una sola lettura per tutta la settimana: oggi è un sottoinsieme
  const settimana = useLiveQuery(
    () => db.blocchi.where('inizio').between(inizioSettimana, fineSettimana).toArray(),
    [inizioSettimana, fineSettimana],
  )

  const materiaPerId = useMemo(() => new Map((materie ?? []).map((m) => [m.id, m])), [materie])

  const blocchiOggi = (settimana ?? [])
    .filter((b) => b.inizio >= inizioGiorno && b.inizio < fineGiorno)
    .sort((a, b) => a.inizio - b.inizio)
  const studioOggi = blocchiOggi.filter((b) => b.tipo === 'studio')

  // Riepiloghi
  const pianificatiOggi = somma(studioOggi.map(minutiPianificati))
  const svoltiOggi = somma(studioOggi.map(minutiSvolti))
  const segnatiOggi = studioOggi.filter((b) => b.stato !== 'pianificato').length
  const svoltiSettimana = somma((settimana ?? []).map(minutiSvolti))
  const pianificatiSettimana = somma((settimana ?? []).map(minutiPianificati))
  const obiettivoSettimana = somma(
    (materie ?? []).filter((m) => !m.archiviata).map((m) => m.oreSettimanaliObiettivo * 60),
  )
  const scala = Math.max(obiettivoSettimana, pianificatiSettimana, 1)
  const percentuale = (minuti: number) => `${Math.min(100, (minuti / scala) * 100)}%`

  const caricamento = materie === undefined || settimana === undefined

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 p-6">
      <header>
        <h1 className="text-3xl font-semibold first-letter:uppercase">
          {format(adesso, 'EEEE d MMMM', { locale: it })}
        </h1>
        {!caricamento && (
          <p className="mt-1 text-testo-tenue">
            {studioOggi.length === 0
              ? 'Nessuna sessione di studio in programma'
              : `${studioOggi.length} ${studioOggi.length === 1 ? 'sessione' : 'sessioni'} · ${formatoOre(pianificatiOggi)} in programma`}
          </p>
        )}
      </header>

      {!caricamento && (
        <>
          <section className="flex flex-col gap-3">
            {blocchiOggi.map((b) => (
              <SessioneOggi
                key={b.id}
                blocco={b}
                materia={b.materiaId ? materiaPerId.get(b.materiaId) : undefined}
                inCorso={b.inizio <= adesso && adesso < b.fine}
                onApri={() => setApertura({ modo: 'modifica', blocco: b })}
                onRiprogramma={() =>
                  setApertura({
                    modo: 'riprogramma',
                    blocco: b,
                    inizio: addDays(b.inizio, 1).getTime(),
                    fine: addDays(b.fine, 1).getTime(),
                  })
                }
              />
            ))}

            {blocchiOggi.length === 0 && (
              <p className="rounded-2xl border border-bordo bg-superficie p-6 text-center text-testo-tenue backdrop-blur-xl">
                Oggi non c'è niente in programma.
              </p>
            )}

            <button
              type="button"
              onClick={() => setApertura({ modo: 'nuovo', ...orarioProposto(adesso) })}
              className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-bordo py-3 text-sm font-medium text-testo-tenue transition-colors hover:bg-hover"
            >
              <Plus size={16} />
              Aggiungi sessione
            </button>
          </section>

          {studioOggi.length > 0 && (
            <p className="text-sm text-testo-tenue">
              Oggi: {formatoOre(svoltiOggi)} svolte · {segnatiOggi} di {studioOggi.length} sessioni segnate
            </p>
          )}

          <section className="rounded-2xl border border-bordo bg-superficie p-5 backdrop-blur-xl">
            <h2 className="font-medium">Settimana</h2>
            <div className="relative mt-3 h-2 overflow-hidden rounded-full bg-hover">
              {/* Pianificate (velate) sotto, svolte (piene) sopra */}
              <div className="absolute inset-y-0 left-0 rounded-full bg-accento-tenue" style={{ width: percentuale(pianificatiSettimana) }} />
              <div className="absolute inset-y-0 left-0 rounded-full bg-accento" style={{ width: percentuale(svoltiSettimana) }} />
              {/* Tacca dell'obiettivo */}
              {obiettivoSettimana > 0 && (
                <div className="absolute inset-y-0 w-0.5 bg-testo-tenue" style={{ left: percentuale(obiettivoSettimana) }} />
              )}
            </div>
            <p className="mt-2 text-sm text-testo-tenue">
              {formatoOre(svoltiSettimana)} svolte · {formatoOre(pianificatiSettimana)} pianificate
              {obiettivoSettimana > 0 && ` · obiettivo ${formatoOre(obiettivoSettimana)}`}
            </p>
          </section>
        </>
      )}

      <FinestraBlocco
        apertura={apertura}
        setApertura={setApertura}
        materie={materie ?? []}
        onChiudi={() => setApertura(null)}
      />
    </div>
  )
}