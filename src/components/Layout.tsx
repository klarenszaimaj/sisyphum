import { NavLink, Outlet } from 'react-router'
import { BookOpen, CalendarCheck, CalendarDays, Focus, Settings, Sparkles } from 'lucide-react'
import SfondoCielo from './SfondoCielo'
import { useAtmosfera } from '../hooks/useAtmosfera'

// Le voci di navigazione: definite una volta, usate in entrambe le barre
const voci = [
  { to: '/oggi', label: 'Oggi', Icona: CalendarCheck },
  { to: '/settimana', label: 'Settimana', Icona: CalendarDays },
  { to: '/materie', label: 'Materie', Icona: BookOpen },
  { to: '/impostazioni', label: 'Impostazioni', Icona: Settings },
]

export default function Layout() {
  const { atmosfera, alterna } = useAtmosfera()
  const inFocus = atmosfera === 'focus'
  const IconaAtmosfera = inFocus ? Focus : Sparkles

  return (
    // "isolate" crea un livello proprio: il cielo (-z-10) resta dietro ma visibile
    <div className="relative isolate min-h-dvh text-testo lg:flex">
            <SfondoCielo animato={!inFocus} />

      {/* Barra laterale: solo da 1024px in su */}
      <aside className="hidden lg:sticky lg:top-0 lg:flex lg:h-dvh lg:w-56 lg:flex-col lg:border-r lg:border-bordo lg:bg-superficie lg:p-4 lg:backdrop-blur-xl">
                <div className="mb-8 flex items-center gap-3 px-2 text-lg font-semibold">
          <img
            src="/pwa-64x64.png"
            alt=""
            className="size-8 rounded-lg shadow-[0_0_14px_-4px_var(--color-neon)]"
          />
          Sisyphum
        </div>
        <nav className="flex flex-col gap-1">
          {voci.map(({ to, label, Icona }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-accento-tenue text-accento'
                    : 'text-testo-tenue hover:bg-hover'
                }`
              }
            >
              <Icona size={18} />
              {label}
            </NavLink>
          ))}
               </nav>

        {/* mt-auto spinge il pulsante in fondo alla barra */}
        <button
          type="button"
          onClick={alterna}
          aria-pressed={inFocus}
          title={inFocus ? 'Torna ad Ambient' : 'Passa a Focus'}
          className={`mt-auto flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            inFocus ? 'bg-accento-tenue text-accento' : 'text-testo-tenue hover:bg-hover'
          }`}
        >
          <IconaAtmosfera size={18} />
          {inFocus ? 'Focus' : 'Ambient'}
        </button>
      </aside>

      {/* Contenuto della pagina corrente */}
      <main className="flex-1 pb-24 lg:pb-0">
        <Outlet />
      </main>

      {/* Barra in basso: solo sotto i 1024px */}
      <nav className="fixed inset-x-0 bottom-0 flex border-t border-bordo bg-superficie pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
        {voci.map(({ to, label, Icona }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium ${
                isActive ? 'text-accento' : 'text-testo-tenue'
              }`
            }
          >
            <Icona size={22} />
            {label}
          </NavLink>
        ))}
        <button
          type="button"
          onClick={alterna}
          aria-pressed={inFocus}
          className={`flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium ${
            inFocus ? 'text-accento' : 'text-testo-tenue'
          }`}
        >
          <IconaAtmosfera size={22} />
          {inFocus ? 'Focus' : 'Ambient'}
        </button>
      </nav>
    </div>
  )
}