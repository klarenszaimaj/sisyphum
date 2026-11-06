import type { Materia } from './tipi'

// Dati di partenza: tutti modificabili dall'interfaccia
export function materieIniziali(crea: () => string): Materia[] {
  const adesso = Date.now()
  const base = { archiviata: false, updatedAt: adesso }

  return [
    {
      ...base,
      id: crea(),
      nome: 'Progettazione web',
      colore: '#fbbf24', // ambra
      dataEsame: '2026-11-21',
      noteEsame: 'Prova anticipata',
      priorita: 1,
      oreSettimanaliObiettivo: 8,
    },
    {
      ...base,
      id: crea(),
      nome: 'Basi di dati',
      colore: '#2dd4bf', // verde acqua
      dataEsame: '2026-12-14',
      noteEsame: 'Primo appello',
      priorita: 1,
      oreSettimanaliObiettivo: 10,
    },
    {
      ...base,
      id: crea(),
      nome: 'Reti logiche',
      colore: '#60a5fa', // azzurro
      dataEsame: '2027-01-08',
      noteEsame: 'Scritto; orale previsto il 18 gennaio',
      priorita: 1,
      oreSettimanaliObiettivo: 9,
    },
    {
      ...base,
      id: crea(),
      nome: 'Ricerca operativa',
      colore: '#4ade80', // verde
      noteEsame: 'Secondo compitino, forse a metà dicembre',
      priorita: 2,
      oreSettimanaliObiettivo: 5,
    },
    {
      ...base,
      id: crea(),
      nome: 'Elettrotecnica',
      colore: '#fb7185', // corallo
      noteEsame: 'Obiettivo: secondo appello invernale',
      priorita: 3,
      oreSettimanaliObiettivo: 2,
    },
  ]
}