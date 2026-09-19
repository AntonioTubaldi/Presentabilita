/**
 * Tutti i numeri che decidono come "si sente" il personaggio.
 *
 * Questa è la Fase 1 del progetto: il file più importante del gioco.
 * Cambia solo questi valori — non il codice di PlayerController — finché
 * il salto non ti sembra giusto al tatto.
 *
 * Unità: pixel e secondi.
 */
export const TUNING = {
  // --- Movimento orizzontale ---

  /** Velocità massima di corsa (px/s). */
  maxSpeed: 170,
  /** Quanto in fretta si raggiunge maxSpeed da fermo, a terra (px/s²). */
  groundAccel: 1400,
  /** Quanto in fretta ci si ferma quando lasci i tasti, a terra (px/s²). */
  groundFriction: 1700,
  /** Come sopra, ma in aria: più bassa = meno controllo a mezz'aria. */
  airAccel: 900,
  airFriction: 450,

  // --- Salto ---

  /** Altezza del salto se tieni premuto (px). Da qui si ricava la spinta iniziale. */
  jumpHeight: 62,
  /** Tempo per raggiungere il culmine del salto (s). Più basso = salto più scattante. */
  jumpTimeToApex: 0.32,

  /**
   * Moltiplicatore di gravità mentre si scende.
   * >1 rende la discesa più rapida della salita: è il trucco che fa sembrare
   * "pesante e reattivo" un platformer invece che lunare.
   */
  fallGravityMultiplier: 1.9,
  /**
   * Moltiplicatore applicato mentre si sale ma il tasto salto è già stato rilasciato.
   * È ciò che rende il salto ad altezza variabile: tocchi = saltello, tieni = salto pieno.
   */
  jumpCutGravityMultiplier: 3.2,

  /** Velocità di caduta massima (px/s): evita che si diventi ingestibili nei pozzi lunghi. */
  maxFallSpeed: 520,

  // --- Ombrello aperto ---

  /**
   * Quanto rallenta camminare con l'ombrello aperto.
   *
   * È il cuore del suo equilibrio: l'ombrello non è un pulsante "sono al
   * sicuro", è uno scambio fra sicurezza e tempo. E il tempo, con lei che
   * aspetta, è la valuta più cara del gioco.
   */
  umbrellaSpeedFactor: 0.6,

  /**
   * Quanto si salta più in basso con l'ombrello aperto. Con 0,85 sulla
   * spinta l'altezza scende a ~43 px, sotto i 50 che servono per i
   * cornicioni: la via alta si prende **solo a ombrello chiuso**, e quindi
   * esposti ai piccioni. È una conseguenza voluta, non un effetto collaterale.
   */
  umbrellaJumpFactor: 0.85,

  // --- Assist (invisibili al giocatore, ma li sente tutti) ---

  /**
   * Coyote time: quanti secondi dopo essere uscito da una piattaforma
   * il salto viene ancora accettato. Perdona il "ho premuto un attimo tardi".
   */
  coyoteTime: 0.1,
  /**
   * Jump buffer: quanti secondi prima di toccare terra la pressione del salto
   * resta in memoria. Perdona il "ho premuto un attimo presto".
   */
  jumpBuffer: 0.12,
} as const;

/**
 * Gravità base (px/s²) e spinta iniziale del salto (px/s), derivate da
 * jumpHeight e jumpTimeToApex con le equazioni del moto uniformemente accelerato.
 *
 * Si ragiona in "quanto alto e quanto veloce", non in "quanti pixel al secondo quadrato":
 * cambiare jumpHeight aggiusta entrambi i valori da solo.
 */
export const BASE_GRAVITY = (2 * TUNING.jumpHeight) / (TUNING.jumpTimeToApex * TUNING.jumpTimeToApex);
export const JUMP_VELOCITY = (2 * TUNING.jumpHeight) / TUNING.jumpTimeToApex;
