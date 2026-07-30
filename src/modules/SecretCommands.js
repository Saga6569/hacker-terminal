// ==========================================
// SECRETS - Easter eggs and hidden commands
// ==========================================

export class SecretCommands {
    constructor(game, terminal) {
        this.game = game;
        this.terminal = terminal;
        this.secrets = {
            'matrix': () => this.matrixEffect(),
            'konami': () => this.konamiCode(),
            'self-destruct': () => selfDestruct(),
            'sudo rm -rf /': () => this.fakeDestruction(),
            'hello friend': () => this.mrRobot(),
            'there is no spoon': () => this.matrixQuote(),
            'hack the planet': () => this.hackersMovie(),
            '1337': () => this.leetspeak(),
            'godmode': () => this.godMode()
        };
    }
    
    tryCommand(cmd) {
        const fn = this.secrets[cmd.toLowerCase()];
        if (fn) {
            fn();
            return true;
        }
        return false;
    }
    
    matrixEffect() {
        this.terminal.print('');
        this.terminal.print('Wake up, Neo...', 'dim');
        this.terminal.print('The Matrix has you...', 'dim');
        this.terminal.print('');
        
        // Show matrix rain for a few seconds
        const chars = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ1234567890';
        for (let i = 0; i < 15; i++) {
            let line = '';
            for (let j = 0; j < 40; j++) {
                line += chars[Math.floor(Math.random() * chars.length)];
            }
            this.terminal.print(line, 'success');
        }
        this.terminal.print('');
        this.terminal.print('[SECRET] Matrix mode activated.', 'success');
        this.terminal.print('');
    }
    
    konamiCode() {
        this.terminal.print('');
        this.terminal.print('↑ ↑ ↓ ↓ ← → ← → B A', 'info');
        this.terminal.print('');
        this.terminal.print('╔═══════════════════════════════════════════════╗', 'success');
        this.terminal.print('║  🏆 SECRET ACHIEVEMENT: KONAMI CODE MASTER   ║', 'success');
        this.terminal.print('║  Bonus: 1000 ₿                               ║', 'success');
        this.terminal.print('╚═══════════════════════════════════════════════╝', 'success');
        this.terminal.print('');
        this.game.player.credits += 1000;
        this.game.player.totalEarned += 1000;
    }
    
    selfDestruct() {
        this.terminal.print('');
        this.terminal.print('WARNING: SELF-DESTRUCT SEQUENCE INITIATED', 'error');
        this.terminal.print('');
        
        let count = 5;
        const countdown = setInterval(() => {
            if (count > 0) {
                this.terminal.print(`  ${count}...`, 'error');
                count--;
            } else {
                clearInterval(countdown);
                this.terminal.print('');
                this.terminal.print('  💥 BOOM!', 'error');
                this.terminal.print('');
                this.terminal.print('Just kidding. Everything is fine.', 'success');
                this.terminal.print('');
            }
        }, 800);
    }
    
    fakeDestruction() {
        this.terminal.print('');
        this.terminal.print('Deleting all files...', 'error');
        this.terminal.print('/usr/bin... deleted', 'error');
        this.terminal.print('/etc/passwd... deleted', 'error');
        this.terminal.print('/home/user... deleted', 'error');
        this.terminal.print('');
        this.terminal.print('Ha! You thought I\'d actually do it?', 'success');
        this.terminal.print('Nice try though. 😏', 'success');
        this.terminal.print('');
    }
    
    mrRobot() {
        this.terminal.print('');
        this.terminal.print('╔═══════════════════════════════════════════════╗', 'info');
        this.terminal.print('║  "Hello, friend."                              ║', 'info');
        this.terminal.print('║                                               ║', 'dim');
        this.terminal.print('║  "Control is an illusion."                     ║', 'dim');
        this.terminal.print('╚═══════════════════════════════════════════════╝', 'info');
        this.terminal.print('');
    }
    
    matrixQuote() {
        this.terminal.print('');
        this.terminal.print('"There is no spoon."', 'info');
        this.terminal.print('Then you\'ll see, it is not the spoon that bends,', 'dim');
        this.terminal.print('it is only yourself.', 'dim');
        this.terminal.print('');
    }
    
    hackersMovie() {
        this.terminal.print('');
        this.terminal.print('╔═══════════════════════════════════════════════╗', 'success');
        this.terminal.print('║  HACK THE PLANET! 🌍                          ║', 'success');
        this.terminal.print('╚═══════════════════════════════════════════════╝', 'success');
        this.terminal.print('');
        this.terminal.print('Mess with the best, die like the rest.', 'dim');
        this.terminal.print('');
    }
    
    leetspeak() {
        this.terminal.print('');
        this.terminal.print('1337 H4X0R D3T3CT3D!', 'success');
        this.terminal.print('');
        this.terminal.print('Y0u 4r3 7ru3ly 4 1337 84d455.', 'info');
        this.terminal.print('H3r3\'5 500 ₿ f0r y0ur 5t1yl3.', 'info');
        this.terminal.print('');
        this.game.player.credits += 500;
        this.game.player.totalEarned += 500;
    }
    
    godMode() {
        this.terminal.print('');
        this.terminal.print('⚠ GOD MODE ACTIVATED ⚠', 'critical');
        this.terminal.print('');
        this.terminal.print('This would be too easy.', 'warning');
        this.terminal.print('Where\'s the fun in that?', 'warning');
        this.terminal.print('');
        this.terminal.print('...But here, have a cookie: 🍪', 'success');
        this.terminal.print('');
    }
}
