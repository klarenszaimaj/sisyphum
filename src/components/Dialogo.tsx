import { useEffect, useRef, type ReactNode } from 'react'

interface Props {
  aperto: boolean
  onChiudi: () => void
  titolo: string
  children: ReactNode
}

export default function Dialogo({ aperto, onChiudi, titolo, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null)

  // Sincronizza il <dialog> del browser con la prop "aperto"
  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (aperto && !d.open) d.showModal()
    if (!aperto && d.open) d.close()
  }, [aperto])

  return (
    <dialog
      ref={ref}
      onClose={onChiudi} // scatta anche premendo Esc
      onClick={(e) => {
        // Clic sullo sfondo scuro (fuori dal contenuto) = chiudi
        if (e.target === ref.current) onChiudi()
      }}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[min(34rem,calc(100%-2rem))] overflow-y-auto rounded-2xl border border-bordo bg-pannello p-0 text-testo shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-sm"
    >
      <div className="p-6">
        <h2 className="text-lg font-semibold">{titolo}</h2>
        <div className="mt-5">{children}</div>
      </div>
    </dialog>
  )
}