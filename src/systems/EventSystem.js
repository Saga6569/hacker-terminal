// ==========================================
// EVENT SYSTEM - Random world events
// ==========================================

import { RANDOM_EVENTS } from '../data/Constants.js';

export class EventSystem {
    constructor(game, terminal) {
        this.game = game;
        this.terminal = terminal;
        this.events = RANDOM_EVENTS;
        this.activeEvent = null;
        this.lastEventTime = 0;
        this.eventCooldown = 300000; // 5 minutes minimum between events
    }
    
    check() {
        const now = Date.now();
        if (now - this.lastEventTime < this.eventCooldown) return;
        
        const roll = Math.random();
        const possibleEvents = this.events.filter(e => roll < e.chance);
        
        if (possibleEvents.length > 0) {
            const event = possibleEvents[Math.floor(Math.random() * possibleEvents.length)];
            this.trigger(event);
        }
    }
    
    trigger(event) {
        this.activeEvent = event;
        this.lastEventTime = Date.now();
        
        this.terminal.print('', 'warning');
        this.terminal.print(`╔══ RANDOM EVENT ═══════════════════════════════╗`, 'warning');
        this.terminal.print(`  🔔 ${event.name.toUpperCase()}`, 'warning');
        this.terminal.print(`  ${event.description}`, 'dim');
        this.terminal.print(`╚═══════════════════════════════════════════════╝`, 'warning');
        this.terminal.print('');
        
        if (event.effect) {
            event.effect(this.game);
        }
    }
    
    // Special UI for events that require player choice
    handleDarknetOffer() {
        if (this.game.player.reputation >= 1000) {
            this.terminal.print('An anonymous hacker wants to trade.', 'info');
            this.terminal.print('Give 1000 REP for a rare Black Hat bot? [yes/no]', 'warning');
            this.game._pendingChoice = 'darknet_offer';
        }
    }
}
