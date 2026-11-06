import { useState } from 'react'

// Gestisce il tema: legge lo stato attuale, lo imposta e lo ricorda
export function useTema() {
  const [scuro, setScuro] = useState(() =>
    document.documentElement.classList.contains('dark'),
  )

  function imposta(valore: boolean) {
    document.documentElement.classList.toggle('dark', valore)
    try {
      localStorage.setItem('tema', valore ? 'scuro' : 'chiaro')
    } catch {
      // se il salvataggio non è possibile, il tema vale solo per questa sessione
    }
    setScuro(valore)
  }

  return { scuro, imposta }
}