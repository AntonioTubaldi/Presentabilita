import Phaser from 'phaser';
import { COLORS, GAME_HEIGHT, GAME_WIDTH, WORLD_WIDTH } from '../config';
import { Pigeon, PIGEON_STAIN, pruneDroppings, type PigeonSpec } from '../enemies/Pigeon';
import { Appointment } from '../game/appointment';
import { Presentability } from '../game/presentability';
import { finalVerdict } from '../game/verdict';
import { Player } from '../player/PlayerController';
import { Hud } from '../ui/Hud';
import { createSkyline } from '../world/skyline';
import {
  consumeTrash,
  createHazards,
  drainFountain,
  FOUNTAIN_INTERVAL_MS,
  puddleCost,
  rollHazardContacts,
  takeUmbrella,
  TRASH_COST,
  type Hazard,
  type HazardSpec,
} from '../world/hazards';

const KeyCodes = Phaser.Input.Keyboard.KeyCodes;

/** Una piattaforma statica: [centro x, centro y, larghezza, altezza]. */
type PlatformSpec = readonly [number, number, number, number];

/**
 * Il percorso verso l'appuntamento: quattro schermate di strada.
 *
 * Le distanze sono tarate su valori misurati, non teorici: con il tuning
 * attuale un salto pieno alza di ≈ 59 px e sposta di ≈ 75 px in avanti
 * partendo a velocità massima. Nessun dislivello supera i 51 px e nessun
 * varco i 55 px. Se cambi `tuning.ts`, queste distanze vanno rimisurate.
 */
const PLATFORMS: readonly PlatformSpec[] = [
  // Marciapiede, spezzato da cinque varchi: 55, 25, 45, 50 e 30 px
  [300, 350, 600, 20], // x    0.. 600
  [830, 350, 350, 20], // x  655..1005
  [1235, 350, 410, 20], // x 1030..1440
  [1662, 350, 355, 20], // x 1485..1840
  [2110, 350, 440, 20], // x 1890..2330
  [2460, 350, 200, 20], // x 2360..2560

  // Cornicioni e impalcature: la via alta salta le insidie ma costa salti.
  //
  // Ogni cornicione alto sta dentro la finestra di atterraggio misurata:
  // con un dislivello di +50 px il centro del ragazzo, staccando dal bordo
  // del cornicione basso, ricade fra 34 e 68 px più avanti. I varchi qui
  // sotto sono di 30 px, comodamente dentro quella finestra.
  [160, 295, 70, 12], // basso   125.. 195
  [250, 245, 60, 12], // ALTO    220.. 280   (varco 25)
  [470, 295, 80, 12], // basso   430.. 510
  [900, 295, 90, 12], // basso   855.. 945
  [1150, 295, 70, 12], // basso  1115..1185
  [1250, 245, 70, 12], // ALTO   1215..1285  (varco 30)
  [1560, 295, 70, 12], // basso  1525..1595
  [1665, 245, 80, 12], // ALTO   1625..1705  (varco 30)
  [2000, 295, 80, 12], // basso  1960..2040
  [2105, 245, 70, 12], // ALTO   2070..2140  (varco 30)
];

/**
 * Le insidie non sono solide: si attraversano pagandone il prezzo.
 * Ognuna è piazzata dove costringe a una scelta — spesso poco prima di un
 * varco, così saltarla bene serve comunque a qualcosa.
 */
const HAZARDS: readonly HazardSpec[] = [
  ['pozzanghera', 200, 337, 50, 6],
  ['spazzatura', 380, 332, 16, 16],
  ['pozzanghera', 540, 337, 44, 6], // subito prima del varco largo
  ['fontanella', 700, 322, 24, 36], // premio per chi lo supera
  ['spazzatura', 960, 332, 16, 16],
  ['ombrellaio', 1055, 322, 24, 36], // prima della seconda zona dei piccioni
  ['pozzanghera', 1100, 337, 55, 6],
  ['spazzatura', 1250, 332, 16, 16],
  ['fontanella', 1600, 322, 24, 36],
  ['spazzatura', 1790, 332, 16, 16],
  ['ombrellaio', 1905, 322, 24, 36], // prima della terza
  ['pozzanghera', 1950, 337, 50, 6],
  ['pozzanghera', 2190, 337, 60, 6], // spostata: chi scende dalla via alta atterra a ~2257
];

const PIGEONS: readonly PigeonSpec[] = [
  { minX: 700, maxX: 1000, y: 160, speed: 70 },
  { minX: 1300, maxX: 1700, y: 140, speed: -90 },
  { minX: 2000, maxX: 2300, y: 170, speed: 80 },
];

