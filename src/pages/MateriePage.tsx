import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Plus } from 'lucide-react'
import { addWeeks, differenceInCalendarDays, format, parseISO, startOfWeek } from 'date-fns'
import { it } from 'date-fns/locale'
import { db } from '../db/db'
import type { Materia } from '../db/tipi'
import { useAdesso } from '../hooks/useAdesso'
import { formatoOre, minutiPianificati, minutiSvolti } from '../lib/ore'
import Dialogo from '../components/Dialogo'
import FormMateria from '../components/FormMateria'

const etichettaPriorita = { 1: 'Alta', 2: 'Media', 3: 'Bassa' } as const

interface OreMateria {
  pianificati: number // minuti
  svolti: number // minuti
}

function descriviEsame(m: Materia): string {
  if (!m.dataEsame) return 'Data da definire'
  const data = parseISO(m.dataEsame)
  const giorni = differenceInCalendarDays(data, new Date())
  const quando =
    giorni > 1 ? `tra ${giorni} giorni`
    : giorni === 1 ? 'domani'
    : giorni === 0 ? 'oggi'
    : 'passato'
  return `${format(data, 'd MMM yyyy', { locale: it })} · ${quando}`
}

// Prima le materie con data (la più vicina in cima), poi quelle senza, in ordine alfabetico
function perDataEsame(a: Materia, b: Materia): number {
  if (a.dataEsame && b.dataEsame) return a.dataEsame.localeCompare(b.dataEsame)
  if (a.dataEsame) return -1
  if (b.dataEsame) return 1
  return a.nome.localeCompare(b.nome)
}

// Barra della settimana: svolte (piene) sopra pianificate (velate), tacca dell'obiettivo
function BarraOre({ ore, obiettivoOre }: { ore: OreMateria; obiettivoOre: number }) {
  const obiettivo = obiettivoOre * 60
  const scala = Math.max(obiettivo, ore.pianificati, 1)
  const percentuale = (minuti: number) => `${Math.min(100, (minuti / scala) * 100)}%`

  return (
    <div className="mt-3 pl-6">
      <div className="relative h-1.5 overflow-hidden rounded-full bg-hover">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-accento-tenue"
          style={{ width: percentuale(ore.pianificati) }}
        />
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-accento"
          style={{ width: percentuale(ore.svolti) }}
        />
        {obiettivo > 0 && (
          <div className="absolute inset-y-0 w-0.5 bg-testo-tenue" style={{ left: percentuale(obiettivo) }} />
        )}
      </div>
      <p className="mt-1.5 text-xs text-testo-tenue">
        {formatoOre(ore.svolti)} svolte · {formatoOre(ore.pianificati)} pianificate
        {obiettivo > 0 && ` · obiettivo ${formatoOre(obiettivo)}`}
      </p>
    </div>
  )
}

