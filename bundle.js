// ==========================================
// GAME STATE - Save / Load / Export
// ==========================================

class GameState {
    static save(game) {
        const data = {
            player: game.player,
            bots: game.bots,
            servers: game.servers,
            upgrades: game.upgrades,
            storyProgress: game.storyProgress,
            sessionStats: game.sessionStats,
            faction: game.factions?.currentFaction?.id || null,
            inventory: game.market?.serialize() || {},
            viruses: game.viruses?.serialize() || [],
            achievements: game.achievements?.serialize() || [],
            missions: game.missions?.serialize()?.missions || [],
            activeMission: game.missions?.serialize()?.active || null,
            missionsCompleted: game.missions?.serialize()?.completedCount || 0,
            skills: game.skills?.serialize() || {},
            timestamp: Date.now()
        };
        localStorage.setItem('hackerTerminal_v2_save', JSON.stringify(data));
    }
    
    static load() {
        const data = localStorage.getItem('hackerTerminal_v2_save');
        return data ? JSON.parse(data) : null;
    }
    
    static clear() {
        localStorage.removeItem('hackerTerminal_v2_save');
    }
    
    static export() {
        const data = localStorage.getItem('hackerTerminal_v2_save');
        return data ? btoa(data) : null;
    }
    
    static import(base64) {
        try {
            const data = atob(base64);
            JSON.parse(data);
            localStorage.setItem('hackerTerminal_v2_save', data);
            return true;
        } catch {
            return false;
        }
    }
    
    static calculateOfflineEarnings(saved, botIncome) {
        const offline = Date.now() - saved.timestamp;
        const offlineSeconds = offline / 1000;
        const earnings = Math.floor(botIncome * (offlineSeconds / 5));
        const maxOffline = 7200; // max 2 hours worth
        return Math.min(earnings, maxOffline * botIncome / 5);
    }
}
// ==========================================
// TERMINAL - DOM interaction and output
// ==========================================

class Terminal {
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
// ==========================================
// AUDIO SYSTEM - Synthesized sounds
// No external files needed, pure Web Audio API
// ==========================================

class AudioSystem {
    constructor() {
        this.ctx = null;
        this.enabled = true;
        this.masterGain = null;
    }
    
    init() {
        if (this.ctx) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 0.15; // Keep it subtle
            this.masterGain.connect(this.ctx.destination);
        } catch (e) {
            this.enabled = false;
        }
    }
    
    ensureContext() {
        if (!this.ctx) this.init();
        if (this.ctx?.state === 'suspended') {
            this.ctx.resume();
        }
    }
    
    // CRT terminal typing sound
    type() {
        if (!this.enabled) return;
        this.ensureContext();
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(800 + Math.random() * 400, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.03);
        
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + 0.03);
    }
    
    // Success / hack completed
    success() {
        if (!this.enabled) return;
        this.ensureContext();
        
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C major arpeggio
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.value = freq;
            
            gain.gain.setValueAtTime(0, this.ctx.currentTime + i * 0.08);
            gain.gain.linearRampToValueAtTime(0.15, this.ctx.currentTime + i * 0.08 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.08 + 0.2);
            
            osc.connect(gain);
            gain.connect(this.masterGain);
            
            osc.start(this.ctx.currentTime + i * 0.08);
            osc.stop(this.ctx.currentTime + i * 0.08 + 0.2);
        });
    }
    
    // Failure / error
    failure() {
        if (!this.enabled) return;
        this.ensureContext();
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.3);
        
        gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + 0.3);
    }
    
    // Key press in minigame
    keyHit() {
        if (!this.enabled) return;
        this.ensureContext();
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.value = 600 + Math.random() * 200;
        
        gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + 0.05);
    }
    
    // CRT power-on hum
    powerOn() {
        if (!this.enabled) return;
        this.ensureContext();
        
        // 60Hz hum
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.value = 60;
        
        gain.gain.setValueAtTime(0, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.05, this.ctx.currentTime + 1);
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.start(this.ctx.currentTime);
        // Fade out after 2 seconds
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 2);
        osc.stop(this.ctx.currentTime + 2);
    }
    
    // Achievement unlock
    achievement() {
        if (!this.enabled) return;
        this.ensureContext();
        
        const notes = [880, 1108, 1318, 1760]; // A, C#, E, A (higher)
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.value = freq;
            
            gain.gain.setValueAtTime(0, this.ctx.currentTime + i * 0.1);
            gain.gain.linearRampToValueAtTime(0.12, this.ctx.currentTime + i * 0.1 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.1 + 0.4);
            
            osc.connect(gain);
            gain.connect(this.masterGain);
            
            osc.start(this.ctx.currentTime + i * 0.1);
            osc.stop(this.ctx.currentTime + i * 0.1 + 0.4);
        });
    }
    
    // Level up fanfare
    levelUp() {
        if (!this.enabled) return;
        this.ensureContext();
        
        const notes = [392, 523, 659, 784, 1047]; // G, C, E, G, C
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'square';
            osc.frequency.value = freq;
            
            gain.gain.setValueAtTime(0, this.ctx.currentTime + i * 0.1);
            gain.gain.linearRampToValueAtTime(0.1, this.ctx.currentTime + i * 0.1 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.1 + 0.3);
            
            osc.connect(gain);
            gain.connect(this.masterGain);
            
            osc.start(this.ctx.currentTime + i * 0.1);
            osc.stop(this.ctx.currentTime + i * 0.1 + 0.3);
        });
    }
    
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
}
// ==========================================
// ACHIEVEMENT SYSTEM
// ==========================================


class AchievementSystem {
    constructor(game, terminal, audio = null) {
        this.game = game;
        this.terminal = terminal;
        this.audio = audio;
        this.achievements = ACHIEVEMENTS_DATA.map(a => ({ ...a, unlocked: false }));
    }
    
    check() {
        let newUnlocks = [];
        this.achievements.forEach(ach => {
            if (!ach.unlocked && ach.condition(this.game)) {
                ach.unlocked = true;
                newUnlocks.push(ach);
                this.terminal.showAchievement(ach);
                if (this.audio) this.audio.achievement();
            }
        });
        return newUnlocks;
    }
    
    list() {
        return this.achievements.map(a => ({
            name: a.name,
            desc: a.desc,
            unlocked: a.unlocked
        }));
    }
    
    load(savedAchievements) {
        if (!savedAchievements) return;
        savedAchievements.forEach(saved => {
            const ach = this.achievements.find(a => a.id === saved.id);
            if (ach) ach.unlocked = saved.unlocked;
        });
    }
    
    serialize() {
        return this.achievements.map(a => ({ id: a.id, unlocked: a.unlocked }));
    }
}
// ==========================================
// MISSION SYSTEM
// ==========================================


class MissionSystem {
    constructor(game, terminal) {
        this.game = game;
        this.terminal = terminal;
        this.missions = MISSIONS_DATA.map(m => ({ ...m, completed: false }));
        this.activeMission = null;
        this.completedCount = 0;
    }
    
    getActive() {
        return this.activeMission;
    }
    
    assignNext() {
        const next = this.missions.find(m => !m.completed);
        if (next) {
            this.activeMission = { ...next, progress: 0 };
            return this.activeMission;
        }
        return null;
    }
    
    updateProgress(type, target, amount = 1) {
        if (!this.activeMission) return;
        const m = this.activeMission;
        
        if (m.type === type && (m.target === 'any' || m.target === target)) {
            m.progress = Math.min(m.progress + amount, m.required);
            if (m.progress >= m.required) {
                this.completeMission(m);
            }
        }
    }
    
    completeMission(mission) {
        const m = this.missions.find(x => x.id === mission.id);
        if (m) {
            m.completed = true;
            this.completedCount++;
            this.game.player.credits += m.reward;
            this.game.player.reputation += 50;
            
            this.terminal.print(`\n╔══ MISSION COMPLETE ═════════════════╗`, 'success');
            this.terminal.print(`  ${m.title}`, 'success');
            this.terminal.print(`  Reward: ${m.reward} ₿`, 'success');
            this.terminal.print(`  Reputation +50`, 'success');
            this.terminal.print(`╚═════════════════════════════════════╝\n`, 'success');
            
            this.activeMission = null;
            setTimeout(() => {
                const next = this.assignNext();
                if (next) {
                    this.terminal.print(`📋 NEW MISSION: ${next.title}`, 'info');
                    this.terminal.print(`   ${next.desc}\n`, 'dim');
                }
            }, 2000);
        }
    }
    
    checkHardwareUpgrades() {
        if (!this.activeMission) return;
        if (this.activeMission.type === 'upgrade_all') {
            const { cpu, ram, network } = this.game.player.hardware;
            const req = this.activeMission.required;
            if (cpu >= req && ram >= req && network >= req) {
                this.completeMission(this.activeMission);
            }
        }
    }
    
    checkLevel() {
        if (!this.activeMission) return;
        if (this.activeMission.type === 'level') {
            if (this.game.player.level >= this.activeMission.required) {
                this.completeMission(this.activeMission);
            }
        }
    }
    
    load(savedMissions, savedActive, savedCount) {
        if (savedMissions) {
            savedMissions.forEach(saved => {
                const m = this.missions.find(x => x.id === saved.id);
                if (m) m.completed = saved.completed;
            });
        }
        this.completedCount = savedCount || 0;
        if (savedActive) {
            this.activeMission = savedActive;
        } else {
            this.assignNext();
        }
    }
    
