// ==========================================
// FACTIONS - Choose your path
// ==========================================

import { FACTIONS } from '../data/Constants.js';

export class FactionSystem {
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
