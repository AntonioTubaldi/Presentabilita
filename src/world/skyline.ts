import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, WORLD_WIDTH } from '../config';

/**
 * I palazzi sullo sfondo, su due piani che scorrono a velocità diverse.
 *
 * Costano pochissimo (una sessantina di rettangoli) e cambiano completamente
 * la percezione del livello: senza, il gioco sembra svolgersi nel vuoto e
 * non si capisce nemmeno di quanto ci si sta spostando. La parallasse è
 * quello che comunica "stai attraversando una città".
 */

const STREET_Y = 340;

/** Piano, quanto è lento rispetto alla telecamera, e come sono fatti i palazzi. */
const LAYERS = [
  { scrollFactor: 0.15, color: COLORS.skylineFar, minHeight: 95, maxHeight: 175, minWidth: 48, maxWidth: 74, step: 58 },
  { scrollFactor: 0.35, color: COLORS.skylineNear, minHeight: 55, maxHeight: 120, minWidth: 38, maxWidth: 62, step: 46 },
] as const;

/**
 * Rumore deterministico: stessa forma della città ad ogni partita.
 * Un `Math.random()` qui renderebbe irriproducibile qualsiasi screenshot.
 */
function noise(i: number, salt: number): number {
  const v = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return v - Math.floor(v);
}

export function createSkyline(scene: Phaser.Scene): void {
  const maxScroll = WORLD_WIDTH - GAME_WIDTH;

  LAYERS.forEach((layer, index) => {
    // Un piano che scorre a velocità ridotta copre meno strada della
    // telecamera: gli basta questa larghezza per non finire mai.
    const span = maxScroll * layer.scrollFactor + GAME_WIDTH;

    for (let i = 0; i * layer.step < span; i++) {
      const x = i * layer.step;
      const height = layer.minHeight + noise(i, index) * (layer.maxHeight - layer.minHeight);
      const width = layer.minWidth + noise(i, index + 10) * (layer.maxWidth - layer.minWidth);

      const building = scene.add.rectangle(x, STREET_Y, width, height, layer.color);
      building.setOrigin(0.5, 1).setScrollFactor(layer.scrollFactor).setDepth(-10 + index);
    }
  });
}