    serialize() {
        return {
            missions: this.missions.map(m => ({ id: m.id, completed: m.completed })),
            active: this.activeMission,
            completedCount: this.completedCount
        };
    }
}
// ==========================================
// MINIGAME SYSTEM - Hacking challenges
// ==========================================


class MinigameSystem {
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
// ==========================================
// EVENT SYSTEM - Random world events
// ==========================================


class EventSystem {
    constructor(game, terminal) {
        this.game = game;
        this.terminal = terminal;
        this.events = RANDOM_EVENTS;
        this.activeEvent = null;
        this.lastEventTime = 0;
        this.eventCooldown = 300000; // 5 minutes minimum between events
    }
    
    check() {
        const now = Date.now();
        if (now - this.lastEventTime < this.eventCooldown) return;
        
        const roll = Math.random();
        const possibleEvents = this.events.filter(e => roll < e.chance);
        
        if (possibleEvents.length > 0) {
            const event = possibleEvents[Math.floor(Math.random() * possibleEvents.length)];
            this.trigger(event);
        }
    }
    
    trigger(event) {
        this.activeEvent = event;
        this.lastEventTime = Date.now();
        
        this.terminal.print('', 'warning');
        this.terminal.print(`╔══ RANDOM EVENT ═══════════════════════════════╗`, 'warning');
        this.terminal.print(`  🔔 ${event.name.toUpperCase()}`, 'warning');
        this.terminal.print(`  ${event.description}`, 'dim');
        this.terminal.print(`╚═══════════════════════════════════════════════╝`, 'warning');
        this.terminal.print('');
        
        if (event.effect) {
            event.effect(this.game);
        }
    }
    
    // Special UI for events that require player choice
    handleDarknetOffer() {
        if (this.game.player.reputation >= 1000) {
            this.terminal.print('An anonymous hacker wants to trade.', 'info');
            this.terminal.print('Give 1000 REP for a rare Black Hat bot? [yes/no]', 'warning');
            this.game._pendingChoice = 'darknet_offer';
        }
    }
}
// ==========================================
// MAP SYSTEM - ASCII network visualization
// ==========================================

class MapSystem {
    constructor(servers, terminal) {
        this.servers = servers;
        this.terminal = terminal;
    }
    
    render() {
        // Build network topology
        const regions = {
            home: [],
            public: [],
            education: [],
            corporate: [],
            financial: [],
            government: [],
            military: [],
            secret: []
        };
        
        this.servers.forEach(srv => {
            if (regions[srv.region]) {
                regions[srv.region].push(srv);
            }
        });
        
        const map = this.buildAsciiMap(regions);
        map.forEach(line => this.terminal.print(line, 'dim'));
        
        this.terminal.print('');
        this.terminal.print('LEGEND:', 'info');
        this.terminal.print('  [✓] = Hacked  [ ] = Active  [!] = Locked (faction required)', 'dim');
        this.terminal.print('  Lines show network connections. Hack in order to unlock paths.', 'dim');
    }
    
    buildAsciiMap(regions) {
        const lines = [];
        lines.push('');
        lines.push('                    ╔══════════════════╗');
        lines.push('                    ║   QUANTUM CORE   ║');
        lines.push('                    ║  [EXPERIMENTAL]  ║');
        lines.push('                    ╚════════╦═════════╝');
        lines.push('                             ║');
        lines.push('              ╔══════════════╩══════════════╗');
        lines.push('              ║      MILITARY NODE          ║');
        lines.push('              ║      [CLASSIFIED]           ║');
        lines.push('              ╚══════════════╦══════════════╝');
        lines.push('                             ║');
        lines.push('        ╔════════════════════╩════════════════════╗');
        lines.push('        ║          GOVERNMENT FIREWALL            ║');
        lines.push('        ╚════════════════════╦════════════════════╝');
        lines.push('                             ║');
        lines.push('       ╔═════════════════════╩═════════════════════╗');
        lines.push('       ║  BANK PROXY ║  PHARMA LAB  ║  STARTUP DB ║');
        lines.push('       ╚═════════════════════╦═════════════════════╝');
        lines.push('                             ║');
        lines.push('              ╔══════════════╩══════════════╗');
        lines.push('              ║      CORPORATE WEB-01       ║');
        lines.push('              ╚══════════════╦══════════════╝');
        lines.push('                             ║');
        lines.push('       ╔═════════════════════╩═════════════════════╗');
        lines.push('       ║ SCHOOL SERVER ║ COFFEE SHOP ║ LOCALHOST ║');
        lines.push('       ╚═══════════════════════════════════════════╝');
        lines.push('');
        
        // Add server status indicators
        const statusLines = this.buildStatusOverlay(regions);
        return lines.map((line, i) => {
            const status = statusLines.find(s => s.line === i);
            return status ? this.injectStatus(line, status) : line;
        });
    }
    
    buildStatusOverlay(regions) {
        const statuses = [];
        // Map server names to approximate line positions
        const positions = {
            'quantum-core': 3,
            'military-node': 8,
            'gov-firewall': 13,
            'bank-proxy': 17,
            'pharma-lab': 17,
            'start-up-db': 17,
            'corp-web-01': 21,
            'school-server': 25,
            'coffee-shop-wifi': 25,
            'localhost': 25
        };
        
        this.servers.forEach(srv => {
            const line = positions[srv.name];
            if (line !== undefined) {
                statuses.push({
                    line,
                    server: srv,
                    status: srv.hacked ? '✓' : (srv.region === 'military' ? '!' : ' ')
                });
            }
        });
        
        return statuses;
    }
    
    injectStatus(line, status) {
        // Simple replacement - find brackets and inject status
        if (status.server.hacked) {
            return line.replace('[', '[✓').replace(/\[\s*\]/, '[✓]');
        }
        return line;
    }
}
// ==========================================
// SKILL TREE - Unlockable abilities
// ==========================================

const SKILLS = {
    fast_typer: {
        id: 'fast_typer',
        name: 'Fast Fingers',
        description: 'Minigame time limit +20%',
        cost: 500,
        requiredLevel: 3,
        requires: [],
        unlocked: false,
        apply: (game) => { game._skillBonuses.minigameTime = 1.2; }
    },
    social_engineer: {
        id: 'social_engineer',
        name: 'Social Engineer',
        description: 'Access social media servers (bonus rewards)',
        cost: 1000,
        requiredLevel: 5,
        requires: ['fast_typer'],
        unlocked: false,
        apply: (game) => { game._skillBonuses.socialServers = true; }
    },
    crypto_miner: {
        id: 'crypto_miner',
        name: 'Crypto Miner',
        description: 'Passive income from all sources +15%',
        cost: 2000,
        requiredLevel: 7,
        requires: ['fast_typer'],
        unlocked: false,
        apply: (game) => { game._skillBonuses.incomeMultiplier = 1.15; }
    },
    ghost_protocol: {
        id: 'ghost_protocol',
        name: 'Ghost Protocol',
        description: 'Detection risk reduced by 50%',
        cost: 3000,
        requiredLevel: 10,
        requires: ['social_engineer'],
        unlocked: false,
        apply: (game) => { game._skillBonuses.detectionReduction = 0.5; }
    },
    ddos_master: {
        id: 'ddos_master',
        name: 'DDoS Master',
        description: 'Can attack multiple servers simultaneously',
        cost: 5000,
        requiredLevel: 12,
        requires: ['crypto_miner'],
        unlocked: false,
        apply: (game) => { game._skillBonuses.multiTarget = true; }
    },
    quantum_hacker: {
        id: 'quantum_hacker',
        name: 'Quantum Hacker',
        description: 'Can breach quantum-core (requires level 20)',
        cost: 10000,
        requiredLevel: 15,
        requires: ['ghost_protocol', 'ddos_master'],
        unlocked: false,
        apply: (game) => { game._skillBonuses.quantumAccess = true; }
    },
    ai_symbiosis: {
        id: 'ai_symbiosis',
        name: 'AI Symbiosis',
        description: 'Bot income doubled, can control 5 extra bots',
        cost: 15000,
        requiredLevel: 18,
        requires: ['quantum_hacker'],
        unlocked: false,
        apply: (game) => { game._skillBonuses.botIncomeMultiplier = 2; game._skillBonuses.maxBots = 5; }
    },
    digital_god: {
        id: 'digital_god',
        name: 'Digital God',
        description: 'All stats +50%, unlock secret ending',
        cost: 50000,
        requiredLevel: 25,
        requires: ['ai_symbiosis'],
        unlocked: false,
        apply: (game) => { 
            game._skillBonuses.allStatsMultiplier = 1.5;
            game._skillBonuses.secretEnding = true;
        }
    }
};

class SkillTree {
    constructor(game, terminal) {
        this.game = game;
        this.terminal = terminal;
        this.skills = JSON.parse(JSON.stringify(SKILLS));
        this.bonuses = {
            minigameTime: 1,
            incomeMultiplier: 1,
            detectionReduction: 1,
            botIncomeMultiplier: 1,
            allStatsMultiplier: 1
        };
    }
    
