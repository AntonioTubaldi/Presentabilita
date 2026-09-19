import Phaser from 'phaser';
import { COLORS } from '../config';
import { mixColor } from '../utils/color';
import { BASE_GRAVITY, JUMP_VELOCITY, TUNING } from './tuning';
import { Umbrella } from './umbrella';

const KeyCodes = Phaser.Input.Keyboard.KeyCodes;

export const PLAYER_WIDTH = 14;
export const PLAYER_HEIGHT = 20;

/** Muove `current` verso `target` di al massimo `maxDelta`, senza superarlo. */
function approach(current: number, target: number, maxDelta: number): number {
  if (current < target) return Math.min(current + maxDelta, target);
  if (current > target) return Math.max(current - maxDelta, target);
  return target;
}

/** Stato leggibile dall'esterno, per l'overlay di debug. */
export interface PlayerDebugState {
  velocityX: number;
  velocityY: number;
  onGround: boolean;
  coyoteTime: number;
  jumpBuffer: number;
}

/**
 * Il personaggio giocante.
 *
 * Il corpo è un rettangolo: in Fase 1 la grafica non serve, serve solo che
 * corsa e salto siano piacevoli. Tutte le costanti stanno in `tuning.ts`.
 */
export class Player {
  readonly view: Phaser.GameObjects.Rectangle;
  readonly body: Phaser.Physics.Arcade.Body;
  readonly umbrella = new Umbrella();

  private readonly canopy: Phaser.GameObjects.Rectangle;
  private readonly shaft: Phaser.GameObjects.Rectangle;

  private readonly leftKeys: Phaser.Input.Keyboard.Key[];
  private readonly rightKeys: Phaser.Input.Keyboard.Key[];
  private readonly jumpKeys: Phaser.Input.Keyboard.Key[];
  private readonly umbrellaKeys: Phaser.Input.Keyboard.Key[];

  /** Secondi residui in cui il salto è ancora concesso dopo aver lasciato il suolo. */
  private coyoteTimer = 0;
  /** Secondi residui di validità di una pressione del salto avvenuta in aria. */
  private bufferTimer = 0;
  /** True dal momento dello stacco fino all'apice del salto. */
  private rising = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.view = scene.add.rectangle(x, y, PLAYER_WIDTH, PLAYER_HEIGHT, COLORS.playerClean);
    scene.physics.add.existing(this.view);

    this.body = this.view.body as Phaser.Physics.Arcade.Body;
    this.body.setCollideWorldBounds(true);

    const keyboard = scene.input.keyboard;
    if (!keyboard) {
      throw new Error('Input da tastiera non disponibile: il gioco richiede una tastiera.');
    }

    this.leftKeys = [keyboard.addKey(KeyCodes.LEFT), keyboard.addKey(KeyCodes.A)];
    this.rightKeys = [keyboard.addKey(KeyCodes.RIGHT), keyboard.addKey(KeyCodes.D)];
    this.jumpKeys = [
      keyboard.addKey(KeyCodes.SPACE),
      keyboard.addKey(KeyCodes.UP),
      keyboard.addKey(KeyCodes.W),
    ];
    this.umbrellaKeys = [keyboard.addKey(KeyCodes.SHIFT), keyboard.addKey(KeyCodes.X)];

