import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'

export default function MateriePage() {
  // Si aggiorna da sola quando la tabella "materie" cambia
  const materie = useLiveQuery(() => db.materie.orderBy('nome').toArray())

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold">Materie</h1>

      {/* undefined = ancora in caricamento */}
      {materie === undefined ? (
        <p className="mt-4 text-testo-tenue">Caricamento…</p>
      ) : (
        <ul className="mt-6 flex flex-col gap-2">
          {materie.map((m) => (
            <li
              key={m.id}
              className="flex items-center gap-3 rounded-xl border border-bordo bg-superficie px-4 py-3 backdrop-blur-xl"
            >
              <span
                className="size-3 rounded-full"
                style={{ backgroundColor: m.colore }}
              />
              <span className="font-medium">{m.nome}</span>
              <span className="ml-auto text-sm text-testo-tenue">
                {m.dataEsame ?? 'data da definire'}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}