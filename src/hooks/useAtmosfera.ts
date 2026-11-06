import { useState } from 'react'

export type Atmosfera = 'ambient' | 'focus'

export function useAtmosfera() {
  const [atmosfera, setAtmosfera] = useState<Atmosfera>(() =>
    document.documentElement.dataset.atmosfera === 'focus' ? 'focus' : 'ambient',
  )

  function alterna() {
    const nuova: Atmosfera = atmosfera === 'ambient' ? 'focus' : 'ambient'
    document.documentElement.dataset.atmosfera = nuova
    try {
      localStorage.setItem('atmosfera', nuova)
    } catch {
      // se il salvataggio non è possibile, vale solo per questa sessione
    }
    setAtmosfera(nuova)
  }

  return { atmosfera, alterna }
}