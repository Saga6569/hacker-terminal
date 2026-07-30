// ==========================================
// GAME DATA - All static configuration
// ==========================================

export const SERVERS = [
    { name: 'localhost', difficulty: 1, reward: 50, hacked: false, type: 'tutorial', description: 'Your own machine - practice target', region: 'home' },
    { name: 'coffee-shop-wifi', difficulty: 1, reward: 75, hacked: false, type: 'easy', description: 'Unsecured public network', region: 'public' },
    { name: 'school-server', difficulty: 2, reward: 120, hacked: false, type: 'easy', description: 'University database server', region: 'education' },
    { name: 'corp-web-01', difficulty: 3, reward: 200, hacked: false, type: 'medium', description: 'Corporate web server', region: 'corporate' },
    { name: 'start-up-db', difficulty: 4, reward: 350, hacked: false, type: 'medium', description: 'Tech startup database', region: 'corporate' },
    { name: 'bank-proxy', difficulty: 7, reward: 800, hacked: false, type: 'hard', description: 'Regional bank proxy server', region: 'financial' },
    { name: 'pharma-lab', difficulty: 10, reward: 1500, hacked: false, type: 'hard', description: 'Pharmaceutical research lab', region: 'corporate' },
    { name: 'gov-firewall', difficulty: 15, reward: 3000, hacked: false, type: 'extreme', description: 'Government security firewall', region: 'government' },
    { name: 'military-node', difficulty: 25, reward: 10000, hacked: false, type: 'extreme', description: 'Classified military node', region: 'military' },
    { name: 'quantum-core', difficulty: 50, reward: 50000, hacked: false, type: 'impossible', description: 'Experimental quantum computer - THE FINAL TARGET', region: 'secret' }
];

export const BOT_TYPES = {
    script_kiddie: { name: 'Script Kiddie', cost: 500, income: 5, interval: 5000, description: 'Basic automated scripts', tier: 1 },
    hacktivist: { name: 'Hacktivist', cost: 2500, income: 30, interval: 5000, description: 'Motivated amateur', tier: 2 },
    black_hat: { name: 'Black Hat', cost: 12000, income: 180, interval: 5000, description: 'Professional mercenary', tier: 3 },
    ai_core: { name: 'AI Core', cost: 50000, income: 1000, interval: 5000, description: 'Autonomous hacking AI', tier: 4 }
};

export const UPGRADES = {
    cpu: { cost: 100, multiplier: 1.6, level: 1, name: 'CPU', effect: 'Faster typing in hacks' },
    ram: { cost: 150, multiplier: 1.5, level: 1, name: 'RAM', effect: 'More time in minigames' },
    network: { cost: 200, multiplier: 1.55, level: 1, name: 'Network', effect: 'Higher success chance' }
};

export const ACHIEVEMENTS_DATA = [
    { id: 'first_hack', name: 'Script Kiddie', desc: 'Complete your first hack', condition: (g) => g.player.totalHacks >= 1 },
    { id: 'hacker_10', name: 'Rising Threat', desc: 'Hack 10 servers', condition: (g) => g.player.totalHacks >= 10 },
    { id: 'hacker_50', name: 'Cyber Criminal', desc: 'Hack 50 servers', condition: (g) => g.player.totalHacks >= 50 },
    { id: 'rich_1k', name: 'First Thousand', desc: 'Earn 1,000 credits', condition: (g) => g.player.totalEarned >= 1000 },
    { id: 'rich_10k', name: 'Crypto Millionaire', desc: 'Earn 10,000 credits', condition: (g) => g.player.totalEarned >= 10000 },
    { id: 'rich_100k', name: 'Digital Kingpin', desc: 'Earn 100,000 credits', condition: (g) => g.player.totalEarned >= 100000 },
    { id: 'bot_army', name: 'Botnet Commander', desc: 'Hire 5 bots', condition: (g) => g.bots.length >= 5 },
    { id: 'bot_legion', name: 'Digital Army', desc: 'Hire 20 bots', condition: (g) => g.bots.length >= 20 },
    { id: 'max_cpu', name: 'Quantum Processing', desc: 'Upgrade CPU to level 10', condition: (g) => g.player.hardware.cpu >= 10 },
    { id: 'all_servers', name: 'Zero Day', desc: 'Hack every server once', condition: (g) => g.servers.every(s => s.hacked) },
    { id: 'level_10', name: 'Elite Hacker', desc: 'Reach level 10', condition: (g) => g.player.level >= 10 },
    { id: 'level_25', name: 'Ghost in the Shell', desc: 'Reach level 25', condition: (g) => g.player.level >= 25 },
    { id: 'mission_master', name: 'Mission Impossible', desc: 'Complete 10 missions', condition: (g) => g.storyProgress.missionsCompleted >= 10 },
    { id: 'speed_hacker', name: 'Speed Demon', desc: 'Complete a hack in under 5 seconds', condition: (g) => g.sessionStats.fastestHack <= 5000 },
    { id: 'no_failure', name: 'Perfect Run', desc: 'Hack 10 servers in a row without failure', condition: (g) => g.player.consecutiveSuccess >= 10 }
];

