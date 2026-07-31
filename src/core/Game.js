// ==========================================
// GAME - Main controller (Uplink-style)
// ==========================================

import { GameState } from './core/GameState.js';
import { Terminal } from './core/Terminal.js';
import { AchievementSystem } from './systems/AchievementSystem.js';
import { MissionSystem } from './systems/MissionSystem.js';
import { EventSystem } from './systems/EventSystem.js';
import { BlackMarket } from './modules/BlackMarket.js';
import { FactionSystem } from './modules/FactionSystem.js';
import { VirusSystem } from './modules/VirusSystem.js';
import { SecretCommands } from './modules/SecretCommands.js';
import { SERVERS, BOT_TYPES, UPGRADES, SOFTWARE_TOOLS } from './data/Constants.js';
import { AudioSystem } from './systems/AudioSystem.js';
import { MapSystem } from './systems/MapSystem.js';
import { SkillTree } from './systems/SkillTree.js';
import { BounceSystem } from './systems/BounceSystem.js';
import { TraceSystem } from './systems/TraceSystem.js';
import { HackingSystem } from './systems/HackingSystem.js';

export class Game {
    constructor() {
        this.audio = new AudioSystem();
        this.terminal = new Terminal(this.audio);
        
        // New Uplink-style systems
        this.bounce = new BounceSystem(this, this.terminal);
        this.trace = new TraceSystem(this, this.terminal);
        this.hacking = new HackingSystem(this, this.terminal, this.audio);
        
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
        this.isGameOver = false;
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
            
            // Load bounce chain
            if (saved.bounceChain) {
                this.bounce.load(saved.bounceChain);
            }
            
            // Offline earnings (reduced — main income from missions now)
            const botIncome = this.bots.reduce((s, b) => s + b.income, 0);
            const offlineEarnings = GameState.calculateOfflineEarnings(saved, botIncome * 0.2); // 20% of bot income
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
        // Bot income (reduced — supplemental only)
        setInterval(() => this.collectIncome(), 5000);
        
        // Autosave & checks
        setInterval(() => {
            if (!this.isGameOver) {
                GameState.save(this);
                this.achievements.check();
                this.missions.checkLevel();
                this.events.check();
            }
        }, 30000);
        
        // Stats bar update
        setInterval(() => this.terminal.updateStats(this.player, this.bots), 2000);
    }
    
