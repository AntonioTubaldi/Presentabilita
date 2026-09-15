/**
 * Interpola due colori RGB a 24 bit. `t` va da 0 (tutto `from`) a 1 (tutto `to`).
 *
 * Scritto a mano invece di usare gli helper di Phaser perché servono solo
 * sei righe e così non dipende da come sono organizzati fra una versione e l'altra.
 */
export function mixColor(from: number, to: number, t: number): number {
  const k = Math.min(1, Math.max(0, t));
  const r = Math.round(((from >> 16) & 0xff) + (((to >> 16) & 0xff) - ((from >> 16) & 0xff)) * k);
  const g = Math.round(((from >> 8) & 0xff) + (((to >> 8) & 0xff) - ((from >> 8) & 0xff)) * k);
  const b = Math.round((from & 0xff) + ((to & 0xff) - (from & 0xff)) * k);
  return (r << 16) | (g << 8) | b;
}
