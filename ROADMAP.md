# Roadmap

Ogni fase si chiude con qualcosa di giocabile, non con codice a metà.
Si passa alla fase successiva solo quando la precedente è divertente da provare.

> **Nota sull'ordine.** Le fasi 2 e 3 sono state scambiate rispetto al piano
> iniziale: prima si dimostra che la meccanica centrale diverte, poi si
> costruiscono gli strumenti per fare tanti livelli. Costruire l'editor di
> livelli prima di sapere se il gioco funziona è il modo classico di
> ritrovarsi con dieci livelli da buttare.

---

## Fase 0 — Fondamenta ✅

- [x] Progetto Vite + TypeScript + Phaser 4 che parte con `npm run dev`
- [x] Controllo dei tipi in `npm run build`
- [x] Pubblicazione automatica su GitHub Pages ad ogni push su `main`

## Fase 1 — Il salto deve essere bello ✅

- [x] Corsa con accelerazione e attrito separati, a terra e in aria
- [x] Salto ad altezza variabile
- [x] Gravità asimmetrica: si scende più in fretta di quanto si sale
- [x] Coyote time e jump buffer
- [x] Livello-palestra tarato sulle distanze reali del salto
- [x] **Approvato alla prova pratica**

## Fase 2 — La presentabilità ⬅️ **siamo qui**

Il cuore del gioco: la barra che è insieme vita e punteggio.

- [x] Barra della presentabilità, da 100 a 0
- [x] Abiti di ricambio come vite, con cambio automatico a zero
- [x] Il personaggio si sporca a vista mentre la barra scende
- [x] Pozzanghere, con costo proporzionale alla velocità d'impatto
- [x] Sacchi di spazzatura attraversabili: saltarli o pagarli
- [x] Fontanelle che ripuliscono, ma con scorta limitata
- [x] Piccioni che pattugliano e bombardano
- [x] Traguardo con verdetto finale in base a quanto sei arrivato in ordine
- [x] **L'orologio: lei sta aspettando** — limite morbido, si può arrivare in
      ritardo ma entra nel giudizio finale
- [x] Verdetto finale che incrocia presentabilità e puntualità
- [x] Le insidie si pagano **entrando**, non restandoci sopra
- [x] Checkpoint, uno per tratto di marciapiede
- [x] Abiti di ricambio con tetto decrescente: cambiarsi non è più un premio
- [x] Inviluppo di salto misurato, e piattaforme alte rese raggiungibili
- [ ] Altri due o tre nemici dal bestiario

## Fase 3 — Mondo vero

- [x] Livello lungo quattro schermate, con scorrimento laterale
- [x] Camera che segue il giocatore con zona morta e inseguimento morbido
- [x] Palazzi sullo sfondo su due piani di parallasse
- [ ] Livelli disegnati in [Tiled](https://www.mapeditor.org/) invece che a mano nel codice
- [ ] Collisioni sul layer della tilemap
- [ ] Scorciatoie rischiose: più rapide, più sporche

## Fase 4 — Contenuto

- [ ] 5-8 tappe del percorso con una curva di difficoltà pensata
- [ ] Il mazzo di fiori da proteggere
- [ ] Schermata di transizione fra una tappa e l'altra
- [ ] Progressione e record salvati nel browser
- [ ] Una piccola scena comica al termine di ogni tappa

## Fase 5 — Juice

Il punto in cui il gioco smette di sembrare un prototipo.

- [ ] Sprite e animazioni (fermo, corsa, salto, caduta, atterraggio)
- [ ] Le macchie si vedono sul vestito, non come cambio di colore
- [ ] Particelle: schizzi d'acqua, polvere allo stacco
- [ ] Screenshake e deformazione del personaggio (squash & stretch)
- [ ] Effetti sonori e musica
- [ ] Menu principale, pausa, opzioni

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
