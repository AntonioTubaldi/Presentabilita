import Phaser from 'phaser';
import { COLORS } from '../config';

/**
 * Le insidie della strada.
 *
 * Nessuna di queste è solida: ci si passa attraverso. È voluto, ed è il
 * cuore del gioco — davanti a un sacco di spazzatura hai sempre due opzioni,
 * saltarlo (costa precisione e tempo) o tirare dritto (costa presentabilità).
 * Se fossero muri, la scelta non esisterebbe.
 */
export type HazardKind = 'pozzanghera' | 'spazzatura' | 'fontanella';

/** [tipo, centro x, centro y, larghezza, altezza] */
export type HazardSpec = readonly [HazardKind, number, number, number, number];

export interface Hazard {
  readonly kind: HazardKind;
  readonly view: Phaser.GameObjects.Rectangle;
  /** Momento dell'ultimo effetto, per non riapplicarlo ad ogni frame. */
  lastTriggeredAt: number;
  /** Solo per la fontanella: quanta pulizia può ancora erogare. */
  budget: number;
}

const FILL: Record<HazardKind, number> = {
  pozzanghera: COLORS.puddle,
  spazzatura: COLORS.trash,
  fontanella: COLORS.fountain,
};

/** Quanto spesso una stessa insidia può colpire di nuovo chi ci resta dentro (ms). */
export const HAZARD_COOLDOWN_MS = 500;

/** Costo base di una pozzanghera, più una quota proporzionale alla velocità. */
export const PUDDLE_BASE_COST = 6;
export const PUDDLE_SPEED_COST = 0.06;
/** Sovrapprezzo per chi ci atterra sopra di peso invece di attraversarla. */
export const PUDDLE_SPLASH_COST = 8;
export const PUDDLE_SPLASH_FALL_SPEED = 250;

export const TRASH_COST = 10;

/** Quanto ripulisce la fontanella per ogni attivazione (una ogni mezzo secondo). */
export const FOUNTAIN_CLEAN = 12;

/**
 * Quanta pulizia può erogare in tutto una fontanella prima di esaurirsi.
 *
 * Senza questo limite bastava restare fermi sotto il getto per tornare
 * immacolati, e le macchie smettevano di contare: la fontanella diventava
 * un pulsante "annulla". Con una scorta finita la domanda diventa *quando*
 * spenderla, che è una decisione interessante.
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
      lastTriggeredAt: -Infinity,
      budget: kind === 'fontanella' ? FOUNTAIN_BUDGET : 0,
    };
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

/**
 * Quanto sporca una pozzanghera, dato come ci sei finito dentro.
 * Attraversarla piano è quasi gratis; tuffarcisi dall'alto si paga.
 */
export function puddleCost(velocityX: number, velocityY: number): number {
  const splash = velocityY > PUDDLE_SPLASH_FALL_SPEED ? PUDDLE_SPLASH_COST : 0;
  return PUDDLE_BASE_COST + Math.abs(velocityX) * PUDDLE_SPEED_COST + splash;
}
