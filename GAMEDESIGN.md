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
**abito di ricambio** e si riparte dall'ultimo checkpoint. Finiti gli abiti,
l'appuntamento è compromesso.

### Gli abiti di ricambio sono peggiori (e devono esserlo)

Il guardaroba è, in ordine di disperazione:

| Abito | Tetto |
| --- | --- |
| Il completo buono | 100% |
| Il vestito del matrimonio di tuo cugino | 55% |
| La felpa che tenevi in macchina | 30% |

Cambiarsi **non riempie la barra: ne abbassa il tetto, per sempre.**

Questo non è un dettaglio di bilanciamento, è la toppa a una falla
strutturale. Se il cambio riportasse al 100%, il giocatore sarebbe *premiato
per essersi sporcato*: bastava rovinarsi apposta poco prima del traguardo per
arrivare immacolati. È il difetto di qualunque meccanismo che rimetta a
nuovo, gratis, lo stesso valore che poi viene giudicato.

Con i tetti il conto torna: da un completo buono al 60% conviene resistere
(60 > 55), da uno al 20% conviene cambiarsi (55 > 20). Cioè cambiarsi resta
la mossa giusta solo quando sei davvero ridotto male — che è una decisione
interessante, non un exploit. E l'interfaccia lo mostra: la porzione di barra
perduta resta disegnata, spenta, così il giocatore vede di aver perso
qualcosa per sempre invece di vedere una barra che si riempie.

Ma soprattutto: **il valore residuo all'arrivo decide il finale.** Non esiste
un semplice "hai vinto". Esiste un giudizio:

| Presentabilità | In orario | In ritardo |
| --- | --- | --- |
| 75%+ | Lei sorride. La serata comincia bene. | Lei apprezza lo sforzo, ma aveva altri programmi. |
| 40%+ | Lei fa finta di non notare nulla. | Lei propone di sedersi… fuori. |
| sotto | Lei chiede se stai bene. | Lei ha appena ricordato di avere un impegno. |
| in felpa | Lei ti guarda la felpa. Poi guarda te. Poi di nuovo la felpa. | Lei era già andata via. |

Questo è ciò che tiene in piedi tutto il resto: arrivare e arrivare *bene*
sono due obiettivi diversi, e il secondo è quello che fa rigiocare.

## Le insidie non sono muri

Nessun ostacolo blocca il passaggio: ci si passa attraverso pagandone il
prezzo. Davanti a un sacco di spazzatura hai sempre due opzioni — saltarlo
(costa precisione) o tirare dritto (costa presentabilità).

Il costo di una pozzanghera è **proporzionale alla velocità**: attraversarla
piano costa 5,6 punti, lanciarcisi a tutta velocità quasi 16, e atterrarci
sopra di peso ancora di più. Questo trasforma anche la fretta in una
decisione.

**Si paga entrando, non restando.** Fermarsi dentro una pozzanghera non
sporca ulteriormente, e un sacco di spazzatura fa danno una volta sola e poi
si affloscia e sparisce. Un'insidia che continua a riscuotere mentre stai
fermo è una punizione che il giocatore non collega a nessuna sua decisione —
e, cosa peggiore, rendeva più conveniente attraversare le pozzanghere di
corsa che con prudenza, esattamente al contrario di quello che il gioco
vuole insegnare.

L'unica eccezione è la fontanella, che agisce nel tempo: restare fermi è il
suo costo, e con l'orologio che scorre è un costo vero.

---

## L'orologio: lei sta aspettando

Senza pressione temporale la strategia ottimale sarebbe avanzare piano e non
sporcarsi mai — cioè annoiarsi. Con l'orologio ogni insidia diventa un
dilemma vero: *ci giro intorno o ci passo dentro?*

È la tensione che tiene insieme il gioco: **pulito contro puntuale.**

Il limite è **morbido**: scaduto il tempo si può ancora arrivare, ma il
ritardo entra nel giudizio. Il gioco non ti ferma, ti giudica. E il verdetto
incrocia davvero le due colonne — lo stesso 63% di presentabilità dà *"Lei fa
finta di non notare nulla"* se sei in orario e *"Lei propone di sedersi…
fuori"* con venti secondi di ritardo.

Il tempo continua a scorrere anche quando cadi in un tombino o cambi
d'abito: perdere tempo è parte del prezzo di ogni errore.

### Come si tara

Il limite del livello è il numero più delicato del gioco: troppo largo e
l'orologio non conta, troppo stretto e diventa una punizione. Si tara su una
misura, non a occhio — una corsa diretta che tira dritto su tutto e salta
solo i varchi impiega **16 secondi**, e il limite è fissato a **28**, cioè
circa il 70% di margine. Va rimisurato ogni volta che il percorso si allunga.