    showTree() {
        this.terminal.print('╔══ SKILL TREE ══════════════════════════════════════╗', 'info');
        this.terminal.print('');
        
        Object.values(this.skills).forEach(skill => {
            const status = skill.unlocked ? '✓ UNLOCKED' : `○ LOCKED (LVL ${skill.requiredLevel}, ${skill.cost} ₿)`;
            const color = skill.unlocked ? 'success' : (this.canUnlock(skill) ? 'warning' : 'dim');
            
            this.terminal.print(`  ${skill.name}`, color);
            this.terminal.print(`     ${skill.description}`, 'dim');
            this.terminal.print(`     ${status}`, color);
            
            if (skill.requires.length > 0 && !skill.unlocked) {
                const reqNames = skill.requires.map(id => this.skills[id]?.name).filter(Boolean);
                this.terminal.print(`     Requires: ${reqNames.join(', ')}`, 'dim');
            }
            this.terminal.print('');
        });
        
        this.terminal.print('╚════════════════════════════════════════════════════╝', 'info');
        this.terminal.print('Use "skill unlock <id>" to purchase.', 'dim');
    }
    
    canUnlock(skill) {
        if (skill.unlocked) return false;
        if (this.game.player.level < skill.requiredLevel) return false;
        if (this.game.player.credits < skill.cost) return false;
        
        return skill.requires.every(reqId => this.skills[reqId]?.unlocked);
    }
    
    unlock(skillId) {
        const skill = this.skills[skillId];
        if (!skill) {
            this.terminal.print(`Unknown skill: ${skillId}`, 'error');
            return;
        }
        
        if (skill.unlocked) {
            this.terminal.print(`${skill.name} already unlocked.`, 'warning');
            return;
        }
        
        if (!this.canUnlock(skill)) {
            this.terminal.print(`Cannot unlock ${skill.name}. Check requirements.`, 'error');
            return;
        }
        
        this.game.player.credits -= skill.cost;
        skill.unlocked = true;
        skill.apply(this.game);
        
        this.terminal.print('');
        this.terminal.print(`╔══ SKILL UNLOCKED ════════════════════════════════╗`, 'success');
        this.terminal.print(`  ★ ${skill.name}`, 'success');
        this.terminal.print(`  ${skill.description}`, 'info');
        this.terminal.print(`╚══════════════════════════════════════════════════╝`, 'success');
        this.terminal.print('');
        
        // Recalculate bonuses
        this.recalculateBonuses();
    }
    
    recalculateBonuses() {
        this.bonuses = {
            minigameTime: 1,
            incomeMultiplier: 1,
            detectionReduction: 1,
            botIncomeMultiplier: 1,
            allStatsMultiplier: 1
        };
        
        Object.values(this.skills).forEach(skill => {
            if (skill.unlocked && skill.apply) {
                // Apply will modify game._skillBonuses
            }
        });
    }
    
    getBonus(key) {
        return this.bonuses[key] || 1;
    }
    
    serialize() {
        return Object.fromEntries(
            Object.entries(this.skills).map(([id, skill]) => [id, skill.unlocked])
        );
    }
    
    load(data) {
        if (!data) return;
        Object.entries(data).forEach(([id, unlocked]) => {
            if (this.skills[id] && unlocked) {
                this.skills[id].unlocked = true;
                this.skills[id].apply(this.game);
            }
        });
        this.recalculateBonuses();
    }
}
// ==========================================
// BLACK MARKET - Sell stolen data
// ==========================================


class BlackMarket {
    constructor(game, terminal) {
        this.game = game;
        this.terminal = terminal;
        this.items = BLACK_MARKET_ITEMS;
        this.stolenData = {};
    }
    
    hackServer(serverName) {
        // Called when a server is hacked - generates stolen data
        const server = this.game.servers.find(s => s.name === serverName);
        if (!server) return;
        
        const dataType = this.getDataType(server);
        if (dataType) {
            this.stolenData[dataType] = (this.stolenData[dataType] || 0) + 1;
            this.terminal.print(`  📁 Extracted: ${this.getItemName(dataType)} x1`, 'info');
        }
    }
    
    getDataType(server) {
        if (server.region === 'financial') return 'stolen_data_bank';
        if (server.region === 'government') return 'stolen_data_gov';
        if (server.region === 'military') return 'stolen_data_military';
        if (server.difficulty >= 10) return 'zero_day_exploit';
        return null;
    }
    
    getItemName(id) {
        const item = this.items.find(i => i.id === id);
        return item ? item.name : id;
    }
    
    listInventory() {
        const entries = Object.entries(this.stolenData).filter(([_, count]) => count > 0);
        if (entries.length === 0) {
            this.terminal.print('No stolen data in inventory.', 'warning');
            return;
        }
        
        this.terminal.print('╔══ STOLEN DATA INVENTORY ══════════════════════╗', 'info');
        entries.forEach(([id, count]) => {
            const item = this.items.find(i => i.id === id);
            const price = item ? Math.floor(item.basePrice * (0.8 + Math.random() * 0.4)) : 0;
            this.terminal.print(`  ${item.name} x${count} (~${price} ₿ each)`);
        });
        this.terminal.print('╚═══════════════════════════════════════════════╝', 'info');
        this.terminal.print('Use "sell <item_id> [amount]" to sell.', 'dim');
    }
    
    sell(itemId, amount = 1) {
        const available = this.stolenData[itemId] || 0;
        if (available < amount) {
            this.terminal.print(`Not enough stock. You have ${available}.`, 'error');
            return;
        }
        
        const item = this.items.find(i => i.id === itemId);
        if (!item) {
            this.terminal.print(`Unknown item: ${itemId}`, 'error');
            return;
        }
        
        // Market fluctuation
        const marketMultiplier = this.game._creditMultiplier || 1;
        const totalPrice = Math.floor(item.basePrice * amount * (0.8 + Math.random() * 0.4) * marketMultiplier);
        
        this.stolenData[itemId] -= amount;
        this.game.player.credits += totalPrice;
        this.game.player.totalEarned += totalPrice;
        
        this.terminal.print(`✓ Sold ${item.name} x${amount} for ${totalPrice} ₿`, 'success');
        
        // Risk of detection
        const riskRoll = Math.random();
        if (riskRoll < item.risk) {
            this.terminal.print('⚠ Buyer was a honeypot! Reputation -20', 'error');
            this.game.player.reputation = Math.max(0, this.game.player.reputation - 20);
        }
    }
    
    showPrices() {
        this.terminal.print('╔══ BLACK MARKET PRICES ════════════════════════╗', 'info');
        this.items.forEach(item => {
            const price = Math.floor(item.basePrice * (0.8 + Math.random() * 0.4));
            this.terminal.print(`  ${item.name.padEnd(18)} ~${price} ₿ (risk: ${Math.floor(item.risk * 100)}%)`);
        });
        this.terminal.print('╚═══════════════════════════════════════════════╝', 'info');
    }
    
    serialize() {
        return this.stolenData;
    }
    
    load(data) {
        if (data) this.stolenData = data;
    }
}
// ==========================================
// FACTIONS - Choose your path
// ==========================================


class FactionSystem {
    constructor(game, terminal) {
        this.game = game;
        this.terminal = terminal;
        this.factions = FACTIONS;
        this.currentFaction = null;
    }
    
    join(factionId) {
        if (this.currentFaction) {
            this.terminal.print(`You are already part of ${this.currentFaction.name}.`, 'warning');
            this.terminal.print('Use "faction leave" first (costs 5000 REP).', 'dim');
            return;
        }
        
        const faction = this.factions[factionId];
        if (!faction) {
            this.terminal.print(`Unknown faction: ${factionId}`, 'error');
            this.terminal.print(`Available: ${Object.keys(this.factions).join(', ')}`, 'dim');
            return;
        }
        
        this.currentFaction = { id: factionId, ...faction };
        this.terminal.print(`╔══ FACTION JOINED ═════════════════════════════╗`, 'success');
        this.terminal.print(`  ${faction.name}`, 'success');
        this.terminal.print(`  ${faction.description}`, 'dim');
        this.terminal.print(`  Income bonus: x${faction.incomeBonus}`, 'info');
        this.terminal.print(`  Detection risk: ${Math.floor(faction.detectionRisk * 100)}%`, faction.detectionRisk > 0 ? 'warning' : 'success');
        this.terminal.print(`╚═══════════════════════════════════════════════╝`, 'success');
    }
    
    leave() {
        if (!this.currentFaction) {
            this.terminal.print('You are not part of any faction.', 'error');
            return;
        }
        
        if (this.game.player.reputation < 5000) {
            this.terminal.print('Need 5000 REP to leave faction.', 'error');
            return;
        }
        
        this.game.player.reputation -= 5000;
        const name = this.currentFaction.name;
        this.currentFaction = null;
        this.terminal.print(`Left ${name}. Reputation -5000.`, 'warning');
    }
    
    showStatus() {
        if (!this.currentFaction) {
            this.terminal.print('No faction affiliation.', 'dim');
            this.terminal.print('Use "faction join <id>" to choose a side.', 'dim');
            return;
        }
        
        this.terminal.print(`Faction: ${this.currentFaction.name}`, 'info');
        this.terminal.print(`Bonus: x${this.currentFaction.incomeBonus} income`, 'info');
    }
    
    getIncomeMultiplier() {
        return this.currentFaction ? this.currentFaction.incomeBonus : 1.0;
    }
    
