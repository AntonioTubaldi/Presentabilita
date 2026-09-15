import { defineConfig } from 'vite';

// Su GitHub Pages il gioco vive in https://<utente>.github.io/Presentabilita/,
// quindi in build gli asset vanno cercati sotto quel prefisso.
// In dev (`npm run dev`) la base resta '/'.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/Presentabilita/' : '/',
  build: {
    target: 'es2022',
    // Phaser è grosso: lo isoliamo per non invalidare la cache del browser
    // ogni volta che cambiamo il codice di gioco.
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/phaser')) return 'phaser';
          return undefined;
        },
      },
    },
  },
}));
