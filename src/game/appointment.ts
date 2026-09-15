/**
 * L'orologio: lei sta aspettando.
 *
 * Senza pressione temporale la strategia ottimale sarebbe avanzare piano e
 * non sporcarsi mai — cioè annoiarsi. Con il tempo che scorre ogni insidia
 * diventa un dilemma vero: *ci giro intorno o ci passo dentro?*
 *
 * Il limite è morbido: scaduto il tempo si può ancora arrivare, ma il
 * ritardo entra nel giudizio finale. Il gioco non ti ferma, ti giudica.
 */
export class Appointment {
  private elapsedMs = 0;

  constructor(private readonly limitMs: number) {}

  tick(deltaMs: number): void {
    this.elapsedMs += deltaMs;
  }

  get elapsedSeconds(): number {
    return this.elapsedMs / 1000;
  }

  /** Secondi che mancano all'orario. Negativo se sei già in ritardo. */
  get remainingSeconds(): number {
    return (this.limitMs - this.elapsedMs) / 1000;
  }

  get isLate(): boolean {
    return this.elapsedMs > this.limitMs;
  }

  get lateBySeconds(): number {
    return Math.max(0, (this.elapsedMs - this.limitMs) / 1000);
  }

  reset(): void {
    this.elapsedMs = 0;
  }
}

/** Formatta un numero di secondi come m:ss, arrotondando per eccesso. */
export function formatClock(seconds: number): string {
  const total = Math.max(0, Math.ceil(seconds));
  const minutes = Math.floor(total / 60);
  return `${minutes}:${String(total % 60).padStart(2, '0')}`;
}
