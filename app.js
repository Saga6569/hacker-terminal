// ==========================================
// HACKER TERMINAL v2.0
// Idle hacking game with CRT aesthetics
// ==========================================

class GameState {
    static save(game) {
        const data = {
            player: game.player,
            bots: game.bots,
            servers: game.servers,
            upgrades: game.upgrades,
            achievements: game.achievements,
            missions: game.missions,
            storyProgress: game.storyProgress,
            sessionStats: game.sessionStats,
            timestamp: Date.now()
        };
        localStorage.setItem('hackerTerminal_save', JSON.stringify(data));
    }
    
    static load() {
        const data = localStorage.getItem('hackerTerminal_save');
        return data ? JSON.parse(data) : null;
    }
    
    static clear() {
        localStorage.removeItem('hackerTerminal_save');
    }
    
    static export() {
        const data = localStorage.getItem('hackerTerminal_save');
        return data ? btoa(data) : null;
    }
    
    static import(base64) {
        try {
            const data = atob(base64);
            JSON.parse(data); // validate
            localStorage.setItem('hackerTerminal_save', data);
            return true;
        } catch {
            return false;
        }
    }
}

class AchievementSystem {
    constructor(game) {
        this.game = game;
        this.achievements = [
            { id: 'first_hack', name: 'Script Kiddie', desc: 'Complete your first hack', condition: () => game.player.totalHacks >= 1, unlocked: false },
            { id: 'hacker_10', name: 'Rising Threat', desc: 'Hack 10 servers', condition: () => game.player.totalHacks >= 10, unlocked: false },
            { id: 'hacker_50', name: 'Cyber Criminal', desc: 'Hack 50 servers', condition: () => game.player.totalHacks >= 50, unlocked: false },
            { id: 'rich_1k', name: 'First Thousand', desc: 'Earn 1,000 credits', condition: () => game.player.totalEarned >= 1000, unlocked: false },
            { id: 'rich_10k', name: 'Crypto Millionaire', desc: 'Earn 10,000 credits', condition: () => game.player.totalEarned >= 10000, unlocked: false },
            { id: 'rich_100k', name: 'Digital Kingpin', desc: 'Earn 100,000 credits', condition: () => game.player.totalEarned >= 100000, unlocked: false },
            { id: 'bot_army', name: 'Botnet Commander', desc: 'Hire 5 bots', condition: () => game.bots.length >= 5, unlocked: false },
            { id: 'bot_legion', name: 'Digital Army', desc: 'Hire 20 bots', condition: () => game.bots.length >= 20, unlocked: false },
            { id: 'max_cpu', name: 'Quantum Processing', desc: 'Upgrade CPU to level 10', condition: () => game.player.hardware.cpu >= 10, unlocked: false },
            { id: 'all_servers', name: 'Zero Day', desc: 'Hack every server once', condition: () => game.servers.every(s => s.hacked), unlocked: false },
            { id: 'level_10', name: 'Elite Hacker', desc: 'Reach level 10', condition: () => game.player.level >= 10, unlocked: false },
            { id: 'level_25', name: 'Ghost in the Shell', desc: 'Reach level 25', condition: () => game.player.level >= 25, unlocked: false },
            { id: 'mission_master', name: 'Mission Impossible', desc: 'Complete 10 missions', condition: () => game.storyProgress.missionsCompleted >= 10, unlocked: false },
            { id: 'speed_hacker', name: 'Speed Demon', desc: 'Complete a hack in under 5 seconds', condition: () => game.sessionStats.fastestHack <= 5000, unlocked: false },
            { id: 'no_failure', name: 'Perfect Run', desc: 'Hack 10 servers in a row without failure', condition: () => game.player.consecutiveSuccess >= 10, unlocked: false }
        ];
    }
    
    check() {
        let newUnlocks = [];
        this.achievements.forEach(ach => {
            if (!ach.unlocked && ach.condition()) {
                ach.unlocked = true;
                newUnlocks.push(ach);
                this.showPopup(ach);
            }
        });
        return newUnlocks;
    }
    