    setupInput() {
        const form = document.getElementById('input-form');
        const input = document.getElementById('command-input');
        
        if (!form || !input) {
            console.error('Form or input not found!');
            return;
        }
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const cmd = this.terminal.getInputValue();
            if (cmd) {
                this.processCommand(cmd);
                this.terminal.clearInput();
            }
        });
        
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const cmd = this.terminal.getInputValue();
                if (cmd) {
                    this.processCommand(cmd);
                    this.terminal.clearInput();
                }
            }
        });
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
    UPLINK-STYLE v3.0 // ONE MISTAKE = GAME OVER
        `;
        this.terminal.printArt(art, 'dim');
        this.terminal.print('╔════════════════════════════════════════════════╗', 'success');
        this.terminal.print('║  Welcome back, operative. Remember:            ║', 'success');
        this.terminal.print('║  ONE SERIOUS MISTAKE = GAME OVER               ║', 'critical');
        this.terminal.print(`║  ${String(this.player.level).padStart(2, '0')}  |  REP: ${String(this.player.reputation).padStart(6, '0')}  |  ₿: ${String(this.player.credits).padStart(8, '0')}       ║`, 'success');
        this.terminal.print('╚════════════════════════════════════════════════╝', 'success');
        
        if (this._offlineEarnings > 0) {
            this.terminal.print(`💰 Offline earnings: +${this._offlineEarnings} ₿`, 'success');
            this.terminal.print(`   Bots earned while you were away.\n`, 'dim');
        }
        
        this.terminal.print('');
        this.terminal.print('CRITICAL: Always build a bounce chain before hacking!');
        this.terminal.print('Type "help" for commands or "bounce show" to see your chain.\n');
        
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
        if (this.isGameOver && cmd !== 'restart') {
            this.terminal.print('Game over. Type "restart" to begin anew.', 'error');
            return;
        }
        
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
            case 'bounce':
                if (args[0] === 'add' && args[1]) this.bounce.add(args[1]);
                else if (args[0] === 'remove') this.bounce.remove(args[1] || null);
                else if (args[0] === 'clear') this.bounce.clear();
                else if (args[0] === 'show') this.bounce.showChain();
                else this.showBounceHelp();
                break;
            case 'wipe':
                if (args[0]) this.wipeLogs(args[0]);
                else this.wipeAllLogs();
                break;
            case 'abort':
                this.abortHack();
                break;
            case 'shop':
                if (args[0] === 'list') this.showSoftwareShop();
                else if (args[0] === 'buy' && args[1]) this.buySoftware(args[1]);
                else this.showSoftwareShop();
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
            case 'restart':
                this.restart();
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
        this.terminal.print('  CRITICAL COMMANDS:', 'critical');
        this.terminal.print('  bounce add <srv>  Add server to proxy chain');
        this.terminal.print('  bounce remove [srv] Remove from chain');
        this.terminal.print('  bounce show       Show current chain');
        this.terminal.print('  hack <server>     Attack target (build chain first!)');
        this.terminal.print('  abort             Abort current hack');
        this.terminal.print('  wipe <server>     Delete logs on server');
        this.terminal.print('');
        this.terminal.print('  GENERAL:', 'info');
        this.terminal.print('  help              Show this help');
        this.terminal.print('  status            Player stats');
        this.terminal.print('  scan              Scan network for targets');
        this.terminal.print('  shop [buy <id>]   Software shop');
        this.terminal.print('  upgrade <item>    Upgrade hardware');
        this.terminal.print('  buy <bot>         Hire bot (supplemental income)');
        this.terminal.print('  bots              Show botnet status');
        this.terminal.print('  mission           Current mission info');
        this.terminal.print('  achievements      View achievement progress');
        this.terminal.print('  story             Narrative overview');
        this.terminal.print('  market <cmd>      Black market');
        this.terminal.print('  faction <cmd>     Join/leave faction');
        this.terminal.print('  virus <cmd>       Deploy viruses');
        this.terminal.print('  map               ASCII network topology');
        this.terminal.print('  skill [unlock <id>]  Skill tree');
        this.terminal.print('  theme [name]      Change color theme');
        this.terminal.print('  sound             Toggle audio');
        this.terminal.print('  save              Manual save');
        this.terminal.print('  export            Export save code');
        this.terminal.print('  import <code>     Import save code');
        this.terminal.print('  restart           Start new game (after game over)');
        this.terminal.print('  clear             Clear terminal');
        this.terminal.print('╚═════════════════════════════════════════════════════╝', 'info');
        this.terminal.print('');
        this.terminal.print('⚠ RULE: Always use "bounce" before hacking hard targets!', 'critical');
        this.terminal.print('⚠ RULE: Wipe logs after every hack!', 'critical');
    }
    
    showBounceHelp() {
        this.terminal.print('Bounce commands:', 'info');
        this.terminal.print('  bounce add <server>    - Add hacked server to chain');
        this.terminal.print('  bounce remove [server] - Remove from chain');
        this.terminal.print('  bounce clear           - Clear entire chain');
        this.terminal.print('  bounce show            - Show current chain', 'dim');
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
    
    showSoftwareShop() {
        this.terminal.print('╔══ SOFTWARE SHOP ═══════════════════════════════════╗', 'info');
        Object.entries(SOFTWARE_TOOLS).forEach(([id, tool]) => {
            const owned = this.inventory[id] ? '[OWNED]' : `[${tool.cost} ₿]`;
            this.terminal.print(`  ${id.padEnd(20)} ${owned}`, 'info');
            this.terminal.print(`     ${tool.description}`, 'dim');
            this.terminal.print(`     Unlocks: ${tool.unlocks}`, 'dim');
        });
        this.terminal.print('╚════════════════════════════════════════════════════╝', 'info');
        this.terminal.print('Use "shop buy <id>" to purchase.', 'dim');
    }
    
    buySoftware(toolId) {
        const tool = SOFTWARE_TOOLS[toolId];
        if (!tool) {
            this.terminal.print(`Unknown software: ${toolId}`, 'error');
            return;
        }
        
        if (this.inventory[toolId]) {
            this.terminal.print(`You already own ${tool.name}.`, 'warning');
            return;
        }
        
        if (this.player.credits < tool.cost) {
            this.terminal.print(`Insufficient funds. Need: ${tool.cost} ₿`, 'error');
            return;
        }
        
        this.player.credits -= tool.cost;
        this.inventory[toolId] = tool;
        
        this.terminal.print(`✓ PURCHASED: ${tool.name}`, 'success');
        this.terminal.print(`  ${tool.description}`, 'dim');
        this.terminal.print(`  Now you can hack: ${tool.unlocks}`, 'success');
        
        GameState.save(this);
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
            `  CPU:         Level ${this.player.hardware.cpu}`,
            `  RAM:         Level ${this.player.hardware.ram}`,
            `  Network:     Level ${this.player.hardware.network}`,
            '╠══ SOFTWARE ════════════════════════════════════════╣',
        ];
        
        const ownedTools = Object.keys(this.inventory);
        if (ownedTools.length === 0) {
            lines.push('  No software purchased. Visit "shop".');
        } else {
            ownedTools.forEach(id => {
                lines.push(`  ✓ ${this.inventory[id].name}`);
            });
        }
        
        lines.push('╠══ BOUNCE CHAIN ════════════════════════════════════╣');
        const chain = this.bounce.getChain();
        if (chain.length === 0) {
            lines.push('  [DIRECT - DANGEROUS]');
        } else {
            chain.forEach((hop, i) => lines.push(`  [${i + 1}] ${hop}`));
            lines.push(`  Trace time: ${this.bounce.getTraceTime()}s`);
        }
        
        if (this.viruses.deployed?.length > 0) {
            lines.push('╠══ VIRUSES ═════════════════════════════════════════╣');
            lines.push(`  Active: ${this.viruses.deployed.length}`);
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
            const toolRequired = srv.difficulty > 2 ? '[NEEDS TOOL]' : '';
            this.terminal.print(`${prefix} ${srv.name.padEnd(18)} | DIF: ${String(srv.difficulty).padStart(2)} | ${String(srv.reward).padStart(6)} ₿ ${status} ${toolRequired}`, color);
        });
        
        this.terminal.print('');
        this.terminal.print('Use "hack <server_name>" to attack.', 'dim');
        this.terminal.print('Build bounce chain first: "bounce add <server>"', 'warning');
    }
    
    getDifficultyColor(diff) {
        if (diff <= 2) return 'success';
        if (diff <= 7) return 'warning';
        if (diff <= 15) return 'error';
        return 'critical';
    }
    
    async hackServer(serverName) {
        if (this.isHacking) {
            this.terminal.print('⚠ Already hacking! Use "abort" to cancel.', 'error');
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
        
        // Check bounce chain for hard servers
        if (server.difficulty > 2 && this.bounce.getChain().length === 0) {
            this.terminal.print('╔════════════════════════════════════════════════════╗', 'error');
            this.terminal.print('║  ⚠ WARNING: NO BOUNCE CHAIN CONFIGURED ⚠          ║', 'error');
            this.terminal.print('║                                                    ║', 'error');
            this.terminal.print('║  Hard targets require proxy chain.                 ║', 'error');
            this.terminal.print('║  Use: bounce add <hacked_server>                   ║', 'error');
            this.terminal.print('║  Then: hack <target>                               ║', 'error');
            this.terminal.print('╚════════════════════════════════════════════════════╝', 'error');
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
        this.terminal.print(`Initiating breach on ${serverName.toUpperCase()}...`, 'critical');
        
        if (this.bounce.getChain().length > 0) {
            this.terminal.print(`Routing through ${this.bounce.getChain().length} proxies...`, 'dim');
        } else {
            this.terminal.print('DIRECT CONNECTION — HIGH RISK', 'error');
        }
        
        this.terminal.glitchScreen(300);
        
        // Use new hacking system
        const result = await this.hacking.start(server, this.bounce, this.trace, 
            (reason) => this.triggerGameOver(reason)
        );
        
        // Check if game over was triggered during hack
        if (this.isGameOver) {
            return;
        }
        
        if (result.success) {
            await this.handleHackSuccess(server, hackStart);
        } else {
            await this.handleHackFailure(server, result);
        }
        
        this.isHacking = false;
        GameState.save(this);
        this.achievements.check();
        this.terminal.updateStats(this.player, this.bots);
    }
    
    async handleHackSuccess(server, hackStart) {
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
        
        const hackTime = Date.now() - hackStart;
        if (hackTime < this.sessionStats.fastestHack) {
            this.sessionStats.fastestHack = hackTime;
        }
        
        this.missions.updateProgress('hack', server.name);
        this.market.hackServer(server.name);
        
        this.terminal.print('');
        this.terminal.print(`╔══ HACK SUCCESSFUL ═══════════════════════════════╗`, 'success');
        this.terminal.print(`  Data extracted: ${(Math.random() * 100 + 50).toFixed(2)} TB`, 'success');
        this.terminal.print(`  Reward: ${reward} ₿`, 'success');
        this.terminal.print(`  Reputation +${server.difficulty * 15}`, 'success');
        this.terminal.print(`  Time: ${(hackTime / 1000).toFixed(2)}s`, 'dim');
        this.terminal.print(`╚══════════════════════════════════════════════════╝`, 'success');
        
        // URGENT: Remind to wipe logs
        this.terminal.print('');
        this.terminal.print('⚠ URGENT: Use "wipe" to clear your tracks!', 'critical');
        this.terminal.print('⚠ Logs on bounce servers can incriminate you!', 'critical');
        
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
    }
    
    async handleHackFailure(server, result) {
        this.player.consecutiveSuccess = 0;
        this.audio.failure();
        this.terminal.flashError();
        this.terminal.shakeScreen(500);
        this.terminal.chromatic(600);
        
        if (result.detected && !result.aborted) {
            // Trace was triggered
            this.terminal.print(`╔══ HACK FAILED — TRACE ACTIVE ════════════════════╗`, 'error');
            this.terminal.print(`  Countermeasures activated!`, 'error');
            this.terminal.print(`  Security is tracing your connection!`, 'critical');
            this.terminal.print(`  You have ${this.trace.getTimeRemaining()}s to escape!`, 'critical');
            this.terminal.print(`╚══════════════════════════════════════════════════╝`, 'error');
        } else if (result.aborted) {
            this.terminal.print(`╔══ HACK ABORTED ══════════════════════════════════╗`, 'warning');
            this.terminal.print(`  You disconnected before completion.`, 'warning');
            this.terminal.print(`  No data extracted.`, 'dim');
            this.terminal.print(`╚══════════════════════════════════════════════════╝`, 'warning');
        } else {
            this.terminal.print(`╔══ HACK FAILED ═══════════════════════════════════╗`, 'error');
            this.terminal.print(`  Access denied.`, 'error');
            this.terminal.print(`  Required tool missing or insufficient.`, 'warning');
            this.terminal.print(`╚══════════════════════════════════════════════════╝`, 'error');
        }
    }
    
    abortHack() {
        if (this.hacking.currentHack) {
            this.hacking.abort();
            this.trace.stop();
            this.isHacking = false;
        } else {
            this.terminal.print('No active hack to abort.', 'dim');
        }
    }
    
    wipeLogs(serverName) {
        const server = this.servers.find(s => s.name === serverName);
        if (!server) {
            this.terminal.print(`Server "${serverName}" not found.`, 'error');
            return;
        }
        
        if (!server.hacked) {
            this.terminal.print(`Cannot wipe logs — server not compromised.`, 'error');
            return;
        }
        
        // Check if log deleter is owned
        if (this.inventory.log_deleter) {
            this.terminal.print(`[✓] Log Deleter Pro used. Logs on ${serverName} wiped instantly.`, 'success');
        } else {
            this.terminal.print(`[...] Manually wiping logs on ${serverName}...`, 'dim');
            this.terminal.print(`[✓] Logs wiped (took longer without tool).`, 'success');
        }
        
        // Mark server as "cleaned"
        server.logsWiped = true;
        this.terminal.print(`[✓] ${serverName} is clean.`, 'success');
    }
    
    wipeAllLogs() {
        const chain = this.bounce.getChain();
        if (chain.length === 0) {
            this.terminal.print('No bounce chain to wipe.', 'dim');
            return;
        }
        
        this.terminal.print('Wiping logs on all bounce servers...', 'warning');
        
        let cleaned = 0;
        chain.forEach(serverName => {
            const server = this.servers.find(s => s.name === serverName);
            if (server) {
                server.logsWiped = true;
                cleaned++;
                this.terminal.print(`  [✓] ${serverName}`, 'success');
            }
        });
        
        this.terminal.print(`\n[✓] ${cleaned} servers cleaned.`, 'success');
        
        // Check if trace can be stopped
        if (this.trace.isActive()) {
            this.trace.stop();
            this.terminal.print('[✓] Trace aborted — no evidence left.', 'success');
        }
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
        this.terminal.print(`  Income: +${botType.income} ₿/5sec (supplemental)`, 'info');
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
        this.terminal.print('Note: Bot income is supplemental. Main income from missions.', 'dim');
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
    
    // ========== GAME OVER / RESTART ==========
    
    triggerGameOver(reason) {
        this.isGameOver = true;
        this.terminal.print('', 'critical');
        this.terminal.print('╔════════════════════════════════════════════════════╗', 'critical');
        this.terminal.print('║                 ☠ GAME OVER ☠                    ║', 'critical');
        this.terminal.print('╚════════════════════════════════════════════════════╝', 'critical');
        this.terminal.print('', 'critical');
        this.terminal.print(`Reason: ${reason}`, 'critical');
        this.terminal.print('', 'dim');
        this.terminal.print(`Final stats:`, 'dim');
        this.terminal.print(`  Level: ${this.player.level}`, 'dim');
        this.terminal.print(`  Hacks: ${this.player.totalHacks}`, 'dim');
        this.terminal.print(`  Total earned: ${this.player.totalEarned} ₿`, 'dim');
        this.terminal.print(`  Reputation: ${this.player.reputation}`, 'dim');
        this.terminal.print('', 'dim');
        this.terminal.print('Type "restart" to begin a new life.', 'warning');
        
        // Clear save
        GameState.clear();
    }
    
    restart() {
        this.isGameOver = false;
        GameState.clear();
        location.reload();
    }
    
    // ========== UTILS ==========
    
    collectIncome() {
        if (this.isGameOver) return;
        
        // Reduced bot income — supplemental only
        let income = this.bots.reduce((sum, b) => sum + b.income, 0);
        income *= 0.2; // Only 20% of listed income
        income += this.viruses.getIncome();
        income *= this.factions.getIncomeMultiplier();
        
        this.player.credits += Math.floor(income);
        this.player.totalEarned += Math.floor(income);
        this.terminal.updateStats(this.player, this.bots);
    }
    
    manualSave() {
        if (this.isGameOver) return;
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
