import { useState, type FormEvent } from 'react'
import { Archive, ArchiveRestore, Check, Trash2 } from 'lucide-react'
import type { Materia, Priorita } from '../db/tipi'
import { aggiornaMateria, creaMateria, eliminaMateria } from '../db/materie'
import { COLORI_MATERIE } from '../lib/colori'

interface Props {
  materia?: Materia // assente = nuova materia
  onFatto: () => void
}

const opzioniPriorita: { valore: Priorita; label: string }[] = [
  { valore: 1, label: 'Alta' },
  { valore: 2, label: 'Media' },
  { valore: 3, label: 'Bassa' },
]

const stileCampo =
  'mt-1 w-full rounded-lg border border-bordo bg-transparent px-3 py-2 outline-none focus:border-accento'
const stileEtichetta = 'text-sm font-medium text-testo-tenue'

export default function FormMateria({ materia, onFatto }: Props) {
  const [nome, setNome] = useState(materia?.nome ?? '')
  const [colore, setColore] = useState(materia?.colore ?? COLORI_MATERIE[0])
  const [dataEsame, setDataEsame] = useState(materia?.dataEsame ?? '')
  const [noteEsame, setNoteEsame] = useState(materia?.noteEsame ?? '')
  const [priorita, setPriorita] = useState<Priorita>(materia?.priorita ?? 2)
  // Testo e non numero: così puoi cancellare il campo e scrivere "7,5"
  const [ore, setOre] = useState(String(materia?.oreSettimanaliObiettivo ?? 4))
  const [errore, setErrore] = useState('')

  async function salva(e: FormEvent) {
    e.preventDefault() // impedisce al browser di ricaricare la pagina
    const nomePulito = nome.trim()
    const oreNumero = Number(ore.replace(',', '.'))

    if (!nomePulito) return setErrore('Il nome è obbligatorio.')
    if (!Number.isFinite(oreNumero) || oreNumero < 0) {
      return setErrore('Le ore devono essere un numero positivo.')
    }

    const dati = {
      nome: nomePulito,
      colore,
      dataEsame: dataEsame || undefined,
      noteEsame: noteEsame.trim() || undefined,
      priorita,
      oreSettimanaliObiettivo: oreNumero,
    }

    if (materia) await aggiornaMateria(materia.id, dati)
    else await creaMateria(dati)
    onFatto()
  }

  async function archivia() {
    if (!materia) return
    await aggiornaMateria(materia.id, { archiviata: !materia.archiviata })
    onFatto()
  }

  async function elimina() {
    if (!materia) return
    if (!window.confirm(`Eliminare definitivamente "${materia.nome}"?`)) return
    const eliminata = await eliminaMateria(materia.id)
    if (!eliminata) {
      window.alert(
        'Questa materia ha blocchi nel calendario. Archiviala invece di eliminarla: così conservi lo storico.',
      )
      return
    }
    onFatto()
  }

  return (
    <form onSubmit={salva} className="flex flex-col gap-4">
      <label>
        <span className={stileEtichetta}>Nome</span>
        <input
          className={stileCampo}
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Es. Reti logiche"
          autoFocus={!materia}
        />
      </label>

      <div>
        <span className={stileEtichetta}>Colore</span>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {COLORI_MATERIE.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColore(c)}
              aria-label={`Colore ${c}`}
              className="grid size-8 place-items-center rounded-full transition-transform hover:scale-110"
              style={{ backgroundColor: c }}
            >
              {colore === c && <Check size={16} className="text-slate-900" />}
            </button>
          ))}
          {/* Colore personalizzato: il selettore nativo del sistema */}
          <label className="relative grid size-8 cursor-pointer place-items-center rounded-full border border-dashed border-bordo text-xs text-testo-tenue">
            +
            <input
              type="color"
              value={colore}
              onChange={(e) => setColore(e.target.value)}
              className="absolute inset-0 cursor-pointer opacity-0"
              aria-label="Colore personalizzato"
            />
          </label>
          <span
            className="ml-2 h-6 w-16 rounded-md"
            style={{ backgroundColor: colore }}
            title="Colore scelto"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          <span className={stileEtichetta}>Data d'esame</span>
          <input
            type="date"
            className={stileCampo}
            value={dataEsame}
            onChange={(e) => setDataEsame(e.target.value)}
          />
        </label>
        <label>
          <span className={stileEtichetta}>Note sull'esame</span>
          <input
            className={stileCampo}
            value={noteEsame}
            onChange={(e) => setNoteEsame(e.target.value)}
            placeholder="Es. orale il 18 gennaio"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <span className={stileEtichetta}>Priorità</span>
          <div className="mt-1 flex gap-1 rounded-lg border border-bordo p-1">
            {opzioniPriorita.map(({ valore, label }) => (
              <button
                key={valore}
                type="button"
                onClick={() => setPriorita(valore)}
                className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
                  priorita === valore
                    ? 'bg-accento-tenue text-accento'
                    : 'text-testo-tenue hover:bg-hover'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <label>
          <span className={stileEtichetta}>Ore settimanali (obiettivo)</span>
          <input
            inputMode="decimal"
            className={stileCampo}
            value={ore}
            onChange={(e) => setOre(e.target.value)}
          />
        </label>
      </div>

      {errore && <p className="text-sm text-rose-600 dark:text-rose-400">{errore}</p>}

      <div className="mt-2 flex flex-wrap items-center gap-2">
        {materia && (
          <>
            <button
              type="button"
              onClick={archivia}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-testo-tenue hover:bg-hover"
            >
              {materia.archiviata ? <ArchiveRestore size={16} /> : <Archive size={16} />}
              {materia.archiviata ? 'Ripristina' : 'Archivia'}
            </button>
            <button
              type="button"
              onClick={elimina}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-rose-600 hover:bg-hover dark:text-rose-400"
            >
              <Trash2 size={16} />
              Elimina
            </button>
          </>
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