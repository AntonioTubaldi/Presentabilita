import Phaser from 'phaser';
import { COLORS, GAME_WIDTH } from '../config';
import { formatClock, type Appointment } from '../game/appointment';
import {
  MAX_PRESENTABILITY,
  OUTFITS,
  STARTING_OUTFITS,
  type Presentability,
} from '../game/presentability';
import { UMBRELLA_MAX_HITS, type Umbrella } from '../player/umbrella';
import { mixColor } from '../utils/color';

const BAR = { width: 150, height: 8, right: 16, top: 16 } as const;
const OUTFIT = { width: 9, height: 13, gap: 4 } as const;
const MESSAGE_MS = 1600;

/**
 * L'interfaccia di gioco: l'orologio, la barra della presentabilità, gli
 * abiti rimasti e un messaggio che commenta i guai appena capitati.
 *
 * La barra mostra anche **il tetto perduto**: la porzione che l'abito attuale
 * non potrà mai più riempire resta disegnata, spenta, sulla destra. Senza
 * quella, cambiarsi sembrerebbe un premio — la barra si riempirebbe di nuovo
 * e il giocatore non vedrebbe di aver perso qualcosa per sempre.
 */
export class Hud {
  private readonly barLeft: number;
  private readonly fill: Phaser.GameObjects.Rectangle;
  private readonly lost: Phaser.GameObjects.Rectangle;
  private readonly label: Phaser.GameObjects.Text;
  private readonly outfitLabel: Phaser.GameObjects.Text;
  private readonly outfitIcons: Phaser.GameObjects.Rectangle[] = [];
  private readonly outfitShirts: Phaser.GameObjects.Rectangle[] = [];
  private readonly clock: Phaser.GameObjects.Text;
  private readonly umbrellaLabel: Phaser.GameObjects.Text;
  private readonly message: Phaser.GameObjects.Text;
  private messageUntil = 0;

  constructor(scene: Phaser.Scene) {
    const left = GAME_WIDTH - BAR.right - BAR.width;
    const right = GAME_WIDTH - BAR.right;
    this.barLeft = left;

    const frame = scene.add.rectangle(left, BAR.top, BAR.width, BAR.height, COLORS.background);
    frame.setOrigin(0, 0.5).setStrokeStyle(1, COLORS.barFrame).setScrollFactor(0);

    // Il tetto perduto sta sotto il riempimento: si vede solo dove questo non arriva.
    this.lost = scene.add.rectangle(left, BAR.top, BAR.width, BAR.height, COLORS.barLost);
    this.lost.setOrigin(0, 0.5).setScrollFactor(0);

    // Origine a sinistra: la barra si accorcia scalando, senza ricalcolare la geometria.
    this.fill = scene.add.rectangle(left, BAR.top, BAR.width, BAR.height, COLORS.barGood);
    this.fill.setOrigin(0, 0.5).setScrollFactor(0);

    this.label = scene.add
      .text(left, BAR.top + 8, '', { fontFamily: 'monospace', fontSize: '9px', color: COLORS.text })
      .setScrollFactor(0);

    // Abiti rimasti, disegnati da destra verso sinistra.
    for (let i = 0; i < STARTING_OUTFITS; i++) {
      const x = right - OUTFIT.width / 2 - i * (OUTFIT.width + OUTFIT.gap);
      const y = BAR.top + 28;
      const jacket = scene.add.rectangle(x, y, OUTFIT.width, OUTFIT.height, COLORS.outfit);
      jacket.setStrokeStyle(1, COLORS.barFrame).setScrollFactor(0);
      const shirt = scene.add.rectangle(x, y - 1, 3, OUTFIT.height - 5, COLORS.outfitShirt);
      shirt.setScrollFactor(0);
      this.outfitIcons.push(jacket);
      this.outfitShirts.push(shirt);
    }

    this.outfitLabel = scene.add
      .text(right, BAR.top + 40, '', {
        fontFamily: 'monospace',
        fontSize: '8px',
        color: COLORS.textDim,
      })
      .setOrigin(1, 0)
      .setScrollFactor(0);

    // A sinistra, sotto i comandi: lo stato dell'ombrello va letto di sfuggita
    // mentre si corre, quindi sta lontano dalla barra e non si muove mai.
    this.umbrellaLabel = scene.add
      .text(8, 22, '', { fontFamily: 'monospace', fontSize: '9px', color: COLORS.textDim })
      .setScrollFactor(0);

    this.clock = scene.add
      .text(GAME_WIDTH / 2, 14, '', {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: COLORS.text,
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0);

    this.message = scene.add
      .text(GAME_WIDTH / 2, 64, '', {
        fontFamily: 'monospace',
        fontSize: '11px',
        color: COLORS.text,
        align: 'center',
      })
      .setOrigin(0.5, 0.5)
      .setScrollFactor(0);
  }

  /** L'orologio cambia colore prima di scadere: l'avviso deve arrivare in tempo. */
  private updateClock(appointment: Appointment): void {
    if (appointment.isLate) {
      this.clock.setText(`IN RITARDO  ${formatClock(appointment.lateBySeconds)}`);
      this.clock.setColor(COLORS.textLate);
      return;
    }

    const left = appointment.remainingSeconds;
    this.clock.setText(`LEI TI ASPETTA  ${formatClock(left)}`);
    this.clock.setColor(left <= 10 ? COLORS.textWarn : COLORS.text);
  }

  /**
   * Quanti colpi regge ancora, e se in questo momento è aperto. Aperto si
   * evidenzia in giallo perché in quello stato stai spendendo tempo: è
   * un'informazione che serve *adesso*, non a fine livello.
   */
  private updateUmbrella(umbrella: Umbrella): void {
    if (!umbrella.has) {
      this.umbrellaLabel.setText('OMBRELLO  rotto');
      this.umbrellaLabel.setColor(COLORS.textLate);
      return;
    }

    const pieni = '#'.repeat(umbrella.hitsLeft);
    const vuoti = '-'.repeat(UMBRELLA_MAX_HITS - umbrella.hitsLeft);
    const stato = umbrella.isOpen ? 'APERTO' : 'chiuso';
    this.umbrellaLabel.setText(`OMBRELLO  ${pieni}${vuoti}  ${stato}`);
    this.umbrellaLabel.setColor(umbrella.isOpen ? COLORS.textWarn : COLORS.textDim);
  }

  update(
    presentability: Presentability,
    appointment: Appointment,
    umbrella: Umbrella,
    time: number,
  ): void {
    this.updateClock(appointment);
    this.updateUmbrella(umbrella);

    const ratio = presentability.percent / MAX_PRESENTABILITY;
    const ceilingRatio = presentability.ceiling / MAX_PRESENTABILITY;

    this.fill.scaleX = ratio;
    this.fill.setFillStyle(mixColor(COLORS.barBad, COLORS.barGood, ratio));

    // La zona perduta parte dal tetto e arriva in fondo alla barra.
    this.lost.x = this.barLeft + BAR.width * ceilingRatio;
    this.lost.scaleX = 1 - ceilingRatio;
    this.label.setText(`PRESENTABILITA  ${Math.round(presentability.percent)}%`);

    const tier = presentability.outfitTier;
    this.outfitLabel.setText(OUTFITS[tier]?.short ?? '');
    this.outfitLabel.setColor(tier === 0 ? COLORS.textDim : COLORS.textWarn);

    for (let i = 0; i < this.outfitIcons.length; i++) {
      // Un'icona per ogni abito ancora disponibile, quello indosso compreso.
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
