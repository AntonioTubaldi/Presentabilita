/**
 * La presentabilità: il cuore del gioco.
 *
 * Non è una normale barra della vita. È insieme **vita e punteggio**: si
 * consuma sporcandosi e, alla fine del livello, il valore residuo decide la
 * reazione della ragazza. Per questo non conviene mai "tanto basta arrivare":
 * arrivare vivi e arrivare bene sono due obiettivi diversi.
 *
 * Quando scende a zero il ragazzo è impresentabile e deve cambiarsi: si
 * consuma un abito di ricambio (le "vite") e si riparte puliti dall'ultimo
 * checkpoint. Finiti gli abiti, l'appuntamento è compromesso.
 */

export const MAX_PRESENTABILITY = 100;
export const STARTING_OUTFITS = 3;

/** Cosa è successo a seguito di una macchia. */
export type StainResult =
  | { kind: 'sporcato' }
  | { kind: 'cambioAbito'; abitiRimasti: number }
  | { kind: 'finita' };

export class Presentability {
  private value = MAX_PRESENTABILITY;
  private outfits = STARTING_OUTFITS;

  get percent(): number {
    return this.value;
  }

  get outfitsLeft(): number {
    return this.outfits;
  }

  get isOver(): boolean {
    return this.outfits <= 0;
  }

  /** 0 = immacolato, 1 = disastro. Usato per colorare il personaggio. */
  get filth(): number {
    return 1 - this.value / MAX_PRESENTABILITY;
  }

  stain(amount: number): StainResult {
    if (this.isOver) return { kind: 'finita' };

    this.value = Math.max(0, this.value - amount);
    if (this.value > 0) return { kind: 'sporcato' };

    this.outfits -= 1;
    if (this.outfits <= 0) return { kind: 'finita' };

    this.value = MAX_PRESENTABILITY;
    return { kind: 'cambioAbito', abitiRimasti: this.outfits };
  }

  /** Ripulirsi alla fontanella: recupera, ma non oltre il massimo. */
  clean(amount: number): void {
    if (this.isOver) return;
    this.value = Math.min(MAX_PRESENTABILITY, this.value + amount);
  }

  reset(): void {
    this.value = MAX_PRESENTABILITY;
    this.outfits = STARTING_OUTFITS;
  }

  /**
   * Il giudizio finale sul ragazzo, in base a quanto è arrivato in ordine.
   * È la ricompensa comica del livello: la ragione per rigiocare.
   */
  verdict(): string {
    if (this.value >= 95) return 'Impeccabile. Lei sorride.';
    if (this.value >= 75) return 'Un po’ spettinato, ma va benissimo.';
    if (this.value >= 50) return 'Lei fa finta di non notare la macchia.';
    if (this.value >= 25) return 'Lei propone di sedersi… fuori.';
    return 'Lei ha appena ricordato di avere un impegno.';
  }
}
