import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Download, ShieldCheck } from 'lucide-react'
import { db } from '../db/db'
import { scaricaBackup } from '../db/backup'
import { descriviUltimoBackup, rimandaPromemoria, serveIlPromemoria } from '../lib/promemoriaBackup'

export default function PromemoriaBackup({ adesso }: { adesso: number }) {
  const [visibile, setVisibile] = useState(() => serveIlPromemoria(adesso))
  const [errore, setErrore] = useState(false)
  // Se non ci sono blocchi, non c'è niente da proteggere
  const quantiBlocchi = useLiveQuery(() => db.blocchi.count())

  if (!visibile || !quantiBlocchi) return null

  async function esporta() {
    try {
      await scaricaBackup()
      setVisibile(false)
    } catch {
      setErrore(true)
    }
  }

  function piuTardi() {
    rimandaPromemoria()
    setVisibile(false)
  }

  return (
    <aside className="flex flex-wrap items-center gap-3 rounded-2xl border border-bordo bg-superficie px-4 py-3 backdrop-blur-xl">
      <ShieldCheck size={20} className="shrink-0 text-accento" />
      <p className="min-w-0 flex-1 text-sm">
        <span className="font-medium">{descriviUltimoBackup(adesso)}</span>
        <span className="text-testo-tenue"> · i dati sono salvati solo su questo dispositivo.</span>
        {errore && (
          <span className="block text-rose-600 dark:text-rose-400">
            Non è stato possibile creare il backup.
          </span>
        )}
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={piuTardi}
          className="rounded-lg px-3 py-1.5 text-sm text-testo-tenue hover:bg-hover"
        >
          Più tardi
        </button>
        <button
          type="button"
          onClick={esporta}
          className="flex items-center gap-1.5 rounded-lg border border-bordo px-3 py-1.5 text-sm font-medium hover:bg-hover"
        >
          <Download size={16} />
          Esporta ora
        </button>
      </div>
    </aside>
  )
}