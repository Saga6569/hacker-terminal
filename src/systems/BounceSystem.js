// ==========================================
// BOUNCE SYSTEM — Proxy chains before hack
// ==========================================

export class BounceSystem {
    constructor(game, terminal) {
        this.game = game;
        this.terminal = terminal;
        this.chain = []; // Array of server names in chain
    }

    // Add server to bounce chain
    add(serverName) {
        const server = this.game.servers.find(s => s.name === serverName);
        if (!server) {
            this.terminal.print(`Server "${serverName}" not found.`, 'error');
            return false;
        }

        if (!server.hacked) {
            this.terminal.print(`Cannot bounce through "${serverName}" — not compromised.`, 'error');
            this.terminal.print('Hack it first to use as proxy.', 'dim');
            return false;
        }

        if (this.chain.includes(serverName)) {
            this.terminal.print(`"${serverName}" already in chain.`, 'warning');
            return false;
        }

        if (this.chain.length >= 5) {
            this.terminal.print('Max chain length reached (5 hops).', 'warning');
            return false;
        }

        this.chain.push(serverName);
        this.terminal.print(`[+] Added ${serverName} to bounce chain`, 'success');
        this.showChain();
        return true;
    }

    // Remove last or specific server
    remove(serverName = null) {
        if (serverName) {
            const idx = this.chain.indexOf(serverName);
            if (idx === -1) {
                this.terminal.print(`"${serverName}" not in chain.`, 'error');
                return false;
            }
            this.chain.splice(idx, 1);
            this.terminal.print(`[-] Removed ${serverName} from chain`, 'warning');
        } else {
            const removed = this.chain.pop();
            if (removed) {
                this.terminal.print(`[-] Removed ${removed} from chain`, 'warning');
            } else {
                this.terminal.print('Chain is empty.', 'dim');
            }
        }
        this.showChain();
        return true;
    }

    // Clear entire chain
    clear() {
        this.chain = [];
        this.terminal.print('[!] Bounce chain cleared.', 'warning');
    }

    // Get trace time in seconds based on chain length
    getTraceTime() {
        // Base: 15 seconds for direct connection
        // Each hop adds +20 seconds
        const base = 15;
        const perHop = 20;
        return base + (this.chain.length * perHop);
    }

    // Get connection speed modifier (longer = slower)
    getSpeedModifier() {
        // Each hop adds 15% delay
        return 1 + (this.chain.length * 0.15);
    }

    // Display current chain
    showChain() {
        if (this.chain.length === 0) {
            this.terminal.print('╔══ BOUNCE CHAIN ════════════════════════════════════╗', 'info');
            this.terminal.print('  DIRECT CONNECTION', 'error');
            this.terminal.print('  Trace time: 15s [DANGEROUS]', 'error');
            this.terminal.print('╚════════════════════════════════════════════════════╝', 'info');
            return;
        }

        this.terminal.print('╔══ BOUNCE CHAIN ════════════════════════════════════╗', 'info');
        this.terminal.print('  YOU', 'success');
        this.chain.forEach((hop, i) => {
            const arrow = i === this.chain.length - 1 ? '  └───► TARGET' : '  └───►';
            this.terminal.print(`  [${i + 1}] ${hop}`);
            if (i < this.chain.length - 1) {
                this.terminal.print('       │');
            }
        });
        this.terminal.print('╠════════════════════════════════════════════════════╣', 'info');
        this.terminal.print(`  Hops: ${this.chain.length} | Trace time: ${this.getTraceTime()}s`, 'success');
        this.terminal.print(`  Speed penalty: ${Math.round((this.getSpeedModifier() - 1) * 100)}%`, 'dim');
        this.terminal.print('╚════════════════════════════════════════════════════╝', 'info');
    }

    // Check if chain is valid for target
    isValidForTarget(targetServer) {
        // Cannot bounce through target itself
        if (this.chain.includes(targetServer.name)) {
            this.terminal.print('Cannot route through target server.', 'error');
            return false;
        }
        return true;
    }

    // Get array of all servers in chain (for log wiping)
    getChain() {
        return [...this.chain];
    }

    serialize() {
        return this.chain;
    }

    load(data) {
        if (Array.isArray(data)) {
            this.chain = data;
        }
    }
}