    // La calotta va disegnata dove effettivamente ripara: sopra la testa.
    // È l'unico modo che ha il giocatore di sapere a colpo d'occhio se è coperto.
    this.shaft = scene.add.rectangle(x, y - 12, 2, 12, COLORS.umbrellaShaft).setVisible(false);
    this.canopy = scene.add.rectangle(x, y - 18, 26, 5, COLORS.umbrella).setVisible(false);
  }

  /** @param delta millisecondi trascorsi dal frame precedente (quello che passa Phaser). */
  update(delta: number): void {
    const dt = delta / 1000;
    const body = this.body;

    const onGround = body.blocked.down || body.touching.down;
    const jumpHeld = this.anyDown(this.jumpKeys);
    const jumpPressed = this.anyJustPressed(this.jumpKeys);

    this.umbrella.setWantsOpen(this.anyDown(this.umbrellaKeys));
    const sheltered = this.umbrella.isOpen;

    this.updateHorizontal(dt, onGround, sheltered);

    // --- Timer di assist ---
    // Il coyote time si ricarica a terra e scorre in aria; il buffer parte
    // alla pressione e scorre sempre, così un salto "anticipato" resta valido
    // per qualche centesimo dopo l'atterraggio.
    this.coyoteTimer = onGround ? TUNING.coyoteTime : Math.max(0, this.coyoteTimer - dt);
    if (jumpPressed) {
      this.bufferTimer = TUNING.jumpBuffer;
    } else {
      this.bufferTimer = Math.max(0, this.bufferTimer - dt);
    }

    // --- Stacco ---
    if (this.bufferTimer > 0 && this.coyoteTimer > 0) {
      body.velocity.y = -JUMP_VELOCITY * (sheltered ? TUNING.umbrellaJumpFactor : 1);
      this.bufferTimer = 0;
      this.coyoteTimer = 0;
      this.rising = true;
    }

    if (body.velocity.y >= 0) {
      this.rising = false;
    }

    this.updateGravity(jumpHeld);

    if (body.velocity.y > TUNING.maxFallSpeed) {
      body.velocity.y = TUNING.maxFallSpeed;
    }

    this.drawUmbrella(sheltered);
  }

  private drawUmbrella(open: boolean): void {
    this.canopy.setVisible(open);
    this.shaft.setVisible(open);
    if (!open) return;

    // Si usa il corpo fisico, non il rettangolo: durante update() la posizione
    // del game object è ancora quella del frame precedente (Phaser la ricopia
    // dal corpo solo in postUpdate), e in corsa l'ombrello si sgancerebbe.
    const { x, y } = this.body.center;
    this.canopy.setPosition(x, y - 18);
    this.shaft.setPosition(x, y - 12);
  }

  private updateHorizontal(dt: number, onGround: boolean, sheltered: boolean): void {
    const direction = (this.anyDown(this.rightKeys) ? 1 : 0) - (this.anyDown(this.leftKeys) ? 1 : 0);
    const maxSpeed = TUNING.maxSpeed * (sheltered ? TUNING.umbrellaSpeedFactor : 1);
    const target = direction * maxSpeed;

    // Accelerare e frenare sono due sensazioni diverse: usano rate diversi,
    // e in aria entrambi sono più deboli che a terra.
    let rate: number;
    if (direction !== 0) {
      rate = onGround ? TUNING.groundAccel : TUNING.airAccel;
    } else {
      rate = onGround ? TUNING.groundFriction : TUNING.airFriction;
    }

    this.body.velocity.x = approach(this.body.velocity.x, target, rate * dt);
  }

  /**
   * La gravità del mondo vale BASE_GRAVITY; qui aggiungiamo la differenza
   * per ottenere il moltiplicatore voluto in ciascuna fase del salto.
   */
  private updateGravity(jumpHeld: boolean): void {
    let multiplier = 1;

    if (this.body.velocity.y > 0) {
      multiplier = TUNING.fallGravityMultiplier;
    } else if (this.rising && !jumpHeld) {
      // Tasto rilasciato prima dell'apice: tronchiamo il salto.
      multiplier = TUNING.jumpCutGravityMultiplier;
    }

    this.body.gravity.y = BASE_GRAVITY * (multiplier - 1);
  }

  private anyDown(keys: Phaser.Input.Keyboard.Key[]): boolean {
    return keys.some((key) => key.isDown);
  }

  /**
   * `JustDown` consuma lo stato del tasto, quindi va chiamato esattamente una
   * volta per tasto per frame: niente short-circuit, si valutano tutti.
   */
  private anyJustPressed(keys: Phaser.Input.Keyboard.Key[]): boolean {
    let pressed = false;
    for (const key of keys) {
      if (Phaser.Input.Keyboard.JustDown(key)) pressed = true;
    }
    return pressed;
  }

  /**
   * Sporca il personaggio a vista: `filth` va da 0 (immacolato) a 1 (disastro).
   * È il riscontro più immediato che il giocatore ha sul proprio stato —
   * si vede prima ancora di guardare la barra.
   */
  setFilth(filth: number): void {
    this.view.setFillStyle(mixColor(COLORS.playerClean, COLORS.playerFilthy, filth));
  }

  getDebugState(): PlayerDebugState {
    return {
      velocityX: this.body.velocity.x,
      velocityY: this.body.velocity.y,
      onGround: this.body.blocked.down || this.body.touching.down,
      coyoteTime: this.coyoteTimer,
      jumpBuffer: this.bufferTimer,
    };
  }
}
