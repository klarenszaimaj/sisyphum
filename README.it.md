<p align="center">
  <img src="public/icona.png" alt="Logo di Sisyphum" width="112" />
</p>

<h1 align="center">Sisyphum</h1>

<p align="center">
  Un planner di studio personale per studenti universitari: un calendario settimanale che
  trasforma il programma dei corsi in sessioni quotidiane concrete. Tranquillo, flessibile
  e completamente offline.
</p>

<p align="center">
  <strong>Online:</strong> <em>link in arrivo</em> · <a href="README.md">English</a> · Italiano
</p>

## Perché l'ho creato

Ho iniziato Sisyphum durante un semestre particolarmente stressante, tra lezioni,
scadenze e troppi impegni universitari da conciliare. Il mio problema non era decidere
*cosa* studiare, ma trasformare un lungo elenco di materie e scadenze in un piano concreto
per ogni giorno, e l'incertezza su cosa fare peggiorava lo stress.

Nessun planner che ho provato faceva davvero al caso mio. Alcuni erano habit tracker
generici, altri strumenti vuoti in cui costruirsi prima un proprio sistema, altri ancora
pianificatori rigidi che trattavano una sessione saltata come un fallimento e scaricavano
le ore perse sui giorni successivi. Nessuno rispecchiava il mio modo di studiare: blocchi
lunghi e concentrati, pause flessibili e un piano che resta sotto il mio controllo.

Così ho costruito lo strumento che volevo: un calendario di studio tranquillo, che mostra
cosa fare oggi, rende facile cambiare il piano e tiene traccia di ciò che è stato fatto,
senza pressione.

## Il nome

Mio fratello mi prende sempre in giro perché assomiglio un po' a Sisifo: quando mi fisso
su qualcosa, continuo a spingere lo stesso masso su per la collina, ancora e ancora.
A un certo punto ho deciso di prenderlo come un complimento.

*Sisyphum* è l'accusativo latino di *Sisyphus*: il complemento oggetto di un verbo
sottinteso, *[seguo] Sisifo*. Studiare è uno sforzo quotidiano e ripetuto e, come
scriveva Camus, "bisogna immaginare Sisifo felice". L'app è costruita attorno a questa
idea: una giornata incompleta non è un fallimento, non ci sono streak punitivi e ogni
mattina si riparte, semplicemente.

## Funzionalità

- **Calendario settimanale interattivo**: crei i blocchi trascinando, li sposti e li
  ridimensioni, li duplichi, con gesti touch pensati per iPad
- **Vista Oggi**: le sessioni della giornata a colpo d'occhio; ognuna si segna come fatta,
  parziale o saltata con un solo tocco
- **Pianificato e svolto**: le sessioni saltate restano visibili e si riprogrammano a mano;
  nulla viene spostato in automatico
- **Copia della settimana precedente**: con rilevamento di duplicati e sovrapposizioni
- **Materie**: colori, date d'esame, priorità, ore settimanali obiettivo, archiviazione
- **Atmosfera Ambient / Focus**: un cielo notturno animato (stelle asincrone, un pianeta
  lontano, orbite lente) che in modalità Focus si ferma e si attenua
- **Local-first**: i dati restano in IndexedDB sul dispositivo; backup JSON esportabile
  e importabile
- **PWA installabile**: funziona offline su Windows e iPad

## Tecnologie

React · TypeScript · Vite · Tailwind CSS · FullCalendar · Dexie (IndexedDB) ·
date-fns · vite-plugin-pwa

## Note sull'architettura

- Niente backend e niente login: ogni dispositivo ha il proprio database. I record hanno
  UUID e timestamp `updatedAt`, per lasciare aperta una futura sincronizzazione.
- La copia della settimana avviene in un'unica transazione e ricalcola lì il proprio
  piano, così clic ripetuti non possono mai creare duplicati.
- I calcoli sulle date usano giorni di calendario (non multipli di 24 ore), per restare
  corretti anche al cambio dell'ora legale.

## Avvio in locale

```bash
npm install
npm run dev      # server di sviluppo
npm run build    # controllo dei tipi + build di produzione
npm run preview  # anteprima della build di produzione (PWA attiva)
```