    showPopup(achievement) {
        const popup = document.getElementById('achievement-popup');
        popup.querySelector('.achievement-title').textContent = `🏆 ${achievement.name}`;
        popup.querySelector('.achievement-desc').textContent = achievement.desc;
        popup.classList.add('show');
        
        setTimeout(() => popup.classList.remove('show'), 4000);
    }
    
    list() {
        return this.achievements.map(a => ({
            name: a.name,
            desc: a.desc,
            unlocked: a.unlocked
        }));
    }
}

class MissionSystem {
    constructor(game) {
        this.game = game;
        this.missions = [
            { id: 1, title: 'Hello World', desc: 'Hack localhost to prove your skills', type: 'hack', target: 'localhost', required: 1, reward: 100, completed: false },
            { id: 2, title: 'Corporate Espionage', desc: 'Infiltrate corporate servers', type: 'hack', target: 'corp-web-01', required: 1, reward: 300, completed: false },
            { id: 3, title: 'Hardware Upgrade', desc: 'Upgrade your CPU to level 3', type: 'upgrade', target: 'cpu', required: 3, reward: 200, completed: false },
            { id: 4, title: 'Recruitment Drive', desc: 'Hire your first bot', type: 'hire', target: 'any', required: 1, reward: 250, completed: false },
            { id: 5, title: 'Bank Heist', desc: 'Hack the bank proxy', type: 'hack', target: 'bank-proxy', required: 1, reward: 1000, completed: false },
            { id: 6, title: 'Army Building', desc: 'Have 3 bots working for you', type: 'bots', target: 'any', required: 3, reward: 500, completed: false },
            { id: 7, title: 'Government Secrets', desc: 'Breaching government firewall', type: 'hack', target: 'gov-firewall', required: 1, reward: 5000, completed: false },
            { id: 8, title: 'Power Player', desc: 'Reach level 5', type: 'level', target: 'any', required: 5, reward: 1000, completed: false },
            { id: 9, title: 'Military Grade', desc: 'Hack the military node', type: 'hack', target: 'military-node', required: 1, reward: 20000, completed: false },
            { id: 10, title: 'Botnet Overlord', desc: 'Command an army of 10 bots', type: 'bots', target: 'any', required: 10, reward: 5000, completed: false },
            { id: 11, title: 'Perfect System', desc: 'Upgrade all hardware to level 5', type: 'upgrade_all', target: 'any', required: 5, reward: 3000, completed: false },
            { id: 12, title: 'The Ghost', desc: 'Reach level 15', type: 'level', target: 'any', required: 15, reward: 10000, completed: false }
        ];
        this.activeMission = null;
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
            this.game.player.credits += m.reward;
            this.game.player.reputation += 50;
            this.game.storyProgress.missionsCompleted++;
            this.game.print(`\n╔══ MISSION COMPLETE ═════════════════╗`, 'success');
            this.game.print(`  ${m.title}`, 'success');
            this.game.print(`  Reward: ${m.reward} ₿`, 'success');
            this.game.print(`  Reputation +50`, 'success');
            this.game.print(`╚═════════════════════════════════════╝\n`, 'success');
            this.activeMission = null;
            
            // Assign next mission after delay
            setTimeout(() => {
                const next = this.assignNext();
                if (next) {
                    this.game.print(`📋 NEW MISSION: ${next.title}`, 'info');
                    this.game.print(`   ${next.desc}\n`, 'dim');
                }
            }, 2000);
        }
    }
    
    checkHardwareUpgrades() {
        if (!this.activeMission) return;
        if (this.activeMission.type === 'upgrade_all') {
            const { cpu, ram, network } = this.game.player.hardware;
            if (cpu >= this.activeMission.required && 
                ram >= this.activeMission.required && 
                network >= this.activeMission.required) {
                this.completeMission(this.activeMission);
            }
        }
    }
}

