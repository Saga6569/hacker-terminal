// ==========================================
// TRACE SYSTEM — The ticking clock
// ==========================================

export class TraceSystem {
    constructor(game, terminal) {
        this.game = game;
        this.terminal = terminal;
        this.isTracing = false;
        this.traceTimer = null;
        this.timeRemaining = 0;
        this.targetServer = null;
        this.onTraceComplete = null;
        this.onTraceAbort = null;
    }

    // Start trace countdown
    start(seconds, targetServer, onComplete, onAbort) {
        if (this.isTracing) {
            this.terminal.print('⚠ TRACE ALREADY IN PROGRESS!', 'error');
            return false;
        }

        this.isTracing = true;
        this.timeRemaining = seconds;
        this.targetServer = targetServer;
        this.onTraceComplete = onComplete;
        this.onTraceAbort = onAbort;

        this.terminal.print('', 'critical');
        this.terminal.print('╔════════════════════════════════════════════════════╗', 'critical');
        this.terminal.print('║  ⚠ INTRUSION DETECTED — TRACE INITIATED ⚠       ║', 'critical');
        this.terminal.print(`║  Target: ${targetServer.name.toUpperCase().padEnd(37)} ║`, 'critical');
        this.terminal.print(`║  Time until identified: ${String(seconds).padEnd(3)} seconds          ║`, 'critical');
        this.terminal.print('║                                                    ║', 'critical');
        this.terminal.print('║  You must:                                         ║', 'critical');
        this.terminal.print('║  1. Complete/abort your operation                  ║', 'critical');
        this.terminal.print('║  2. Disconnect from target                         ║', 'critical');
        this.terminal.print('║  3. Wipe logs on ALL bounce servers                ║', 'critical');
        this.terminal.print('╚════════════════════════════════════════════════════╝', 'critical');
        this.terminal.print('', 'critical');

        // Start countdown
        this.traceTimer = setInterval(() => {
            this.timeRemaining--;

            // Warning at 10s
            if (this.timeRemaining === 10) {
                this.terminal.print('[!!!] 10 SECONDS REMAINING !!!', 'critical');
                this.game.audio?.alarm?.();
            }

            // Critical at 5s
            if (this.timeRemaining === 5) {
                this.terminal.print('[!!!] 5 SECONDS !!! DISCONNECT NOW !!!', 'critical');
                this.game.audio?.alarm?.();
            }

            if (this.timeRemaining <= 0) {
                this.complete();
            }
        }, 1000);

        return true;
    }

    // Trace completed — player caught
    complete() {
        this.stop();

        const severity = this.getSeverity();

        this.terminal.print('', 'critical');
        this.terminal.print('╔════════════════════════════════════════════════════╗', 'critical');
        this.terminal.print('║           ☠ TRACE COMPLETE ☠                     ║', 'critical');
        this.terminal.print('╚════════════════════════════════════════════════════╝', 'critical');

        if (severity === 'gameover') {
            this.terminal.print('', 'critical');
            this.terminal.print('The authorities have identified you.', 'critical');
            this.terminal.print('Your equipment has been seized.', 'critical');
            this.terminal.print('Your accounts have been frozen.', 'critical');
            this.terminal.print('', 'critical');
            this.terminal.print('╔════════════════════════════════════════════════════╗', 'critical');
            this.terminal.print('║              ☠ GAME OVER ☠                       ║', 'critical');
            this.terminal.print('╚════════════════════════════════════════════════════╝', 'critical');
            this.terminal.print('', 'critical');
            this.terminal.print(`Final stats:`, 'dim');
            this.terminal.print(`  Level: ${this.game.player.level}`, 'dim');
            this.terminal.print(`  Hacks: ${this.game.player.totalHacks}`, 'dim');
            this.terminal.print(`  Total earned: ${this.game.player.totalEarned} ₿`, 'dim');
            this.terminal.print(`  Reputation: ${this.game.player.reputation}`, 'dim');
            this.terminal.print('', 'dim');
            this.terminal.print('Type "restart" to begin anew.', 'warning');

            if (this.onTraceComplete) {
                this.onTraceComplete('gameover');
            }
        } else {
            // Soft penalty for minor servers
            const fine = Math.floor(this.game.player.credits * 0.5);
            this.game.player.credits = Math.max(0, this.game.player.credits - fine);
            this.game.player.reputation = Math.max(0, this.game.player.reputation - 100);

            this.terminal.print(`Penalty assessed:`, 'warning');
            this.terminal.print(`  Fine: ${fine} ₿`, 'warning');
            this.terminal.print(`  Reputation: -100`, 'warning');
            this.terminal.print('Consider improving your bounce chain.', 'dim');

            if (this.onTraceComplete) {
                this.onTraceComplete('penalty');
            }
        }
    }

    // Player successfully aborted
    abort() {
        this.stop();
        this.terminal.print('', 'success');
        this.terminal.print('[✓] Trace aborted. You got away... this time.', 'success');
        this.terminal.print('', 'dim');

        if (this.onTraceAbort) {
            this.onTraceAbort();
        }
    }

    // Stop the timer
    stop() {
        if (this.traceTimer) {
            clearInterval(this.traceTimer);
            this.traceTimer = null;
        }
        this.isTracing = false;
        this.timeRemaining = 0;
    }

    // Get severity based on target
    getSeverity() {
        if (!this.targetServer) return 'penalty';

        // Tutorial/public servers = just penalty
        if (this.targetServer.region === 'home' || this.targetServer.region === 'public') {
            return 'penalty';
        }

        // Government, military, financial = game over
        if (['government', 'military', 'financial'].includes(this.targetServer.region)) {
            return 'gameover';
        }

        // Corporate = game over if level > 5
        if (this.targetServer.region === 'corporate' && this.targetServer.difficulty > 5) {
            return 'gameover';
        }

        return 'penalty';
    }

    // Get remaining time
    getTimeRemaining() {
        return this.timeRemaining;
    }

    // Is trace active?
    isActive() {
        return this.isTracing;
    }
}