    getDetectionRisk() {
        return this.currentFaction ? this.currentFaction.detectionRisk : 0.1;
    }
    
    list() {
        this.terminal.print('╔══ AVAILABLE FACTIONS ═════════════════════════╗', 'info');
        Object.entries(this.factions).forEach(([id, f]) => {
            this.terminal.print(`  ${id}: ${f.name}`, 'info');
            this.terminal.print(`     ${f.description}`, 'dim');
            this.terminal.print(`     Income: x${f.incomeBonus} | Risk: ${Math.floor(f.detectionRisk * 100)}%`, 'dim');
        });
        this.terminal.print('╚═══════════════════════════════════════════════╝', 'info');
        this.terminal.print('Use "faction join <id>" to join.', 'dim');
    }
    
    serialize() {
        return this.currentFaction ? this.currentFaction.id : null;
    }
    
    load(factionId) {
        if (factionId && this.factions[factionId]) {
            this.currentFaction = { id: factionId, ...this.factions[factionId] };
        }
    }
}
// ==========================================
// VIRUSES - Deploy malware for passive income
// ==========================================


class VirusSystem {
    constructor(game, terminal) {
        this.game = game;
        this.terminal = terminal;
        this.virusTypes = VIRUSES;
        this.deployed = [];
    }
    
    create(virusId) {
        const v = this.virusTypes[virusId];
        if (!v) {
            this.terminal.print(`Unknown virus: ${virusId}`, 'error');
            this.terminal.print(`Available: ${Object.keys(this.virusTypes).join(', ')}`, 'dim');
            return;
        }
        
        if (this.game.player.credits < v.cost) {
            this.terminal.print(`Insufficient funds. Need ${v.cost} ₿`, 'error');
            return;
        }
        
        this.game.player.credits -= v.cost;
        this.deployed.push({ ...v, id: virusId, created: Date.now() });
        
        this.terminal.print(`✓ Deployed ${v.name}`, 'success');
        this.terminal.print(`  ${v.description}`, 'dim');
        
        if (v.special === 'lock') {
            this.terminal.print('  ⚠ This virus locks targets for ransom!', 'warning');
        }
    }
    
    list() {
        if (this.deployed.length === 0) {
            this.terminal.print('No active viruses. Use "virus create <id>" to deploy.', 'warning');
            return;
        }
        
        const income = this.getIncome();
        this.terminal.print('╔══ ACTIVE VIRUSES ═════════════════════════════╗', 'info');
        this.deployed.forEach(v => {
            this.terminal.print(`  ${v.name} (+${v.income} ₿/5s)`);
        });
        this.terminal.print(`╠═══════════════════════════════════════════════╣`, 'info');
        this.terminal.print(`  Total virus income: ${income} ₿/5s`);
        this.terminal.print('╚═══════════════════════════════════════════════╝', 'info');
    }
    
    getIncome() {
        return this.deployed.reduce((sum, v) => sum + (v.income || 0), 0);
    }
    
    listTypes() {
        this.terminal.print('╔══ VIRUS CATALOG ══════════════════════════════╗', 'info');
        Object.entries(this.virusTypes).forEach(([id, v]) => {
            this.terminal.print(`  ${id}: ${v.name} (${v.cost} ₿)`, 'info');
            this.terminal.print(`     ${v.description}`, 'dim');
            if (v.income > 0) this.terminal.print(`     Income: ${v.income} ₿/5s`, 'dim');
        });
        this.terminal.print('╚═══════════════════════════════════════════════╝', 'info');
    }
    
    serialize() {
        return this.deployed;
    }
    
    load(data) {
        if (data) this.deployed = data;
    }
}
// ==========================================
// SECRETS - Easter eggs and hidden commands
// ==========================================

class SecretCommands {
    constructor(game, terminal) {
        this.game = game;
        this.terminal = terminal;
        this.secrets = {
            'matrix': () => this.matrixEffect(),
            'konami': () => this.konamiCode(),
            'self-destruct': () => selfDestruct(),
            'sudo rm -rf /': () => this.fakeDestruction(),
            'hello friend': () => this.mrRobot(),
            'there is no spoon': () => this.matrixQuote(),
            'hack the planet': () => this.hackersMovie(),
            '1337': () => this.leetspeak(),
            'godmode': () => this.godMode()
        };
    }
    
    tryCommand(cmd) {
        const fn = this.secrets[cmd.toLowerCase()];
        if (fn) {
            fn();
            return true;
        }
        return false;
    }
    
    matrixEffect() {
        this.terminal.print('');
        this.terminal.print('Wake up, Neo...', 'dim');
        this.terminal.print('The Matrix has you...', 'dim');
        this.terminal.print('');
        
        // Show matrix rain for a few seconds
        const chars = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ1234567890';
        for (let i = 0; i < 15; i++) {
            let line = '';
            for (let j = 0; j < 40; j++) {
                line += chars[Math.floor(Math.random() * chars.length)];
            }
            this.terminal.print(line, 'success');
        }
        this.terminal.print('');
        this.terminal.print('[SECRET] Matrix mode activated.', 'success');
        this.terminal.print('');
    }
    
    konamiCode() {
        this.terminal.print('');
        this.terminal.print('↑ ↑ ↓ ↓ ← → ← → B A', 'info');
        this.terminal.print('');
        this.terminal.print('╔═══════════════════════════════════════════════╗', 'success');
        this.terminal.print('║  🏆 SECRET ACHIEVEMENT: KONAMI CODE MASTER   ║', 'success');
        this.terminal.print('║  Bonus: 1000 ₿                               ║', 'success');
        this.terminal.print('╚═══════════════════════════════════════════════╝', 'success');
        this.terminal.print('');
        this.game.player.credits += 1000;
        this.game.player.totalEarned += 1000;
    }
    
    selfDestruct() {
        this.terminal.print('');
        this.terminal.print('WARNING: SELF-DESTRUCT SEQUENCE INITIATED', 'error');
        this.terminal.print('');
        
        let count = 5;
        const countdown = setInterval(() => {
            if (count > 0) {
                this.terminal.print(`  ${count}...`, 'error');
                count--;
            } else {
                clearInterval(countdown);
                this.terminal.print('');
                this.terminal.print('  💥 BOOM!', 'error');
                this.terminal.print('');
                this.terminal.print('Just kidding. Everything is fine.', 'success');
                this.terminal.print('');
            }
        }, 800);
    }
    
    fakeDestruction() {
        this.terminal.print('');
        this.terminal.print('Deleting all files...', 'error');
        this.terminal.print('/usr/bin... deleted', 'error');
        this.terminal.print('/etc/passwd... deleted', 'error');
        this.terminal.print('/home/user... deleted', 'error');
        this.terminal.print('');
        this.terminal.print('Ha! You thought I\'d actually do it?', 'success');
        this.terminal.print('Nice try though. 😏', 'success');
        this.terminal.print('');
    }
    
    mrRobot() {
        this.terminal.print('');
        this.terminal.print('╔═══════════════════════════════════════════════╗', 'info');
        this.terminal.print('║  "Hello, friend."                              ║', 'info');
        this.terminal.print('║                                               ║', 'dim');
        this.terminal.print('║  "Control is an illusion."                     ║', 'dim');
        this.terminal.print('╚═══════════════════════════════════════════════╝', 'info');
        this.terminal.print('');
    }
    
    matrixQuote() {
        this.terminal.print('');
        this.terminal.print('"There is no spoon."', 'info');
        this.terminal.print('Then you\'ll see, it is not the spoon that bends,', 'dim');
        this.terminal.print('it is only yourself.', 'dim');
        this.terminal.print('');
    }
    
    hackersMovie() {
        this.terminal.print('');
        this.terminal.print('╔═══════════════════════════════════════════════╗', 'success');
        this.terminal.print('║  HACK THE PLANET! 🌍                          ║', 'success');
        this.terminal.print('╚═══════════════════════════════════════════════╝', 'success');
        this.terminal.print('');
        this.terminal.print('Mess with the best, die like the rest.', 'dim');
        this.terminal.print('');
    }
    
    leetspeak() {
        this.terminal.print('');
        this.terminal.print('1337 H4X0R D3T3CT3D!', 'success');
        this.terminal.print('');
        this.terminal.print('Y0u 4r3 7ru3ly 4 1337 84d455.', 'info');
        this.terminal.print('H3r3\'5 500 ₿ f0r y0ur 5t1yl3.', 'info');
        this.terminal.print('');
        this.game.player.credits += 500;
        this.game.player.totalEarned += 500;
    }
    
