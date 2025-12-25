# 🎰 Lucky Fortune Slots

A full-featured slot machine program with dual-screen support and real payment device integration. Perfect for home hobby projects and learning about gaming machine development.

![Lucky Fortune Slots](https://img.shields.io/badge/Version-1.0.0-gold)
![Electron](https://img.shields.io/badge/Electron-28.0.0-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

### 🎮 Game Features
- **5-Reel, 3-Row Slot Machine** with 20 paylines
- **12 Unique Symbols** including Wilds and Scatters
- **Progressive Jackpot** system (Mega, Major, Minor, Mini)
- **Beautiful Vegas-style UI** with animations and effects
- **Configurable RTP** (Return to Player)
- **Auto-play mode** for hands-free gaming

### 🖥️ Dual Screen Support
- **Main Game Screen** - Full slot machine interface
- **Top Display Screen** - Jackpots, promotions, and recent wins
- Automatically detects and uses multiple monitors
- Configurable screen positions and sizes

### 💳 Payment Integration
- **Bill Validator Support** (Pyramid, ICT, JCM, MEI)
- **Coin Acceptor Support** (Coinco, Mars, Azkoyen)
- **Card Reader Support** (Magnetic stripe, RFID)
- **Demo Mode** for testing without hardware

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- (Optional) Payment hardware and USB-Serial adapters

### Installation

```bash
# Clone or navigate to the project
cd "Slots machine OS"

# Install dependencies
npm install

# Start in demo mode
npm start

# Start with developer tools
npm run dev
```

### First Run
1. The application will open two windows (main game and top display)
2. By default, it runs in **Demo Mode** - no hardware needed
3. Click "ADD $10" to add demo credits
4. Press SPIN or hit SPACEBAR to play!

## 🎮 Controls

| Key/Button | Action |
|------------|--------|
| SPACE | Spin the reels |
| ↑/↓ | Increase/decrease bet |
| M | Max bet |
| P | View paytable |
| ESC | Exit full screen |

## 💰 Paytable

| Symbol | 3x | 4x | 5x |
|--------|-----|-----|-----|
| 🌟 Wild | 50x | 200x | 1000x |
| 💎 Scatter | 5x | 20x | 100x |
| 7️⃣ Seven | 40x | 150x | 500x |
| 🏆 Bar | 30x | 100x | 300x |
| 🔔 Bell | 20x | 60x | 200x |
| 🍀 Clover | 10x | 40x | 100x |
| 🍒 Cherry | 8x | 30x | 80x |
| 🍇 Grape | 6x | 25x | 60x |
| 🍉 Melon | 8x | 30x | 70x |
| 🍋 Lemon | 5x | 20x | 50x |
| 🍊 Orange | 5x | 20x | 50x |

**Special:**
- 🌟 Wild substitutes for all symbols except Scatter
- 💎 3+ Scatters trigger bonus and pay on total bet

## ⚙️ Configuration

Edit `config/settings.json` to customize:

```json
{
  "game": {
    "betLevels": [1, 2, 3, 5, 10, 20, 50, 100],
    "defaultBet": 1
  },
  "payment": {
    "demoMode": true,
    "billValidator": {
      "enabled": true,
      "port": "/dev/ttyUSB0"
    }
  },
  "audio": {
    "enabled": true,
    "masterVolume": 0.7
  }
}
```

## 🔧 Hardware Setup

For real payment acceptance, you'll need:

### Bill Validator
1. Purchase a bill validator (Pyramid Apex 7000 recommended)
2. Connect via USB-Serial adapter
3. Set `payment.demoMode: false` in settings
4. Configure the correct port (`/dev/ttyUSB0` on Linux/Mac, `COM3` on Windows)

### Coin Acceptor
1. Connect coin acceptor to second USB-Serial port
2. Configure in `payment.coinAcceptor` settings
3. Ensure proper 12V/24V power supply

See `config/hardwareSetup.md` for detailed instructions.

## 📁 Project Structure

```
Slots machine OS/
├── main.js                 # Electron main process
├── preload.js              # IPC bridge
├── package.json
├── config/
│   ├── settings.json       # Game configuration
│   └── hardwareSetup.md    # Hardware guide
├── renderer/
│   ├── main-screen/        # Main game UI
│   │   ├── index.html
│   │   ├── styles.css
│   │   └── script.js
│   └── top-screen/         # Top display UI
│       ├── index.html
│       ├── styles.css
│       └── script.js
├── src/
│   ├── game/
│   │   ├── slotMachine.js  # Core game logic
│   │   ├── symbols.js      # Symbol definitions
│   │   └── paytable.js     # Payline configurations
│   ├── payment/
│   │   ├── paymentManager.js
│   │   ├── billValidator.js
│   │   ├── coinAcceptor.js
│   │   └── cardReader.js
│   └── sounds/
│       └── soundManager.js
└── assets/
    ├── images/
    └── sounds/
```

## 🔊 Adding Sound Effects

The game supports custom sound effects. Place audio files in `assets/sounds/`:

- `click.mp3` - Button clicks
- `spin.mp3` - Spin start
- `reel-stop.mp3` - Each reel stopping
- `win.mp3` - Small wins
- `big-win.mp3` - Large wins
- `coin.mp3` - Credit insertion
- `cash-out.mp3` - Cash out

Free sound effects can be found at:
- [Freesound.org](https://freesound.org)
- [OpenGameArt.org](https://opengameart.org)
- [ZapSplat](https://www.zapsplat.com)

## 🏗️ Building for Production

```bash
# Build for current platform
npm run build

# Build for specific platform
npm run build:mac
npm run build:win
npm run build:linux
```

Builds are output to the `dist/` folder.

## 🛡️ Security Notes

This software is designed for **HOME HOBBY USE ONLY**.

- ⚠️ Not intended for commercial gambling
- ⚠️ Check local laws regarding gaming devices
- ⚠️ The RNG is for entertainment, not certified for real gambling
- ⚠️ Secure any cash handling components appropriately

## 🤝 Contributing

Feel free to fork and modify for your own projects. Some ideas:
- Add new themes and symbol sets
- Implement bonus games
- Add networked progressive jackpots
- Create an admin interface
- Add player tracking

## 📝 License

MIT License - See LICENSE file for details.

## 🙏 Acknowledgments

- Electron team for the framework
- Howler.js for audio
- The slot machine hobbyist community

---

**Built with ❤️ for slot machine enthusiasts**

*Remember: Gambling should be fun. Play responsibly!*

