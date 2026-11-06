import { useState, type FormEvent } from 'react'
import { format, parse } from 'date-fns'
import { Trash2 } from 'lucide-react'
import type { Blocco, Materia, StatoBlocco, TipoBlocco } from '../db/tipi'
import { aggiornaBlocco, creaBlocco, eliminaBlocco } from '../db/blocchi'

interface Props {
  blocco?: Blocco // assente = nuovo blocco
  inizio: number // orari proposti per un blocco nuovo
  fine: number
  materie: Materia[]
  onFatto: () => void
}

const tipi: { valore: TipoBlocco; label: string }[] = [
  { valore: 'studio', label: 'Studio' },
  { valore: 'pausa', label: 'Pausa' },
  { valore: 'libero', label: 'Tempo libero' },
]

const stati: { valore: StatoBlocco; label: string }[] = [
  { valore: 'pianificato', label: 'Da fare' },
  { valore: 'fatto', label: 'Fatto' },
  { valore: 'parziale', label: 'Parziale' },
  { valore: 'saltato', label: 'Saltato' },
]

// timestamp → "2026-11-09" e "09:00"
const comeData = (t: number) => format(t, 'yyyy-MM-dd')
const comeOra = (t: number) => format(t, 'HH:mm')
// "2026-11-09" + "09:00" → timestamp
const unisci = (data: string, ora: string) =>
  parse(`${data} ${ora}`, 'yyyy-MM-dd HH:mm', new Date()).getTime()

const stileCampo =
  'mt-1 w-full rounded-lg border border-bordo bg-transparent px-3 py-2 outline-none focus:border-accento'
const stileEtichetta = 'text-sm font-medium text-testo-tenue'

