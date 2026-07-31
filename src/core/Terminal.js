// ==========================================
// TERMINAL - DOM interaction and output
// ==========================================

export class Terminal {
    constructor(audio = null) {
        this.output = document.getElementById('output');
        this.input = document.getElementById('command-input');
        this.statsBar = document.getElementById('stats-bar');
        this.screen = document.getElementById('screen');
        this.audio = audio;
        
        this.setupThemeSelector();
        this.setupMobileInput();
        
        // Typing sound on keypress
        if (this.input && this.audio) {
            this.input.addEventListener('keydown', () => {
                if (this.audio) this.audio.type();
            });
        }
    }
    
    setupThemeSelector() {
        const selector = document.getElementById('theme-selector');
        if (!selector) return;
        
        selector.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const theme = btn.dataset.theme;
                document.documentElement.setAttribute('data-theme', theme);
                localStorage.setItem('hackerTerminal_theme', theme);
            });
        });
        
        // Readable mode toggle
        const readableBtn = document.getElementById('readable-toggle');
        if (readableBtn) {
            readableBtn.addEventListener('click', () => {
                const current = document.documentElement.getAttribute('data-readable');
                const next = current === 'true' ? 'false' : 'true';
                document.documentElement.setAttribute('data-readable', next);
                localStorage.setItem('hackerTerminal_readable', next);
                readableBtn.style.background = next === 'true' ? 'var(--primary)' : 'transparent';
                readableBtn.style.color = next === 'true' ? '#000' : 'var(--primary)';
            });
            
            // Load saved
            const savedReadable = localStorage.getItem('hackerTerminal_readable');
            if (savedReadable === 'true') {
                document.documentElement.setAttribute('data-readable', 'true');
                readableBtn.style.background = 'var(--primary)';
                readableBtn.style.color = '#000';
            }
        }
        
        // Load saved theme
        const saved = localStorage.getItem('hackerTerminal_theme');
        if (saved) {
            document.documentElement.setAttribute('data-theme', saved);
        }
    }
    
    setupMobileInput() {
        if (!this.input || !this.screen) return;
        
        // Focus input on any tap/click on screen
        this.screen.addEventListener('touchstart', (e) => {
            if (e.target !== this.input && e.target.tagName !== 'BUTTON') {
                this.focusInput();
            }
        }, { passive: true });
        
        this.screen.addEventListener('click', (e) => {
            if (e.target !== this.input && e.target.tagName !== 'BUTTON') {
                this.focusInput();
            }
        });
    }
    
    print(text, type = '') {
        const line = document.createElement('div');
        line.className = `line ${type}`;
        line.textContent = text;
        this.output.appendChild(line);
        this.output.scrollTop = this.output.scrollHeight;
        return line;
    }
    
    updateLine(lineElement, text, type = '') {
        if (lineElement) {
            lineElement.textContent = text;
            if (type) lineElement.className = `line ${type}`;
            this.output.scrollTop = this.output.scrollHeight;
        }
    }
    
    printSlow(text, type = '', delay = 15) {
        return new Promise(resolve => {
            const line = document.createElement('div');
            line.className = `line ${type}`;
            this.output.appendChild(line);
            
            let i = 0;
            const chars = text.split('');
            
            const interval = setInterval(() => {
                if (i < chars.length) {
                    line.textContent += chars[i];
                    this.output.scrollTop = this.output.scrollHeight;
                    if (this.audio && i % 3 === 0) this.audio.type();
                    i++;
                } else {
                    clearInterval(interval);
                    resolve();
                }
            }, delay);
        });
    }
    
    clear() {
        this.output.innerHTML = '';
    }
    
    printArt(art, type = 'dim') {
        const lines = art.split('\n');
        lines.forEach(line => this.print(line, type));
    }
    
    printBox(title, lines, type = 'info') {
        const width = 50;
        this.print(`╔══ ${title.padEnd(width - 5, ' ')}╗`, type);
        lines.forEach(l => this.print(`  ${l}`, type));
        this.print(`╚${'═'.repeat(width - 1)}╝`, type);
    }
    
    updateStats(player, bots) {
        if (!this.statsBar) return;
        const income = bots.reduce((s, b) => s + b.income, 0);
        this.statsBar.innerHTML = `
            <span class="stat-item">₿ ${player.credits}</span>
            <span class="stat-item">LVL ${player.level}</span>
            <span class="stat-item">REP ${player.reputation}</span>
            <span class="stat-item">HACKS ${player.totalHacks}</span>
            <span class="stat-item">+${income}/5s</span>
        `;
    }
    
    focusInput() {
        this.input.focus();
    }
    
    getInputValue() {
        return this.input.value.trim();
    }
    
    clearInput() {
        this.input.value = '';
        this.focusInput();
    }
    
    showAchievement(achievement) {
        const popup = document.getElementById('achievement-popup');
        popup.querySelector('.achievement-title').textContent = `🏆 ${achievement.name}`;
        popup.querySelector('.achievement-desc').textContent = achievement.desc;
        popup.classList.add('show');
        setTimeout(() => popup.classList.remove('show'), 4000);
    }
    
    // Visual effects
    glitchScreen(duration = 500) {
        if (this.screen) {
            this.screen.classList.add('glitch');
            setTimeout(() => this.screen.classList.remove('glitch'), duration);
        }
    }
    
    shakeScreen(duration = 500) {
        if (this.screen) {
            this.screen.classList.add('shake');
            setTimeout(() => this.screen.classList.remove('shake'), duration);
        }
    }
    
    chromatic(duration = 500) {
        if (this.screen) {
            this.screen.classList.add('chromatic');
            setTimeout(() => this.screen.classList.remove('chromatic'), duration);
        }
    }
    
    flashError() {
        if (this.screen) {
            this.screen.style.boxShadow = 'inset 0 0 100px rgba(255,0,0,0.3)';
            setTimeout(() => {
                this.screen.style.boxShadow = '';
            }, 300);
        }
    }
    
    flashSuccess() {
        if (this.screen) {
            this.screen.style.boxShadow = 'inset 0 0 100px rgba(0,255,0,0.2)';
            setTimeout(() => {
                this.screen.style.boxShadow = '';
            }, 300);
        }
    }
    
    bootSequence() {
        return new Promise(resolve => {
            const lines = [
                'BIOS v4.2.1 - HACKNET SYSTEMS',
                'Memory Test: 65536K OK',
                'Detecting primary master ... HDD-0 FOUND',
                'Detecting primary slave  ... NONE',
                'Loading kernel ...',
                'Mounting filesystems ...',
                'Starting network services ...',
                'Establishing secure connection ...',
                '...',
                'ACCESS GRANTED'
            ];
            
            let i = 0;
            const nextLine = () => {
                if (i < lines.length) {
                    const line = document.createElement('div');
                    line.className = 'line boot-line dim';
                    line.textContent = `[${(i * 0.1 + 0.1).toFixed(1)}s] ${lines[i]}`;
                    this.output.appendChild(line);
                    this.output.scrollTop = this.output.scrollHeight;
                    if (this.audio) this.audio.type();
                    i++;
                    setTimeout(nextLine, 150 + Math.random() * 200);
                } else {
                    this.output.innerHTML = '';
                    resolve();
                }
            };
            nextLine();
        });
    }
}
