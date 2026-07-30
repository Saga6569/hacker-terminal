# 🖥️ HACKER TERMINAL

> A retro-style hacking idle game with CRT monitor aesthetics.

## 🎮 Gameplay

You are a hacker operative with ROOT access. Hack servers, upgrade your hardware, build a botnet, and become the most notorious hacker in the network.

### Commands
- `help` - Show available commands
- `status` - View player stats and hardware
- `scan` - List hackable targets
- `hack <server>` - Attack a server
- `upgrade <cpu|ram|network>` - Upgrade hardware
- `buy <bot_type>` - Hire bots for passive income
- `bots` - View your botnet
- `clear` - Clear terminal

### Server Targets
| Server | Difficulty | Reward |
|--------|-----------|--------|
| localhost | 1 | 50 ₿ |
| corp-web-01 | 2 | 150 ₿ |
| bank-proxy | 5 | 500 ₿ |
| gov-firewall | 10 | 2000 ₿ |
| military-node | 25 | 10000 ₿ |

### Bot Types
| Bot | Cost | Income/5s |
|-----|------|-----------|
| Script Kiddie | 500 ₿ | 5 ₿ |
| Hacktivist | 2000 ₿ | 25 ₿ |
| Black Hat | 10000 ₿ | 150 ₿ |

## 🚀 Quick Start

Open `index.html` in your browser or serve with any static server:

```bash
npx serve .
# or
python3 -m http.server 8080
```

## 🛠 Tech Stack

- Vanilla HTML/CSS/JS
- No frameworks needed
- CRT effects via CSS

## 📁 Structure

```
hacker-terminal/
├── index.html      # Main screen
├── styles.css      # CRT effects & terminal styling
├── app.js          # Game logic
└── README.md       # This file
```

---

*Hack the planet.* 🌍
