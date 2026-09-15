import Phaser from 'phaser';
import { COLORS, GAME_HEIGHT, GAME_WIDTH } from '../config';
import { Pigeon, PIGEON_STAIN, pruneDroppings } from '../enemies/Pigeon';
import { Presentability } from '../game/presentability';
import { Player } from '../player/PlayerController';
import { Hud } from '../ui/Hud';
import {
  createHazards,
  drainFountain,
  HAZARD_COOLDOWN_MS,
  puddleCost,
  TRASH_COST,
  type Hazard,
  type HazardSpec,
} from '../world/hazards';

const KeyCodes = Phaser.Input.Keyboard.KeyCodes;

/** Una piattaforma statica: [centro x, centro y, larghezza, altezza]. */
type PlatformSpec = readonly [number, number, number, number];

/**
 * Il primo tratto di strada verso l'appuntamento.
 *
 * Le distanze sono tarate su valori misurati, non teorici: con il tuning
 * attuale un salto pieno alza di ≈ 59 px e sposta di ≈ 75 px in avanti
 * partendo a velocità massima. Nessun dislivello supera i 51 px e il varco
 * largo è 55 px. Se cambi `tuning.ts`, queste distanze vanno rimisurate.
 */
const PLATFORMS: readonly PlatformSpec[] = [
  // Marciapiede, spezzato da due varchi: 55 px e 25 px
  [120, 350, 240, 20], // x   0..240
  [415, 350, 240, 20], // x 295..535
  [600, 350, 80, 20], // x 560..640

  // Gradini a sinistra
  [100, 300, 70, 12], // x  65..135, +46
  [175, 255, 60, 12], // x 145..205, +45

  // Salita a destra (tenuta oltre x=365 per non intercettare l'atterraggio
  // di chi salta il varco largo)
  [400, 295, 70, 12], // x 365..435, +51
  [510, 245, 80, 12], // x 470..550, +50
  [600, 195, 70, 12], // x 565..635, +50
];

/**
 * Le insidie non sono solide: si possono attraversare pagandone il prezzo.
 * Ognuna è piazzata dove costringe a una scelta, non dove fa solo arredamento.
 */
const HAZARDS: readonly HazardSpec[] = [
  ['pozzanghera', 160, 337, 46, 6], // sul rettilineo di partenza, si prende velocità
  ['spazzatura', 205, 332, 16, 16], // subito prima del varco: saltarlo bene serve comunque
  ['fontanella', 320, 322, 24, 36], // premio per chi supera il varco: ci si rassetta
  ['pozzanghera', 370, 337, 50, 6],
  ['spazzatura', 460, 332, 16, 16],
  ['pozzanghera', 505, 337, 40, 6],
];

const PLAYER_START = { x: 30, y: 300 } as const;
const GOAL = { x: 615, y: 320, width: 22, height: 40 } as const;

