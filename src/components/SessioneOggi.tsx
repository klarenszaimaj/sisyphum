import { useState } from 'react'
import { format } from 'date-fns'
import { CalendarClock, Check, CircleDashed, X, type LucideIcon } from 'lucide-react'
import type { Blocco, Materia, StatoBlocco } from '../db/tipi'
import { aggiornaBlocco } from '../db/blocchi'
import { durataMinuti, formatoOre } from '../lib/ore'

interface Props {
  blocco: Blocco
  materia?: Materia
  inCorso: boolean
  onApri: () => void
  onRiprogramma: () => void
}

function PulsanteStato(props: { attivo: boolean; Icona: LucideIcon; label: string; onClick: () => void }) {
  const { attivo, Icona, label, onClick } = props
  return (
    <button
      type="button"
      aria-pressed={attivo}
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
        attivo ? 'border-accento bg-accento-tenue text-accento' : 'border-bordo text-testo-tenue hover:bg-hover'
      }`}
    >
      <Icona size={16} />
      {label}
    </button>
  )
}

export default function SessioneOggi({ blocco, materia, inCorso, onApri, onRiprogramma }: Props) {
  const [chiediMinuti, setChiediMinuti] = useState(false)
  const orario = `${format(blocco.inizio, 'HH:mm')}–${format(blocco.fine, 'HH:mm')}`

  // Pause e tempo libero: una riga compatta e discreta
  if (blocco.tipo !== 'studio') {
    return (
      <button
        type="button"
        onClick={onApri}
        className="flex w-full items-center gap-3 rounded-xl px-4 py-2 text-left text-sm text-testo-tenue hover:bg-hover"
      >
        <span className="w-24 shrink-0 tabular-nums">{orario}</span>
        <span>{blocco.tipo === 'pausa' ? 'Pausa' : 'Tempo libero'}</span>
        {blocco.obiettivo && <span className="truncate">· {blocco.obiettivo}</span>}
      </button>
    )
  }

  const colore = materia?.colore ?? '#94a3b8'
  const durata = durataMinuti(blocco)
  // Durate proposte per "Parziale": ¼, ½ e ¾ della sessione, arrotondate al quarto d'ora
  const proposte = [0.25, 0.5, 0.75]
    .map((f) => Math.round((durata * f) / 15) * 15)
    .filter((m, i, tutte) => m > 0 && m < durata && tutte.indexOf(m) === i)

  function imposta(stato: StatoBlocco) {
    setChiediMinuti(false)
    // Ripremere lo stato attivo lo annulla: la sessione torna "da fare"
    const nuovo = blocco.stato === stato ? 'pianificato' : stato
    aggiornaBlocco(blocco.id, { stato: nuovo, minutiEffettivi: undefined })
  }

  function segnaParziale(minuti: number) {
    setChiediMinuti(false)
    aggiornaBlocco(blocco.id, { stato: 'parziale', minutiEffettivi: minuti })
  }

  return (
    <article
      className={`rounded-2xl border bg-superficie p-4 backdrop-blur-xl transition-opacity ${
        inCorso ? 'border-accento shadow-[0_0_24px_-10px_var(--color-neon)]' : 'border-bordo'
      } ${blocco.stato === 'saltato' ? 'opacity-60' : ''}`}
    >
      <button type="button" onClick={onApri} className="flex w-full items-start gap-3 text-left">
        <span className="mt-1 h-10 w-1 shrink-0 rounded-full" style={{ backgroundColor: colore }} />
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2 text-sm tabular-nums text-testo-tenue">
            {orario}
            {inCorso && (
              <span className="rounded-md bg-accento-tenue px-1.5 text-xs font-medium text-accento">In corso</span>
            )}
          </span>
          <span className="mt-0.5 block text-lg font-semibold">{materia?.nome ?? 'Materia eliminata'}</span>
          {blocco.obiettivo && <span className="mt-1 block">{blocco.obiettivo}</span>}
          {blocco.note && <span className="mt-1 block text-sm text-testo-tenue">{blocco.note}</span>}
        </span>
      </button>

      <div className="mt-3 flex flex-wrap items-center gap-2 pl-4">
        <PulsanteStato attivo={blocco.stato === 'fatto'} Icona={Check} label="Fatto" onClick={() => imposta('fatto')} />
        <PulsanteStato
          attivo={blocco.stato === 'parziale'}
          Icona={CircleDashed}
          label={
            blocco.stato === 'parziale' && blocco.minutiEffettivi
              ? `Parziale · ${formatoOre(blocco.minutiEffettivi)}`
              : 'Parziale'
          }
          onClick={() => (blocco.stato === 'parziale' ? imposta('parziale') : setChiediMinuti((v) => !v))}
        />
        <PulsanteStato attivo={blocco.stato === 'saltato'} Icona={X} label="Saltato" onClick={() => imposta('saltato')} />

        {blocco.stato === 'saltato' && (
          <button
            type="button"
            onClick={onRiprogramma}
            className="ml-auto flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-accento hover:bg-hover"
          >
            <CalendarClock size={16} />
            Riprogramma
          </button>
        )}
      </div>

      {chiediMinuti && (
        <div className="mt-3 flex flex-wrap items-center gap-2 pl-4 text-sm">
          <span className="text-testo-tenue">Quanto hai studiato?</span>
          {proposte.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => segnaParziale(m)}
              className="rounded-full border border-bordo px-3 py-1 hover:bg-hover"
            >
              {formatoOre(m)}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setChiediMinuti(false)
              onApri()
            }}
            className="rounded-full px-3 py-1 text-testo-tenue hover:bg-hover"
          >
            Altro…
          </button>
        </div>
      )}
    </article>
  )
}