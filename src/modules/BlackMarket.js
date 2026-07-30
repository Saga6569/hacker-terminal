// ==========================================
// BLACK MARKET - Sell stolen data
// ==========================================

import { BLACK_MARKET_ITEMS } from '../data/Constants.js';

export class BlackMarket {
    constructor(game, terminal) {
        this.game = game;
        this.terminal = terminal;
        this.items = BLACK_MARKET_ITEMS;
        this.stolenData = {};
    }
    
    hackServer(serverName) {
        // Called when a server is hacked - generates stolen data
        const server = this.game.servers.find(s => s.name === serverName);
        if (!server) return;
        
        const dataType = this.getDataType(server);
        if (dataType) {
            this.stolenData[dataType] = (this.stolenData[dataType] || 0) + 1;
            this.terminal.print(`  📁 Extracted: ${this.getItemName(dataType)} x1`, 'info');
        }
    }
    
    getDataType(server) {
        if (server.region === 'financial') return 'stolen_data_bank';
        if (server.region === 'government') return 'stolen_data_gov';
        if (server.region === 'military') return 'stolen_data_military';
        if (server.difficulty >= 10) return 'zero_day_exploit';
        return null;
    }
    
    getItemName(id) {
        const item = this.items.find(i => i.id === id);
        return item ? item.name : id;
    }
    
    listInventory() {
        const entries = Object.entries(this.stolenData).filter(([_, count]) => count > 0);
        if (entries.length === 0) {
            this.terminal.print('No stolen data in inventory.', 'warning');
            return;
        }
        
        this.terminal.print('╔══ STOLEN DATA INVENTORY ══════════════════════╗', 'info');
        entries.forEach(([id, count]) => {
            const item = this.items.find(i => i.id === id);
            const price = item ? Math.floor(item.basePrice * (0.8 + Math.random() * 0.4)) : 0;
            this.terminal.print(`  ${item.name} x${count} (~${price} ₿ each)`);
        });
        this.terminal.print('╚═══════════════════════════════════════════════╝', 'info');
        this.terminal.print('Use "sell <item_id> [amount]" to sell.', 'dim');
    }
    
    sell(itemId, amount = 1) {
        const available = this.stolenData[itemId] || 0;
        if (available < amount) {
            this.terminal.print(`Not enough stock. You have ${available}.`, 'error');
            return;
        }
        
        const item = this.items.find(i => i.id === itemId);
        if (!item) {
            this.terminal.print(`Unknown item: ${itemId}`, 'error');
            return;
        }
        
        // Market fluctuation
        const marketMultiplier = this.game._creditMultiplier || 1;
        const totalPrice = Math.floor(item.basePrice * amount * (0.8 + Math.random() * 0.4) * marketMultiplier);
        
        this.stolenData[itemId] -= amount;
        this.game.player.credits += totalPrice;
        this.game.player.totalEarned += totalPrice;
        
        this.terminal.print(`✓ Sold ${item.name} x${amount} for ${totalPrice} ₿`, 'success');
        
        // Risk of detection
        const riskRoll = Math.random();
        if (riskRoll < item.risk) {
            this.terminal.print('⚠ Buyer was a honeypot! Reputation -20', 'error');
            this.game.player.reputation = Math.max(0, this.game.player.reputation - 20);
        }
    }
    
    showPrices() {
        this.terminal.print('╔══ BLACK MARKET PRICES ════════════════════════╗', 'info');
        this.items.forEach(item => {
            const price = Math.floor(item.basePrice * (0.8 + Math.random() * 0.4));
            this.terminal.print(`  ${item.name.padEnd(18)} ~${price} ₿ (risk: ${Math.floor(item.risk * 100)}%)`);
        });
        this.terminal.print('╚═══════════════════════════════════════════════╝', 'info');
    }
    
    serialize() {
        return this.stolenData;
    }
    
    load(data) {
        if (data) this.stolenData = data;
    }
}
