import { useMemo, useRef, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import itLocale from '@fullcalendar/core/locales/it'
import type { DatesSetArg, EventApi, EventInput } from '@fullcalendar/core'
import { aggiornaBlocco } from '../db/blocchi'
import { useLiveQuery } from 'dexie-react-hooks'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { db } from '../db/db'
import type { Blocco } from '../db/tipi'
import ContenutoBlocco from '../components/ContenutoBlocco'
import Dialogo from '../components/Dialogo'
import FormBlocco from '../components/FormBlocco'
import StrumentiSviluppo from '../components/StrumentiSviluppo'

interface Intervallo {
    inizio: number
    fine: number
    titolo: string
}

// Stato della finestra: chiusa, nuovo blocco (con orari proposti) o modifica
type Apertura =
    | { modo: 'nuovo'; inizio: number; fine: number }
    | { modo: 'modifica'; blocco: Blocco }
    | { modo: 'duplica'; blocco: Blocco }
    | null

const ORA = 60 * 60 * 1000
const stileBottone = 'rounded-lg border border-bordo px-3 py-1.5 text-sm font-medium hover:bg-hover'

// Orario proposto dal pulsante "+ Blocco": oggi alla prossima mezz'ora
// se stai guardando la settimana corrente, altrimenti lunedì alle 9:00
function orarioProposto(intervallo: Intervallo | null) {
    const adesso = new Date()
    const settimanaCorrente =
        intervallo !== null &&
        adesso.getTime() >= intervallo.inizio &&
        adesso.getTime() < intervallo.fine

    let inizio: Date
    if (settimanaCorrente && adesso.getHours() >= 8 && adesso.getHours() < 19) {
        inizio = new Date(adesso)
        inizio.setMinutes(adesso.getMinutes() < 30 ? 30 : 60, 0, 0)
    } else {
        inizio = new Date(settimanaCorrente ? adesso : (intervallo?.inizio ?? adesso))
        if (settimanaCorrente && adesso.getHours() >= 19) inizio.setDate(inizio.getDate() + 1)
        inizio.setHours(9, 0, 0, 0)
    }
    return { inizio: inizio.getTime(), fine: inizio.getTime() + 2 * ORA }
}

export default function SettimanaPage() {
    const calendario = useRef<FullCalendar>(null)
    const [intervallo, setIntervallo] = useState<Intervallo | null>(null)
    const [apertura, setApertura] = useState<Apertura>(null)

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

    // Chiamata quando un blocco viene spostato o ridimensionato
    function salvaNuovoOrario(info: { event: EventApi; revert: () => void }) {
        const { event } = info
        if (!event.start || !event.end) return info.revert()
        aggiornaBlocco(event.id, {
            inizio: event.start.getTime(),
            fine: event.end.getTime(),
        }).catch(() => info.revert()) // se il salvataggio fallisce, il blocco torna dov'era
    }
    function chiudi() {
        setApertura(null)
        api()?.unselect() // toglie l'evidenziazione della selezione
    }

    return (
        // Altezza = schermo meno la barra in basso; su schermi larghi tutto lo schermo
        <div className="flex h-[calc(100dvh-5.5rem)] flex-col gap-3 p-3 lg:h-dvh lg:p-6">
            <div className="flex flex-wrap items-center gap-2">
                <h1 className="mr-auto text-xl font-semibold lg:text-2xl">
                    {intervallo?.titolo ?? 'Settimana'}
                </h1>
                <StrumentiSviluppo />
                <button
                    type="button"
                    onClick={() => setApertura({ modo: 'nuovo', ...orarioProposto(intervallo) })}
                    className="flex items-center gap-1.5 rounded-lg bg-neon px-3 py-1.5 text-sm font-medium text-white shadow-[0_0_16px_-4px_var(--color-neon)] hover:opacity-90"
                >
                    <Plus size={16} />
                    Blocco
                </button>
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
                    // Creazione: trascina su uno spazio vuoto
                    selectable
                    selectMirror
                    select={(info) =>
                        setApertura({ modo: 'nuovo', inizio: info.start.getTime(), fine: info.end.getTime() })
                    }

                    // Spostamento e durata
                    editable
                    eventDrop={salvaNuovoOrario}
                    eventResize={salvaNuovoOrario}
                    snapDuration="00:15:00"
                    slotEventOverlap={false}
                    // Touch: pressione prolungata breve per trascinare, senza confondersi con lo scorrimento
                    eventLongPressDelay={300}
                    selectLongPressDelay={400}
                    // Modifica: clic su un blocco
                    eventClick={(info) =>
                        setApertura({ modo: 'modifica', blocco: info.event.extendedProps.blocco as Blocco })
                    }
                />
            </div>

            <Dialogo
                aperto={apertura !== null}
                onChiudi={chiudi}
                titolo={
                    apertura?.modo === 'modifica' ? 'Modifica blocco'
                        : apertura?.modo === 'duplica' ? 'Duplica blocco'
                            : 'Nuovo blocco'
                }
            >
                {apertura !== null && (
                    <FormBlocco
                        key={apertura.modo === 'nuovo' ? `nuovo-${apertura.inizio}` : `${apertura.modo}-${apertura.blocco.id}`}
                        blocco={apertura.modo === 'modifica' ? apertura.blocco : undefined}
                        modello={apertura.modo === 'duplica' ? apertura.blocco : undefined}
                        inizio={apertura.modo === 'nuovo' ? apertura.inizio : apertura.blocco.inizio}
                        fine={apertura.modo === 'nuovo' ? apertura.fine : apertura.blocco.fine}
                        materie={materie ?? []}
                        onFatto={chiudi}
                        onDuplica={
                            apertura.modo === 'modifica'
                                ? () => setApertura({ modo: 'duplica', blocco: apertura.blocco })
                                : undefined
                        }
                    />
                )}
            </Dialogo>
        </div>
    )
}
