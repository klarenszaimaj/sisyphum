import { creaBlocchiProva, svuotaBlocchi } from '../db/blocchiProva'

const stile =
  'rounded-lg border border-dashed border-bordo px-2 py-1.5 text-xs text-testo-tenue hover:bg-hover'

// Visibili solo con "npm run dev": nell'app pubblicata spariscono da soli
export default function StrumentiSviluppo() {
  if (!import.meta.env.DEV) return null

  return (
    <div className="flex gap-1">
      <button type="button" className={stile} onClick={creaBlocchiProva}>
        + prova
      </button>
      <button
        type="button"
        className={stile}
        onClick={() => {
          if (window.confirm('Eliminare TUTTI i blocchi di tutte le settimane?')) svuotaBlocchi()
        }}
      >
        svuota
      </button>
    </div>
  )
}