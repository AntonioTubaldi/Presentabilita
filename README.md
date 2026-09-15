# Presentabilità

Un platformer 2D scritto in TypeScript con [Phaser 4](https://phaser.io/), costruito passo per passo.

Stato attuale: **Fase 1 — accordatura dei controlli.** Il personaggio è un rettangolo
e non c'è ancora grafica: si sta lavorando solo su come si sente il movimento.

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
| `R` | Torna al punto di partenza |
| `Tab` | Mostra/nascondi i valori di debug |

In sviluppo sono attivi anche i riquadri dei corpi fisici e l'oggetto `game`
nella console del browser, per ispezionare scene e corpi mentre si gioca.

## Struttura

```
src/
  main.ts                    configurazione di Phaser e avvio
  config.ts                  dimensioni logiche e palette
  player/tuning.ts           TUTTI i numeri che decidono il "feel"  ← si lavora qui
  player/PlayerController.ts logica di corsa e salto
  scenes/GameScene.ts        livello di prova
```

Il file che conta in questa fase è **`src/player/tuning.ts`**. Cambia quei valori,
non il codice del controller, finché il salto non ti sembra giusto al tatto.

## Come si comporta oggi

Valori misurati sul gioco in esecuzione con il tuning attuale:

| Grandezza | Valore |
| --- | --- |
| Altezza del salto pieno | 59 px, apice dopo 0,32 s |
| Altezza del saltello (tasto rilasciato subito) | 28 px |
| Gittata orizzontale del salto a velocità massima | ~75 px |
| Velocità di corsa | 170 px/s, arresto in 7 px |
| Coyote time | 0,10 s (5 frame concessi) |
| Jump buffer | 0,12 s |

Le distanze del livello di prova sono tarate su questi numeri: se cambi
`tuning.ts`, vanno rimisurate, altrimenti alcuni salti diventano impossibili.

## Roadmap

Le fasi del progetto sono in [ROADMAP.md](ROADMAP.md); il concept e le decisioni
ancora aperte in [GAMEDESIGN.md](GAMEDESIGN.md).

## Licenza

MIT.
