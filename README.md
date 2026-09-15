# Presentabilità

Un ragazzo deve attraversare la città per arrivare a un appuntamento, e la città
fa di tutto per sporcarlo. Platformer 2D in TypeScript con
[Phaser 4](https://phaser.io/), costruito passo per passo.

La **presentabilità** è insieme vita e punteggio: si consuma sporcandosi, e quanto
te ne resta all'arrivo decide come reagisce lei. Arrivare e arrivare *bene* sono
due obiettivi diversi.

Stato attuale: **Fase 2 — la meccanica centrale.** I personaggi sono ancora
rettangoli colorati: la grafica arriva in Fase 5, quando il gioco sarà divertente
anche senza.

## Avvio

Serve Node 20 o superiore.

```bash
npm install
npm run dev
```

Poi apri http://localhost:5173.

| Comando | Cosa fa |
| --- | --- |
| `npm run dev` | Server di sviluppo con ricarica a caldo |
| `npm run build` | Controllo dei tipi + build di produzione in `dist/` |
| `npm run preview` | Serve localmente la build di produzione |
| `npm run typecheck` | Solo controllo dei tipi |

## Comandi di gioco

| Tasto | Azione |
| --- | --- |
| `←` `→` oppure `A` `D` | Muoviti |
| `Spazio`, `W` o `↑` | Salta (tieni premuto per saltare più in alto) |
| `R` | Ricomincia il livello da capo |
| `Tab` | Mostra/nascondi i valori di debug |

In sviluppo sono attivi anche i riquadri dei corpi fisici e l'oggetto `game`
nella console del browser, per ispezionare scene e corpi mentre si gioca.

## Struttura

```
src/
  main.ts                    configurazione di Phaser e avvio
  config.ts                  dimensioni logiche e palette
  player/tuning.ts           TUTTI i numeri che decidono il "feel" del movimento
  player/PlayerController.ts logica di corsa e salto
  game/presentability.ts     la barra che è insieme vita e punteggio
  world/hazards.ts           pozzanghere, spazzatura, fontanelle
  enemies/Pigeon.ts          piccioni e relativi bombardamenti
  ui/Hud.ts                  barra, abiti di ricambio, messaggi
  scenes/GameScene.ts        il livello
```

Per accordare il movimento si tocca **solo** `src/player/tuning.ts`; per
bilanciare i danni, le costanti in cima a `src/world/hazards.ts`.

## Come si comporta oggi

Valori **misurati sul gioco in esecuzione**, non calcolati sulla carta:

| Grandezza | Valore |
| --- | --- |
| Altezza del salto pieno | 59 px, apice dopo 0,32 s |
| Altezza del saltello (tasto rilasciato subito) | 28 px |
| Gittata orizzontale del salto a velocità massima | ~75 px |
| Velocità di corsa | 170 px/s, arresto in 7 px |
| Coyote time | 0,10 s (5 frame concessi) |
| Jump buffer | 0,12 s |
| Costo pozzanghera a velocità massima | 16 punti |
| Costo pozzanghera camminando piano | ~7 punti |
| Costo sacco di spazzatura | 10 punti |
| Colpo di piccione | 14 punti |
| Scorta di una fontanella | 36 punti |

Chi tira dritto su ogni ostacolo arriva intorno al 31%; chi salta tutto arriva
al 100%. È lo spazio di manovra che rende il livello interessante.

Le distanze del livello sono tarate su questi numeri: se cambi `tuning.ts`,
vanno rimisurate, altrimenti alcuni salti diventano impossibili.

## Roadmap

Le fasi del progetto sono in [ROADMAP.md](ROADMAP.md); il concept e le decisioni
ancora aperte in [GAMEDESIGN.md](GAMEDESIGN.md).

## Licenza

MIT.
