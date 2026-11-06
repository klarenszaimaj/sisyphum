import type { EventContentArg } from '@fullcalendar/core'
import { Check } from 'lucide-react'
import type { Blocco, Materia } from '../db/tipi'

const GRIGIO = '#94a3b8'

export default function ContenutoBlocco({ arg }: { arg: EventContentArg }) {
  const blocco = arg.event.extendedProps.blocco as Blocco
  const materia = arg.event.extendedProps.materia as Materia | undefined
    // Anteprima durante la selezione: non esiste ancora un blocco
  if (!blocco) {
    return (
      <div className="h-full rounded-md border border-dashed border-accento px-1.5 py-1 text-[11px] font-medium text-accento">
        {arg.timeText}
      </div>
    )
  }

  const colore = blocco.tipo === 'studio' ? (materia?.colore ?? GRIGIO) : GRIGIO
  const titolo =
    blocco.tipo === 'pausa' ? 'Pausa'
    : blocco.tipo === 'libero' ? 'Tempo libero'
    : (materia?.nome ?? 'Materia eliminata')
  // Le pause e il tempo libero sono più tenui dei blocchi di studio
  const intensita = blocco.tipo === 'studio' ? 24 : 10

  return (
    <div
      className={`flex h-full flex-col overflow-hidden rounded-md border-l-[3px] px-1.5 py-1 text-testo ${
        blocco.stato === 'saltato' ? 'opacity-40' : ''
      }`}
      style={{
        borderColor: colore,
        backgroundColor: `color-mix(in srgb, ${colore} ${intensita}%, transparent)`,
      }}
    >
      <div className="flex items-center gap-1 font-semibold leading-tight">
        <span className="truncate">{titolo}</span>
        {blocco.stato === 'fatto' && <Check size={12} className="shrink-0" />}
      </div>
      <div className="text-[11px] text-testo-tenue">{arg.timeText}</div>
      {blocco.obiettivo && (
        <div className="mt-0.5 line-clamp-2 text-[11px] leading-snug">{blocco.obiettivo}</div>
      )}
    </div>
  )
}