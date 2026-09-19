import Phaser from 'phaser';
import { COLORS } from '../config';

/**
 * Il vicinato ai piani alti.
 *
 * Due minacce che vengono **dall'alto**, cioè le prime per cui l'ombrello
 * esiste davvero. Hanno ritmi opposti di proposito:
 *
 * - **la tovaglia** è una raffica breve, telegrafata: la si evita col tempismo;
 * - **i gerani** sono un getto lungo: lo si attraversa di corsa, lo si aspetta,
 *   o lo si passa sotto l'ombrello pagando in secondi.
 *
 * Entrambe seguono un ciclo fisso *fermo → preavviso → attivo*. Il preavviso
 * è la parte importante: la zona pericolosa viene disegnata in trasparenza
 * **prima** di fare male, così essere colpiti è sempre una lettura sbagliata
 * e mai una sorpresa.
 */
export type BalconyKind = 'tovaglia' | 'gerani';

export interface BalconySpec {
  readonly kind: BalconyKind;
  readonly x: number;
  readonly y: number;
  /** Sfasa il ciclo, così due balconi vicini non vanno mai a tempo. */
  readonly offsetMs?: number;
}

interface BalconyProfile {
  /** Durata delle tre fasi, in millisecondi. */
  readonly idle: number;
  readonly telegraph: number;
  readonly active: number;
  /** Larghezza della zona pericolosa. */
  readonly width: number;
  /** Quanto sporca un colpo. */
  readonly damage: number;
  /** Ogni quanto può colpire di nuovo chi resta sotto (0 = una volta per raffica). */
  readonly repeatMs: number;
  readonly color: number;
  readonly message: string;
  /**
   * Se un colpo parato consuma una carica dell'ombrello.
   *
   * Le briciole sì, l'acqua no: quello che rovina un ombrello è la roba che
   * pesa, l'acqua scivola via. Senza questa distinzione un getto lungo
   * distruggerebbe l'ombrello in poco più di un secondo, e la regola
   * "l'ombrello para dall'alto" diventerebbe una presa in giro.
   */
  readonly breaksUmbrella: boolean;
}

const PROFILES: Record<BalconyKind, BalconyProfile> = {
  tovaglia: {
    idle: 1500,
    telegraph: 600,
    active: 400,
    width: 46,
    damage: 12,
    repeatMs: 0,
    color: COLORS.crumbs,
    message: 'Briciole. Dal terzo piano.',
    breaksUmbrella: true,
  },
  gerani: {
    idle: 1900,
    telegraph: 500,
    active: 1700,
    width: 22,
    damage: 7,
    repeatMs: 400,
    color: COLORS.water,
    message: 'Ti sta innaffiando.',
    breaksUmbrella: false,
  },
};

/** Quota della strada: le zone pericolose arrivano fin qui. */
const STREET_Y = 348;

type Phase = 'fermo' | 'preavviso' | 'attivo';

export class Balcony {
  readonly kind: BalconyKind;
  private readonly profile: BalconyProfile;
  private readonly zone: Phaser.GameObjects.Rectangle;
  private readonly prop: Phaser.GameObjects.Rectangle;
  private readonly propRestY: number;
  private readonly x: number;

  private readonly startOffset: number;
  private phase: Phase = 'fermo';
  private phaseEndsAt = 0;
  /** Il primo ciclo si programma al primo update, non nel costruttore. */
  private started = false;
  private lastHitAt = -Infinity;
  private hitThisBurst = false;

  constructor(scene: Phaser.Scene, spec: BalconySpec) {
    this.kind = spec.kind;
    this.profile = PROFILES[spec.kind];
    this.x = spec.x;

    const { x, y } = spec;

    // Il balcone e il vicino: arredo, non collidono con niente.
    scene.add.rectangle(x, y, 30, 4, COLORS.balcony);
    scene.add.rectangle(x, y - 11, 10, 18, COLORS.neighbour);

    this.propRestY = y - 6;
    const propColor = spec.kind === 'tovaglia' ? COLORS.tablecloth : COLORS.wateringCan;
    const propWidth = spec.kind === 'tovaglia' ? 22 : 9;
    const propHeight = spec.kind === 'tovaglia' ? 3 : 6;
    this.prop = scene.add.rectangle(x + 13, this.propRestY, propWidth, propHeight, propColor);

    // La zona pericolosa scende dal balcone fino alla strada.
    const top = y + 6;
    const height = STREET_Y - top;
    this.zone = scene.add.rectangle(x, top + height / 2, this.profile.width, height, this.profile.color);
    this.zone.setAlpha(0);

    this.startOffset = spec.offsetMs ?? 0;
  }

  update(time: number): void {
    // `scene.time.now` è il tempo di gioco, non riparte da zero ad ogni
    // livello: programmare il primo ciclo nel costruttore lo farebbe
    // risultare già scaduto, e tutti i balconi scatterebbero insieme al
    // primo frame — proprio ciò che gli sfasamenti servono a evitare.
    if (!this.started) {
      this.started = true;
      this.phaseEndsAt = time + this.startOffset + this.profile.idle;
      return;
    }

    if (time < this.phaseEndsAt) return;

    switch (this.phase) {
      case 'fermo':
        this.phase = 'preavviso';
        this.phaseEndsAt = time + this.profile.telegraph;
        break;
      case 'preavviso':
        this.phase = 'attivo';
        this.phaseEndsAt = time + this.profile.active;
        this.hitThisBurst = false;
        break;
      case 'attivo':
        this.phase = 'fermo';
        this.phaseEndsAt = time + this.profile.idle;
        break;
    }

    this.draw();
  }

  private draw(): void {
    // Trasparente durante il preavviso, pieno quando fa male: la differenza
    // dev'essere leggibile con la coda dell'occhio, di corsa.
    this.zone.setAlpha(this.phase === 'attivo' ? 0.5 : this.phase === 'preavviso' ? 0.18 : 0);

    if (this.kind === 'tovaglia') {
      // Si alza per caricare, poi scende di scatto.
      const dy = this.phase === 'preavviso' ? -14 : this.phase === 'attivo' ? 4 : 0;
      this.prop.setY(this.propRestY + dy);
    } else {
      this.prop.setAngle(this.phase === 'attivo' ? -40 : 0);
    }
  }

  /** Il giocatore è nella colonna pericolosa? Si confrontano solo le x. */
  coversX(playerLeft: number, playerRight: number): boolean {
    const half = this.profile.width / 2;
    return playerRight >= this.x - half && playerLeft <= this.x + half;
  }

  /**
   * Il colpo va a segno adesso? Gestisce da sé la cadenza: la tovaglia
   * colpisce una volta per raffica, il getto a intervalli finché ci resti.
   */
  tryHit(time: number): boolean {
    if (this.phase !== 'attivo') return false;

    if (this.profile.repeatMs === 0) {
      if (this.hitThisBurst) return false;
      this.hitThisBurst = true;
      return true;
    }

    if (time - this.lastHitAt < this.profile.repeatMs) return false;
    this.lastHitAt = time;
    return true;
  }

  get damage(): number {
    return this.profile.damage;
  }

  get message(): string {
    return this.profile.message;
  }

  get breaksUmbrella(): boolean {
    return this.profile.breaksUmbrella;
  }
}