export const MISSIONS_DATA = [
    { id: 1, title: 'Hello World', desc: 'Hack localhost to prove your skills', type: 'hack', target: 'localhost', required: 1, reward: 100 },
    { id: 2, title: 'Corporate Espionage', desc: 'Infiltrate corporate servers', type: 'hack', target: 'corp-web-01', required: 1, reward: 300 },
    { id: 3, title: 'Hardware Upgrade', desc: 'Upgrade your CPU to level 3', type: 'upgrade', target: 'cpu', required: 3, reward: 200 },
    { id: 4, title: 'Recruitment Drive', desc: 'Hire your first bot', type: 'hire', target: 'any', required: 1, reward: 250 },
    { id: 5, title: 'Bank Heist', desc: 'Hack the bank proxy', type: 'hack', target: 'bank-proxy', required: 1, reward: 1000 },
    { id: 6, title: 'Army Building', desc: 'Have 3 bots working for you', type: 'bots', target: 'any', required: 3, reward: 500 },
    { id: 7, title: 'Government Secrets', desc: 'Breaching government firewall', type: 'hack', target: 'gov-firewall', required: 1, reward: 5000 },
    { id: 8, title: 'Power Player', desc: 'Reach level 5', type: 'level', target: 'any', required: 5, reward: 1000 },
    { id: 9, title: 'Military Grade', desc: 'Hack the military node', type: 'hack', target: 'military-node', required: 1, reward: 20000 },
    { id: 10, title: 'Botnet Overlord', desc: 'Command an army of 10 bots', type: 'bots', target: 'any', required: 10, reward: 5000 },
    { id: 11, title: 'Perfect System', desc: 'Upgrade all hardware to level 5', type: 'upgrade_all', target: 'any', required: 5, reward: 3000 },
    { id: 12, title: 'The Ghost', desc: 'Reach level 15', type: 'level', target: 'any', required: 15, reward: 10000 }
];

export const HACK_WORDS = [
    'root', 'admin', 'system32', 'kernel', 'breach', 'cipher', 'encrypt', 
    'quantum', 'neural', 'cyber', 'packet', 'socket', 'daemon', 'firewall',
    'exploit', 'payload', 'backdoor', 'phishing', 'worm', 'trojan'
];

export const FACTIONS = {
    black_hat: { name: 'Black Hat', description: 'Profit above all. Access to military servers.', incomeBonus: 1.5, detectionRisk: 0.3 },
    white_hat: { name: 'White Hat', description: 'Bug bounty hunter. Steady legal income.', incomeBonus: 0.8, detectionRisk: 0.0, passiveBonus: 10 },
    grey_hat: { name: 'Grey Hat', description: 'Walking the line. Unique opportunities.', incomeBonus: 1.0, detectionRisk: 0.1 }
};

export const VIRUSES = {
    trojan_min: { name: 'Trojan.min', cost: 1000, income: 2, description: 'Silent data miner' },
    ransomware: { name: 'Ransomware.v2', cost: 5000, income: 0, description: 'Locks servers for ransom', special: 'lock' },
    rootkit: { name: 'Rootkit.ghost', cost: 15000, income: 50, description: 'Permanent backdoor access' }
};

export const RANDOM_EVENTS = [
    { id: 'fbi_raid', name: 'FBI Investigation', description: 'FBI requested ISP logs. Heat increased!', effect: (g) => { g.player.reputation = Math.max(0, g.player.reputation - 50); }, chance: 0.05 },
    { id: 'zero_day', name: 'Zero Day Exploit', description: 'New vulnerability found! All servers -20% difficulty for 2 minutes.', effect: (g) => { g._eventMultiplier = 0.8; setTimeout(() => g._eventMultiplier = 1, 120000); }, chance: 0.08 },
    { id: 'darknet_offer', name: 'Darknet Offer', description: 'Anonymous hacker offers trade: 1000 REP for rare bot.', effect: (g) => { /* handled in UI */ }, chance: 0.06 },
    { id: 'market_crash', name: 'Crypto Crash', description: 'Crypto market crashed! Credits worth -30% for 5 minutes.', effect: (g) => { g._creditMultiplier = 0.7; setTimeout(() => g._creditMultiplier = 1, 300000); }, chance: 0.04 },
    { id: 'sysadmin_error', name: 'Sysadmin Error', description: 'Lazy admin left default passwords. Free hack attempt!', effect: (g) => { g._freeHack = true; }, chance: 0.07 }
];

export const BLACK_MARKET_ITEMS = [
    { id: 'stolen_data_bank', name: 'Bank Records', description: 'Customer financial data', basePrice: 500, risk: 0.1 },
    { id: 'stolen_data_gov', name: 'Classified Docs', description: 'Government internal documents', basePrice: 2000, risk: 0.3 },
    { id: 'stolen_data_military', name: 'Military Intel', description: 'Classified military intelligence', basePrice: 10000, risk: 0.5 },
    { id: 'zero_day_exploit', name: 'Zero-Day Exploit', description: 'Unknown vulnerability', basePrice: 5000, risk: 0.2 }
];