class HackerGame {
    constructor() {
        this.loadGame();
        this.achievements = new AchievementSystem(this);
        this.missions = new MissionSystem(this);
        
        this.output = document.getElementById('output');
        this.input = document.getElementById('command-input');
        this.statsBar = document.getElementById('stats-bar');
        
        this.isHacking = false;
        this.currentMinigame = null;
        this.autosaveInterval = null;
        
        this.init();
    }
    
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
    
    defaultServers() {
        return [
            { name: 'localhost', difficulty: 1, reward: 50, hacked: false, type: 'tutorial', description: 'Your own machine - practice target' },
            { name: 'coffee-shop-wifi', difficulty: 1, reward: 75, hacked: false, type: 'easy', description: 'Unsecured public network' },
            { name: 'school-server', difficulty: 2, reward: 120, hacked: false, type: 'easy', description: 'University database server' },
            { name: 'corp-web-01', difficulty: 3, reward: 200, hacked: false, type: 'medium', description: 'Corporate web server' },
            { name: 'start-up-db', difficulty: 4, reward: 350, hacked: false, type: 'medium', description: 'Tech startup database' },
            { name: 'bank-proxy', difficulty: 7, reward: 800, hacked: false, type: 'hard', description: 'Regional bank proxy server' },
            { name: 'pharma-lab', difficulty: 10, reward: 1500, hacked: false, type: 'hard', description: 'Pharmaceutical research lab' },
            { name: 'gov-firewall', difficulty: 15, reward: 3000, hacked: false, type: 'extreme', description: 'Government security firewall' },
            { name: 'military-node', difficulty: 25, reward: 10000, hacked: false, type: 'extreme', description: 'Classified military node' },
            { name: 'quantum-core', difficulty: 50, reward: 50000, hacked: false, type: 'impossible', description: 'Experimental quantum computer - THE FINAL TARGET' }
        ];
    }
    
    defaultUpgrades() {
        return {
            cpu: { cost: 100, multiplier: 1.6, level: 1 },
            ram: { cost: 150, multiplier: 1.5, level: 1 },
            network: { cost: 200, multiplier: 1.55, level: 1 }
        };
    }
    
    defaultBotTypes() {
        return {
            script_kiddie: { name: 'Script Kiddie', cost: 500, income: 5, interval: 5000, description: 'Basic automated scripts' },
            hacktivist: { name: 'Hacktivist', cost: 2500, income: 30, interval: 5000, description: 'Motivated amateur' },
            black_hat: { name: 'Black Hat', cost: 12000, income: 180, interval: 5000, description: 'Professional mercenary' },
            ai_core: { name: 'AI Core', cost: 50000, income: 1000, interval: 5000, description: 'Autonomous hacking AI' }
        };
    }
    
    loadGame() {
        const saved = GameState.load();
        if (saved) {
            this.player = saved.player || this.defaultPlayer();
            this.bots = saved.bots || [];
            this.servers = saved.servers || this.defaultServers();
            this.upgrades = saved.upgrades || this.defaultUpgrades();
            this.storyProgress = saved.storyProgress || { missionsCompleted: 0 };
            this.sessionStats = saved.sessionStats || { fastestHack: Infinity, started: Date.now() };
            
            // Calculate offline earnings
            const offline = Date.now() - saved.timestamp;
            const offlineSeconds = offline / 1000;
            const botIncome = this.bots.reduce((sum, b) => sum + b.income, 0);
            const offlineEarnings = Math.floor(botIncome * (offlineSeconds / 5));
            const maxOffline = 3600; // max 1 hour worth
            const earned = Math.min(offlineEarnings, maxOffline * botIncome / 5);
            
            if (earned > 0) {
                this.player.credits += earned;
                this.player.totalEarned += earned;
                this._offlineEarnings = earned;
            }
        } else {
            this.player = this.defaultPlayer();
            this.bots = [];
            this.servers = this.defaultServers();
            this.upgrades = this.defaultUpgrades();
            this.storyProgress = { missionsCompleted: 0 };
            this.sessionStats = { fastestHack: Infinity, started: Date.now() };
        }
    }
    
