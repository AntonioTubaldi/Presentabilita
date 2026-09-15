import { formatClock } from './appointment';

/**
 * Il giudizio finale, che è la vera ricompensa del livello.
 *
 * Tiene conto di **due** cose, perché il gioco è costruito sulla tensione fra
 * loro: quanto sei arrivato in ordine e quanto sei arrivato puntuale.
 * Arrivare immacolati con tre minuti di ritardo non deve andare meglio che
 * arrivare in orario con una macchia.
 */

function presentabilityLine(percent: number): string {
  if (percent >= 95) return 'Impeccabile.';
  if (percent >= 75) return 'Un po’ spettinato, ma niente di grave.';
  if (percent >= 50) return 'C’è una macchia. Si vede.';
  if (percent >= 25) return 'Sei messo piuttosto male.';
  return 'Sei irriconoscibile.';
}

function punctualityLine(secondsLate: number): string {
  if (secondsLate <= 0) return 'E sei in orario.';
  if (secondsLate <= 10) return `In ritardo di ${formatClock(secondsLate)}: nessuno se n’è accorto.`;
  if (secondsLate <= 30) return `In ritardo di ${formatClock(secondsLate)}. Lei guarda l’orologio.`;
  return `In ritardo di ${formatClock(secondsLate)}. Lei ha finito l’aperitivo da sola.`;
}

/** La reazione di lei: la somma delle due colonne, non la media. */
function reaction(percent: number, secondsLate: number): string {
  const presentable = percent >= 75;
  const acceptable = percent >= 40;
  const punctual = secondsLate <= 10;
  const veryLate = secondsLate > 30;

  if (presentable && punctual) return 'Lei sorride. La serata comincia bene.';
  if (presentable && !veryLate) return 'Lei ti perdona: sei venuto bene.';
  if (presentable) return 'Lei apprezza lo sforzo, ma aveva altri programmi.';
  if (acceptable && punctual) return 'Lei fa finta di non notare nulla.';
  if (acceptable) return 'Lei propone di sedersi… fuori.';
  if (punctual) return 'Lei chiede se stai bene.';
  return 'Lei ha appena ricordato di avere un impegno.';
}

export function finalVerdict(percent: number, secondsLate: number): string {
  return [
    `Presentabilità: ${Math.round(percent)}%`,
    presentabilityLine(percent),
    punctualityLine(secondsLate),
    '',
    reaction(percent, secondsLate),
  ].join('\n');
}