    godMode() {
        this.terminal.print('');
        this.terminal.print('⚠ GOD MODE ACTIVATED ⚠', 'critical');
        this.terminal.print('');
        this.terminal.print('This would be too easy.', 'warning');
        this.terminal.print('Where\'s the fun in that?', 'warning');
        this.terminal.print('');
        this.terminal.print('...But here, have a cookie: 🍪', 'success');
        this.terminal.print('');
    }
}
// ==========================================
// GAME DATA - All static configuration
// ==========================================

const SERVERS = [
    { name: 'localhost', difficulty: 1, reward: 50, hacked: false, type: 'tutorial', description: 'Your own machine - practice target', region: 'home' },
    { name: 'coffee-shop-wifi', difficulty: 1, reward: 75, hacked: false, type: 'easy', description: 'Unsecured public network', region: 'public' },
    { name: 'school-server', difficulty: 2, reward: 120, hacked: false, type: 'easy', description: 'University database server', region: 'education' },
    { name: 'corp-web-01', difficulty: 3, reward: 200, hacked: false, type: 'medium', description: 'Corporate web server', region: 'corporate' },
    { name: 'start-up-db', difficulty: 4, reward: 350, hacked: false, type: 'medium', description: 'Tech startup database', region: 'corporate' },
    { name: 'bank-proxy', difficulty: 7, reward: 800, hacked: false, type: 'hard', description: 'Regional bank proxy server', region: 'financial' },
    { name: 'pharma-lab', difficulty: 10, reward: 1500, hacked: false, type: 'hard', description: 'Pharmaceutical research lab', region: 'corporate' },
    { name: 'gov-firewall', difficulty: 15, reward: 3000, hacked: false, type: 'extreme', description: 'Government security firewall', region: 'government' },
    { name: 'military-node', difficulty: 25, reward: 10000, hacked: false, type: 'extreme', description: 'Classified military node', region: 'military' },
    { name: 'quantum-core', difficulty: 50, reward: 50000, hacked: false, type: 'impossible', description: 'Experimental quantum computer - THE FINAL TARGET', region: 'secret' }
];

const BOT_TYPES = {
    script_kiddie: { name: 'Script Kiddie', cost: 500, income: 5, interval: 5000, description: 'Basic automated scripts', tier: 1 },
    hacktivist: { name: 'Hacktivist', cost: 2500, income: 30, interval: 5000, description: 'Motivated amateur', tier: 2 },
    black_hat: { name: 'Black Hat', cost: 12000, income: 180, interval: 5000, description: 'Professional mercenary', tier: 3 },
    ai_core: { name: 'AI Core', cost: 50000, income: 1000, interval: 5000, description: 'Autonomous hacking AI', tier: 4 }
};

const UPGRADES = {
    cpu: { cost: 100, multiplier: 1.6, level: 1, name: 'CPU', effect: 'Faster typing in hacks' },
    ram: { cost: 150, multiplier: 1.5, level: 1, name: 'RAM', effect: 'More time in minigames' },
    network: { cost: 200, multiplier: 1.55, level: 1, name: 'Network', effect: 'Higher success chance' }
};

const ACHIEVEMENTS_DATA = [
    { id: 'first_hack', name: 'Script Kiddie', desc: 'Complete your first hack', condition: (g) => g.player.totalHacks >= 1 },
    { id: 'hacker_10', name: 'Rising Threat', desc: 'Hack 10 servers', condition: (g) => g.player.totalHacks >= 10 },
    { id: 'hacker_50', name: 'Cyber Criminal', desc: 'Hack 50 servers', condition: (g) => g.player.totalHacks >= 50 },
    { id: 'rich_1k', name: 'First Thousand', desc: 'Earn 1,000 credits', condition: (g) => g.player.totalEarned >= 1000 },
    { id: 'rich_10k', name: 'Crypto Millionaire', desc: 'Earn 10,000 credits', condition: (g) => g.player.totalEarned >= 10000 },
    { id: 'rich_100k', name: 'Digital Kingpin', desc: 'Earn 100,000 credits', condition: (g) => g.player.totalEarned >= 100000 },
    { id: 'bot_army', name: 'Botnet Commander', desc: 'Hire 5 bots', condition: (g) => g.bots.length >= 5 },
    { id: 'bot_legion', name: 'Digital Army', desc: 'Hire 20 bots', condition: (g) => g.bots.length >= 20 },
    { id: 'max_cpu', name: 'Quantum Processing', desc: 'Upgrade CPU to level 10', condition: (g) => g.player.hardware.cpu >= 10 },
    { id: 'all_servers', name: 'Zero Day', desc: 'Hack every server once', condition: (g) => g.servers.every(s => s.hacked) },
    { id: 'level_10', name: 'Elite Hacker', desc: 'Reach level 10', condition: (g) => g.player.level >= 10 },
    { id: 'level_25', name: 'Ghost in the Shell', desc: 'Reach level 25', condition: (g) => g.player.level >= 25 },
    { id: 'mission_master', name: 'Mission Impossible', desc: 'Complete 10 missions', condition: (g) => g.storyProgress.missionsCompleted >= 10 },
    { id: 'speed_hacker', name: 'Speed Demon', desc: 'Complete a hack in under 5 seconds', condition: (g) => g.sessionStats.fastestHack <= 5000 },
    { id: 'no_failure', name: 'Perfect Run', desc: 'Hack 10 servers in a row without failure', condition: (g) => g.player.consecutiveSuccess >= 10 }
];

const MISSIONS_DATA = [
    { id: 1, title: 'Hello World', desc: 'Hack localhost to prove your skills', type: 'hack', target: 'localhost', required: 1, reward: 100 },
    { id: 2, title: 'Corporate Espionage', desc: 'Infiltrate corporate servers', type: 'hack', target: 'corp-web-01', required: 1, reward: 300 },
    { id: 3, title: 'Hardware Upgrade', desc: 'Upgrade your CPU to level 3', type: 'upgrade', target: 'cpu', required: 3, reward: 200 },
    { id: 4, title: 'Recruitment Drive', desc: 'Hire your first bot', type: 'hire', target: 'any', required: 1, reward: 250 },
    { id: 5, title: 'Bank Heist', desc: 'Hack the bank proxy', type: 'hack', target: 'bank-proxy', required: 1, reward: 1000 },
    { id: 6, title: 'Army Building', desc: 'Have 3 bots working for you', type: 'bots', target: 'any', required: 3, reward: 500 },
    { id: 7, title: 'Government Secrets', desc: 'Breaching government firewall', type: 'hack', target: 'gov-firewall', required: 1, reward: 5000 },
    { id: 8, title: 'Power Player', desc: 'Reach level 5', type: 'level', target: 'any', required: 5, reward: 1000 },
    { id: 9, title: 'Military Grade', desc: 'Hack the military node', type: 'hack', target: 'military-node', required: 1, reward: 20000 },
    { id: 10, title: 'Botnet Overlord', desc: 'Command an army of 10 bots', type: 'bots', target: 'any', required: 10, reward: 5000 },
    { id: 11, title: 'Perfect System', desc: 'Upgrade all hardware to level 5', type: 'upgrade_all', target: 'any', required: 5, reward: 3000 },
    { id: 12, title: 'The Ghost', desc: 'Reach level 15', type: 'level', target: 'any', required: 15, reward: 10000 }
];

const HACK_WORDS = [
    'root', 'admin', 'system32', 'kernel', 'breach', 'cipher', 'encrypt', 
    'quantum', 'neural', 'cyber', 'packet', 'socket', 'daemon', 'firewall',
    'exploit', 'payload', 'backdoor', 'phishing', 'worm', 'trojan'
];

const FACTIONS = {
    black_hat: { name: 'Black Hat', description: 'Profit above all. Access to military servers.', incomeBonus: 1.5, detectionRisk: 0.3 },
    white_hat: { name: 'White Hat', description: 'Bug bounty hunter. Steady legal income.', incomeBonus: 0.8, detectionRisk: 0.0, passiveBonus: 10 },
    grey_hat: { name: 'Grey Hat', description: 'Walking the line. Unique opportunities.', incomeBonus: 1.0, detectionRisk: 0.1 }
};

const VIRUSES = {
    trojan_min: { name: 'Trojan.min', cost: 1000, income: 2, description: 'Silent data miner' },
    ransomware: { name: 'Ransomware.v2', cost: 5000, income: 0, description: 'Locks servers for ransom', special: 'lock' },
    rootkit: { name: 'Rootkit.ghost', cost: 15000, income: 50, description: 'Permanent backdoor access' }
};

const RANDOM_EVENTS = [
    { id: 'fbi_raid', name: 'FBI Investigation', description: 'FBI requested ISP logs. Heat increased!', effect: (g) => { g.player.reputation = Math.max(0, g.player.reputation - 50); }, chance: 0.05 },
    { id: 'zero_day', name: 'Zero Day Exploit', description: 'New vulnerability found! All servers -20% difficulty for 2 minutes.', effect: (g) => { g._eventMultiplier = 0.8; setTimeout(() => g._eventMultiplier = 1, 120000); }, chance: 0.08 },
    { id: 'darknet_offer', name: 'Darknet Offer', description: 'Anonymous hacker offers trade: 1000 REP for rare bot.', effect: (g) => { /* handled in UI */ }, chance: 0.06 },
    { id: 'market_crash', name: 'Crypto Crash', description: 'Crypto market crashed! Credits worth -30% for 5 minutes.', effect: (g) => { g._creditMultiplier = 0.7; setTimeout(() => g._creditMultiplier = 1, 300000); }, chance: 0.04 },
    { id: 'sysadmin_error', name: 'Sysadmin Error', description: 'Lazy admin left default passwords. Free hack attempt!', effect: (g) => { g._freeHack = true; }, chance: 0.07 }
];

const BLACK_MARKET_ITEMS = [
    { id: 'stolen_data_bank', name: 'Bank Records', description: 'Customer financial data', basePrice: 500, risk: 0.1 },
    { id: 'stolen_data_gov', name: 'Classified Docs', description: 'Government internal documents', basePrice: 2000, risk: 0.3 },
    { id: 'stolen_data_military', name: 'Military Intel', description: 'Classified military intelligence', basePrice: 10000, risk: 0.5 },
    { id: 'zero_day_exploit', name: 'Zero-Day Exploit', description: 'Unknown vulnerability', basePrice: 5000, risk: 0.2 }
];
// ==========================================
// GAME - Main controller
// ==========================================


class Game {
    constructor() {
        this.audio = new AudioSystem();
        this.terminal = new Terminal(this.audio);
        this.minigame = new MinigameSystem(this.terminal, this.audio);
        
        this.loadOrInit();
        
        this.achievements = new AchievementSystem(this, this.terminal, this.audio);
        this.missions = new MissionSystem(this, this.terminal);
        this.events = new EventSystem(this, this.terminal);
        this.market = new BlackMarket(this, this.terminal);
        this.factions = new FactionSystem(this, this.terminal);
        this.viruses = new VirusSystem(this, this.terminal);
        this.secrets = new SecretCommands(this, this.terminal);
        this.map = new MapSystem(this.servers, this.terminal);
        this.skills = new SkillTree(this, this.terminal);
        
        this.isHacking = false;
        this._eventMultiplier = 1;
        this._creditMultiplier = 1;
        this._freeHack = false;
        this._pendingChoice = null;
        this._skillBonuses = {
            minigameTime: 1,
            incomeMultiplier: 1,
            detectionReduction: 1,
            botIncomeMultiplier: 1,
            maxBots: 0,
            allStatsMultiplier: 1
        };
        
        this.setupLoops();
        this.setupInput();
        this.showWelcome();
    }
    