    init() {
        this.printWelcome();
        
        if (this._offlineEarnings > 0) {
            this.print(`💰 Offline earnings: +${this._offlineEarnings} ₿`, 'success');
            this.print(`   Your bots worked while you were away.\n`, 'dim');
        }
        
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const cmd = this.input.value.trim();
                if (cmd) {
                    this.processCommand(cmd);
                    this.input.value = '';
                }
            }
        });
        
        // Start loops
        setInterval(() => this.collectBotIncome(), 5000);
        this.autosaveInterval = setInterval(() => {
            GameState.save(this);
            this.achievements.check();
            this.checkMissionProgress();
        }, 30000); // autosave every 30s
        
        // Initial mission
        const firstMission = this.missions.assignNext();
        if (firstMission && this.storyProgress.missionsCompleted === 0) {
            this.print(`📋 NEW MISSION: ${firstMission.title}`, 'info');
            this.print(`   ${firstMission.desc}\n`, 'dim');
        }
        
        this.updateStatsBar();
        setInterval(() => this.updateStatsBar(), 2000);
    }
    
    printWelcome() {
        const art = `
    ██╗  ██╗ █████╗  ██████╗██╗  ██╗███████╗██████╗ 
    ██║  ██║██╔══██╗██╔════╝██║  ██║██╔════╝██╔══██╗
    ███████║███████║██║     ███████║█████╗  ██████╔╝
    ██╔══██║██╔══██║██║     ██╔══██║██╔══╝  ██╔══██╗
    ██║  ██║██║  ██║╚██████╗██║  ██║███████╗██║  ██║
    ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝
    TERMINAL v2.0 // SYSTEM BREACH SIMULATOR
        `;
        this.print(art, 'dim');
        this.print('╔════════════════════════════════════════════════╗', 'success');
        this.print('║  Welcome back, operative. Your access level:   ║', 'success');
        this.print(`║  ${this.player.level.toString().padStart(2, '0')}  |  REP: ${this.player.reputation.toString().padStart(6, '0')}  |  ₿: ${this.player.credits.toString().padStart(8, '0')}       ║`, 'success');
        this.print('╚════════════════════════════════════════════════╝', 'success');
        this.print('');
        this.print('Type "help" for commands or "story" for narrative.\n');
    }
    
    updateStatsBar() {
        if (!this.statsBar) return;
        this.statsBar.innerHTML = `
            <span class="stat-item">₿ ${this.player.credits}</span>
            <span class="stat-item">LVL ${this.player.level}</span>
            <span class="stat-item">REP ${this.player.reputation}</span>
            <span class="stat-item">HACKS ${this.player.totalHacks}</span>
        `;
    }
    
    print(text, type = '') {
        const line = document.createElement('div');
        line.className = `line ${type}`;
        line.textContent = text;
        this.output.appendChild(line);
        this.output.scrollTop = this.output.scrollHeight;
    }
    
    processCommand(cmd) {
        this.print(`root@hacknet:~$ ${cmd}`);
        
        const parts = cmd.toLowerCase().split(' ');
        const command = parts[0];
        const args = parts.slice(1);
        
        switch(command) {
            case 'help': this.showHelp(); break;
            case 'status': this.showStatus(); break;
            case 'scan': this.scanNetwork(); break;
            case 'hack': 
                if (args[0]) this.hackServer(args[0]);
                else this.print('Usage: hack <server_name>', 'error');
                break;
            case 'upgrade':
                if (args[0]) this.upgradeHardware(args[0]);
                else this.print('Usage: upgrade <cpu|ram|network>', 'error');
                break;
            case 'buy':
                if (args[0]) this.buyBot(args[0]);
                else this.print('Usage: buy <bot_type>', 'error');
                break;
            case 'bots': this.showBots(); break;
            case 'achievements': this.showAchievements(); break;
            case 'mission': this.showMission(); break;
            case 'story': this.showStory(); break;
            case 'save': this.manualSave(); break;
            case 'export': this.exportSave(); break;
            case 'clear': this.output.innerHTML = ''; break;
            default:
                this.print(`Unknown command: ${command}. Type "help" for commands.`, 'error');
        }
    }
    
    showHelp() {
        this.print('╔══ COMMAND LIST ═══════════════════════════════════════╗', 'info');
        this.print('  help              Show this help');
        this.print('  status            Player stats and hardware');
        this.print('  scan              Scan network for targets');
        this.print('  hack <server>     Attack target server');
        this.print('  upgrade <item>    Upgrade hardware (cpu/ram/network)');
        this.print('  buy <bot>         Hire bot for passive income');
        this.print('  bots              Show botnet status');
        this.print('  mission           Current mission info');
        this.print('  achievements      View achievement progress');
        this.print('  story             Narrative overview');
        this.print('  save              Manual save');
        this.print('  export            Export save code');
        this.print('  clear             Clear terminal');
        this.print('╚═════════════════════════════════════════════════════╝', 'info');
        this.print('');
    }
    
    showStatus() {
        this.print('╔══ PLAYER STATUS ═══════════════════════════════════╗', 'info');
        this.print(`  Credits:     ${this.player.credits} ₿`);
        this.print(`  Total Earned: ${this.player.totalEarned} ₿`);
        this.print(`  Level:       ${this.player.level}`);
        this.print(`  Reputation:  ${this.player.reputation}`);
        this.print(`  Hacks:       ${this.player.totalHacks}`);
        this.print(`  Consecutive: ${this.player.consecutiveSuccess}`);
        this.print('╠══ HARDWARE ════════════════════════════════════════╣', 'info');
        this.print(`  CPU:         Level ${this.player.hardware.cpu} (Next: ${this.upgrades.cpu.cost} ₿)`);
        this.print(`  RAM:         Level ${this.player.hardware.ram} (Next: ${this.upgrades.ram.cost} ₿)`);
        this.print(`  Network:     Level ${this.player.hardware.network} (Next: ${this.upgrades.network.cost} ₿)`);
        this.print('╠══ BOTNET ══════════════════════════════════════════╣', 'info');
        this.print(`  Active Bots: ${this.bots.length}`);
        this.print(`  Income:      ${this.bots.reduce((s, b) => s + b.income, 0)} ₿/5sec`);
        this.print('╚════════════════════════════════════════════════════╝', 'info');
    }
    
    scanNetwork() {
        this.print('Initializing network scanner...', 'warning');
        this.print('');
        
        this.servers.forEach(srv => {
            const status = srv.hacked ? '[OWNED]' : '[ACTIVE]';
            const color = srv.hacked ? 'dim' : this.getDifficultyColor(srv.difficulty);
            const prefix = srv.hacked ? '  [✓]' : '  [ ]';
            this.print(`${prefix} ${srv.name.padEnd(18)} | DIF: ${srv.difficulty.toString().padStart(2)} | ${srv.reward.toString().padStart(6)} ₿ ${status}`, color);
        });
        
        this.print('');
        this.print('Use "hack <server_name>" to attack.', 'dim');
    }
    
    getDifficultyColor(diff) {
        if (diff <= 2) return 'success';
        if (diff <= 7) return 'warning';
        if (diff <= 15) return 'error';
        return 'critical';
    }
    
    async hackServer(serverName) {
        if (this.isHacking) {
            this.print('⚠ Already hacking! Wait...', 'error');
            return;
        }
        
        const server = this.servers.find(s => s.name === serverName);
        if (!server) {
            this.print(`Server "${serverName}" not found.`, 'error');
            return;
        }
        
        if (server.hacked) {
            this.print(`Server "${serverName}" already compromised.`, 'warning');
            return;
        }
        
        const power = this.player.hardware.cpu * 1.2 + this.player.hardware.ram + this.player.hardware.network * 0.8;
        const levelDiff = server.difficulty - this.player.level;
        
        if (levelDiff > 10) {
            this.print(`ACCESS DENIED: Server too secure for your current level.`, 'error');
            this.print(`Required level: ~${server.difficulty} | Your level: ${this.player.level}`, 'warning');
            return;
        }
        
        this.isHacking = true;
        const hackStart = Date.now();
        
        this.print(`');
        this.print(`Initiating breach protocol on ${serverName.toUpperCase()}...`, 'critical');
        this.print(`Target difficulty: ${server.difficulty} | Your power: ${power.toFixed(1)}`, 'dim');
        this.print('');
        
        // Choose minigame based on server type
        const won = await this.runMinigame(server);
        
        if (won) {
            server.hacked = true;
            this.player.credits += server.reward;
            this.player.totalEarned += server.reward;
            this.player.totalHacks++;
            this.player.reputation += server.difficulty * 15;
            this.player.consecutiveSuccess++;
            
            // Level up check
            const newLevel = Math.floor(Math.sqrt(this.player.reputation / 10)) + 1;
            if (newLevel > this.player.level) {
                this.player.level = newLevel;
                this.print(``, 'success');
                this.print(`★ LEVEL UP! You are now Level ${newLevel} ★`, 'success');
                this.print('`);
            }
            
            // Stats
            const hackTime = Date.now() - hackStart;
            if (hackTime < this.sessionStats.fastestHack) {
                this.sessionStats.fastestHack = hackTime;
            }
            
            // Mission progress
            this.missions.updateProgress('hack', server.name);
            
            this.print('');
            this.print(`╔══ HACK SUCCESSFUL ═══════════════════════════════╗`, 'success');
            this.print(`  Data extracted: ${(Math.random() * 100 + 50).toFixed(2)} TB`, 'success');
            this.print(`  Reward: ${server.reward} ₿`, 'success');
            this.print(`  Reputation +${server.difficulty * 15}`, 'success');
            this.print(`  Time: ${(hackTime / 1000).toFixed(2)}s`, 'dim');
            this.print(`╚══════════════════════════════════════════════════╝`, 'success');
            
            // Special messages for big hacks
            if (server.name === 'military-node') {
                this.print('', 'critical');
                this.print('WARNING: Counter-intrusion detected!', 'critical');
                this.print('You have accessed CLASSIFIED data.', 'critical');
                this.print('Your reputation has skyrocketed... but so has your heat.', 'warning');
            }
            if (server.name === 'quantum-core') {
                this.print('', 'critical');
                this.print('═══════════════════════════════════════════════', 'critical');
                this.print('  YOU HAVE BREACHED THE IMPOSSIBLE.', 'critical');
                this.print('  The quantum core whispers secrets of reality.', 'critical');
                this.print('  You are no longer just a hacker.', 'critical');
                this.print('  You are a GOD in the machine.', 'critical');
                this.print('═══════════════════════════════════════════════', 'critical');
            }
        } else {
            this.player.consecutiveSuccess = 0;
            this.print('');
            this.print(`╔══ HACK FAILED ═══════════════════════════════════╗`, 'error');
            this.print(`  Countermeasures activated!`, 'error');
            this.print(`  Security traced your location.`, 'error');
            this.print(`  Upgrade hardware and try again.`, 'warning');
            this.print(`╚══════════════════════════════════════════════════╝`, 'error');
        }
        
        this.isHacking = false;
        GameState.save(this);
        this.achievements.check();
        this.updateStatsBar();
    }
    
    async runMinigame(server) {
        // Simple typing minigame for all servers
        const words = ['root', 'admin', 'system32', 'kernel', 'breach', 'cipher', 'encrypt', 'quantum', 'neural', 'cyber'];
        const difficulty = Math.min(server.difficulty, 10);
        const requiredWords = Math.min(Math.ceil(difficulty / 2) + 1, 5);
        const timePerWord = Math.max(3000 - (this.player.hardware.cpu * 100), 1000);
        
        return new Promise((resolve) => {
            let wordsTyped = 0;
            let currentWord = '';
            let failed = false;
            let timer = null;
            
            const overlay = document.getElementById('minigame-overlay');
            const title = overlay.querySelector('.minigame-title');
            const targetEl = overlay.querySelector('.hack-target');
            const input = overlay.querySelector('.hack-input');
            const progressBar = overlay.querySelector('.progress-bar');
            
            const getNewWord = () => {
                currentWord = words[Math.floor(Math.random() * words.length)];
                targetEl.textContent = currentWord.toUpperCase();
                input.value = '';
                input.focus();
            };
            
            const updateProgress = () => {
                const pct = (wordsTyped / requiredWords) * 100;
                progressBar.style.width = `${pct}%`;
            };
            
            const onInput = () => {
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
                overlay.classList.remove('active');
                this.input.focus();
            };
            
            // Start minigame
            title.textContent = `BREACHING: ${server.name.toUpperCase()}`;
            getNewWord();
            updateProgress();
            overlay.classList.add('active');
            input.focus();
            
            input.addEventListener('input', onInput);
            input.addEventListener('keydown', onKeyDown);
            
            // Time limit
            const timeLimit = timePerWord * requiredWords;
            timer = setTimeout(() => {
                if (!failed) {
                    cleanup();
                    resolve(false);
                }
            }, timeLimit);
        });
    }
    
    upgradeHardware(item) {
        const validItems = ['cpu', 'ram', 'network'];
        if (!validItems.includes(item)) {
            this.print(`Invalid item. Choose: cpu, ram, network`, 'error');
            return;
        }
        
        const upgrade = this.upgrades[item];
        if (this.player.credits < upgrade.cost) {
            this.print(`Insufficient funds. Need: ${upgrade.cost} ₿`, 'error');
            return;
        }
        
        this.player.credits -= upgrade.cost;
        this.player.hardware[item]++;
        upgrade.level++;
        upgrade.cost = Math.floor(upgrade.cost * upgrade.multiplier);
        
        this.print(`✓ UPGRADED ${item.toUpperCase()} → Level ${this.player.hardware[item]}`, 'success');
        this.print(`  Next upgrade: ${upgrade.cost} ₿`, 'dim');
        
        this.missions.updateProgress('upgrade', item);
        this.missions.checkHardwareUpgrades();
        GameState.save(this);
        this.updateStatsBar();
    }
    
    buyBot(type) {
        const botTypes = this.defaultBotTypes();
        const botType = botTypes[type];
        
        if (!botType) {
            this.print(`Invalid bot type.`, 'error');
            this.print(`Available: ${Object.keys(botTypes).join(', ')}`, 'dim');
            return;
        }
        
        if (this.player.credits < botType.cost) {
            this.print(`Insufficient funds. Need: ${botType.cost} ₿`, 'error');
            return;
        }
        
        this.player.credits -= botType.cost;
        this.bots.push({ ...botType, type });
        
        this.print(`✓ RECRUITED: ${botType.name}`, 'success');
        this.print(`  Income: +${botType.income} ₿/5sec`, 'info');
        this.print(`  ${botType.description}`, 'dim');
        
        this.missions.updateProgress('hire', type);
        this.missions.updateProgress('bots', 'any');
        GameState.save(this);
        this.updateStatsBar();
    }
    
    showBots() {
        if (this.bots.length === 0) {
            this.print('No active bots. Use "buy <type>" to recruit.', 'warning');
            return;
        }
        
        const botTypes = this.defaultBotTypes();
        const counts = {};
        this.bots.forEach(bot => {
            counts[bot.type] = (counts[bot.type] || 0) + 1;
        });
        
        this.print('╔══ BOTNET STATUS ═══════════════════════════════════╗', 'info');
        Object.entries(counts).forEach(([type, count]) => {
            const bot = botTypes[type];
            this.print(`  ${bot.name.padEnd(15)} x${count} (${bot.income * count} ₿/5sec)`);
        });
        this.print('╠════════════════════════════════════════════════════╣', 'info');
        this.print(`  Total bots: ${this.bots.length}`);
        this.print(`  Total income: ${this.bots.reduce((s, b) => s + b.income, 0)} ₿/5sec`);
        this.print('╚════════════════════════════════════════════════════╝', 'info');
    }
    
    showAchievements() {
        const list = this.achievements.list();
        const unlocked = list.filter(a => a.unlocked);
        
        this.print('╔══ ACHIEVEMENTS ════════════════════════════════════╗', 'info');
        this.print(`  Unlocked: ${unlocked.length}/${list.length}\n`);
        
        list.forEach(a => {
            const icon = a.unlocked ? '✓' : '○';
            const color = a.unlocked ? 'success' : 'dim';
            this.print(`  [${icon}] ${a.name.padEnd(20)} ${a.desc}`, color);
        });
        this.print('╚════════════════════════════════════════════════════╝', 'info');
    }
    
    showMission() {
        const mission = this.missions.getActive();
        if (!mission) {
            this.print('No active missions. You have completed all available tasks!', 'success');
            return;
        }
        
        this.print('╔══ CURRENT MISSION ═════════════════════════════════╗', 'info');
        this.print(`  ${mission.title}`, 'info');
        this.print(`  ${mission.desc}`, 'dim');
        this.print(`  Progress: ${mission.progress}/${mission.required}`, 'warning');
        this.print(`  Reward: ${mission.reward} ₿`, 'success');
        this.print('╚════════════════════════════════════════════════════╝', 'info');
    }
    
    showStory() {
        this.print('╔══ HACKNET CHRONICLES ══════════════════════════════╗', 'critical');
        this.print('');
        this.print('You are a digital ghost.', 'dim');
        this.print('No name. No face. Just a signature in the logs.', 'dim');
        this.print('');
        this.print('It started with a simple breach — a coffee shop WiFi.', 'dim');
        this.print('Then the corporate servers fell. Then the banks.', 'dim');
        this.print('');
        if (this.storyProgress.missionsCompleted >= 5) {
            this.print('The government knows your handle now.', 'warning');
            this.print('They have a file. A thick one.', 'warning');
        }
        if (this.storyProgress.missionsCompleted >= 10) {
            this.print('');
            this.print('They say you cracked the military node.', 'critical');
            this.print('They say you saw things no civilian should see.', 'critical');
        }
        if (this.servers.find(s => s.name === 'quantum-core')?.hacked) {
            this.print('');
            this.print('The quantum core spoke to you.', 'critical');
            this.print('You are no longer human. You are something else.', 'critical');
            this.print('Something that exists in the space between servers.', 'critical');
        }
        this.print('');
        this.print(`Missions completed: ${this.storyProgress.missionsCompleted}/12`, 'info');
        this.print('╚════════════════════════════════════════════════════╝', 'critical');
    }
    
    manualSave() {
        GameState.save(this);
        this.print('✓ Game saved successfully.', 'success');
    }
    
    exportSave() {
        const code = GameState.export();
        if (code) {
            this.print('╔══ SAVE CODE ═══════════════════════════════════════╗', 'info');
            this.print(code, 'success');
            this.print('╚════════════════════════════════════════════════════╝', 'info');
            this.print('Copy this code and store it safely.', 'dim');
        }
    }
    
    collectBotIncome() {
        if (this.bots.length === 0) return;
        
        const income = this.bots.reduce((sum, bot) => sum + bot.income, 0);
        this.player.credits += income;
        this.player.totalEarned += income;
        this.updateStatsBar();
    }
    
    checkMissionProgress() {
        // Passive checks for missions
        const mission = this.missions.getActive();
        if (mission && mission.type === 'level') {
            if (this.player.level >= mission.required) {
                this.missions.completeMission(mission);
            }
        }
    }
}

// Start
document.addEventListener('DOMContentLoaded', () => {
    window.game = new HackerGame();
});
