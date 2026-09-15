/**
 * La presentabilità: il cuore del gioco.
 *
 * Non è una normale barra della vita. È insieme **vita e punteggio**: si
 * consuma sporcandosi e, alla fine del livello, il valore residuo decide la
 * reazione della ragazza. Per questo non conviene mai "tanto basta arrivare":
 * arrivare vivi e arrivare bene sono due obiettivi diversi.
 *
 * ## Perché gli abiti di ricambio hanno un tetto più basso
 *
 * Se cambiarsi riportasse al 100%, il giocatore sarebbe **premiato per
 * essersi sporcato**: bastava rovinarsi apposta poco prima del traguardo per
 * arrivare immacolati. È il difetto strutturale di qualunque meccanismo che
 * rimetta a nuovo, gratis, lo stesso valore che poi viene giudicato.
 *
 * La soluzione è tematica prima che matematica: gli abiti di ricambio sono
 * semplicemente **peggiori**. Il secondo arriva al 55%, il terzo al 30%.
 * Cambiarsi non riempie la barra: ne abbassa il tetto, per sempre.
 *
 * Il conto torna: da un completo buono al 60% conviene resistere (60 > 55),
 * da uno al 20% conviene cambiarsi (55 > 20). Cioè cambiarsi resta la mossa
 * giusta solo quando sei davvero ridotto male — che è una decisione
 * interessante, non un exploit.
 */

/** Il guardaroba, in ordine di disperazione. Il tetto è il massimo raggiungibile. */
export const OUTFITS = [
  { name: 'il completo buono', short: 'COMPLETO BUONO', ceiling: 100 },
  { name: 'il vestito del matrimonio di tuo cugino', short: 'VESTITO DEL CUGINO', ceiling: 55 },
  { name: 'la felpa che tenevi in macchina', short: 'FELPA DA MACCHINA', ceiling: 30 },
] as const;

/** Scala della barra: resta 100 anche quando il tetto scende, così il calo si vede. */
export const MAX_PRESENTABILITY = 100;
export const STARTING_OUTFITS = OUTFITS.length;

/** Cosa è successo a seguito di una macchia. */
export type StainResult =
  | { kind: 'sporcato' }
  | { kind: 'cambioAbito'; nuovoAbito: string; tetto: number }
  | { kind: 'finita' };

export class Presentability {
  private tier = 0;
  private value: number = OUTFITS[0].ceiling;
  private over = false;

  get percent(): number {
    return this.value;
  }

  /** Quale abito è addosso: 0 = il completo buono. */
  get outfitTier(): number {
    return this.tier;
  }

  get outfitName(): string {
    return OUTFITS[this.tier]?.name ?? OUTFITS[OUTFITS.length - 1]!.name;
  }

  /** Il massimo raggiungibile con l'abito attuale. */
  get ceiling(): number {
    return OUTFITS[this.tier]?.ceiling ?? 0;
  }

  /** Quanti abiti restano, quello indosso compreso. */
  get outfitsLeft(): number {
    return Math.max(0, OUTFITS.length - this.tier);
  }

  get isOver(): boolean {
    return this.over;
  }

  /**
   * 0 = pulito, 1 = disastro. È relativo al tetto dell'abito attuale: una
   * felpa appena indossata dev'essere *pulita*, anche se vale solo 30 punti.
   */
  get filth(): number {
    const ceiling = this.ceiling;
    if (ceiling <= 0) return 1;
    return 1 - this.value / ceiling;
  }

  stain(amount: number): StainResult {
    if (this.over) return { kind: 'finita' };

    this.value = Math.max(0, this.value - amount);
    if (this.value > 0) return { kind: 'sporcato' };

    this.tier += 1;
    if (this.tier >= OUTFITS.length) {
      this.over = true;
      return { kind: 'finita' };
    }

    this.value = this.ceiling;
    return { kind: 'cambioAbito', nuovoAbito: this.outfitName, tetto: this.ceiling };
  }

  /** Ripulirsi alla fontanella: recupera, ma mai oltre il tetto dell'abito. */
  clean(amount: number): void {
    if (this.over) return;
    this.value = Math.min(this.ceiling, this.value + amount);
  }

  reset(): void {
    this.tier = 0;
    this.value = OUTFITS[0].ceiling;
    this.over = false;
  }
}