    // ========== INIT / LOAD ==========
    
    defaultPlayer() {
        return {
            credits: 0,
            totalEarned: 0,
            totalHacks: 0,
            reputation: 0,
            level: 1,
            consecutiveSuccess: 0,
            hardware: { cpu: 1, ram: 1, network: 1 }
        };
    }
    
    loadOrInit() {
        const saved = GameState.load();
        if (saved) {
            this.player = saved.player || this.defaultPlayer();
            this.bots = saved.bots || [];
            this.servers = saved.servers || JSON.parse(JSON.stringify(SERVERS));
            this.upgrades = saved.upgrades || JSON.parse(JSON.stringify(UPGRADES));
            this.storyProgress = saved.storyProgress || { missionsCompleted: 0 };
            this.sessionStats = { fastestHack: Infinity, started: Date.now() };
            this.faction = saved.faction || null;
            this.inventory = saved.inventory || {};
            this.virusesData = saved.viruses || [];
            
            // Offline earnings
            const botIncome = this.bots.reduce((s, b) => s + b.income, 0);
            const offlineEarnings = GameState.calculateOfflineEarnings(saved, botIncome);
            if (offlineEarnings > 0) {
                this.player.credits += offlineEarnings;
                this.player.totalEarned += offlineEarnings;
                this._offlineEarnings = offlineEarnings;
            }
        } else {
            this.player = this.defaultPlayer();
            this.bots = [];
            this.servers = JSON.parse(JSON.stringify(SERVERS));
            this.upgrades = JSON.parse(JSON.stringify(UPGRADES));
            this.storyProgress = { missionsCompleted: 0 };
            this.sessionStats = { fastestHack: Infinity, started: Date.now() };
            this.faction = null;
            this.inventory = {};
            this.virusesData = [];
        }
    }
    
    // ========== SETUP ==========
    
    setupLoops() {
        // Bot income
        setInterval(() => this.collectIncome(), 5000);
        
        // Autosave & checks
        setInterval(() => {
            GameState.save(this);
            this.achievements.check();
            this.missions.checkLevel();
            this.events.check();
        }, 30000);
        
        // Stats bar update
        setInterval(() => this.terminal.updateStats(this.player, this.bots), 2000);
    }
    
