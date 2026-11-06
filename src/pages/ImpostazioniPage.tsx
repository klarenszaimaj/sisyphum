import { useRef, useState, type ChangeEvent } from 'react'
import { Download, Moon, Sun, Upload } from 'lucide-react'
import { useTema } from '../hooks/useTema'
import { db } from '../db/db'
import { leggiBackup, ripristinaBackup, scaricaBackup } from '../db/backup'

type Messaggio = { tipo: 'ok' | 'errore'; testo: string } | null

const temi = [
  { scuro: true, label: 'Notte', Icona: Moon },
  { scuro: false, label: 'Giorno', Icona: Sun },
]

export default function ImpostazioniPage() {
  const { scuro, imposta } = useTema()
  const inputFile = useRef<HTMLInputElement>(null)
  const [messaggio, setMessaggio] = useState<Messaggio>(null)

  async function esporta() {
    try {
      const b = await scaricaBackup()
      setMessaggio({
        tipo: 'ok',
        testo: `Backup scaricato: ${b.materie.length} materie, ${b.blocchi.length} blocchi.`,
      })
    } catch {
      setMessaggio({ tipo: 'errore', testo: 'Non è stato possibile creare il backup.' })
    }
  }

  async function fileScelto(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = '' // permette di scegliere di nuovo lo stesso file
    if (!file) return

    try {
      const backup = leggiBackup(await file.text())
      const [nMaterie, nBlocchi] = await Promise.all([
        db.materie.count(),
        db.blocchi.count(),
      ])
      const data = new Date(backup.esportatoIl).toLocaleString('it-IT')

      const conferma = window.confirm(
        `Sostituire i dati attuali (${nMaterie} materie, ${nBlocchi} blocchi) ` +
          `con il backup del ${data} (${backup.materie.length} materie, ${backup.blocchi.length} blocchi)?\n\n` +
          `I dati attuali andranno persi: se vuoi conservarli, esporta prima un backup.`,
      )
      if (!conferma) return

      await ripristinaBackup(backup)
      setMessaggio({ tipo: 'ok', testo: 'Backup ripristinato.' })
    } catch (err) {
      setMessaggio({
        tipo: 'errore',
        testo: err instanceof Error ? err.message : 'Importazione non riuscita.',
      })
    }
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold">Impostazioni</h1>

      {/* ASPETTO */}
      <section className="mt-6 rounded-2xl border border-bordo bg-superficie p-5 backdrop-blur-xl">
        <h2 className="font-medium">Aspetto</h2>
        <div className="mt-3 inline-flex gap-1 rounded-xl border border-bordo p-1">
          {temi.map(({ scuro: valore, label, Icona }) => (
            <button
              key={label}
              type="button"
              onClick={() => imposta(valore)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                scuro === valore
                  ? 'bg-accento-tenue text-accento'
                  : 'text-testo-tenue hover:bg-hover'
              }`}
            >
              <Icona size={16} />
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* BACKUP */}
      <section className="mt-4 rounded-2xl border border-bordo bg-superficie p-5 backdrop-blur-xl">
        <h2 className="font-medium">Backup</h2>
        <p className="mt-1 text-sm text-testo-tenue">
          I dati sono salvati solo su questo dispositivo. Esporta un backup di
          tanto in tanto e conservalo al sicuro, per esempio su Google Drive.
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={esporta}
            className="flex items-center gap-2 rounded-lg bg-neon px-4 py-2 text-sm font-medium text-white shadow-[0_0_16px_-4px_var(--color-neon)] transition-opacity hover:opacity-90"
          >
            <Download size={16} />
            Esporta backup
          </button>
          <button
            type="button"
            onClick={() => inputFile.current?.click()}
            className="flex items-center gap-2 rounded-lg border border-bordo px-4 py-2 text-sm font-medium transition-colors hover:bg-hover"
          >
            <Upload size={16} />
            Importa backup
          </button>
          {/* Il vero selettore di file è nascosto: lo apre il pulsante qui sopra */}
          <input
            ref={inputFile}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={fileScelto}
          />
        </div>

        {messaggio && (
          <p
            className={`mt-4 text-sm ${
              messaggio.tipo === 'ok'
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {messaggio.testo}
          </p>
        )}
      </section>
    </div>
  )
}