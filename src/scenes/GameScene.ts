import Phaser from 'phaser';
import { COLORS, GAME_HEIGHT } from '../config';
import { Player } from '../player/PlayerController';

const KeyCodes = Phaser.Input.Keyboard.KeyCodes;

/** Una piattaforma statica: [centro x, centro y, larghezza, altezza]. */
type PlatformSpec = readonly [number, number, number, number];

/**
 * Livello di prova della Fase 1. Non è un livello "vero": è una palestra
 * costruita apposta per sentire i difetti dei controlli.
 *
 * - il varco largo misura la gittata del salto pieno;
 * - il gradino a sinistra serve a testare il coyote time (esci e salta tardi);
 * - la salita a destra serve a testare il jump buffer (premi prima di atterrare).
 *
 * Le distanze sono tarate su valori misurati, non teorici: con il tuning
 * attuale un salto pieno alza di ≈ 59 px e sposta di ≈ 75 px in avanti
 * partendo a velocità massima. Nessun dislivello supera i 51 px, il varco
 * largo è 55 px e sopra la sua traiettoria non c'è nulla che intercetti il
 * salto. Se cambi `tuning.ts`, queste distanze vanno rimisurate.
 */
const PLATFORMS: readonly PlatformSpec[] = [
  // Terreno, spezzato da due varchi: 55 px e 25 px
  [120, 350, 240, 20], // x   0..240
  [415, 350, 240, 20], // x 295..535
  [600, 350, 80, 20], // x 560..640

  // Gradini a sinistra: ci si sale, e se ne esce camminando (coyote time)
  [100, 300, 70, 12], // x  65..135, +46
  [175, 255, 60, 12], // x 145..205, +45

  // Salita a destra, dislivelli da ~50 px (tenuta oltre x=365 per non
  // intercettare l'atterraggio di chi salta il varco largo)
  [400, 295, 70, 12], // x 365..435, +51
  [510, 245, 80, 12], // x 470..550, +50
  [600, 195, 70, 12], // x 565..635, +50
];

const PLAYER_START = { x: 30, y: 300 } as const;

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private debugText!: Phaser.GameObjects.Text;
  private debugVisible = true;

  constructor() {
    super('GameScene');
  }

  create(): void {
    this.cameras.main.setBackgroundColor(COLORS.background);

    const platforms = PLATFORMS.map(([x, y, width, height]) => {
      const rect = this.add.rectangle(x, y, width, height, COLORS.platform);
      rect.setStrokeStyle(1, COLORS.platformEdge);
      this.physics.add.existing(rect, true);
      return rect;
    });

    this.player = new Player(this, PLAYER_START.x, PLAYER_START.y);
    this.physics.add.collider(this.player.view, platforms);

    this.add
      .text(8, 8, '← → / A D  muovi     SPAZIO / W  salta     R  ricomincia     TAB  debug', {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: COLORS.text,
      })
      .setScrollFactor(0);

    this.debugText = this.add
      .text(8, 26, '', {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: COLORS.text,
      })
      .setScrollFactor(0);

    const keyboard = this.input.keyboard;
    if (keyboard) {
      keyboard.addKey(KeyCodes.R).on('down', () => this.respawn());
      keyboard.addKey(KeyCodes.TAB).on('down', () => {
        this.debugVisible = !this.debugVisible;
        this.debugText.setVisible(this.debugVisible);
      });
    }
  }

  override update(_time: number, delta: number): void {
    this.player.update(delta);

    // Caduta fuori dal mondo: per ora si riparte dall'inizio.
    // In Fase 3 questo diventerà il respawn al checkpoint.
    if (this.player.view.y > GAME_HEIGHT + 40) {
      this.respawn();
    }

    if (this.debugVisible) {
      const state = this.player.getDebugState();
      this.debugText.setText(
        [
          `vel  x ${state.velocityX.toFixed(0).padStart(5)}   y ${state.velocityY.toFixed(0).padStart(5)}`,
          `terra    ${state.onGround ? 'sì' : 'no'}`,
          `coyote   ${state.coyoteTime.toFixed(3)}`,
          `buffer   ${state.jumpBuffer.toFixed(3)}`,
          `fps      ${this.game.loop.actualFps.toFixed(0)}`,
        ].join('\n'),
      );
    }
  }

  private respawn(): void {
    this.player.body.reset(PLAYER_START.x, PLAYER_START.y);
  }
}