/**
 * Punti di ripartenza, uno per tratto di marciapiede. Senza, cadere in un
 * tombino a tre quarti del percorso rimanderebbe all'inizio — con l'orologio
 * che scorre sarebbe la fine della partita, non un intoppo.
 */
const CHECKPOINTS: readonly { x: number; y: number }[] = [
  { x: 30, y: 300 },
  { x: 690, y: 300 },
  { x: 1060, y: 300 },
  { x: 1520, y: 300 },
  { x: 1920, y: 300 },
  { x: 2390, y: 300 },
];

const GOAL = { x: 2500, y: 320, width: 22, height: 40 } as const;

/**
 * Quanto tempo c'è prima di essere in ritardo.
 *
 * Tarato su una misura, non a occhio: una corsa diretta che tira dritto su
 * tutto e salta solo i varchi arriva in **16,4 secondi**. Ventotto danno
 * quindi circa il 70% di margine — abbastanza per scavalcare le insidie e
 * spendere una fontanella, non abbastanza per attraversare la città
 * passeggiando.
 *
 * È il numero più delicato del gioco: troppo largo e l'orologio non conta,
 * troppo stretto e diventa una punizione. Va rimisurato ogni volta che il
 * percorso si allunga o cambia il tuning del movimento.
 */
const LEVEL_TIME_MS = 28_000;

