// ==========================================
// HACKING SYSTEM — Replaces word minigame
// ==========================================

import { SOFTWARE_TOOLS } from '../data/Constants.js';

export class HackingSystem {
    constructor(game, terminal, audio = null) {
        this.game = game;
        this.terminal = terminal;
        this.audio = audio;
        this.currentHack = null;
    }

    // Main hack entry point
    async start(server, bounceSystem, traceSystem, onGameOver) {
        if (this.currentHack) {
            this.terminal.print('Already hacking! Use "abort" to cancel.', 'error');
            return { success: false, detected: false };
        }

        // Check if player has required tools
        const requiredTool = this.getRequiredTool(server);
        if (requiredTool && !this.game.inventory[requiredTool.id]) {
            this.terminal.print(`Access denied. Required tool: ${requiredTool.name}`, 'error');
            this.terminal.print(`Purchase it from the software shop.`, 'dim');
            return { success: false, detected: false };
        }

        // Calculate trace time based on bounce chain
        const traceTime = bounceSystem.getTraceTime();
        const speedMod = bounceSystem.getSpeedModifier();

        this.terminal.print('', 'info');
        this.terminal.print(`Initiating breach on ${server.name.toUpperCase()}...`, 'warning');
        this.terminal.print(`Bounce chain: ${bounceSystem.getChain().length} hops`, bounceSystem.getChain().length > 0 ? 'success' : 'error');
        this.terminal.print(`Trace time: ${traceTime}s | Speed penalty: ${Math.round((speedMod - 1) * 100)}%`, 'dim');
        this.terminal.print('', 'info');

        // Start trace immediately on high-security targets
        const detectionChance = this.getDetectionChance(server, bounceSystem);
        const detected = Math.random() < detectionChance;

        if (detected) {
            traceSystem.start(traceTime, server,
                (result) => {
                    if (result === 'gameover' && onGameOver) {
                        onGameOver(`Traced during hack on ${server.name}`);
                    }
                },
                () => this.onTraceAbort()
            );
        }

        // Execute hack based on server type
        const result = await this.executeHack(server, requiredTool, speedMod, traceSystem);

        this.currentHack = null;
        return result;
    }

    // Determine required tool for server
    getRequiredTool(server) {
        if (server.difficulty <= 2) return null; // No tool needed
        if (server.difficulty <= 5) return SOFTWARE_TOOLS.password_decoder;
        if (server.difficulty <= 10) return SOFTWARE_TOOLS.firewall_bypass;
        if (server.difficulty <= 20) return SOFTWARE_TOOLS.proxy_bypass;
        return SOFTWARE_TOOLS.voice_analyzer;
    }

    // Calculate detection chance
    getDetectionChance(server, bounceSystem) {
        let baseChance = server.difficulty * 0.03; // 3% per difficulty level

        // Reduce by bounce chain
        baseChance -= bounceSystem.getChain().length * 0.05;

        // Reduce by network upgrade (if we keep it)
        baseChance -= (this.game.player.hardware?.network || 0) * 0.02;

        // Faction bonus
        if (this.game.factions?.currentFaction?.id === 'black_hat') {
            baseChance -= 0.05;
        }

        return Math.max(0.1, Math.min(0.8, baseChance)); // 10% to 80%
    }

    // Execute the actual hack
    async executeHack(server, tool, speedMod, traceSystem) {
        this.currentHack = { server, tool, startTime: Date.now() };

        // Different hack types based on server
        if (server.type === 'tutorial' || server.type === 'easy') {
            return await this.bruteForceHack(server, tool, speedMod, traceSystem);
        } else if (server.type === 'medium') {
            return await this.sqlInjectionHack(server, tool, speedMod, traceSystem);
        } else {
            return await this.advancedHack(server, tool, speedMod, traceSystem);
        }
    }

