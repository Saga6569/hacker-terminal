// ==========================================
// ENTRY POINT
// ==========================================

import { Game } from './src/core/Game.js';

document.addEventListener('DOMContentLoaded', () => {
    try {
        window.game = new Game();
        console.log('Game initialized successfully');
    } catch (err) {
        console.error('Game init failed:', err);
        const output = document.getElementById('output');
        if (output) {
            output.innerHTML = '<div class="line error">[ERROR] Game initialization failed. Check console.</div>';
        }
    }
});