type Phase = 'gioco' | 'finito';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private hud!: Hud;
  private presentability!: Presentability;
  private appointment!: Appointment;
  private pigeons: Pigeon[] = [];
  private droppings!: Phaser.GameObjects.Group;
  private hazards: Hazard[] = [];
  private hazardsByView = new Map<Phaser.GameObjects.GameObject, Hazard>();
  private checkpointIndex = 0;
  private phase: Phase = 'gioco';
  private endText!: Phaser.GameObjects.Text;
  private debugText!: Phaser.GameObjects.Text;
  private debugVisible = false;

  constructor() {
    super('GameScene');
  }

  create(): void {
    this.phase = 'gioco';
    this.checkpointIndex = 0;
    this.presentability = new Presentability();
    this.appointment = new Appointment(LEVEL_TIME_MS);
    this.hazardsByView = new Map();
    this.pigeons = [];

    this.cameras.main.setBackgroundColor(COLORS.background);
    createSkyline(this);

    // Il bordo inferiore del mondo non collide: nei varchi si cade davvero.
    this.physics.world.setBounds(0, 0, WORLD_WIDTH, GAME_HEIGHT + 400, true, true, true, false);

    const platforms = PLATFORMS.map(([x, y, width, height]) => {
      const rect = this.add.rectangle(x, y, width, height, COLORS.platform);
      rect.setStrokeStyle(1, COLORS.platformEdge);
      this.physics.add.existing(rect, true);
      return rect;
    });

    this.hazards = createHazards(this, HAZARDS);
    for (const hazard of this.hazards) this.hazardsByView.set(hazard.view, hazard);

    const goal = this.add.rectangle(GOAL.x, GOAL.y, GOAL.width, GOAL.height, COLORS.barGood);
    goal.setStrokeStyle(1, COLORS.outfitShirt);
    this.physics.add.existing(goal, true);

    this.droppings = this.add.group();
    for (const spec of PIGEONS) this.pigeons.push(new Pigeon(this, this.droppings, spec));

    const start = CHECKPOINTS[0]!;
    this.player = new Player(this, start.x, start.y);
    this.physics.add.collider(this.player.view, platforms);

    this.physics.add.overlap(
      this.player.view,
      this.hazards.map((h) => h.view),
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

      // L'ombrello para ciò che viene dall'alto, e solo quello: è mezza
      // soluzione per costruzione, altrimenti basterebbe tenerlo sempre aperto.
      if (this.player.umbrella.isOpen) {
        const esito = this.player.umbrella.absorb();
        this.hud.flash(
          esito === 'rotto'
            ? "L'ombrello ha ceduto. Ti serve un ombrellaio."
            : 'TOC. L’ombrello regge.',
          this.time.now,
        );
        return;
      }

      this.applyStain(PIGEON_STAIN, 'PICCIONE! Proprio sulla spalla.');
    });

    this.physics.add.overlap(this.player.view, goal, () => this.finish());

    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, GAME_HEIGHT);
    this.cameras.main.startFollow(this.player.view, true, 0.14, 0.14);
    this.cameras.main.setDeadzone(110, 90);

    this.hud = new Hud(this);
    this.buildTextOverlays();
    this.bindKeys();
  }

  private buildTextOverlays(): void {
    this.add
      .text(8, 8, '← →  muovi    SPAZIO  salta    SHIFT  ombrello    R  ricomincia', {
        fontFamily: 'monospace',
        fontSize: '9px',
        color: COLORS.textDim,
      })
      .setScrollFactor(0);

    this.endText = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, '', {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: COLORS.text,
        align: 'center',
        lineSpacing: 5,
      })
      .setOrigin(0.5, 0.5)
      .setScrollFactor(0)
      .setDepth(100);

    this.debugText = this.add
      .text(8, 34, '', { fontFamily: 'monospace', fontSize: '9px', color: COLORS.textDim })
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
    this.appointment.tick(delta);
    this.player.update(delta);
    for (const pigeon of this.pigeons) pigeon.update(now);
    pruneDroppings(this.droppings);
    this.updateCheckpoint();
    this.hud.update(this.presentability, this.appointment, this.player.umbrella, now);

    // Caduta nel varco: si finisce nel tombino, e non è pulito.
    // L'orologio continua a scorrere: perdere tempo è parte del prezzo.
    if (this.player.view.y > GAME_HEIGHT + 40) {
      this.applyStain(25, 'Nel tombino. Splendido.');
      this.respawn();
    }

    // Va fatto dopo tutte le sovrapposizioni del frame: è il confronto fra
    // "toccata ora" e "toccata prima" a distinguere l'ingresso dalla sosta.
    rollHazardContacts(this.hazards);

    if (this.debugVisible) {
      const state = this.player.getDebugState();
      this.debugText.setText(
        `x ${this.player.view.x.toFixed(0)}  vel ${state.velocityX.toFixed(0)}  ` +
          `t ${this.appointment.elapsedSeconds.toFixed(1)}s  fps ${this.game.loop.actualFps.toFixed(0)}`,
      );
    }
  }

  /** Il checkpoint avanza solo con i piedi per terra: non si sblocca cadendo. */
  private updateCheckpoint(): void {
    if (!this.player.getDebugState().onGround) return;

    for (let i = CHECKPOINTS.length - 1; i > this.checkpointIndex; i--) {
      if (this.player.view.x >= CHECKPOINTS[i]!.x) {
        this.checkpointIndex = i;
        return;
      }
    }
  }

  private onHazard(view: Phaser.GameObjects.GameObject): void {
    const hazard = this.hazardsByView.get(view);
    if (!hazard) return;

    hazard.touchedThisFrame = true;
    const velocity = this.player.body.velocity;

    switch (hazard.kind) {
      case 'pozzanghera':
        // Si paga entrando. Restare fermi nell'acqua non sporca di più:
        // sarebbe una punizione scollegata da qualsiasi decisione.
        if (hazard.wasTouching) return;
        this.applyStain(puddleCost(velocity.x, velocity.y), 'SPLASH');
        break;

      case 'spazzatura':
        // Il sacco fa danno una volta sola, poi si affloscia e sparisce.
        if (hazard.consumed) return;
        consumeTrash(hazard, this);
        this.applyStain(TRASH_COST, 'Spazzatura sui pantaloni.');
        break;

      case 'ombrellaio':
        // Un negozio serve una volta sola: altrimenti basterebbe fare avanti
        // e indietro davanti alla vetrina per essere sempre coperti.
        if (hazard.consumed || hazard.wasTouching) return;
        takeUmbrella(hazard);
        this.player.umbrella.refill();
        this.hud.flash('Ombrello nuovo. Tienilo da conto.', this.time.now);
        break;

      case 'fontanella': {
        // La fontanella invece agisce nel tempo: è l'unica per cui restare
        // fermi ha senso, ed è esattamente il tempo che costa usarla.
        const now = this.time.now;
        if (now - hazard.lastTriggeredAt < FOUNTAIN_INTERVAL_MS) return;
        hazard.lastTriggeredAt = now;

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
        // Il messaggio deve dire subito che ci si è rimessi peggio, non meglio:
        // è l'unico momento in cui il giocatore vede il costo del cambio.
        this.hud.flash(
          `Hai dovuto metterti ${result.nuovoAbito}. Massimo ${result.tetto}%.`,
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
    this.end(
      'Sei arrivato.\n\n' +
        finalVerdict(
          this.presentability.percent,
          this.appointment.lateBySeconds,
          this.presentability.outfitTier,
        ),
    );
  }

  private end(message: string): void {
    if (this.phase === 'finito') return;
    this.phase = 'finito';
    this.physics.pause();
    this.endText.setText(`${message}\n\nR per riprovare`);
  }

  private respawn(): void {
    const checkpoint = CHECKPOINTS[this.checkpointIndex] ?? CHECKPOINTS[0]!;
    this.player.body.reset(checkpoint.x, checkpoint.y);
  }
}
