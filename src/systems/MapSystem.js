// ==========================================
// MAP SYSTEM - ASCII network visualization
// ==========================================

export class MapSystem {
    constructor(servers, terminal) {
        this.servers = servers;
        this.terminal = terminal;
    }
    
    render() {
        // Build network topology
        const regions = {
            home: [],
            public: [],
            education: [],
            corporate: [],
            financial: [],
            government: [],
            military: [],
            secret: []
        };
        
        this.servers.forEach(srv => {
            if (regions[srv.region]) {
                regions[srv.region].push(srv);
            }
        });
        
        const map = this.buildAsciiMap(regions);
        map.forEach(line => this.terminal.print(line, 'dim'));
        
        this.terminal.print('');
        this.terminal.print('LEGEND:', 'info');
        this.terminal.print('  [✓] = Hacked  [ ] = Active  [!] = Locked (faction required)', 'dim');
        this.terminal.print('  Lines show network connections. Hack in order to unlock paths.', 'dim');
    }
    
    buildAsciiMap(regions) {
        const lines = [];
        lines.push('');
        lines.push('                    ╔══════════════════╗');
        lines.push('                    ║   QUANTUM CORE   ║');
        lines.push('                    ║  [EXPERIMENTAL]  ║');
        lines.push('                    ╚════════╦═════════╝');
        lines.push('                             ║');
        lines.push('              ╔══════════════╩══════════════╗');
        lines.push('              ║      MILITARY NODE          ║');
        lines.push('              ║      [CLASSIFIED]           ║');
        lines.push('              ╚══════════════╦══════════════╝');
        lines.push('                             ║');
        lines.push('        ╔════════════════════╩════════════════════╗');
        lines.push('        ║          GOVERNMENT FIREWALL            ║');
        lines.push('        ╚════════════════════╦════════════════════╝');
        lines.push('                             ║');
        lines.push('       ╔═════════════════════╩═════════════════════╗');
        lines.push('       ║  BANK PROXY ║  PHARMA LAB  ║  STARTUP DB ║');
        lines.push('       ╚═════════════════════╦═════════════════════╝');
        lines.push('                             ║');
        lines.push('              ╔══════════════╩══════════════╗');
        lines.push('              ║      CORPORATE WEB-01       ║');
        lines.push('              ╚══════════════╦══════════════╝');
        lines.push('                             ║');
        lines.push('       ╔═════════════════════╩═════════════════════╗');
        lines.push('       ║ SCHOOL SERVER ║ COFFEE SHOP ║ LOCALHOST ║');
        lines.push('       ╚═══════════════════════════════════════════╝');
        lines.push('');
        
        // Add server status indicators
        const statusLines = this.buildStatusOverlay(regions);
        return lines.map((line, i) => {
            const status = statusLines.find(s => s.line === i);
            return status ? this.injectStatus(line, status) : line;
        });
    }
    
    buildStatusOverlay(regions) {
        const statuses = [];
        // Map server names to approximate line positions
        const positions = {
            'quantum-core': 3,
            'military-node': 8,
            'gov-firewall': 13,
            'bank-proxy': 17,
            'pharma-lab': 17,
            'start-up-db': 17,
            'corp-web-01': 21,
            'school-server': 25,
            'coffee-shop-wifi': 25,
            'localhost': 25
        };
        
        this.servers.forEach(srv => {
            const line = positions[srv.name];
            if (line !== undefined) {
                statuses.push({
                    line,
                    server: srv,
                    status: srv.hacked ? '✓' : (srv.region === 'military' ? '!' : ' ')
                });
            }
        });
        
        return statuses;
    }
    
    injectStatus(line, status) {
        // Simple replacement - find brackets and inject status
        if (status.server.hacked) {
            return line.replace('[', '[✓').replace(/\[\s*\]/, '[✓]');
        }
        return line;
    }
}
