import { useEffect, useRef } from 'react'

interface Stella {
  x: number // posizione da 0 a 1 (in proporzione allo schermo)
  y: number
  r: number // raggio in pixel
  alfa: number // luminosità massima
  periodo: number // durata di una pulsazione, in ms
  fase: number // punto di partenza dell'onda
  tinta: string // colore RGB
}

interface Meteora {
  inizio: number
  x: number
  y: number
  angolo: number
  lunghezza: number
}

const FPS = 20 // il movimento è lentissimo: 20 fotogrammi al secondo bastano
const DURATA_METEORA = 1200
const attesaMeteora = () => 60_000 + Math.random() * 120_000 // tra 1 e 3 minuti

function creaStelle(quante: number): Stella[] {
  return Array.from({ length: quante }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: 0.4 + Math.random() ** 2 * 1.1, // tante piccole, poche grandi
    alfa: 0.25 + Math.random() * 0.55,
    periodo: 6000 + Math.random() * 8000,
    fase: Math.random() * Math.PI * 2,
    tinta: Math.random() < 0.2 ? '200, 190, 255' : '255, 255, 255', // qualcuna lavanda
  }))
}

export default function SfondoCielo({ animato }: { animato: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // Le stelle stanno fuori dall'effetto: passando ad Ambient/Focus restano le stesse
  const stelleRef = useRef<Stella[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const vivo = animato && !matchMedia('(prefers-reduced-motion: reduce)').matches
    let larghezza = 0
    let altezza = 0
    let meteora: Meteora | null = null
    let prossima = performance.now() + attesaMeteora()

    const ridimensiona = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2) // nitido su schermi Retina
      larghezza = window.innerWidth
      altezza = window.innerHeight
      canvas.width = larghezza * dpr
      canvas.height = altezza * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const quante = Math.min(220, Math.round((larghezza * altezza) / 9000))
      if (stelleRef.current.length !== quante) stelleRef.current = creaStelle(quante)
    }

    const disegnaMeteora = (t: number) => {
      if (!meteora && t >= prossima) {
        meteora = {
          inizio: t,
          x: (0.15 + Math.random() * 0.6) * larghezza,
          y: Math.random() * 0.35 * altezza,
          angolo: Math.PI * (0.15 + Math.random() * 0.1), // in diagonale verso il basso
          lunghezza: 140 + Math.random() * 80,
        }
      }
      if (!meteora) return

      const p = (t - meteora.inizio) / DURATA_METEORA // avanzamento da 0 a 1
      if (p >= 1) {
        meteora = null
        prossima = t + attesaMeteora()
        return
      }
      const percorso = p * 380
      const testaX = meteora.x + Math.cos(meteora.angolo) * percorso
      const testaY = meteora.y + Math.sin(meteora.angolo) * percorso
      const codaX = testaX - Math.cos(meteora.angolo) * meteora.lunghezza
      const codaY = testaY - Math.sin(meteora.angolo) * meteora.lunghezza
      const intensita = Math.sin(p * Math.PI) // compare e svanisce dolcemente

      const scia = ctx.createLinearGradient(codaX, codaY, testaX, testaY)
      scia.addColorStop(0, 'rgba(255, 255, 255, 0)')
      scia.addColorStop(1, `rgba(230, 220, 255, ${0.7 * intensita})`)
      ctx.strokeStyle = scia
      ctx.lineWidth = 1.2
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(codaX, codaY)
      ctx.lineTo(testaX, testaY)
      ctx.stroke()
    }

    const disegna = (t: number) => {
      ctx.clearRect(0, 0, larghezza, altezza)
      // Di giorno niente stelle
      if (!document.documentElement.classList.contains('dark')) return

      for (const s of stelleRef.current) {
        const luce = vivo ? 0.55 + 0.45 * Math.sin((t / s.periodo) * Math.PI * 2 + s.fase) : 0.8
        ctx.beginPath()
        ctx.arc(s.x * larghezza, s.y * altezza, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${s.tinta}, ${s.alfa * luce})`
        ctx.fill()
      }
      if (vivo) disegnaMeteora(t)
    }

    // Ciclo di animazione limitato a FPS fotogrammi al secondo
    let idFrame = 0
    let ultimo = 0
    const ciclo = (t: number) => {
      idFrame = requestAnimationFrame(ciclo)
      if (t - ultimo < 1000 / FPS) return
      ultimo = t
      disegna(t)
    }

    ridimensiona()
    if (vivo) idFrame = requestAnimationFrame(ciclo)
    else disegna(performance.now()) // Focus: un solo fotogramma, poi fermo

    const alRidimensionamento = () => {
      ridimensiona()
      if (!vivo) disegna(performance.now())
    }
    window.addEventListener('resize', alRidimensionamento)

    // Se cambi tema (Notte/Giorno) mentre il cielo è fermo, ridisegna
    const osservatore = new MutationObserver(() => {
      if (!vivo) disegna(performance.now())
    })
    osservatore.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    // Pulizia quando cambia "animato" o il componente sparisce
    return () => {
      cancelAnimationFrame(idFrame)
      window.removeEventListener('resize', alRidimensionamento)
      osservatore.disconnect()
    }
  }, [animato])

  return (
    <div
      aria-hidden="true"
      className="sfondo-cielo pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <canvas ref={canvasRef} className="absolute inset-0 size-full" />

      <div className="sistema-pianeta">
        <div className="orbita orbita-1">
          <div className="anello">
            <span className="luna" />
          </div>
        </div>
        <div className="orbita orbita-2">
          <div className="anello">
            <span className="luna luna-piccola" />
          </div>
        </div>
        <div className="pianeta" />
      </div>

      <div className="velo-focus absolute inset-0" />
    </div>
  )
}