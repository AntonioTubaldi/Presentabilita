/**
 * L'ombrello: il verbo caratterizzante del gioco.
 *
 * Aperto para tutto quello che arriva **dall'alto** e niente di quello che
 * arriva **da terra**: non è un pulsante "sono al sicuro", è mezza soluzione.
 * E costa velocità — cioè costa tempo, che con lei che aspetta è la valuta
 * più cara. Le tre cose insieme fanno sì che tenerlo sempre aperto sia una
 * strategia perdente quanto non aprirlo mai.
 *
 * Si rompe dopo qualche colpo incassato, così è una risorsa da spendere e
 * non uno stato da attivare: quando lo apri stai anche consumando qualcosa.
 */

/** Quanti colpi regge prima di rompersi. */
export const UMBRELLA_MAX_HITS = 3;

/** Cosa è successo quando qualcosa gli è caduto addosso. */
export type AbsorbResult = 'retto' | 'rotto';

export class Umbrella {
  private hits = UMBRELLA_MAX_HITS;
  private owned = true;
  private wantsOpen = false;

  /** Ne hai uno addosso, rotto o no che sia il prossimo colpo. */
  get has(): boolean {
    return this.owned;
  }

  /** Aperto davvero: lo si può volere aperto anche senza averne uno. */
  get isOpen(): boolean {
    return this.owned && this.wantsOpen;
  }

  get hitsLeft(): number {
    return this.owned ? this.hits : 0;
  }

  /** Lo stato del tasto, letto ogni frame da PlayerController. */
  setWantsOpen(wanted: boolean): void {
    this.wantsOpen = wanted;
  }

  /**
   * Incassa un colpo dall'alto. Va chiamato solo se `isOpen`: è il chiamante
   * a decidere se il colpo era parabile, perché solo lui sa da dove arriva.
   */
  absorb(): AbsorbResult {
    this.hits -= 1;
    if (this.hits > 0) return 'retto';

    this.owned = false;
    this.hits = 0;
    return 'rotto';
  }

  /** Un ombrello nuovo dal negozio. */
  refill(): void {
    this.owned = true;
    this.hits = UMBRELLA_MAX_HITS;
  }

  reset(): void {
    this.owned = true;
    this.hits = UMBRELLA_MAX_HITS;
    this.wantsOpen = false;
  }
}
