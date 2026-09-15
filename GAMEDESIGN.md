# Presentabilità — documento di design

Si aggiorna man mano. Registra ciò che è deciso e tiene in evidenza le
domande ancora aperte, invece di fingere che il gioco sia già tutto chiaro.

---

## Il gioco in una frase

Un ragazzo deve attraversare la città per arrivare a un appuntamento con una
ragazza che gli piace, e la città fa di tutto per sporcarlo.

## La meccanica centrale

**La presentabilità è insieme vita e punteggio.** Una sola barra, da 100 a 0.

Si consuma sporcandosi: pozzanghere, sacchi di spazzatura, piccioni. Quando
arriva a zero il ragazzo è impresentabile e deve cambiarsi — si consuma un
**abito di ricambio** (le vite, tre all'inizio) e si riparte puliti. Finiti
gli abiti, l'appuntamento è compromesso.

Ma soprattutto: **il valore residuo all'arrivo decide il finale.** Non esiste
un semplice "hai vinto". Esiste un giudizio:

| Presentabilità | Reazione |
| --- | --- |
| 95%+ | Impeccabile. Lei sorride. |
| 75%+ | Un po' spettinato, ma va benissimo. |
| 50%+ | Lei fa finta di non notare la macchia. |
| 25%+ | Lei propone di sedersi… fuori. |
| sotto | Lei ha appena ricordato di avere un impegno. |

Questo è ciò che tiene in piedi tutto il resto: arrivare e arrivare *bene*
sono due obiettivi diversi, e il secondo è quello che fa rigiocare.

## Le insidie non sono muri

Nessun ostacolo blocca il passaggio: ci si passa attraverso pagandone il
prezzo. Davanti a un sacco di spazzatura hai sempre due opzioni — saltarlo
(costa precisione) o tirare dritto (costa presentabilità).

Il costo di una pozzanghera è **proporzionale alla velocità**: attraversarla
piano è quasi gratis, lanciarcisi a tutta velocità costa il triplo, e
atterrarci sopra di peso costa ancora di più. Questo trasforma anche la
fretta in una decisione.

---

## La proposta che manca: il tempo

**Lei sta aspettando.** Senza una pressione temporale, la strategia ottimale è
avanzare piano e non sporcarsi mai — cioè annoiarsi. Con un orologio che
scorre, ogni insidia diventa un vero dilemma: *ci giro intorno o ci passo
dentro?*

È la tensione che tiene insieme il gioco: **pulito contro puntuale.** Il
finale terrebbe conto di entrambi — arrivare immacolati con quaranta minuti
di ritardo dovrebbe andare peggio che arrivare in orario con una macchia.

È l'unica aggiunta che secondo me cambia il gioco da "schiva le cose" a
"scegli cosa sacrificare". La proporrei come prossimo passo.

## Altre idee da valutare

**Scorciatoie sporche.** Percorsi alternativi più rapidi ma più rischiosi:
il vicolo dietro i cassonetti, il cantiere, il tetto. Due assi di bravura
invece di uno.

**Il mazzo di fiori.** Lo porti con te e si rovina separatamente. Una seconda
cosa fragile da proteggere, e un modo di migliorare il finale se arriva
intatto. Perdere i fiori non ti fa perdere: ti fa arrivare a mani vuote.

**Le fontanelle a scorta limitata.** Già implementate: erogano 36 punti in
tutto, poi si seccano. Senza il limite erano un pulsante "annulla" e le
macchie smettevano di contare; con il limite la domanda diventa *quando*
spenderle.

**Un finale per livello.** Ogni tappa del percorso finisce con una piccola
scena comica invece che con "livello completato".

## Il bestiario

Implementato:

- **Piccioni.** Pattugliano il cielo e bombardano. Il proiettile cade a
  velocità costante, non accelerata: è prevedibile, quindi essere colpiti è
  sempre colpa tua.

Da fare, in ordine di quanto mi convincono:

- **Il tizio che scuote la tovaglia dal balcone** — telegrafato, ritmico,
  facile da leggere e divertente da schivare.
- **Il taxi che passa sulla pozzanghera** — si sente arrivare il motore, hai
  un secondo per allontanarti dal bordo. Il classico.
- **Il cane che si scrolla l'acqua di dosso** — innocuo finché non ti avvicini.
- **La vecchietta che innaffia i gerani** — getto continuo, ti costringe a
  passare di corsa o ad aspettare (e l'orologio scorre).
- **Il tombino che sbuffa vapore** — non ti sporca, ti arruffa i capelli:
  una categoria di danno diversa.
- **I bambini con le pistole ad acqua** — ti inseguono, non stanno fermi.
- **Il gabbiano** — come il piccione ma peggio: punta i fiori, non te.
- **L'imbianchino sul ponteggio** — vernice, il danno più caro del gioco.

Due proposte da riconsiderare: i **barboni** che lanciano spazzatura e le
**persone molto grasse** che schizzano salsa. Fanno ridere della categoria,
non della situazione, e su un gioco pubblico invecchiano male. La battuta
funziona uguale spostando il bersaglio sul comportamento: *il tizio che
gesticola troppo mangiando un hot dog al tavolino del bar* schizza salsa per
come gesticola, non per quanto pesa — stessa gag, nessun bersaglio facile.
Decisione tua, il gioco è il tuo.

---

## Deciso sul resto

**Genere.** Platformer 2D a livelli separati, ognuno una tappa del percorso.
Non un metroidvania.

**Prospettiva.** Vista laterale, risoluzione logica 640×360 scalata a schermo
intero, stile pixel.

**Piattaforma.** Browser. Si apre da un link, senza installare niente.

**Comandi.** Due direzioni e un tasto salto. Nessuna combinazione. Il salto ad
altezza variabile è l'unica sottigliezza, e si capisce senza spiegazioni.

**Tono.** Comico. Il ragazzo non è un eroe, è uno che ci tiene troppo.

**Principio guida.** La difficoltà sta nel *leggere* la strada, non nel
combattere i comandi. Ogni macchia dev'essere colpa del giocatore: per questo
coyote time e jump buffer esistono dal primo giorno, e per questo i proiettili
dei piccioni cadono a velocità costante.

## Ancora da decidere

1. **Il verbo caratterizzante.** Correre e saltare ce l'hanno tutti. Serve una
   cosa in più: una scivolata per passare sotto le cose? Un ombrello che para
   dall'alto ma rallenta? Uno scatto che però ti spettina? Meglio una
   meccanica sola sfruttata a fondo che tre appena accennate.
2. **Estetica.** Pixel art originale o asset gratuiti (per esempio
   [Kenney](https://kenney.nl/), dominio pubblico) per arrivare prima a un
   gioco completo, sostituendoli dopo.
3. **Il personaggio.** Ha un nome? Si vede la ragazza durante il percorso
   (messaggi sul telefono che aumentano la pressione) o solo alla fine?

---

## Numeri che vincolano il design

Misurati sul gioco in esecuzione, non calcolati:

| Grandezza | Valore |
| --- | --- |
| Altezza del salto pieno | 59 px |
| Gittata del salto a velocità massima | ~75 px |
| Dislivello massimo superabile | ~56 px |
| Costo pozzanghera a velocità massima | 16 punti |
| Costo pozzanghera camminando piano | ~7 punti |
| Costo sacco di spazzatura | 10 punti |
| Colpo di piccione | 14 punti |
| Scorta di una fontanella | 36 punti |

Con questi numeri, chi tira dritto su tutto arriva intorno al 31% ("Lei
propone di sedersi… fuori") e chi salta tutto arriva al 100%. È lo spazio di
manovra che rende il livello interessante.

Questi valori sono il vocabolario con cui si scrivono i livelli: se cambiano,
tutti i livelli già disegnati vanno ricontrollati.
