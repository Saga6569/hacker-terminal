// ==========================================
// TERMINAL - DOM interaction and output
// ==========================================

export class Terminal {
    constructor() {
        this.output = document.getElementById('output');
        this.input = document.getElementById('command-input');
        this.statsBar = document.getElementById('stats-bar');
    }
    
    print(text, type = '') {
        const line = document.createElement('div');
        line.className = `line ${type}`;
        line.textContent = text;
        this.output.appendChild(line);
        this.output.scrollTop = this.output.scrollHeight;
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
    }
    
    showAchievement(achievement) {
        const popup = document.getElementById('achievement-popup');
        popup.querySelector('.achievement-title').textContent = `🏆 ${achievement.name}`;
        popup.querySelector('.achievement-desc').textContent = achievement.desc;
        popup.classList.add('show');
        setTimeout(() => popup.classList.remove('show'), 4000);
    }
}
