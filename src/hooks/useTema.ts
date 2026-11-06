import { useState } from 'react'

// Gestisce il tema: legge lo stato attuale, lo cambia e lo ricorda
export function useTema() {
  const [scuro, setScuro] = useState(() =>
    document.documentElement.classList.contains('dark'),
  )

  function cambia() {
    const nuovo = !scuro
    document.documentElement.classList.toggle('dark', nuovo)
    try {
      localStorage.setItem('tema', nuovo ? 'scuro' : 'chiaro')
    } catch {
      // se il salvataggio non è possibile, il tema vale solo per questa sessione
    }
    setScuro(nuovo)
  }

  return { scuro, cambia }
}