    // Simple brute force with progress bar
    async bruteForceHack(server, tool, speedMod, traceSystem) {
        const baseTime = 5000; // 5 seconds base
        const toolBonus = tool ? 0.5 : 1; // Tool halves time
        const totalTime = baseTime * speedMod * toolBonus;

        this.terminal.print(`[Brute-forcing password...]`, 'warning');

        const steps = 20;
        const stepTime = totalTime / steps;
        let progressLine = null;

        for (let i = 0; i <= steps; i++) {
            if (!this.currentHack) {
                // Hack was aborted
                return { success: false, detected: traceSystem.isActive(), aborted: true };
            }

            const progress = Math.round((i / steps) * 100);
            const bar = '█'.repeat(i) + '░'.repeat(steps - i);
            const text = `[${bar}] ${progress}%`;
            
            if (progressLine) {
                this.terminal.updateLine(progressLine, text, 'dim');
            } else {
                progressLine = this.terminal.print(text, 'dim');
            }

            if (i < steps) {
                await this.sleep(stepTime);
            }
        }

        this.terminal.print(`[✓] Password cracked!`, 'success');
        return { success: true, detected: traceSystem.isActive() };
    }

    // SQL Injection puzzle
    async sqlInjectionHack(server, tool, speedMod, traceSystem) {
        const payloads = [
            { text: "' OR '1'='1", correct: false, result: "Syntax error" },
            { text: "admin'--", correct: false, result: "User not found" },
            { text: "' UNION SELECT * FROM users--", correct: true, result: "Data extracted" },
            { text: "'; DROP TABLE users;--", correct: false, result: "Permission denied" }
        ];

        this.terminal.print(`[SQL Injection detected in login form]`, 'warning');
        this.terminal.print(`Select payload:`, 'info');

        payloads.forEach((p, i) => {
            this.terminal.print(`  ${i + 1}. ${p.text}`, 'dim');
        });

        // In real implementation, wait for player input
        // For now, simulate with tool auto-solving or random
        let choice;
        if (tool) {
            this.terminal.print(`[Tool auto-selected correct payload]`, 'success');
            choice = payloads.findIndex(p => p.correct);
        } else {
            // Without tool, 50% chance to pick wrong
            choice = Math.random() < 0.5 ? payloads.findIndex(p => p.correct) : 0;
        }

        await this.sleep(2000 * speedMod);

        const selected = payloads[choice];
        if (selected.correct) {
            this.terminal.print(`[✓] ${selected.result}`, 'success');
            return { success: true, detected: traceSystem.isActive() };
        } else {
            this.terminal.print(`[✗] ${selected.result}`, 'error');
            this.terminal.print(`[!] Security alert triggered!`, 'critical');
            if (!traceSystem.isActive()) {
                traceSystem.start(10, server, null, null);
            }
            return { success: false, detected: true };
        }
    }

    // Advanced hack for hard servers
    async advancedHack(server, tool, speedMod, traceSystem) {
        if (!tool) {
            this.terminal.print(`[✗] Advanced encryption detected.`, 'error');
            this.terminal.print(`[✗] Required tool not found.`, 'error');
            return { success: false, detected: false };
        }

        this.terminal.print(`[Using ${tool.name}...]`, 'info');

        // Simulate complex process
        const phases = ['Bypassing firewall', 'Decrypting handshake', 'Injecting payload', 'Escalating privileges'];

        for (const phase of phases) {
            if (!this.currentHack) return { success: false, detected: traceSystem.isActive(), aborted: true };

            this.terminal.print(`[${phase}...]`, 'dim');
            await this.sleep(1500 * speedMod);

            // Each phase has small failure chance without proper tool level
            const failChance = tool.level ? 0.1 / tool.level : 0.3;
            if (Math.random() < failChance) {
                this.terminal.print(`[✗] ${phase} failed!`, 'error');
                if (!traceSystem.isActive()) {
                    traceSystem.start(15, server, null, null);
                }
                return { success: false, detected: true };
            }
        }

        this.terminal.print(`[✓] System compromised!`, 'success');
        return { success: true, detected: traceSystem.isActive() };
    }

    // Abort current hack
    abort() {
        if (this.currentHack) {
            this.terminal.print('[!] Aborting hack...', 'warning');
            this.currentHack = null;
            return true;
        }
        return false;
    }

    // Utility
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    onTraceResult(result) {
        // Handled by TraceSystem
    }

    onTraceAbort() {
        // Handled by TraceSystem
    }
}