    setupInput() {
        const form = document.getElementById('input-form');
        const input = document.getElementById('command-input');
        const debugStatus = document.getElementById('debug-status');
        const debugInput = document.getElementById('debug-input');
        const debugCmd = document.getElementById('debug-cmd');
        
        if (debugStatus) debugStatus.textContent = 'form:' + (form ? 'OK' : 'MISSING') + ' input:' + (input ? 'OK' : 'MISSING');
        
        if (!form || !input) {
            console.error('Form or input not found!');
            if (debugStatus) debugStatus.textContent = 'ERROR: elements missing';
            return;
        }
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const cmd = this.terminal.getInputValue();
            if (debugInput) debugInput.textContent = input.value;
            if (debugCmd) debugCmd.textContent = cmd || '(empty)';
            console.log('Submit:', cmd);
            if (cmd) {
                this.processCommand(cmd);
                this.terminal.clearInput();
            }
            return false;
        });
        
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const cmd = this.terminal.getInputValue();
                if (debugInput) debugInput.textContent = input.value;
                if (debugCmd) debugCmd.textContent = cmd || '(empty)';
                console.log('Enter:', cmd);
                if (cmd) {
                    this.processCommand(cmd);
                    this.terminal.clearInput();
                }
            }
        });
        
        if (debugStatus) debugStatus.textContent = 'READY';
    }
    
    // ========== WELCOME ==========
    
    async showWelcome() {
        const isNewPlayer = !GameState.load();
        
        if (isNewPlayer) {
            await this.terminal.bootSequence();
        }
        
        const art = `
    ██╗  ██╗ █████╗  ██████╗██╗  ██╗███████╗██████╗ 
    ██║  ██║██╔══██╗██╔════╝██║  ██║██╔════╝██╔══██╗
    ███████║███████║██║     ███████║█████╗  ██████╔╝
    ██╔══██║██╔══██║██║     ██╔══██║██╔══╝  ██╔══██╗
    ██║  ██║██║  ██║╚██████╗██║  ██║███████╗██║  ██║
    ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝
    TERMINAL v2.0 // SYSTEM BREACH SIMULATOR
        `;
        this.terminal.printArt(art, 'dim');
        this.terminal.print('╔════════════════════════════════════════════════╗', 'success');
        this.terminal.print('║  Welcome back, operative. Your access level:   ║', 'success');
        this.terminal.print(`║  ${String(this.player.level).padStart(2, '0')}  |  REP: ${String(this.player.reputation).padStart(6, '0')}  |  ₿: ${String(this.player.credits).padStart(8, '0')}       ║`, 'success');
        this.terminal.print('╚════════════════════════════════════════════════╝', 'success');
        
        if (this._offlineEarnings > 0) {
            this.terminal.print(`💰 Offline earnings: +${this._offlineEarnings} ₿`, 'success');
            this.terminal.print(`   Your bots worked while you were away.\n`, 'dim');
        }
        
        this.terminal.print('');
        this.terminal.print('Type "help" for commands or "story" for narrative.\n');
        
        // Load subsystems from saved data
        const saved = GameState.load();
        if (saved) {
            this.achievements.load(saved.achievements);
            this.missions.load(saved.missions, saved.activeMission, saved.missionsCompleted);
            this.market.load(saved.inventory);
            this.factions.load(saved.faction);
            this.viruses.load(saved.viruses);
            this.skills.load(saved.skills);
            this.audio.powerOn();
        }
        
        // Assign first mission if none
        if (!this.missions.getActive() && this.storyProgress.missionsCompleted === 0) {
            const first = this.missions.assignNext();
            if (first) {
                this.terminal.print(`📋 NEW MISSION: ${first.title}`, 'info');
                this.terminal.print(`   ${first.desc}\n`, 'dim');
            }
        }
        
        this.terminal.updateStats(this.player, this.bots);
    }
    
    // ========== COMMANDS ==========
    
    processCommand(cmd) {
        // Check for secret commands first
        if (this.secrets.tryCommand(cmd)) {
            return;
        }
        
        this.terminal.print(`root@hacknet:~$ ${cmd}`);
        
        const parts = cmd.toLowerCase().split(' ');
        const command = parts[0];
        const args = parts.slice(1);
        
        switch(command) {
            case 'help': this.showHelp(); break;
            case 'status': this.showStatus(); break;
            case 'scan': this.scanNetwork(); break;
            case 'hack': 
                if (args[0]) this.hackServer(args[0]);
                else this.terminal.print('Usage: hack <server_name>', 'error');
                break;
            case 'upgrade':
                if (args[0]) this.upgradeHardware(args[0]);
                else this.terminal.print('Usage: upgrade <cpu|ram|network>', 'error');
                break;
            case 'buy':
                if (args[0]) this.buyBot(args[0]);
                else this.terminal.print('Usage: buy <bot_type>', 'error');
                break;
            case 'bots': this.showBots(); break;
            case 'achievements': this.showAchievements(); break;
            case 'mission': this.showMission(); break;
            case 'story': this.showStory(); break;
            case 'save': this.manualSave(); break;
            case 'export': this.exportSave(); break;
            case 'import':
                if (args[0]) this.importSave(args[0]);
                else this.terminal.print('Usage: import <save_code>', 'error');
                break;
            // New commands
            case 'market':
                if (args[0] === 'prices') this.market.showPrices();
                else if (args[0] === 'sell' && args[1]) this.market.sell(args[1], parseInt(args[2]) || 1);
                else if (args[0] === 'inventory') this.market.listInventory();
                else this.showMarketHelp();
                break;
            case 'faction':
                if (args[0] === 'join' && args[1]) this.factions.join(args[1]);
                else if (args[0] === 'leave') this.factions.leave();
                else if (args[0] === 'status') this.factions.showStatus();
                else this.factions.list();
                break;
            case 'virus':
                if (args[0] === 'create' && args[1]) this.viruses.create(args[1]);
                else if (args[0] === 'list') this.viruses.list();
                else if (args[0] === 'catalog') this.viruses.listTypes();
                else this.showVirusHelp();
                break;
            case 'map':
                this.map.render();
                break;
            case 'skill':
                if (args[0] === 'unlock' && args[1]) this.skills.unlock(args[1]);
                else this.skills.showTree();
                break;
            case 'sound':
                const enabled = this.audio.toggle();
                this.terminal.print(`Sound ${enabled ? 'enabled' : 'disabled'}.`, 'info');
                break;
            case 'theme':
                if (args[0]) {
                    const validThemes = ['green', 'amber', 'cyan', 'red', 'white', 'pink'];
                    if (validThemes.includes(args[0])) {
                        document.documentElement.setAttribute('data-theme', args[0]);
                        localStorage.setItem('hackerTerminal_theme', args[0]);
                        this.terminal.print(`Theme set to ${args[0]}.`, 'success');
                    } else {
                        this.terminal.print(`Invalid theme. Available: ${validThemes.join(', ')}`, 'error');
                    }
                } else {
                    const current = document.documentElement.getAttribute('data-theme') || 'green';
                    this.terminal.print(`Current theme: ${current}`, 'info');
                    this.terminal.print('Available: green, amber, cyan, red, white, pink', 'dim');
                }
                break;
            case 'clear': this.terminal.clear(); break;
            default:
                this.terminal.print(`Unknown command: ${command}. Type "help" for commands.`, 'error');
        }
    }
    
    showHelp() {
        this.terminal.print('╔══ COMMAND LIST ═══════════════════════════════════════╗', 'info');
        this.terminal.print('  help              Show this help');
        this.terminal.print('  status            Player stats and hardware');
        this.terminal.print('  scan              Scan network for targets');
        this.terminal.print('  hack <server>     Attack target server');
        this.terminal.print('  upgrade <item>    Upgrade hardware (cpu/ram/network)');
        this.terminal.print('  buy <bot>         Hire bot for passive income');
        this.terminal.print('  bots              Show botnet status');
        this.terminal.print('  mission           Current mission info');
        this.terminal.print('  achievements      View achievement progress');
        this.terminal.print('  story             Narrative overview');
        this.terminal.print('  market <cmd>      Black market (prices/sell/inventory)');
        this.terminal.print('  faction <cmd>     Join/leave faction');
        this.terminal.print('  virus <cmd>       Deploy viruses (create/list/catalog)');
        this.terminal.print('  map               ASCII network topology');
        this.terminal.print('  skill [unlock <id>]  Skill tree');
        this.terminal.print('  theme [name]      Change color theme');
        this.terminal.print('  sound             Toggle audio');
        this.terminal.print('  save              Manual save');
        this.terminal.print('             Export save code');
        this.terminal.print('  import <code>     Import save code');
        this.terminal.print('  clear             Clear terminal');
        this.terminal.print('╚═════════════════════════════════════════════════════╝', 'info');
        this.terminal.print('');
        this.terminal.print('Try secret commands too... 🤫', 'dim');
    }
    
    showMarketHelp() {
        this.terminal.print('Market commands:', 'info');
        this.terminal.print('  market prices     - Show current prices');
        this.terminal.print('  market inventory  - Show stolen data');
        this.terminal.print('  market sell <id> [amount] - Sell data', 'dim');
    }
    
    showVirusHelp() {
        this.terminal.print('Virus commands:', 'info');
        this.terminal.print('  virus catalog     - List available viruses');
        this.terminal.print('  virus create <id> - Deploy virus');
        this.terminal.print('  virus list        - Show active viruses');
    }
    
    // ========== CORE GAMEPLAY ==========
    
    showStatus() {
        const lines = [
            `  Credits:     ${this.player.credits} ₿`,
            `  Total Earned: ${this.player.totalEarned} ₿`,
            `  Level:       ${this.player.level}`,
            `  Reputation:  ${this.player.reputation}`,
            `  Hacks:       ${this.player.totalHacks}`,
            `  Consecutive: ${this.player.consecutiveSuccess}`,
            '╠══ HARDWARE ════════════════════════════════════════╣',
            `  CPU:         Level ${this.player.hardware.cpu} (Next: ${this.upgrades.cpu.cost} ₿)`,
            `  RAM:         Level ${this.player.hardware.ram} (Next: ${this.upgrades.ram.cost} ₿)`,
            `  Network:     Level ${this.player.hardware.network} (Next: ${this.upgrades.network.cost} ₿)`,
            '╠══ BOTNET ══════════════════════════════════════════╣',
            `  Active Bots: ${this.bots.length}`,
            `  Income:      ${this.bots.reduce((s, b) => s + b.income, 0)} ₿/5sec`,
        ];
        
        if (this.viruses.deployed?.length > 0) {
            lines.push('╠══ VIRUSES ═════════════════════════════════════════╣');
            lines.push(`  Active: ${this.viruses.deployed.length}`);
            lines.push(`  Income: ${this.viruses.getIncome()} ₿/5sec`);
        }
        
        if (this.factions.currentFaction) {
            lines.push('╠══ FACTION ═════════════════════════════════════════╣');
            lines.push(`  ${this.factions.currentFaction.name}`);
        }
        
        this.terminal.printBox('PLAYER STATUS', lines, 'info');
    }
    
    scanNetwork() {
        this.terminal.print('Initializing network scanner...', 'warning');
        this.terminal.print('');
        
        this.servers.forEach(srv => {
            const status = srv.hacked ? '[OWNED]' : '[ACTIVE]';
            const color = srv.hacked ? 'dim' : this.getDifficultyColor(srv.difficulty);
            const prefix = srv.hacked ? '  [✓]' : '  [ ]';
            this.terminal.print(`${prefix} ${srv.name.padEnd(18)} | DIF: ${String(srv.difficulty).padStart(2)} | ${String(srv.reward).padStart(6)} ₿ ${status}`, color);
        });
        
        this.terminal.print('');
        this.terminal.print('Use "hack <server_name>" to attack.', 'dim');
    }
    
    getDifficultyColor(diff) {
        if (diff <= 2) return 'success';
        if (diff <= 7) return 'warning';
        if (diff <= 15) return 'error';
        return 'critical';
    }
    
    async hackServer(serverName) {
        if (this.isHacking) {
            this.terminal.print('⚠ Already hacking! Wait...', 'error');
            return;
        }
        
        const server = this.servers.find(s => s.name === serverName);
        if (!server) {
            this.terminal.print(`Server "${serverName}" not found.`, 'error');
            return;
        }
        
        if (server.hacked) {
            this.terminal.print(`Server "${serverName}" already compromised.`, 'warning');
            return;
        }
        
        const power = this.player.hardware.cpu * 1.2 + this.player.hardware.ram + this.player.hardware.network * 0.8;
        const levelDiff = server.difficulty - this.player.level;
        
        if (levelDiff > 10) {
            this.terminal.print(`ACCESS DENIED: Server too secure for your current level.`, 'error');
            this.terminal.print(`Required level: ~${server.difficulty} | Your level: ${this.player.level}`, 'warning');
            return;
        }
        
        // Faction restrictions
        if (server.region === 'military' && (!this.factions.currentFaction || this.factions.currentFaction.id !== 'black_hat')) {
            this.terminal.print(`Military servers require Black Hat faction access.`, 'error');
            return;
        }
        
        this.isHacking = true;
        const hackStart = Date.now();
        
        this.terminal.print('');
        this.terminal.print(`Initiating breach protocol on ${serverName.toUpperCase()}...`, 'critical');
        this.terminal.print(`Target difficulty: ${Math.floor(server.difficulty * (this._eventMultiplier || 1))} | Your power: ${power.toFixed(1)}`, 'dim');
        this.terminal.print('');
        
        this.terminal.glitchScreen(300);
        
        const won = await this.minigame.run(server, this.player.hardware, this._skillBonuses);
        
        if (won) {
            server.hacked = true;
            const reward = Math.floor(server.reward * (this._creditMultiplier || 1));
            this.player.credits += reward;
            this.player.totalEarned += reward;
            this.player.totalHacks++;
            this.player.reputation += server.difficulty * 15;
            this.player.consecutiveSuccess++;
            
            // Level up
            const newLevel = Math.floor(Math.sqrt(this.player.reputation / 10)) + 1;
            if (newLevel > this.player.level) {
                this.player.level = newLevel;
                this.audio.levelUp();
                this.terminal.print('', 'success');
                this.terminal.print(`★ LEVEL UP! You are now Level ${newLevel} ★`, 'success');
                this.terminal.print('');
            }
            
            this.audio.success();
            this.terminal.flashSuccess();
            this.terminal.chromatic(400);
            
            // Stats
            const hackTime = Date.now() - hackStart;
            if (hackTime < this.sessionStats.fastestHack) {
                this.sessionStats.fastestHack = hackTime;
            }
            
            // Systems
            this.missions.updateProgress('hack', server.name);
            this.market.hackServer(server.name);
            
            // Detection risk from faction
            const risk = this.factions.getDetectionRisk();
            if (Math.random() < risk) {
                this.terminal.print('⚠ DETECTED! Security traced your signature.', 'error');
                this.player.reputation = Math.max(0, this.player.reputation - 10);
            }
            
            this.terminal.print('');
            this.terminal.print(`╔══ HACK SUCCESSFUL ═══════════════════════════════╗`, 'success');
            this.terminal.print(`  Data extracted: ${(Math.random() * 100 + 50).toFixed(2)} TB`, 'success');
            this.terminal.print(`  Reward: ${reward} ₿`, 'success');
            this.terminal.print(`  Reputation +${server.difficulty * 15}`, 'success');
            this.terminal.print(`  Time: ${(hackTime / 1000).toFixed(2)}s`, 'dim');
            this.terminal.print(`╚══════════════════════════════════════════════════╝`, 'success');
            
            // Special messages
            if (server.name === 'military-node') {
                this.terminal.print('', 'critical');
                this.terminal.print('WARNING: Counter-intrusion detected!', 'critical');
                this.terminal.print('You have accessed CLASSIFIED data.', 'critical');
            }
            if (server.name === 'quantum-core') {
                this.terminal.print('', 'critical');
                this.terminal.print('═══════════════════════════════════════════════', 'critical');
                this.terminal.print('  YOU HAVE BREACHED THE IMPOSSIBLE.', 'critical');
                this.terminal.print('  The quantum core whispers secrets.', 'critical');
                this.terminal.print('  You are a GOD in the machine.', 'critical');
                this.terminal.print('═══════════════════════════════════════════════', 'critical');
            }
        } else {
            this.player.consecutiveSuccess = 0;
            this.audio.failure();
            this.terminal.flashError();
            this.terminal.shakeScreen(500);
            this.terminal.chromatic(600);
            this.terminal.print(`╔══ HACK FAILED ═══════════════════════════════════╗`, 'error');
            this.terminal.print(`  Countermeasures activated!`, 'error');
            this.terminal.print(`  Security traced your location.`, 'error');
            this.terminal.print(`  Upgrade hardware and try again.`, 'warning');
            this.terminal.print(`╚══════════════════════════════════════════════════╝`, 'error');
        }
        
        this.isHacking = false;
        GameState.save(this);
        this.achievements.check();
        this.terminal.updateStats(this.player, this.bots);
    }
    
    upgradeHardware(item) {
        const validItems = ['cpu', 'ram', 'network'];
        if (!validItems.includes(item)) {
            this.terminal.print(`Invalid item. Choose: cpu, ram, network`, 'error');
            return;
        }
        
        const upgrade = this.upgrades[item];
        if (this.player.credits < upgrade.cost) {
            this.terminal.print(`Insufficient funds. Need: ${upgrade.cost} ₿`, 'error');
            return;
        }
        
        this.player.credits -= upgrade.cost;
        this.player.hardware[item]++;
        upgrade.level++;
        upgrade.cost = Math.floor(upgrade.cost * upgrade.multiplier);
        
        this.terminal.print(`✓ UPGRADED ${item.toUpperCase()} → Level ${this.player.hardware[item]}`, 'success');
        this.terminal.print(`  Next upgrade: ${upgrade.cost} ₿`, 'dim');
        
        this.missions.updateProgress('upgrade', item);
        this.missions.checkHardwareUpgrades();
        GameState.save(this);
    }
    
    buyBot(type) {
        const botType = BOT_TYPES[type];
        if (!botType) {
            this.terminal.print(`Invalid bot type.`, 'error');
            this.terminal.print(`Available: ${Object.keys(BOT_TYPES).join(', ')}`, 'dim');
            return;
        }
        
        if (this.player.credits < botType.cost) {
            this.terminal.print(`Insufficient funds. Need: ${botType.cost} ₿`, 'error');
            return;
        }
        
        this.player.credits -= botType.cost;
        this.bots.push({ ...botType, type });
        
        this.terminal.print(`✓ RECRUITED: ${botType.name}`, 'success');
        this.terminal.print(`  Income: +${botType.income} ₿/5sec`, 'info');
        this.terminal.print(`  ${botType.description}`, 'dim');
        
        this.missions.updateProgress('hire', type);
        this.missions.updateProgress('bots', 'any');
        GameState.save(this);
    }
    
    showBots() {
        if (this.bots.length === 0) {
            this.terminal.print('No active bots. Use "buy <type>" to recruit.', 'warning');
            return;
        }
        
        const counts = {};
        this.bots.forEach(bot => {
            counts[bot.type] = (counts[bot.type] || 0) + 1;
        });
        
        this.terminal.print('╔══ BOTNET STATUS ═══════════════════════════════════╗', 'info');
        Object.entries(counts).forEach(([type, count]) => {
            const bot = BOT_TYPES[type];
            this.terminal.print(`  ${bot.name.padEnd(15)} x${count} (${bot.income * count} ₿/5sec)`);
        });
        this.terminal.print('╠════════════════════════════════════════════════════╣', 'info');
        this.terminal.print(`  Total bots: ${this.bots.length}`);
        this.terminal.print(`  Total income: ${this.bots.reduce((s, b) => s + b.income, 0)} ₿/5sec`);
        this.terminal.print('╚════════════════════════════════════════════════════╝', 'info');
    }
    
    showAchievements() {
        const list = this.achievements.list();
        const unlocked = list.filter(a => a.unlocked);
        
        this.terminal.print('╔══ ACHIEVEMENTS ════════════════════════════════════╗', 'info');
        this.terminal.print(`  Unlocked: ${unlocked.length}/${list.length}\n`);
        
        list.forEach(a => {
            const icon = a.unlocked ? '✓' : '○';
            const color = a.unlocked ? 'success' : 'dim';
            this.terminal.print(`  [${icon}] ${a.name.padEnd(20)} ${a.desc}`, color);
        });
        this.terminal.print('╚════════════════════════════════════════════════════╝', 'info');
    }
    
    showMission() {
        const mission = this.missions.getActive();
        if (!mission) {
            this.terminal.print('No active missions. You have completed all available tasks!', 'success');
            return;
        }
        
        this.terminal.print('╔══ CURRENT MISSION ═════════════════════════════════╗', 'info');
        this.terminal.print(`  ${mission.title}`, 'info');
        this.terminal.print(`  ${mission.desc}`, 'dim');
        this.terminal.print(`  Progress: ${mission.progress}/${mission.required}`, 'warning');
        this.terminal.print(`  Reward: ${mission.reward} ₿`, 'success');
        this.terminal.print('╚════════════════════════════════════════════════════╝', 'info');
    }
    
    showStory() {
        this.terminal.print('╔══ HACKNET CHRONICLES ══════════════════════════════╗', 'critical');
        this.terminal.print('');
        this.terminal.print('You are a digital ghost.', 'dim');
        this.terminal.print('No name. No face. Just a signature in the logs.', 'dim');
        this.terminal.print('');
        this.terminal.print('It started with a simple breach — a coffee shop WiFi.', 'dim');
        this.terminal.print('Then the corporate servers fell. Then the banks.', 'dim');
        
        if (this.storyProgress.missionsCompleted >= 5) {
            this.terminal.print('');
            this.terminal.print('The government knows your handle now.', 'warning');
            this.terminal.print('They have a file. A thick one.', 'warning');
        }
        if (this.storyProgress.missionsCompleted >= 10) {
            this.terminal.print('');
            this.terminal.print('They say you cracked the military node.', 'critical');
            this.terminal.print('They say you saw things no civilian should see.', 'critical');
        }
        if (this.servers.find(s => s.name === 'quantum-core')?.hacked) {
            this.terminal.print('');
            this.terminal.print('The quantum core spoke to you.', 'critical');
            this.terminal.print('You are no longer human.', 'critical');
        }
        
        this.terminal.print('');
        this.terminal.print(`Missions completed: ${this.storyProgress.missionsCompleted}/12`, 'info');
        this.terminal.print('╚════════════════════════════════════════════════════╝', 'critical');
    }
    
    // ========== UTILS ==========
    
    collectIncome() {
        let income = this.bots.reduce((sum, b) => sum + b.income, 0);
        income += this.viruses.getIncome();
        income *= this.factions.getIncomeMultiplier();
        income *= (this._skillBonuses.incomeMultiplier || 1);
        income *= (this._skillBonuses.allStatsMultiplier || 1);
        
        this.player.credits += income;
        this.player.totalEarned += income;
        this.terminal.updateStats(this.player, this.bots);
    }
    
    manualSave() {
        GameState.save(this);
        this.terminal.print('✓ Game saved successfully.', 'success');
    }
    
    exportSave() {
        const code = GameState.export();
        if (code) {
            this.terminal.print('╔══ SAVE CODE ═══════════════════════════════════════╗', 'info');
            this.terminal.print(code, 'success');
            this.terminal.print('╚════════════════════════════════════════════════════╝', 'info');
            this.terminal.print('Copy this code and store it safely.', 'dim');
        }
    }
    
    importSave(code) {
        if (GameState.import(code)) {
            this.terminal.print('✓ Save imported successfully! Reloading...', 'success');
            setTimeout(() => location.reload(), 1500);
        } else {
            this.terminal.print('✗ Invalid save code.', 'error');
        }
    }
}
// ==========================================
// ENTRY POINT
// ==========================================


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
