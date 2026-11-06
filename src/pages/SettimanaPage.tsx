import { useMemo, useRef, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import itLocale from '@fullcalendar/core/locales/it'
import type { DatesSetArg, EventInput } from '@fullcalendar/core'
import { useLiveQuery } from 'dexie-react-hooks'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { db } from '../db/db'
import ContenutoBlocco from '../components/ContenutoBlocco'
import StrumentiSviluppo from '../components/StrumentiSviluppo'

interface Intervallo {
  inizio: number
  fine: number
  titolo: string
}

const stileBottone = 'rounded-lg border border-bordo px-3 py-1.5 text-sm font-medium hover:bg-hover'

export default function SettimanaPage() {
  const calendario = useRef<FullCalendar>(null)
  const [intervallo, setIntervallo] = useState<Intervallo | null>(null)

  const materie = useLiveQuery(() => db.materie.toArray())

  // Solo i blocchi della settimana visibile (ricerca per intervallo sull'indice "inizio")
  const blocchi = useLiveQuery(
    () =>
      intervallo
        ? db.blocchi.where('inizio').between(intervallo.inizio, intervallo.fine).toArray()
        : [],
    [intervallo?.inizio, intervallo?.fine],
  )

  // Traduce i nostri blocchi nel formato che FullCalendar capisce
  const eventi = useMemo<EventInput[]>(() => {
    const materiaPerId = new Map((materie ?? []).map((m) => [m.id, m]))
    return (blocchi ?? []).map((b) => ({
      id: b.id,
      start: b.inizio,
      end: b.fine,
      extendedProps: {
        blocco: b,
        materia: b.materiaId ? materiaPerId.get(b.materiaId) : undefined,
      },
    }))
  }, [blocchi, materie])

  function quandoCambianoLeDate(info: DatesSetArg) {
    setIntervallo({
      inizio: info.start.getTime(),
      fine: info.end.getTime(),
      titolo: info.view.title,
    })
  }

  const api = () => calendario.current?.getApi()

  return (
    // Altezza = schermo meno la barra in basso; su schermi larghi tutto lo schermo
    <div className="flex h-[calc(100dvh-5.5rem)] flex-col gap-3 p-3 lg:h-dvh lg:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="mr-auto text-xl font-semibold lg:text-2xl">
          {intervallo?.titolo ?? 'Settimana'}
        </h1>
        <StrumentiSviluppo />
        <button type="button" className={stileBottone} onClick={() => api()?.today()}>
          Oggi
        </button>
        <div className="flex overflow-hidden rounded-lg border border-bordo">
          <button
            type="button"
            aria-label="Settimana precedente"
            className="p-1.5 hover:bg-hover"
            onClick={() => api()?.prev()}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            aria-label="Settimana successiva"
            className="p-1.5 hover:bg-hover"
            onClick={() => api()?.next()}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 rounded-2xl border border-bordo bg-superficie p-2 backdrop-blur-xl">
        <FullCalendar
          ref={calendario}
          plugins={[timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          locale={itLocale}
          firstDay={1}
          headerToolbar={false}
          allDaySlot={false}
          slotMinTime="08:00:00"
          slotMaxTime="21:00:00"
          slotDuration="00:30:00"
          slotLabelInterval="01:00"
          slotLabelFormat={{ hour: '2-digit', minute: '2-digit' }}
          eventTimeFormat={{ hour: '2-digit', minute: '2-digit' }}
          dayHeaderFormat={{ weekday: 'short', day: 'numeric' }}
          scrollTime="08:30:00"
          nowIndicator
          height="100%"
          expandRows
          events={eventi}
          eventContent={(arg) => <ContenutoBlocco arg={arg} />}
          datesSet={quandoCambianoLeDate}
        />
      </div>
    </div>
  )
}