type Phase = 'gioco' | 'finito';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private hud!: Hud;
  private presentability!: Presentability;
  private pigeon!: Pigeon;
  private droppings!: Phaser.GameObjects.Group;
  private hazardsByView = new Map<Phaser.GameObjects.GameObject, Hazard>();
  private phase: Phase = 'gioco';
  private endText!: Phaser.GameObjects.Text;
  private debugText!: Phaser.GameObjects.Text;
  private debugVisible = false;

  constructor() {
    super('GameScene');
  }

  create(): void {
    this.phase = 'gioco';
    this.presentability = new Presentability();
    this.hazardsByView = new Map();

    this.cameras.main.setBackgroundColor(COLORS.background);

    const platforms = PLATFORMS.map(([x, y, width, height]) => {
      const rect = this.add.rectangle(x, y, width, height, COLORS.platform);
      rect.setStrokeStyle(1, COLORS.platformEdge);
      this.physics.add.existing(rect, true);
      return rect;
    });

    const hazards = createHazards(this, HAZARDS);
    for (const hazard of hazards) this.hazardsByView.set(hazard.view, hazard);

    const goal = this.add.rectangle(GOAL.x, GOAL.y, GOAL.width, GOAL.height, COLORS.barGood);
    goal.setStrokeStyle(1, COLORS.outfitShirt);
    this.physics.add.existing(goal, true);

    this.droppings = this.add.group();
    this.pigeon = new Pigeon(this, this.droppings, 200, 110, 70);

    this.player = new Player(this, PLAYER_START.x, PLAYER_START.y);
    this.physics.add.collider(this.player.view, platforms);

    this.physics.add.overlap(
      this.player.view,
      hazards.map((h) => h.view),
      (_player, hazardView) => this.onHazard(hazardView as Phaser.GameObjects.GameObject),
    );

    this.physics.add.overlap(this.player.view, this.droppings, (_player, dropping) => {
      const shot = dropping as Phaser.GameObjects.Rectangle;
      const body = shot.body as Phaser.Physics.Arcade.Body | null;

      // Phaser rimuove i corpi eliminati solo a fine step. Disattivare il
      // corpo subito garantisce che un proiettile conti una volta sola anche
      // se la stessa coppia venisse valutata di nuovo nello stesso frame.
      if (!body || !body.enable) return;
      body.enable = false;

      shot.destroy();
      this.applyStain(PIGEON_STAIN, 'PICCIONE! Proprio sulla spalla.');
    });

    this.physics.add.overlap(this.player.view, goal, () => this.finish());

    this.hud = new Hud(this);
    this.buildTextOverlays();
    this.bindKeys();
  }

  private buildTextOverlays(): void {
    this.add
      .text(8, 8, '← →  muovi     SPAZIO  salta     R  ricomincia     TAB  debug', {
        fontFamily: 'monospace',
        fontSize: '9px',
        color: COLORS.textDim,
      })
      .setScrollFactor(0);

    this.endText = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, '', {
        fontFamily: 'monospace',
        fontSize: '13px',
        color: COLORS.text,
        align: 'center',
        lineSpacing: 6,
      })
      .setOrigin(0.5, 0.5)
      .setScrollFactor(0);

    this.debugText = this.add
      .text(8, 22, '', { fontFamily: 'monospace', fontSize: '9px', color: COLORS.textDim })
      .setScrollFactor(0)
      .setVisible(false);
  }

  private bindKeys(): void {
    const keyboard = this.input.keyboard;
    if (!keyboard) return;

    keyboard.addKey(KeyCodes.R).on('down', () => this.scene.restart());
    keyboard.addKey(KeyCodes.TAB).on('down', () => {
      this.debugVisible = !this.debugVisible;
      this.debugText.setVisible(this.debugVisible);
    });
  }

  override update(_time: number, delta: number): void {
    if (this.phase === 'finito') return;

    const now = this.time.now;
    this.player.update(delta);
    this.pigeon.update(now);
    pruneDroppings(this.droppings);
    this.hud.update(this.presentability, now);

    // Caduta fuori dal marciapiede: si finisce nel tombino, e non è pulito.
    if (this.player.view.y > GAME_HEIGHT + 40) {
      this.applyStain(25, 'Nel tombino. Splendido.');
      this.respawn();
    }

    if (this.debugVisible) {
      const state = this.player.getDebugState();
      this.debugText.setText(
        `vel x ${state.velocityX.toFixed(0)}  y ${state.velocityY.toFixed(0)}   ` +
          `terra ${state.onGround ? 'si' : 'no'}   fps ${this.game.loop.actualFps.toFixed(0)}`,
      );
    }
  }

  private onHazard(view: Phaser.GameObjects.GameObject): void {
    const hazard = this.hazardsByView.get(view);
    if (!hazard) return;

    // Le insidie riscuotono a intervalli: attraversarle di corsa costa una
    // volta sola, restarci dentro costa a ripetizione.
    const now = this.time.now;
    if (now - hazard.lastTriggeredAt < HAZARD_COOLDOWN_MS) return;
    hazard.lastTriggeredAt = now;

    const velocity = this.player.body.velocity;

    switch (hazard.kind) {
      case 'pozzanghera':
        this.applyStain(puddleCost(velocity.x, velocity.y), 'SPLASH');
        break;
      case 'spazzatura':
        this.applyStain(TRASH_COST, 'Spazzatura sui pantaloni.');
        break;
      case 'fontanella': {
        const given = drainFountain(hazard);
        if (given <= 0) {
          this.hud.flash('La fontanella è a secco.', now);
          break;
        }
        this.presentability.clean(given);
        this.player.setFilth(this.presentability.filth);
        this.hud.flash('Una rassettata veloce.', now);
        break;
      }
    }
  }

  private applyStain(amount: number, message: string): void {
    const result = this.presentability.stain(amount);
    this.player.setFilth(this.presentability.filth);

    switch (result.kind) {
      case 'sporcato':
        this.hud.flash(message, this.time.now);
        break;
      case 'cambioAbito':
        this.hud.flash(
          `IMPRESENTABILE! Cambio d'abito — ne restano ${result.abitiRimasti}`,
          this.time.now,
        );
        this.respawn();
        break;
      case 'finita':
        this.end('Finiti gli abiti di ricambio.\nL’appuntamento può dirsi concluso.');
        break;
    }
  }

  private finish(): void {
    const percent = Math.round(this.presentability.percent);
    this.end(`Sei arrivato.\n\nPresentabilità: ${percent}%\n${this.presentability.verdict()}`);
  }

  private end(message: string): void {
    if (this.phase === 'finito') return;
    this.phase = 'finito';
    this.physics.pause();
    this.endText.setText(`${message}\n\nR per riprovare`);
  }

  private respawn(): void {
    this.player.body.reset(PLAYER_START.x, PLAYER_START.y);
  }
}
