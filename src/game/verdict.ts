import { formatClock } from './appointment';
import { OUTFITS } from './presentability';

/**
 * Il giudizio finale, che è la vera ricompensa del livello.
 *
 * Tiene conto di **tre** cose, perché il gioco è costruito sulla tensione fra
 * loro: quanto sei arrivato in ordine, quanto sei arrivato puntuale, e con
 * cosa addosso. Arrivare immacolati con tre minuti di ritardo non deve andare
 * meglio che arrivare in orario con una macchia — e arrivare immacolati *in
 * felpa* non deve andare meglio di niente.
 *
 * Il terzo fattore non ha bisogno di matematica propria: il tetto di ogni
 * abito limita già la percentuale raggiungibile (vedi `presentability.ts`),
 * quindi chi si è cambiato due volte non può superare il 30% e le soglie qui
 * sotto fanno il resto da sole.
 */

function conditionLine(percent: number, tier: number): string {
  if (tier === 0) {
    if (percent >= 95) return 'Impeccabile.';
    if (percent >= 75) return 'Un po’ spettinato, ma niente di grave.';
    if (percent >= 50) return 'C’è una macchia. Si vede.';
    if (percent >= 25) return 'Sei messo piuttosto male.';
    return 'Sei irriconoscibile.';
  }

  const ceiling = OUTFITS[tier]?.ceiling ?? 1;
  const condizione = percent / ceiling;
  if (condizione >= 0.9) return 'Almeno è pulito.';
  if (condizione >= 0.5) return 'E nemmeno quello è messo bene.';
  return 'E lo hai già ridotto uno straccio.';
}

function punctualityLine(secondsLate: number): string {
  if (secondsLate <= 0) return 'E sei in orario.';
  if (secondsLate <= 10) return `In ritardo di ${formatClock(secondsLate)}: nessuno se n’è accorto.`;
  if (secondsLate <= 30) return `In ritardo di ${formatClock(secondsLate)}. Lei guarda l’orologio.`;
  return `In ritardo di ${formatClock(secondsLate)}. Lei ha finito l’aperitivo da sola.`;
}

/** La reazione di lei: la somma delle colonne, non la media. */
function reaction(percent: number, secondsLate: number, tier: number): string {
  const punctual = secondsLate <= 10;
  const veryLate = secondsLate > 30;

  // L'ultimo abito è una felpa: nessuna percentuale la riscatta.
  if (tier >= OUTFITS.length - 1) {
    return punctual
      ? 'Lei ti guarda la felpa. Poi guarda te. Poi di nuovo la felpa.'
      : 'Lei era già andata via. La felpa, almeno, non l’ha vista nessuno.';
  }

  const presentable = percent >= 75;
  const acceptable = percent >= 40;

  if (presentable && punctual) return 'Lei sorride. La serata comincia bene.';
  if (presentable && !veryLate) return 'Lei ti perdona: sei venuto bene.';
  if (presentable) return 'Lei apprezza lo sforzo, ma aveva altri programmi.';
  if (acceptable && punctual) return 'Lei fa finta di non notare nulla.';
  if (acceptable) return 'Lei propone di sedersi… fuori.';
  if (punctual) return 'Lei chiede se stai bene.';
  return 'Lei ha appena ricordato di avere un impegno.';
}

export function finalVerdict(percent: number, secondsLate: number, tier: number): string {
  const outfit = OUTFITS[tier] ?? OUTFITS[OUTFITS.length - 1]!;
  const righe = [
    `Presentabilità: ${Math.round(percent)}%`,
    `Addosso hai ${outfit.name}.`,
    conditionLine(percent, tier),
    punctualityLine(secondsLate),
    '',
    reaction(percent, secondsLate, tier),
  ];
  return righe.join('\n');
}
