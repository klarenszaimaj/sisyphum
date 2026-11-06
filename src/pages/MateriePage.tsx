import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Plus } from 'lucide-react'
import { differenceInCalendarDays, format, parseISO } from 'date-fns'
import { it } from 'date-fns/locale'
import { db } from '../db/db'
import type { Materia } from '../db/tipi'
import Dialogo from '../components/Dialogo'
import FormMateria from '../components/FormMateria'

const etichettaPriorita = { 1: 'Alta', 2: 'Media', 3: 'Bassa' } as const

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

function SchedaMateria({ materia, onApri }: { materia: Materia; onApri: () => void }) {
  return (
    <button
      type="button"
      onClick={onApri}
      className={`flex w-full items-start gap-3 rounded-xl border border-bordo bg-superficie px-4 py-3 text-left backdrop-blur-xl transition-colors hover:bg-hover ${
        materia.archiviata ? 'opacity-60' : ''
      }`}
    >
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
    </button>
  )
}

export default function MateriePage() {
  const materie = useLiveQuery(() => db.materie.toArray())
  // null = finestra chiusa, 'nuova' = creazione, Materia = modifica
  const [inModifica, setInModifica] = useState<Materia | 'nuova' | null>(null)

  const attive = (materie ?? []).filter((m) => !m.archiviata).sort(perDataEsame)
  const archiviate = (materie ?? []).filter((m) => m.archiviata).sort(perDataEsame)
  const chiudi = () => setInModifica(null)

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Materie</h1>
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
              <SchedaMateria key={m.id} materia={m} onApri={() => setInModifica(m)} />
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