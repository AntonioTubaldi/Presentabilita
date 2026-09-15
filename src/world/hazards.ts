import Phaser from 'phaser';
import { COLORS } from '../config';

/**
 * Le insidie della strada.
 *
 * Nessuna è solida: ci si passa attraverso pagandone il prezzo. È voluto, ed
 * è il cuore del gioco — davanti a un sacco di spazzatura hai sempre due
 * opzioni, saltarlo (costa precisione e tempo) o tirare dritto (costa
 * presentabilità). Se fossero muri, la scelta non esisterebbe.
 *
 * Regola generale: **si paga entrando, non restando**. Fermarsi sopra
 * un'insidia non deve continuare a sporcare: sarebbe una punizione che il
 * giocatore non collega a nessuna sua decisione.
 */
export type HazardKind = 'pozzanghera' | 'spazzatura' | 'fontanella';

/** [tipo, centro x, centro y, larghezza, altezza] */
export type HazardSpec = readonly [HazardKind, number, number, number, number];

export interface Hazard {
  readonly kind: HazardKind;
  readonly view: Phaser.GameObjects.Rectangle;
  /** Il giocatore la stava toccando nel frame precedente? Serve a pagare solo all'ingresso. */
  wasTouching: boolean;
  /** Toccata in questo frame: azzerata a fine update dopo il confronto. */
  touchedThisFrame: boolean;
  /** Solo per la fontanella: momento dell'ultima erogazione. */
  lastTriggeredAt: number;
  /** Solo per la fontanella: quanta pulizia può ancora erogare. */
  budget: number;
  /** Solo per la spazzatura: già urtata, non fa più danno. */
  consumed: boolean;
}

const FILL: Record<HazardKind, number> = {
  pozzanghera: COLORS.puddle,
  spazzatura: COLORS.trash,
  fontanella: COLORS.fountain,
};

/** Ogni quanto la fontanella può erogare di nuovo a chi ci resta sotto (ms). */
export const FOUNTAIN_INTERVAL_MS = 500;

/**
 * Costo di una pozzanghera: una quota fissa più una proporzionale alla
 * velocità con cui ci finisci dentro. Attraversarla piano sporca poco,
 * lanciarcisi a tutta velocità sporca il triplo.
 */
export const PUDDLE_BASE_COST = 4;
export const PUDDLE_SPEED_COST = 0.07;
/** Sovrapprezzo per chi ci atterra sopra di peso invece di attraversarla. */
export const PUDDLE_SPLASH_COST = 8;
export const PUDDLE_SPLASH_FALL_SPEED = 250;

export const TRASH_COST = 10;

/** Quanto ripulisce la fontanella ad ogni erogazione. */
export const FOUNTAIN_CLEAN = 12;

/**
 * Quanta pulizia può erogare in tutto una fontanella prima di esaurirsi.
 *
 * Senza questo limite bastava restare fermi sotto il getto per tornare
 * immacolati, e le macchie smettevano di contare: la fontanella diventava
 * un pulsante "annulla". Con una scorta finita la domanda diventa *quando*
 * spenderla — e con l'orologio che scorre, anche *se* puoi permettertelo.
 */
export const FOUNTAIN_BUDGET = 36;

export function createHazards(scene: Phaser.Scene, specs: readonly HazardSpec[]): Hazard[] {
  return specs.map(([kind, x, y, width, height]) => {
    const view = scene.add.rectangle(x, y, width, height, FILL[kind]);
    if (kind === 'fontanella') {
      view.setStrokeStyle(1, COLORS.barGood);
    }
    scene.physics.add.existing(view, true);
    return {
      kind,
      view,
      wasTouching: false,
      touchedThisFrame: false,
      lastTriggeredAt: -Infinity,
      budget: kind === 'fontanella' ? FOUNTAIN_BUDGET : 0,
      consumed: false,
    };
  });
}

/**
 * Chiude il frame: quello che è stato toccato ora sarà "già toccato" al
 * prossimo giro. È questo confronto a distinguere l'ingresso dalla permanenza.
 */
export function rollHazardContacts(hazards: readonly Hazard[]): void {
  for (const hazard of hazards) {
    hazard.wasTouching = hazard.touchedThisFrame;
    hazard.touchedThisFrame = false;
  }
}

/**
 * Quanto sporca una pozzanghera, dato come ci sei finito dentro.
 * Attraversarla piano costa poco; tuffarcisi dall'alto si paga.
 */
export function puddleCost(velocityX: number, velocityY: number): number {
  const splash = velocityY > PUDDLE_SPLASH_FALL_SPEED ? PUDDLE_SPLASH_COST : 0;
  return PUDDLE_BASE_COST + Math.abs(velocityX) * PUDDLE_SPEED_COST + splash;
}

/** Il sacco urtato si affloscia e sparisce: ha già fatto il suo danno. */
export function consumeTrash(hazard: Hazard, scene: Phaser.Scene): void {
  hazard.consumed = true;
  const body = hazard.view.body as Phaser.Physics.Arcade.StaticBody | null;
  if (body) body.enable = false;

  scene.tweens.add({
    targets: hazard.view,
    alpha: 0,
    scaleY: 0.3,
    duration: 180,
    onComplete: () => hazard.view.destroy(),
  });
}

/** La fontanella esaurita si spegne a vista, così il giocatore non ci torna sperando. */
export function drainFountain(hazard: Hazard): number {
  const given = Math.min(FOUNTAIN_CLEAN, hazard.budget);
  hazard.budget -= given;
  if (hazard.budget <= 0) {
    hazard.view.setFillStyle(COLORS.trash);
    hazard.view.setStrokeStyle(1, COLORS.barFrame);
  }
  return given;
}
