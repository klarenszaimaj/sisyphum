import { NavLink, Outlet } from 'react-router'
import { CalendarCheck, CalendarDays, BookOpen } from 'lucide-react'

// Le voci di navigazione: definite una volta, usate in entrambe le barre
const voci = [
  { to: '/oggi', label: 'Oggi', Icona: CalendarCheck },
  { to: '/settimana', label: 'Settimana', Icona: CalendarDays },
  { to: '/materie', label: 'Materie', Icona: BookOpen },
]

export default function Layout() {
  return (
    <div className="min-h-dvh bg-slate-50 text-slate-900 lg:flex">
      {/* Barra laterale: solo da 1024px in su */}
      <aside className="hidden lg:sticky lg:top-0 lg:flex lg:h-dvh lg:w-56 lg:flex-col lg:border-r lg:border-slate-200 lg:bg-white lg:p-4">
        <div className="mb-8 px-3 text-lg font-semibold">StudyFlow</div>
        <nav className="flex flex-col gap-1">
          {voci.map(({ to, label, Icona }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              <Icona size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Contenuto della pagina corrente */}
      <main className="flex-1 pb-24 lg:pb-0">
        <Outlet />
      </main>

      {/* Barra in basso: solo sotto i 1024px */}
      <nav className="fixed inset-x-0 bottom-0 flex border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">
        {voci.map(({ to, label, Icona }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium ${
                isActive ? 'text-indigo-700' : 'text-slate-500'
              }`
            }
          >
            <Icona size={22} />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}