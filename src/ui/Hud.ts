import Phaser from 'phaser';
import { COLORS, GAME_WIDTH } from '../config';
import { MAX_PRESENTABILITY, STARTING_OUTFITS, type Presentability } from '../game/presentability';
import { mixColor } from '../utils/color';

const BAR = { width: 150, height: 8, right: 16, top: 16 } as const;
const OUTFIT = { width: 9, height: 13, gap: 4 } as const;
const MESSAGE_MS = 1400;

/**
 * L'interfaccia di gioco: la barra della presentabilità, gli abiti di
 * ricambio rimasti e un messaggio che commenta i guai appena capitati.
 *
 * La barra cambia colore oltre che lunghezza: a colpo d'occhio si legge
 * "sto ancora bene" o "sono un disastro" senza leggere la percentuale.
 */
export class Hud {
  private readonly fill: Phaser.GameObjects.Rectangle;
  private readonly label: Phaser.GameObjects.Text;
  private readonly outfitIcons: Phaser.GameObjects.Rectangle[] = [];
  private readonly outfitShirts: Phaser.GameObjects.Rectangle[] = [];
  private readonly message: Phaser.GameObjects.Text;
  private messageUntil = 0;

  constructor(scene: Phaser.Scene) {
    const left = GAME_WIDTH - BAR.right - BAR.width;

    const frame = scene.add.rectangle(left, BAR.top, BAR.width, BAR.height, COLORS.background);
    frame.setOrigin(0, 0.5).setStrokeStyle(1, COLORS.barFrame).setScrollFactor(0);

    // Origine a sinistra: la barra si accorcia scalando, senza ricalcolare la geometria.
    this.fill = scene.add.rectangle(left, BAR.top, BAR.width, BAR.height, COLORS.barGood);
    this.fill.setOrigin(0, 0.5).setScrollFactor(0);

    this.label = scene.add
      .text(left, BAR.top + 8, '', { fontFamily: 'monospace', fontSize: '9px', color: COLORS.text })
      .setScrollFactor(0);

    // Abiti di ricambio, disegnati da destra verso sinistra.
    for (let i = 0; i < STARTING_OUTFITS; i++) {
      const x = GAME_WIDTH - BAR.right - OUTFIT.width / 2 - i * (OUTFIT.width + OUTFIT.gap);
      const y = BAR.top + 28;
      const jacket = scene.add.rectangle(x, y, OUTFIT.width, OUTFIT.height, COLORS.outfit);
      jacket.setStrokeStyle(1, COLORS.barFrame).setScrollFactor(0);
      const shirt = scene.add.rectangle(x, y - 1, 3, OUTFIT.height - 5, COLORS.outfitShirt);
      shirt.setScrollFactor(0);
      this.outfitIcons.push(jacket);
      this.outfitShirts.push(shirt);
    }

    this.message = scene.add
      .text(GAME_WIDTH / 2, 60, '', {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: COLORS.text,
      })
      .setOrigin(0.5, 0.5)
      .setScrollFactor(0);
  }

  update(presentability: Presentability, time: number): void {
    const ratio = presentability.percent / MAX_PRESENTABILITY;
    this.fill.scaleX = ratio;
    this.fill.setFillStyle(mixColor(COLORS.barBad, COLORS.barGood, ratio));
    this.label.setText(`PRESENTABILITA  ${Math.round(presentability.percent)}%`);

    for (let i = 0; i < this.outfitIcons.length; i++) {
      // Un'icona per ogni abito ancora disponibile, quello indosso compreso:
      // tre icone accese = tre tentativi, che è come il giocatore le legge.
      const available = i < presentability.outfitsLeft;
      this.outfitIcons[i]?.setFillStyle(available ? COLORS.outfit : COLORS.outfitSpent);
      this.outfitShirts[i]?.setVisible(available);
    }

    if (time > this.messageUntil) this.message.setText('');
  }

  flash(text: string, time: number): void {
    this.message.setText(text);
    this.messageUntil = time + MESSAGE_MS;
  }
}
