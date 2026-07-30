// ==========================================
// MISSION SYSTEM
// ==========================================

import { MISSIONS_DATA } from '../data/Constants.js';

export class MissionSystem {
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
