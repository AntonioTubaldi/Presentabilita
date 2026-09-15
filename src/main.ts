import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from './config';
import { BASE_GRAVITY } from './player/tuning';
import { GameScene } from './scenes/GameScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-root',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      // La gravità del mondo è quella "in salita"; PlayerController aggiunge
      // per-corpo la differenza per caduta e salto troncato. Vedi tuning.ts.
      gravity: { x: 0, y: BASE_GRAVITY },
      debug: import.meta.env.DEV,
    },
  },
  scene: [GameScene],
};

const game = new Phaser.Game(config);

// In sviluppo l'istanza è raggiungibile dalla console del browser come `game`,
// utile per ispezionare scene e corpi fisici mentre si accorda il movimento.
if (import.meta.env.DEV) {
  (window as unknown as { game: Phaser.Game }).game = game;
}
