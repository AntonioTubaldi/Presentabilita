# Presentabilità

Un ragazzo deve attraversare la città per arrivare a un appuntamento, e la città
fa di tutto per sporcarlo. Platformer 2D in TypeScript con
[Phaser 4](https://phaser.io/), costruito passo per passo.

La **presentabilità** è insieme vita e punteggio: si consuma sporcandosi, e quanto
te ne resta all'arrivo decide come reagisce lei. Ma lei sta anche aspettando, e
l'orologio scorre: il gioco è la tensione fra **arrivare puliti** e **arrivare
puntuali**.

Stato attuale: **Fase 2-3 — meccanica centrale e percorso a scorrimento.**
I personaggi sono ancora rettangoli colorati: la grafica arriva in Fase 5,
quando il gioco sarà divertente anche senza.

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
| `Shift` o `X` (tieni premuto) | Apri l'ombrello: para dall'alto, ma rallenta |
| `R` | Ricomincia il livello da capo |
| `Tab` | Mostra/nascondi i valori di debug |

In sviluppo sono attivi anche i riquadri dei corpi fisici e l'oggetto `game`
nella console del browser, per ispezionare scene e corpi mentre si gioca.

## Struttura

```
src/
  main.ts                    configurazione di Phaser e avvio
  config.ts                  dimensioni, larghezza del mondo e palette
  player/tuning.ts           TUTTI i numeri che decidono il "feel" del movimento
  player/PlayerController.ts logica di corsa e salto
  player/umbrella.ts         l'ombrello: para dall'alto, rallenta, si rompe
  game/presentability.ts     la barra che è insieme vita e punteggio
  game/appointment.ts        l'orologio: lei sta aspettando
  game/verdict.ts            il giudizio finale, che incrocia pulizia e puntualità
  world/hazards.ts           pozzanghere, spazzatura, fontanelle, negozi di ombrelli
  world/skyline.ts           i palazzi in parallasse sullo sfondo
  enemies/Pigeon.ts          piccioni e relativi bombardamenti
  enemies/Balcony.ts         tovaglie scosse e gerani innaffiati, dall'alto
  ui/Hud.ts                  barra, orologio, ombrello, abiti di ricambio, messaggi
  scenes/GameScene.ts        il percorso e le regole che lo governano
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
| Costo pozzanghera a velocità massima | 15,9 punti |
| Costo pozzanghera camminando piano | 5,6 punti |
| Costo sacco di spazzatura | 10 punti, una volta sola |
| Colpo di piccione | 14 punti |
| Scorta di una fontanella | 36 punti |
| Lunghezza del percorso | 2560 px (quattro schermate) |
| Corsa diretta dall'inizio alla fine | 16,0 s, tirando dritto su tutto si arriva al 18% |
| Limite prima del ritardo | 28 s |
| Tetto degli abiti di ricambio | 100% → 55% → 30% |
| Velocità con l'ombrello aperto | 102 px/s invece di 170 |
| Salto con l'ombrello aperto | 42 px invece di 59 |
| Colpi che regge un ombrello | 3 (le briciole lo consumano, l'acqua no) |
| Tovaglia dal balcone | 12 punti, una volta per raffica |
| Getto dei gerani | 7 punti ogni 0,4 s finché ci resti sotto |
| Corsa senza mai aprire l'ombrello | 14,7 s, si arriva all'8% |
| Stessa corsa aprendolo sotto i balconi | 16,3 s, si arriva al 14% col completo buono |

Cambiarsi d'abito non riempie la barra: ne abbassa il tetto. Senza questo il
gioco premiava chi si rovinava apposta prima del traguardo.

Per piazzare una piattaforma serve l'**inviluppo di salto** documentato in
[GAMEDESIGN.md](GAMEDESIGN.md): a +50 px di dislivello la finestra utile va da
34 a 68 px oltre il punto di stacco.

Le insidie si pagano **entrando**, non restandoci sopra: stare fermi in una
pozzanghera non sporca di più, e un sacco di spazzatura fa danno una volta
sola e poi sparisce. L'unica eccezione è la fontanella, che agisce nel tempo —
e il tempo, con l'orologio che scorre, è proprio ciò che costa usarla.

Le distanze del livello sono tarate su questi numeri: se cambi `tuning.ts`,
vanno rimisurate, altrimenti alcuni salti diventano impossibili.

## Roadmap

Le fasi del progetto sono in [ROADMAP.md](ROADMAP.md); il concept e le decisioni
ancora aperte in [GAMEDESIGN.md](GAMEDESIGN.md).

## Licenza

MIT.
