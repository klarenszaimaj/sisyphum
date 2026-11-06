import { NavLink, Outlet } from 'react-router'
import { BookOpen, CalendarCheck, CalendarDays, Moon, Sun } from 'lucide-react'
import { useTema } from '../hooks/useTema'
import SfondoCielo from './SfondoCielo'

// Le voci di navigazione: definite una volta, usate in entrambe le barre
const voci = [
  { to: '/oggi', label: 'Oggi', Icona: CalendarCheck },
  { to: '/settimana', label: 'Settimana', Icona: CalendarDays },
  { to: '/materie', label: 'Materie', Icona: BookOpen },
]

export default function Layout() {
  const { scuro, cambia } = useTema()
  // L'icona mostra dove andrai: sole = passa a Giorno, luna = passa a Notte
  const IconaTema = scuro ? Sun : Moon
  const etichettaTema = scuro ? 'Tema Giorno' : 'Tema Notte'

  return (
    // "isolate" crea un livello proprio: il cielo (-z-10) resta dietro ma visibile
    <div className="relative isolate min-h-dvh text-testo lg:flex">
      <SfondoCielo />

      {/* Barra laterale: solo da 1024px in su */}
      <aside className="hidden lg:sticky lg:top-0 lg:flex lg:h-dvh lg:w-56 lg:flex-col lg:border-r lg:border-bordo lg:bg-superficie lg:p-4 lg:backdrop-blur-xl">
        <div className="mb-8 flex items-center gap-2 px-3 text-lg font-semibold">
          {/* Un unico punto neon: l'accento è dosato */}
          <span className="size-2 rounded-full bg-neon shadow-[0_0_10px_var(--color-neon)]" />
          StudyFlow
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
          onClick={cambia}
          className="mt-auto flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-testo-tenue transition-colors hover:bg-hover"
        >
          <IconaTema size={18} />
          {etichettaTema}
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
          onClick={cambia}
          aria-label={etichettaTema}
          className="flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium text-testo-tenue"
        >
          <IconaTema size={22} />
          Tema
        </button>
      </nav>
    </div>
  )
}