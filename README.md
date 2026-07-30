# 🖥️ HACKER TERMINAL v2.0

> A retro-style hacking idle game with CRT monitor aesthetics.

## 🎮 Gameplay

You are a hacker operative with ROOT access. Hack servers, upgrade your hardware, build a botnet, join factions, deploy viruses, and conquer the digital world.

### Core Commands
- `help` - Show all available commands
- `status` - View player stats, hardware, botnet
- `scan` - List hackable targets
- `hack <server>` - Attack a server with typing minigame
- `upgrade <cpu|ram|network>` - Upgrade hardware
- `buy <bot_type>` - Hire bots for passive income
- `bots` - View botnet status
- `mission` - Current mission info
- `achievements` - View achievement progress
- `story` - Narrative overview
- `save` / `export` / `import <code>` - Save management
- `clear` - Clear terminal

### Black Market
- `market prices` - Show current data prices
- `market inventory` - View stolen data
- `market sell <id> [amount]` - Sell stolen data

### Factions
- `faction list` - Show available factions
- `faction join <black_hat|white_hat|grey_hat>` - Join a faction
- `faction leave` - Leave current faction
- `faction status` - Show faction info

### Viruses
- `virus catalog` - List available viruses
- `virus create <id>` - Deploy a virus
- `virus list` - Show active viruses

### Secret Commands 🤫
Try these: `matrix`, `konami`, `self-destruct`, `hack the planet`, `hello friend`, `1337`, `godmode`

## 🎯 Features

- **10 Hackable Servers** - From coffee shop WiFi to quantum computers
- **Typing Minigames** - Time-based word challenges during hacks
- **Achievement System** - 15 unlockable achievements
- **Story Missions** - 12 narrative-driven missions
- **Save System** - Autosave, offline earnings, export/import
- **Black Market** - Sell stolen data for profit
- **Factions** - Choose your path: Black Hat, White Hat, or Grey Hat
- **Viruses** - Deploy malware for passive income
- **Random Events** - FBI raids, zero-day exploits, darknet offers
- **Secret Commands** - Hidden easter eggs

## 🚀 Quick Start

Open `index.html` in your browser or serve with any static server:

```bash
npx serve .
# or
python3 -m http.server 8080
```

> Note: Uses ES6 modules, requires a local server (not `file://` protocol).

## 🛠 Tech Stack

- Vanilla HTML/CSS/JS
- ES6 Modules
- No frameworks needed
- CRT effects via CSS

## 📁 Structure

```
hacker-terminal/
├── index.html              # Main screen
├── styles.css              # CRT effects & terminal styling
├── app.js                  # Entry point
├── README.md
└── src/
    ├── core/
    │   ├── Game.js         # Main game controller
    │   ├── GameState.js    # Save/load system
    │   └── Terminal.js     # DOM interaction
    ├── systems/
    │   ├── AchievementSystem.js
    │   ├── MissionSystem.js
    │   ├── MinigameSystem.js
    │   └── EventSystem.js
    ├── modules/
    │   ├── BlackMarket.js
    │   ├── FactionSystem.js
    │   ├── VirusSystem.js
    │   └── SecretCommands.js
    └── data/
        └── Constants.js    # Game data
```

---

*Hack the planet.* 🌍
