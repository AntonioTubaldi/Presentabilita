# Presentabilità — documento di design

Questo documento è volutamente incompleto: registra ciò che è già deciso e
tiene in evidenza le domande ancora aperte. Si aggiorna man mano, non si scrive
tutto all'inizio.

---

## Deciso

**Genere.** Platformer 2D a schermate, con salto preciso. Non un metroidvania:
livelli separati, ognuno una sfida chiusa che dura pochi minuti.

**Prospettiva.** Vista laterale, risoluzione logica 640×360 scalata a schermo
intero. Stile pixel.

**Piattaforma.** Browser. Il gioco si apre da un link, senza installare niente.

**Comandi.** Tastiera: due direzioni e un tasto salto. Nessuna combinazione
complicata. Il salto ad altezza variabile è l'unica sottigliezza, e si capisce
senza spiegazioni.

**Principio guida.** La difficoltà deve stare nel *leggere* il livello, non nel
combattere i comandi. Ogni morte deve sembrare colpa del giocatore. Per questo
coyote time e jump buffer esistono fin dal primo giorno: il giocatore non li
nota, ma sente la differenza.

---

## Da decidere

### 1. Il titolo, cosa significa

"Presentabilità" è un titolo insolito per un platformer, ed è un punto di forza
se il gioco lo prende sul serio. Alcune direzioni possibili:

- **Letterale e comica.** Il personaggio deve arrivare a un colloquio, a un
  matrimonio, a una cena — e il livello lo sporca, lo spettina, lo strappa. La
  barra della vita è quanto sei ancora presentabile.
- **Astratta.** Il tema non entra nella storia ma nell'estetica: un mondo che si
  ricompone quando lo attraversi bene e si sfalda quando sbagli.
- **Ironica e slegata.** Il titolo resta un nome proprio e basta.

La prima dà un tema chiaro, di cui si nutrono livelli, nemici e collezionabili.
È la direzione più produttiva, ma va scelta consapevolmente.

### 2. Il verbo caratterizzante

Correre e saltare è la base comune a tutti i platformer. Serve **una** cosa in
più che renda questo gioco riconoscibile. Da valutare in Fase 1, provandole:

- scatto in aria (una sola volta, si ricarica a terra);
- aggrapparsi ai muri e saltare via;
- un oggetto da trasportare che limita i movimenti;
- rallentamento del tempo a comando.

Meglio una meccanica sola, sfruttata a fondo in tutti i livelli, che tre appena
accennate.

### 3. Cosa succede quando sbagli

Riavvio immediato del livello (stile *Super Meat Boy*, morte economica e
riprovare istantaneo) oppure vite e checkpoint (più tradizionale, meno
frustrante ma anche meno intenso). La scelta cambia il ritmo di tutto il gioco.

### 4. Estetica

Pixel art originale, oppure asset gratuiti (per esempio le collezioni di
[Kenney](https://kenney.nl/), dominio pubblico) per arrivare prima a un gioco
completo. Si può partire dai secondi e sostituirli dopo.

---

## Note tecniche rilevanti per il design

Con il tuning attuale (misurato, non teorico):

- il salto pieno alza di **59 px** e sposta in avanti di circa **75 px**;
- il dislivello massimo superabile è quindi poco sotto i **56 px**;
- il varco più largo attraversabile con rincorsa è circa **60 px**.

Questi numeri sono il vocabolario con cui si scrivono i livelli. Se cambiano,
tutti i livelli già disegnati vanno ricontrollati — motivo per cui conviene
chiudere davvero la Fase 1 prima di costruire contenuto.
