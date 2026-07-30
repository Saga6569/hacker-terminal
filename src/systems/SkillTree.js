// ==========================================
// SKILL TREE - Unlockable abilities
// ==========================================

export const SKILLS = {
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

export class SkillTree {
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
