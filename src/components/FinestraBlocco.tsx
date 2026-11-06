import type { Blocco, Materia } from '../db/tipi'
import Dialogo from './Dialogo'
import FormBlocco from './FormBlocco'

// Cosa mostra la finestra dei blocchi
export type Apertura =
  | { modo: 'nuovo'; inizio: number; fine: number }
  | { modo: 'modifica'; blocco: Blocco }
  // duplica e riprogramma creano un blocco NUOVO partendo da uno esistente;
  // inizio/fine, se presenti, sono gli orari proposti per il nuovo blocco
  | { modo: 'duplica' | 'riprogramma'; blocco: Blocco; inizio?: number; fine?: number }
  | null

type Modo = NonNullable<Apertura>['modo']

const titoli: Record<Modo, string> = {
  nuovo: 'Nuovo blocco',
  modifica: 'Modifica blocco',
  duplica: 'Duplica blocco',
  riprogramma: 'Riprogramma sessione',
}

interface Props {
  apertura: Apertura
  setApertura: (a: Apertura) => void
  materie: Materia[]
  onChiudi: () => void
}

export default function FinestraBlocco({ apertura, setApertura, materie, onChiudi }: Props) {
  let modulo = null

  if (apertura !== null) {
    const orari =
      apertura.modo === 'nuovo' ? apertura
      : apertura.modo === 'modifica' ? apertura.blocco
      : {
          inizio: apertura.inizio ?? apertura.blocco.inizio,
          fine: apertura.fine ?? apertura.blocco.fine,
        }
    const daDuplicare = apertura.modo === 'modifica' ? apertura.blocco : null

    modulo = (
      <FormBlocco
        key={apertura.modo === 'nuovo' ? `nuovo-${apertura.inizio}` : `${apertura.modo}-${apertura.blocco.id}`}
        blocco={apertura.modo === 'modifica' ? apertura.blocco : undefined}
        modello={apertura.modo === 'duplica' || apertura.modo === 'riprogramma' ? apertura.blocco : undefined}
        inizio={orari.inizio}
        fine={orari.fine}
        materie={materie}
        onFatto={onChiudi}
        onDuplica={daDuplicare ? () => setApertura({ modo: 'duplica', blocco: daDuplicare }) : undefined}
      />
    )
  }

  return (
    <Dialogo aperto={apertura !== null} onChiudi={onChiudi} titolo={apertura ? titoli[apertura.modo] : ''}>
      {modulo}
    </Dialogo>
  )
}