import { useEffect, useState } from 'react'

// L'ora attuale, aggiornata ogni minuto: serve per "In corso" e per il cambio di giorno
export function useAdesso(): number {
  const [adesso, setAdesso] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setAdesso(Date.now()), 60_000)
    return () => clearInterval(id) // pulizia: ferma il timer quando la pagina si chiude
  }, [])

  return adesso
}