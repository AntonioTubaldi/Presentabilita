# Roadmap

Ogni fase si chiude con qualcosa di giocabile, non con codice a metà.
Si passa alla fase successiva solo quando la precedente è divertente da provare.

---

## Fase 0 — Fondamenta ✅

- [x] Progetto Vite + TypeScript + Phaser 4 che parte con `npm run dev`
- [x] Controllo dei tipi in `npm run build`
- [x] Pubblicazione automatica su GitHub Pages ad ogni push su `main`
- [x] Documentazione di partenza

## Fase 1 — Il salto deve essere bello ⬅️ **siamo qui**

La fase che decide il gioco. Un platformer con brutti controlli non si salva con
nessuna grafica; uno con ottimi controlli è già divertente con i rettangoli.

- [x] Corsa con accelerazione e attrito separati, a terra e in aria
- [x] Salto ad altezza variabile (tocchi = saltello, tieni = salto pieno)
- [x] Gravità asimmetrica: si scende più in fretta di quanto si sale
- [x] Coyote time — salto concesso poco dopo aver lasciato la piattaforma
- [x] Jump buffer — salto memorizzato se premuto poco prima di atterrare
- [x] Livello-palestra tarato sulle distanze reali del salto
- [ ] **Accordatura a mano dei valori in `tuning.ts` finché non convince**
- [ ] Decidere se servono meccaniche in più (scatto, doppio salto, aggrapparsi ai muri)

Criterio per considerarla chiusa: saltare tra le piattaforme è piacevole anche
senza nessun obiettivo da raggiungere.

## Fase 2 — Mondo vero

- [ ] Livelli disegnati in [Tiled](https://www.mapeditor.org/) invece che a mano nel codice
- [ ] Collisioni sul layer della tilemap
- [ ] Camera che segue il giocatore con zona morta e inseguimento morbido
- [ ] Limiti del mondo più grandi di uno schermo
- [ ] Un livello completo percorribile da inizio a fine

## Fase 3 — Opposizione

- [ ] 2-3 nemici con comportamenti diversi (pattuglia, inseguitore, ostacolo fisso)
- [ ] Danno al giocatore e invulnerabilità temporanea
- [ ] Vite e schermata di sconfitta
- [ ] Checkpoint e respawn
- [ ] Trappole ambientali (spuntoni, piattaforme mobili)

## Fase 4 — Contenuto

- [ ] 5-8 livelli con una curva di difficoltà pensata
- [ ] Collezionabili e porta di uscita
- [ ] Schermata di transizione tra un livello e l'altro
- [ ] Progressione salvata nel browser
- [ ] Cronometro e record personali

## Fase 5 — Juice

Il punto in cui il gioco smette di sembrare un prototipo.

- [ ] Sprite e animazioni (fermo, corsa, salto, caduta, atterraggio)
- [ ] Particelle: polvere allo stacco e all'atterraggio
- [ ] Screenshake e deformazione del personaggio (squash & stretch)
- [ ] Effetti sonori e musica
- [ ] Menu principale, pausa, opzioni (volume, rimappatura tasti)

## Fase 6 — Pubblicazione

- [ ] Build ottimizzata e pagina di destinazione curata
- [ ] Pubblicazione su [itch.io](https://itch.io/)
- [ ] Sessioni di prova con persone vere
- [ ] Correzioni in base a cosa le ha bloccate

---

## Come lavoriamo

- Un ramo per funzionalità, pull request verso `main`.
- Ogni fase chiusa diventa una release con tag (`v0.1`, `v0.2`, …).
- Ad ogni passo tu provi il gioco e dici cosa non funziona **al tatto**:
  è il tipo di riscontro che conta di più e che non si può dedurre dal codice.