## L'ombrello: il verbo caratterizzante

Correre e saltare ce l'hanno tutti. Questo è il gesto che rende il gioco
riconoscibile, ed è **difensivo**, perché il gioco parla di proteggere
qualcosa, non di attaccare. Un ragazzo che va a un appuntamento con
l'ombrello non ha bisogno di spiegazioni.

Si tiene premuto `SHIFT` (o `X`). Finché è aperto:

| | |
| --- | --- |
| Para tutto ciò che viene **dall'alto** | piccioni, e in futuro tovaglie, gerani, imbianchini |
| Non para **niente da terra** | pozzanghere, spazzatura, schizzi dei taxi |
| Rallenta | 170 → 102 px/s |
| Abbassa il salto | 59 → 42 px |

Le quattro righe insieme fanno il lavoro, e nessuna funziona senza le altre:

1. **Divide il bestiario in due metà.** Nessuna delle due si risolve da sola,
   quindi tenerlo sempre aperto è una strategia perdente quanto non aprirlo mai.
2. **Il costo è tempo**, cioè si innesta sulla tensione che già regge il
   gioco. Non è "premi per essere al sicuro", è "spendi secondi per esserlo".
3. **A 42 px non si sale sui cornicioni** (ne servono 50). Quindi la via alta
   si prende solo a ombrello chiuso, cioè esposti. Questa non è una
   limitazione accidentale: è il motivo per cui la via alta resta rischiosa.

### Si rompe, e si ricompra

Regge **tre colpi**, poi cede. Non è uno stato che attivi, è una risorsa che
spendi: aprire l'ombrello significa anche consumarlo.

Lungo la strada ci sono **negozi di ombrelli**: passandoci davanti ne prendi
uno nuovo al volo, senza fermarti. Ogni negozio serve una volta sola —
altrimenti basterebbe fare avanti e indietro davanti alla vetrina. Sono
piazzati appena prima delle zone dei piccioni, così la domanda "lo tengo per
dopo o lo apro adesso?" arriva sempre un attimo prima che serva.

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
  sempre colpa tua. Parabili con l'ombrello.

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

1. **Estetica.** Pixel art originale o asset gratuiti (per esempio
   [Kenney](https://kenney.nl/), dominio pubblico) per arrivare prima a un
   gioco completo, sostituendoli dopo.
2. **Il personaggio.** Ha un nome? Si vede la ragazza durante il percorso
   (messaggi sul telefono che aumentano la pressione) o solo alla fine?

---

## Numeri che vincolano il design

Misurati sul gioco in esecuzione, non calcolati:

| Grandezza | Valore |
| --- | --- |
| Altezza del salto pieno | 59 px |
| Gittata del salto a velocità massima | ~75 px |
| Dislivello massimo superabile | ~56 px |
| Costo pozzanghera a velocità massima | 15,9 punti |
| Costo pozzanghera camminando piano | 5,6 punti |
| Costo sacco di spazzatura | 10 punti (una volta sola) |
| Colpo di piccione | 14 punti |
| Scorta di una fontanella | 36 punti |
| Lunghezza del percorso | 2560 px, quattro schermate |
| Corsa diretta dall'inizio alla fine | 16,0 s, si arriva al 18% |
| Limite prima del ritardo | 28 s |

Chi tira dritto su tutto arriva intorno al 63% e in orario; chi si ferma a
ripulirsi arriva più pulito ma rischia il ritardo. È lo spazio fra queste due
strategie che rende il livello interessante.

Questi valori sono il vocabolario con cui si scrivono i livelli: se cambiano,
tutti i livelli già disegnati vanno ricontrollati.

### L'inviluppo di salto

Non basta sapere che il salto alza di 59 px: per piazzare una piattaforma
serve sapere **dove** si passa a una certa quota. Questa tabella è misurata
registrando l'arco di un salto pieno a velocità massima, e dice entro quale
distanza orizzontale dal punto di stacco il ragazzo si trova almeno a quel
dislivello:

| Dislivello | Finestra utile dal punto di stacco |
| --- | --- |
| 0 (pianura) | 0 → 91 px |
| +25 px | 14 → 82 px |
| +40 px | 25 → 74 px |
| +50 px | 34 → 68 px |
| +55 px | 40 → 62 px |

Una piattaforma a +50 px va quindi piazzata fra 34 e 68 px oltre il bordo di
stacco. È la regola che mancava: le prime piattaforme alte erano a 105, 110 e
125 px, cioè **semplicemente irraggiungibili**, e si vedeva solo provando.
