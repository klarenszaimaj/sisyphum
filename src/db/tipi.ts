// Priorità: 1 = alta, 2 = media, 3 = bassa
export type Priorita = 1 | 2 | 3

export interface Materia {
  id: string
  nome: string
  colore: string // es. "#60a5fa"
  dataEsame?: string // "AAAA-MM-GG"; assente se non ancora fissata
  noteEsame?: string // es. "Orale previsto il 18 gennaio"
  priorita: Priorita
  oreSettimanaliObiettivo: number
  archiviata: boolean
  updatedAt: number
}

export type TipoBlocco = 'studio' | 'pausa' | 'libero'
export type StatoBlocco = 'pianificato' | 'fatto' | 'parziale' | 'saltato'

export interface Blocco {
  id: string
  tipo: TipoBlocco
  materiaId?: string // solo se tipo = 'studio'
  inizio: number // timestamp in millisecondi
  fine: number
  obiettivo: string
  note?: string
  stato: StatoBlocco
  minutiEffettivi?: number // per i blocchi 'parziale'
  origineId?: string // se copiato da un'altra settimana: id del blocco originale
  updatedAt: number
}