function SchedaMateria(props: { materia: Materia; ore?: OreMateria; onApri: () => void }) {
  const { materia, ore, onApri } = props
  return (
    <button
      type="button"
      onClick={onApri}
      className={`block w-full rounded-xl border border-bordo bg-superficie px-4 py-3 text-left backdrop-blur-xl transition-colors hover:bg-hover ${
        materia.archiviata ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className="mt-1.5 size-3 shrink-0 rounded-full"
          style={{ backgroundColor: materia.colore }}
        />
        <span className="min-w-0 flex-1">
          <span className="block font-medium">{materia.nome}</span>
          {materia.noteEsame && (
            <span className="block truncate text-sm text-testo-tenue">{materia.noteEsame}</span>
          )}
        </span>
        <span className="shrink-0 text-right text-sm">
          <span className="block text-testo-tenue">{descriviEsame(materia)}</span>
          <span className="mt-1 flex justify-end gap-2">
            <span
              className={`rounded-md px-1.5 text-xs font-medium ${
                materia.priorita === 1 ? 'bg-accento-tenue text-accento' : 'text-testo-tenue'
              }`}
            >
              {etichettaPriorita[materia.priorita]}
            </span>
            <span className="text-xs text-testo-tenue">
              {materia.oreSettimanaliObiettivo} h/sett
            </span>
          </span>
        </span>
      </div>

      {/* Le materie archiviate non hanno più un obiettivo settimanale da seguire */}
      {!materia.archiviata && (
        <BarraOre ore={ore ?? { pianificati: 0, svolti: 0 }} obiettivoOre={materia.oreSettimanaliObiettivo} />
      )}
    </button>
  )
}

export default function MateriePage() {
  const adesso = useAdesso()
  const inizioSettimana = startOfWeek(adesso, { weekStartsOn: 1 }).getTime()
  const fineSettimana = addWeeks(inizioSettimana, 1).getTime()

  const materie = useLiveQuery(() => db.materie.toArray())
  const blocchiSettimana = useLiveQuery(
    () => db.blocchi.where('inizio').between(inizioSettimana, fineSettimana).toArray(),
    [inizioSettimana, fineSettimana],
  )

  // Ore della settimana raggruppate per materia: una sola passata sui blocchi
  const orePerMateria = useMemo(() => {
    const mappa = new Map<string, OreMateria>()
    for (const b of blocchiSettimana ?? []) {
      if (b.tipo !== 'studio' || !b.materiaId) continue
      const ore = mappa.get(b.materiaId) ?? { pianificati: 0, svolti: 0 }
      ore.pianificati += minutiPianificati(b)
      ore.svolti += minutiSvolti(b)
      mappa.set(b.materiaId, ore)
    }
    return mappa
  }, [blocchiSettimana])

  // null = finestra chiusa, 'nuova' = creazione, Materia = modifica
  const [inModifica, setInModifica] = useState<Materia | 'nuova' | null>(null)

  const attive = (materie ?? []).filter((m) => !m.archiviata).sort(perDataEsame)
  const archiviate = (materie ?? []).filter((m) => m.archiviata).sort(perDataEsame)
  const chiudi = () => setInModifica(null)

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Materie</h1>
          <p className="mt-1 text-sm text-testo-tenue">
            Ore della settimana {format(inizioSettimana, 'd MMM', { locale: it })} –{' '}
            {format(addWeeks(inizioSettimana, 1).getTime() - 1, 'd MMM', { locale: it })}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setInModifica('nuova')}
          className="flex items-center gap-2 rounded-lg bg-neon px-4 py-2 text-sm font-medium text-white shadow-[0_0_16px_-4px_var(--color-neon)] hover:opacity-90"
        >
          <Plus size={16} />
          Nuova materia
        </button>
      </div>

      {materie === undefined ? (
        <p className="mt-4 text-testo-tenue">Caricamento…</p>
      ) : (
        <>
          {attive.length === 0 && (
            <p className="mt-6 text-testo-tenue">
              Nessuna materia attiva. Aggiungine una per iniziare.
            </p>
          )}
          <div className="mt-6 flex flex-col gap-2">
            {attive.map((m) => (
              <SchedaMateria
                key={m.id}
                materia={m}
                ore={orePerMateria.get(m.id)}
                onApri={() => setInModifica(m)}
              />
            ))}
          </div>

          {archiviate.length > 0 && (
            <details className="mt-8">
              <summary className="cursor-pointer text-sm font-medium text-testo-tenue">
                Archiviate ({archiviate.length})
              </summary>
              <div className="mt-3 flex flex-col gap-2">
                {archiviate.map((m) => (
                  <SchedaMateria key={m.id} materia={m} onApri={() => setInModifica(m)} />
                ))}
              </div>
            </details>
          )}
        </>
      )}

      <Dialogo
        aperto={inModifica !== null}
        onChiudi={chiudi}
        titolo={inModifica === 'nuova' ? 'Nuova materia' : 'Modifica materia'}
      >
        {inModifica !== null && (
          <FormMateria
            // key: aprendo un'altra materia il modulo riparte da zero
            key={inModifica === 'nuova' ? 'nuova' : inModifica.id}
            materia={inModifica === 'nuova' ? undefined : inModifica}
            onFatto={chiudi}
          />
        )}
      </Dialogo>
    </div>
  )
}