/** Dimensioni della finestra di gioco. Il canvas viene poi scalato per riempire lo schermo. */
export const GAME_WIDTH = 640;
export const GAME_HEIGHT = 360;

/**
 * Larghezza del livello: quattro schermate abbondanti.
 * La telecamera segue il ragazzo lungo la strada.
 */
export const WORLD_WIDTH = 2560;

/** Palette provvisoria: rettangoli colorati, zero grafica. Si sostituisce in Fase 5. */
export const COLORS = {
  background: 0x12111a,
  platform: 0x3d4466,
  platformEdge: 0x5a628f,

  /** Palazzi sullo sfondo, su due piani di profondità. */
  skylineFar: 0x1a1926,
  skylineNear: 0x232336,

  /** Il ragazzo, da immacolato a disastro: si interpola tra questi due. */
  playerClean: 0xf0c674,
  playerFilthy: 0x6b4a2a,

  // Insidie della strada
  puddle: 0x2f6f8f,
  trash: 0x6a6a45,
  pigeon: 0x9aa0b5,
  dropping: 0xe8e4d0,
  fountain: 0x49b0c9,
  umbrella: 0x9b6bb5,
  umbrellaShaft: 0x6b5a4a,
  shop: 0xb58a3c,

  // Interfaccia
  barGood: 0x6fcf97,
  barBad: 0xc9743a,
  barFrame: 0x5a628f,
  /** La porzione di barra che l'abito attuale non potrà mai più riempire. */
  barLost: 0x3a2432,
  outfit: 0x20202e,
  outfitShirt: 0xe8e8f0,
  outfitSpent: 0x2a2a35,
  text: '#c8cce0',
  textDim: '#7a819c',
  textWarn: '#e8a33d',
  textLate: '#e05a4f',
} as const;
