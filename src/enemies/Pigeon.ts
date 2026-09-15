import Phaser from 'phaser';
import { COLORS, GAME_HEIGHT, GAME_WIDTH } from '../config';

export const PIGEON_STAIN = 14;

const PIGEON_WIDTH = 16;
const PIGEON_HEIGHT = 9;
const DROPPING_WIDTH = 4;
const DROPPING_HEIGHT = 7;

/**
 * Velocità di caduta costante, non accelerata: il proiettile è prevedibile
 * e quindi schivabile. Un piccione che ti colpisce dev'essere colpa tua.
 */
const DROPPING_FALL_SPEED = 170;

const DROP_INTERVAL_MS = { min: 1100, max: 2300 } as const;

/** Margine oltre i bordi entro cui il piccione inverte la rotta. */
const PATROL_MARGIN = 24;

export class Pigeon {
  readonly view: Phaser.GameObjects.Rectangle;
  private readonly body: Phaser.Physics.Arcade.Body;
  private readonly scene: Phaser.Scene;
  private readonly droppings: Phaser.GameObjects.Group;
  private nextDropAt = 0;

  constructor(
    scene: Phaser.Scene,
    droppings: Phaser.GameObjects.Group,
    x: number,
    y: number,
    speed: number,
  ) {
    this.scene = scene;
    this.droppings = droppings;

    this.view = scene.add.rectangle(x, y, PIGEON_WIDTH, PIGEON_HEIGHT, COLORS.pigeon);
    scene.physics.add.existing(this.view);
    this.body = this.view.body as Phaser.Physics.Arcade.Body;
    this.body.setAllowGravity(false);
    this.body.setVelocityX(speed);
  }

  update(time: number): void {
    // Pattuglia avanti e indietro sopra la strada.
    if (this.view.x < PATROL_MARGIN && this.body.velocity.x < 0) {
      this.body.setVelocityX(-this.body.velocity.x);
    } else if (this.view.x > GAME_WIDTH - PATROL_MARGIN && this.body.velocity.x > 0) {
      this.body.setVelocityX(-this.body.velocity.x);
    }

    if (time >= this.nextDropAt) {
      // Il primo intervallo parte alla prima chiamata, non alla costruzione,
      // così il piccione non bombarda subito all'avvio della scena.
      if (this.nextDropAt > 0) this.drop();
      this.nextDropAt =
        time + Phaser.Math.Between(DROP_INTERVAL_MS.min, DROP_INTERVAL_MS.max);
    }
  }

  private drop(): void {
    const dropping = this.scene.add.rectangle(
      this.view.x,
      this.view.y + PIGEON_HEIGHT,
      DROPPING_WIDTH,
      DROPPING_HEIGHT,
      COLORS.dropping,
    );
    this.scene.physics.add.existing(dropping);
    const body = dropping.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setVelocityY(DROPPING_FALL_SPEED);
    this.droppings.add(dropping);
  }
}

/** Rimuove i proiettili usciti dallo schermo, per non accumularli all'infinito. */
export function pruneDroppings(droppings: Phaser.GameObjects.Group): void {
  for (const child of droppings.getChildren()) {
    const dropping = child as Phaser.GameObjects.Rectangle;
    if (dropping.y > GAME_HEIGHT + 20) dropping.destroy();
  }
}