function Segmenti<T extends string>(props: {
  opzioni: { valore: T; label: string }[]
  valore: T
  onCambia: (v: T) => void
}) {
  return (
    <div className="mt-1 flex gap-1 rounded-lg border border-bordo p-1">
      {props.opzioni.map(({ valore, label }) => (
        <button
          key={valore}
          type="button"
          onClick={() => props.onCambia(valore)}
          className={`flex-1 rounded-md px-2 py-1.5 text-sm font-medium transition-colors ${
            props.valore === valore ? 'bg-accento-tenue text-accento' : 'text-testo-tenue hover:bg-hover'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

export default function FormBlocco({ blocco, inizio, fine, materie, onFatto }: Props) {
  const iniziale = blocco ?? { inizio, fine }

  // Materie selezionabili: le attive, più quella attuale del blocco anche se archiviata
  const scelte = materie.filter((m) => !m.archiviata || m.id === blocco?.materiaId)

  const [tipo, setTipo] = useState<TipoBlocco>(blocco?.tipo ?? 'studio')
  const [materiaId, setMateriaId] = useState(blocco?.materiaId ?? scelte[0]?.id ?? '')
  const [data, setData] = useState(comeData(iniziale.inizio))
  const [oraInizio, setOraInizio] = useState(comeOra(iniziale.inizio))
  const [oraFine, setOraFine] = useState(comeOra(iniziale.fine))
  const [obiettivo, setObiettivo] = useState(blocco?.obiettivo ?? '')
  const [note, setNote] = useState(blocco?.note ?? '')
  const [stato, setStato] = useState<StatoBlocco>(blocco?.stato ?? 'pianificato')
  const [minuti, setMinuti] = useState(blocco?.minutiEffettivi ? String(blocco.minutiEffettivi) : '')
  const [errore, setErrore] = useState('')

  async function salva(e: FormEvent) {
    e.preventDefault()
    const nuovoInizio = unisci(data, oraInizio)
    const nuovaFine = unisci(data, oraFine)

    if (Number.isNaN(nuovoInizio) || Number.isNaN(nuovaFine)) {
      return setErrore('Data o orario non validi.')
    }
    if (nuovaFine <= nuovoInizio) {
      return setErrore("L'orario di fine deve essere dopo quello di inizio.")
    }
    if (tipo === 'studio' && !materiaId) {
      return setErrore('Scegli una materia.')
    }

    let minutiEffettivi: number | undefined
    if (stato === 'parziale') {
      const n = Number(minuti)
      const durata = (nuovaFine - nuovoInizio) / 60000
      if (!Number.isInteger(n) || n <= 0) return setErrore('Indica quanti minuti hai studiato.')
      if (n >= durata) return setErrore('Per un blocco parziale i minuti devono essere meno della durata.')
      minutiEffettivi = n
    }

    const dati = {
      tipo,
      materiaId: tipo === 'studio' ? materiaId : undefined,
      inizio: nuovoInizio,
      fine: nuovaFine,
      obiettivo: obiettivo.trim(),
      note: note.trim() || undefined,
      stato,
      minutiEffettivi,
    }

    if (blocco) await aggiornaBlocco(blocco.id, dati)
    else await creaBlocco(dati)
    onFatto()
  }

  async function elimina() {
    if (!blocco) return
    if (!window.confirm('Eliminare questo blocco?')) return
    await eliminaBlocco(blocco.id)
    onFatto()
  }

  return (
    <form onSubmit={salva} className="flex flex-col gap-4">
      <div>
        <span className={stileEtichetta}>Tipo</span>
        <Segmenti opzioni={tipi} valore={tipo} onCambia={setTipo} />
      </div>

      {tipo === 'studio' && (
        <div>
          <span className={stileEtichetta}>Materia</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {scelte.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMateriaId(m.id)}
                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  materiaId === m.id
                    ? 'border-accento bg-accento-tenue font-medium'
                    : 'border-bordo text-testo-tenue hover:bg-hover'
                }`}
              >
                <span className="size-2.5 rounded-full" style={{ backgroundColor: m.colore }} />
                {m.nome}
              </button>
            ))}
            {scelte.length === 0 && (
              <p className="text-sm text-testo-tenue">
                Nessuna materia attiva: creane una nella pagina Materie.
              </p>
            )}
          </div>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-[1.4fr_1fr_1fr]">
        <label>
          <span className={stileEtichetta}>Giorno</span>
          <input type="date" className={stileCampo} value={data} onChange={(e) => setData(e.target.value)} />
        </label>
        <label>
          <span className={stileEtichetta}>Dalle</span>
          <input type="time" step={300} className={stileCampo} value={oraInizio} onChange={(e) => setOraInizio(e.target.value)} />
        </label>
        <label>
          <span className={stileEtichetta}>Alle</span>
          <input type="time" step={300} className={stileCampo} value={oraFine} onChange={(e) => setOraFine(e.target.value)} />
        </label>
      </div>

      <label>
        <span className={stileEtichetta}>Obiettivo</span>
        <input
          className={stileCampo}
          value={obiettivo}
          onChange={(e) => setObiettivo(e.target.value)}
          placeholder={tipo === 'studio' ? 'Es. esercizi sulle FSM di Mealy' : 'Facoltativo'}
          autoFocus={!blocco}
        />
      </label>

      <label>
        <span className={stileEtichetta}>Note</span>
        <textarea
          rows={2}
          className={`${stileCampo} resize-none`}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </label>

      <div>
        <span className={stileEtichetta}>Stato</span>
        <Segmenti opzioni={stati} valore={stato} onCambia={setStato} />
      </div>

      {stato === 'parziale' && (
        <label>
          <span className={stileEtichetta}>Minuti effettivamente studiati</span>
          <input
            inputMode="numeric"
            className={stileCampo}
            value={minuti}
            onChange={(e) => setMinuti(e.target.value)}
            placeholder="Es. 60"
          />
        </label>
      )}

      {errore && <p className="text-sm text-rose-600 dark:text-rose-400">{errore}</p>}

      <div className="mt-2 flex flex-wrap items-center gap-2">
        {blocco && (
          <button
            type="button"
            onClick={elimina}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-rose-600 hover:bg-hover dark:text-rose-400"
          >
            <Trash2 size={16} />
            Elimina
          </button>
        )}
        <div className="ml-auto flex gap-2">
          <button
            type="button"
            onClick={onFatto}
            className="rounded-lg border border-bordo px-4 py-2 text-sm font-medium hover:bg-hover"
          >
            Annulla
          </button>
          <button
            type="submit"
            className="rounded-lg bg-neon px-4 py-2 text-sm font-medium text-white shadow-[0_0_16px_-4px_var(--color-neon)] hover:opacity-90"
          >
            Salva
          </button>
        </div>
      </div>
    </form>
  )
}