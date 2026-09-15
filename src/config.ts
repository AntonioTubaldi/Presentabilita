/** Dimensioni logiche del gioco. Il canvas viene poi scalato per riempire la finestra. */
export const GAME_WIDTH = 640;
export const GAME_HEIGHT = 360;

/** Palette provvisoria: rettangoli colorati, zero grafica. Si sostituisce in Fase 5. */
export const COLORS = {
  background: 0x12111a,
  platform: 0x3d4466,
  platformEdge: 0x5a628f,
  player: 0xf0c674,
  text: '#c8cce0',
} as const;
