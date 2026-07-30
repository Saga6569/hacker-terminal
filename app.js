class HackerGame {
    constructor() {
        this.player = {
            credits: 0,
            totalHacks: 0,
            reputation: 0,
            level: 1,
            hardware: {
                cpu: 1,
                ram: 1,
                network: 1
            }
        };
        
        this.bots = [];
        this.currentTarget = null;
        this.isHacking = false;
        
        this.servers = [
            { name: 'localhost', difficulty: 1, reward: 50, hacked: false },
            { name: 'corp-web-01', difficulty: 2, reward: 150, hacked: false },
            { name: 'bank-proxy', difficulty: 5, reward: 500, hacked: false },
            { name: 'gov-firewall', difficulty: 10, reward: 2000, hacked: false },
            { name: 'military-node', difficulty: 25, reward: 10000, hacked: false }
        ];
        
        this.upgrades = {
            cpu: { cost: 100, multiplier: 1.5, level: 1 },
            ram: { cost: 150, multiplier: 1.3, level: 1 },
            network: { cost: 200, multiplier: 1.4, level: 1 }
        };
        
        this.botTypes = {
            script_kiddie: { name: 'Script Kiddie', cost: 500, income: 5, interval: 5000 },
            hacktivist: { name: 'Hacktivist', cost: 2000, income: 25, interval: 5000 },
            black_hat: { name: 'Black Hat', cost: 10000, income: 150, interval: 5000 }
        };
        
        this.output = document.getElementById('output');
        this.input = document.getElementById('command-input');
        
        this.init();
    }
    
    init() {
        this.print('╔══════════════════════════════════════╗', 'success');
        this.print('║     HACKNET v1.0.4 INITIALIZED       ║', 'success');
        this.print('╚══════════════════════════════════════╝', 'success');
        this.print('');
        this.print('Welcome, operative. You have been granted ROOT access.');
        this.print('Type "help" for available commands.');
        this.print('');
        
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const cmd = this.input.value.trim();
                if (cmd) {
                    this.processCommand(cmd);
                    this.input.value = '';
                }
            }
        });
        
        // Start passive income loop
        setInterval(() => this.collectBotIncome(), 5000);
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
        const arg = parts[1];
        
        switch(command) {
            case 'help':
                this.showHelp();
                break;
            case 'status':
                this.showStatus();
                break;
            case 'scan':
                this.scanNetwork();
                break;
            case 'hack':
                if (arg) this.hackServer(arg);
                else this.print('Usage: hack <server_name>', 'error');
                break;
            case 'upgrade':
                if (arg) this.upgradeHardware(arg);
                else this.print('Usage: upgrade <cpu|ram|network>', 'error');
                break;
            case 'buy':
                if (arg) this.buyBot(arg);
                else this.print('Usage: buy <script_kiddie|hacktivist|black_hat>', 'error');
                break;
            case 'bots':
                this.showBots();
                break;
            case 'clear':
                this.output.innerHTML = '';
                break;
            default:
                this.print(`Unknown command: ${command}. Type "help" for commands.`, 'error');
        }
    }
    
    showHelp() {
        this.print('AVAILABLE COMMANDS:', 'info');
        this.print('  help              - Show this help');
        this.print('  status            - Show player status');
        this.print('  scan              - Scan network for targets');
        this.print('  hack <server>     - Hack target server');
        this.print('  upgrade <item>    - Upgrade hardware (cpu/ram/network)');
        this.print('  buy <bot>         - Hire bot (script_kiddie/hacktivist/black_hat)');
        this.print('  bots              - Show your botnet');
        this.print('  clear             - Clear terminal');
        this.print('');
    }
    
    showStatus() {
        this.print('╔══ PLAYER STATUS ═══════════════════╗', 'info');
        this.print(`  Credits:    ${this.player.credits} ₿`);
        this.print(`  Level:      ${this.player.level}`);
        this.print(`  Reputation: ${this.player.reputation}`);
        this.print(`  Total Hacks: ${this.player.totalHacks}`);
        this.print('╠══ HARDWARE ════════════════════════╣', 'info');
        this.print(`  CPU:        Level ${this.player.hardware.cpu}`);
        this.print(`  RAM:        Level ${this.player.hardware.ram}`);
        this.print(`  Network:    Level ${this.player.hardware.network}`);
        this.print('╚════════════════════════════════════╝', 'info');
    }
    
    scanNetwork() {
        this.print('Scanning network...', 'warning');
        this.print('');
        this.print('AVAILABLE TARGETS:', 'info');
        this.servers.forEach(srv => {
            const status = srv.hacked ? '[ROOTED]' : '[ACTIVE]';
            const color = srv.hacked ? 'success' : 'warning';
            this.print(`  ${srv.name} - Difficulty: ${srv.difficulty} - Reward: ${srv.reward} ₿ ${status}`, color);
        });
        this.print('');
        this.print('Type "hack <server_name>" to attack.', 'info');
    }
    
    async hackServer(serverName) {
        if (this.isHacking) {
            this.print('Already hacking! Wait...', 'error');
            return;
        }
        
        const server = this.servers.find(s => s.name === serverName);
        if (!server) {
            this.print(`Server "${serverName}" not found. Use "scan" to list targets.`, 'error');
            return;
        }
        
        if (server.hacked) {
            this.print(`Server "${serverName}" already compromised.`, 'warning');
            return;
        }
        
        const power = this.player.hardware.cpu + this.player.hardware.ram + this.player.hardware.network;
        const successChance = Math.min(0.95, power / (server.difficulty * 3));
        
        this.isHacking = true;
        this.print(`Initiating hack on ${serverName}...`);
        
        // Simulate hacking process
        const steps = [
            'Bypassing firewall...',
            'Injecting payload...',
            'Brute-forcing credentials...',
            'Escalating privileges...',
            'Extracting data...'
        ];
        
        for (let step of steps) {
            await this.delay(800);
            this.print(`  > ${step}`, 'info');
        }
        
        await this.delay(500);
        
        if (Math.random() < successChance) {
            server.hacked = true;
            this.player.credits += server.reward;
            this.player.totalHacks++;
            this.player.reputation += server.difficulty * 10;
            this.player.level = Math.floor(this.player.reputation / 100) + 1;
            
            this.print('');
            this.print(`✓ HACK SUCCESSFUL!`, 'success');
            this.print(`  Reward: ${server.reward} ₿`, 'success');
            this.print(`  Reputation +${server.difficulty * 10}`, 'success');
        } else {
            this.print('');
            this.print(`✗ HACK FAILED! Security detected intrusion.`, 'error');
            this.print(`  Your hardware needs upgrade.`, 'warning');
        }
        
        this.isHacking = false;
    }
    
    upgradeHardware(item) {
        const validItems = ['cpu', 'ram', 'network'];
        if (!validItems.includes(item)) {
            this.print(`Invalid item. Choose: cpu, ram, network`, 'error');
            return;
        }
        
        const upgrade = this.upgrades[item];
        if (this.player.credits < upgrade.cost) {
            this.print(`Not enough credits. Need: ${upgrade.cost} ₿`, 'error');
            return;
        }
        
        this.player.credits -= upgrade.cost;
        this.player.hardware[item]++;
        upgrade.level++;
        upgrade.cost = Math.floor(upgrade.cost * upgrade.multiplier);
        
        this.print(`✓ Upgraded ${item.toUpperCase()} to Level ${this.player.hardware[item]}!`, 'success');
        this.print(`  Next upgrade cost: ${upgrade.cost} ₿`, 'info');
    }
    
    buyBot(type) {
        const botType = this.botTypes[type];
        if (!botType) {
            this.print(`Invalid bot type. Available: script_kiddie, hacktivist, black_hat`, 'error');
            return;
        }
        
        if (this.player.credits < botType.cost) {
            this.print(`Not enough credits. Need: ${botType.cost} ₿`, 'error');
            return;
        }
        
        this.player.credits -= botType.cost;
        this.bots.push({ ...botType, type });
        
        this.print(`✓ Hired ${botType.name}!`, 'success');
        this.print(`  Passive income: +${botType.income} ₿/5sec`, 'info');
    }
    
    showBots() {
        if (this.bots.length === 0) {
            this.print('No bots in your botnet. Use "buy <bot_type>" to hire.', 'warning');
            return;
        }
        
        this.print('╔══ BOTNET ══════════════════════════╗', 'info');
        const counts = {};
        this.bots.forEach(bot => {
            counts[bot.type] = (counts[bot.type] || 0) + 1;
        });
        
        Object.entries(counts).forEach(([type, count]) => {
            const bot = this.botTypes[type];
            this.print(`  ${bot.name} x${count} (${bot.income * count} ₿/5sec)`);
        });
        this.print('╚════════════════════════════════════╝', 'info');
    }
    
    collectBotIncome() {
        if (this.bots.length === 0) return;
        
        const income = this.bots.reduce((sum, bot) => sum + bot.income, 0);
        this.player.credits += income;
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Start the game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.game = new HackerGame();
});
