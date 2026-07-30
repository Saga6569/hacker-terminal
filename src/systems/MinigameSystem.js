// ==========================================
// MINIGAME SYSTEM - Hacking challenges
// ==========================================

import { HACK_WORDS } from '../data/Constants.js';

export class MinigameSystem {
    constructor(terminal, audio = null) {
        this.terminal = terminal;
        this.audio = audio;
        this.overlay = document.getElementById('minigame-overlay');
        this.words = HACK_WORDS;
    }
    
    async run(server, hardware, skillBonuses = {}) {
        const difficulty = Math.min(server.difficulty, 10);
        const requiredWords = Math.min(Math.ceil(difficulty / 2) + 1, 5);
        const timePerWord = Math.max(3000 - (hardware.cpu * 100), 1000) * (skillBonuses.minigameTime || 1);
        
        return new Promise((resolve) => {
            let wordsTyped = 0;
            let currentWord = '';
            let failed = false;
            let timer = null;
            
            const title = this.overlay.querySelector('.minigame-title');
            const targetEl = this.overlay.querySelector('.hack-target');
            const input = this.overlay.querySelector('.hack-input');
            const progressBar = this.overlay.querySelector('.progress-bar');
            
            const getNewWord = () => {
                currentWord = this.words[Math.floor(Math.random() * this.words.length)];
                targetEl.textContent = currentWord.toUpperCase();
                input.value = '';
                input.focus();
            };
            
            const updateProgress = () => {
                const pct = (wordsTyped / requiredWords) * 100;
                progressBar.style.width = `${pct}%`;
                if (pct > 70) progressBar.classList.add('danger');
            };
            
            const onInput = () => {
                if (this.audio) this.audio.keyHit();
                if (input.value.toLowerCase() === currentWord) {
                    wordsTyped++;
                    updateProgress();
                    if (wordsTyped >= requiredWords) {
                        cleanup();
                        resolve(true);
                        return;
                    }
                    getNewWord();
                }
            };
            
            const onKeyDown = (e) => {
                if (e.key === 'Escape') {
                    failed = true;
                    cleanup();
                    resolve(false);
                }
            };
            
            const cleanup = () => {
                clearTimeout(timer);
                input.removeEventListener('input', onInput);
                input.removeEventListener('keydown', onKeyDown);
                this.overlay.classList.remove('active');
                progressBar.classList.remove('danger');
                this.terminal.focusInput();
            };
            
            title.textContent = `BREACHING: ${server.name.toUpperCase()}`;
            getNewWord();
            progressBar.style.width = '0%';
            this.overlay.classList.add('active');
            input.focus();
            
            input.addEventListener('input', onInput);
            input.addEventListener('keydown', onKeyDown);
            
            const timeLimit = timePerWord * requiredWords;
            timer = setTimeout(() => {
                if (!failed) {
                    cleanup();
                    resolve(false);
                }
            }, timeLimit);
        });
    }
}
