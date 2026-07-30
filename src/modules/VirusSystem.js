// ==========================================
// VIRUSES - Deploy malware for passive income
// ==========================================

import { VIRUSES } from '../data/Constants.js';

export class VirusSystem {
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
