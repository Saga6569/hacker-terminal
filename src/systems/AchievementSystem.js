// ==========================================
// ACHIEVEMENT SYSTEM
// ==========================================

import { ACHIEVEMENTS_DATA } from '../data/Constants.js';

export class AchievementSystem {
    constructor(game, terminal) {
        this.game = game;
        this.terminal = terminal;
        this.achievements = ACHIEVEMENTS_DATA.map(a => ({ ...a, unlocked: false }));
    }
    
    check() {
        let newUnlocks = [];
        this.achievements.forEach(ach => {
            if (!ach.unlocked && ach.condition(this.game)) {
                ach.unlocked = true;
                newUnlocks.push(ach);
                this.terminal.showAchievement(ach);
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
