/** Dimensioni logiche del gioco. Il canvas viene poi scalato per riempire la finestra. */
export const GAME_WIDTH = 640;
export const GAME_HEIGHT = 360;

/** Palette provvisoria: rettangoli colorati, zero grafica. Si sostituisce in Fase 5. */
export const COLORS = {
  background: 0x12111a,
  platform: 0x3d4466,
  platformEdge: 0x5a628f,

  /** Il ragazzo, da immacolato a disastro: si interpola tra questi due. */
  playerClean: 0xf0c674,
  playerFilthy: 0x6b4a2a,

  // Insidie della strada
  puddle: 0x2f6f8f,
  trash: 0x6a6a45,
  pigeon: 0x9aa0b5,
  dropping: 0xe8e4d0,
  fountain: 0x49b0c9,

  // Interfaccia
  barGood: 0x6fcf97,
  barBad: 0xc9743a,
  barFrame: 0x5a628f,
  outfit: 0x20202e,
  outfitShirt: 0xe8e8f0,
  outfitSpent: 0x2a2a35,
  text: '#c8cce0',
  textDim: '#7a819c',
} as const;
