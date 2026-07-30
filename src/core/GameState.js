// ==========================================
// GAME STATE - Save / Load / Export
// ==========================================

export class GameState {
    static save(game) {
        const data = {
            player: game.player,
            bots: game.bots,
            servers: game.servers,
            upgrades: game.upgrades,
            storyProgress: game.storyProgress,
            sessionStats: game.sessionStats,
            faction: game.faction,
            inventory: game.inventory,
            viruses: game.viruses,
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
