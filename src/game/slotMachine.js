// Slot Machine Core Game Logic
// Handles spinning, RNG, win calculation, and game state

// Node.js compatibility - load modules if not in browser
// In browser, SYMBOLS and PAYLINES should already be loaded via script tags
let SYMBOLS_REF, PAYLINES_REF;
if (typeof window !== 'undefined') {
  // Browser context - use globals
  SYMBOLS_REF = typeof SYMBOLS !== 'undefined' ? SYMBOLS : null;
  PAYLINES_REF = typeof PAYLINES !== 'undefined' ? PAYLINES : null;
} else if (typeof require !== 'undefined') {
  // Node.js context
  const symbolsModule = require('./symbols.js');
  const paytableModule = require('./paytable.js');
  SYMBOLS_REF = symbolsModule.SYMBOLS;
  PAYLINES_REF = paytableModule.PAYLINES;
}

class SlotMachine {
  constructor(config = {}) {
    // Use provided symbols/paylines or fall back to globals
    const symbols = config.symbols || SYMBOLS_REF;
    const paylines = config.paylines || PAYLINES_REF;
    
    if (!symbols) {
      throw new Error('SYMBOLS not defined. Make sure symbols.js is loaded before slotMachine.js');
    }
    if (!paylines) {
      throw new Error('PAYLINES not defined. Make sure paytable.js is loaded before slotMachine.js');
    }
    
    this.config = {
      reels: 5,
      rows: 3,
      symbols: symbols,
      paylines: paylines,
      ...config
    };
    
    this.state = {
      lastResult: null,
      totalSpins: 0,
      totalWagered: 0,
      totalWon: 0
    };
    
    // Initialize RNG
    this.rng = this.createRNG();
  }

  // Cryptographically-inspired RNG for fairness
  createRNG() {
    let seed = Date.now();
    
    return {
      next: () => {
        // Simple but effective PRNG (xorshift)
        seed ^= seed << 13;
        seed ^= seed >> 17;
        seed ^= seed << 5;
        return (seed >>> 0) / 4294967296;
      },
      setSeed: (newSeed) => {
        seed = newSeed;
      }
    };
  }

  // Get a random symbol based on weights
  getRandomSymbol() {
    // Calculate total weight dynamically
    const totalWeight = this.config.symbols.reduce((sum, s) => sum + s.weight, 0);
    const random = this.rng.next() * totalWeight;
    let accumulated = 0;
    
    for (const symbol of this.config.symbols) {
      accumulated += symbol.weight;
      if (random <= accumulated) {
        return { ...symbol };
      }
    }
    
    return { ...this.config.symbols[this.config.symbols.length - 1] };
  }

  // Generate a single reel strip (visible symbols)
  generateReel() {
    const symbols = [];
    for (let i = 0; i < this.config.rows; i++) {
      symbols.push(this.getRandomSymbol());
    }
    return symbols;
  }

  // Generate all reels for a spin
  generateSpinResult() {
    const reels = [];
    for (let i = 0; i < this.config.reels; i++) {
      reels.push(this.generateReel());
    }
    return reels;
  }

  // Main spin function
  spin(betLevel = 1) {
    const betPerLine = betLevel;
    const totalBet = betPerLine * this.config.paylines.length;
    
    // Update statistics
    this.state.totalSpins++;
    this.state.totalWagered += totalBet;
    
    // Generate result
    const reels = this.generateSpinResult();
    
    // Calculate wins
    const winResult = this.calculateWins(reels, betPerLine);
    
    // Update statistics
    this.state.totalWon += winResult.totalWin;
    
    // Store last result
    this.state.lastResult = {
      reels,
      ...winResult,
      betPerLine,
      totalBet,
      timestamp: Date.now()
    };
    
    return this.state.lastResult;
  }

  // Calculate all wins for the current spin
  calculateWins(reels, betPerLine) {
    const result = {
      lineWins: [],
      scatterWin: null,
      totalWin: 0,
      winLines: [],
      triggersBonus: false,
      bigWin: false,
      megaWin: false,
      jackpot: false
    };
    
    // Check each payline
    for (const payline of this.config.paylines) {
      const win = this.checkPayline(reels, payline, betPerLine);
      if (win) {
        result.lineWins.push(win);
        result.winLines.push(win);
        result.totalWin += win.win;
      }
    }
    
    // Check scatter wins
    const scatterWin = this.checkScatter(reels, betPerLine);
    if (scatterWin) {
      result.scatterWin = scatterWin;
      result.totalWin += scatterWin.win;
      result.triggersBonus = scatterWin.triggersBonus;
    }
    
    // Determine win level
    const totalBet = betPerLine * this.config.paylines.length;
    const winMultiplier = result.totalWin / totalBet;
    
    if (winMultiplier >= 10) result.bigWin = true;
    if (winMultiplier >= 50) result.megaWin = true;
    if (winMultiplier >= 100) result.jackpot = true;
    
    return result;
  }

  // Check a single payline for wins
  checkPayline(reels, payline, betPerLine) {
    const lineSymbols = payline.positions.map((row, reelIndex) => reels[reelIndex][row]);
    
    // Find the first non-wild symbol (leftmost)
    let matchSymbol = null;
    for (const sym of lineSymbols) {
      if (!sym.isWild && !sym.isScatter) {
        matchSymbol = sym;
        break;
      }
    }
    
    // If all wilds, use the wild symbol
    if (!matchSymbol) {
      const wildSymbol = lineSymbols.find(s => s.isWild);
      if (wildSymbol) {
        matchSymbol = wildSymbol;
      } else {
        return null; // All scatters on a line don't count as line win
      }
    }
    
    // Count consecutive matches from left
    let matchCount = 0;
    const matchPositions = [];
    
    for (let i = 0; i < lineSymbols.length; i++) {
      const sym = lineSymbols[i];
      if (sym.id === matchSymbol.id || sym.isWild) {
        matchCount++;
        matchPositions.push({ reel: i, row: payline.positions[i] });
      } else {
        break;
      }
    }
    
    // Check payout
    if (matchSymbol.pays && matchSymbol.pays[matchCount]) {
      const multiplier = matchSymbol.pays[matchCount];
      return {
        payline: payline,
        symbol: matchSymbol,
        count: matchCount,
        multiplier: multiplier,
        win: betPerLine * multiplier,
        positions: matchPositions
      };
    }
    
    return null;
  }

  // Check scatter symbols
  checkScatter(reels, betPerLine) {
    let scatterCount = 0;
    const scatterPositions = [];
    
    for (let reel = 0; reel < reels.length; reel++) {
      for (let row = 0; row < reels[reel].length; row++) {
        if (reels[reel][row].isScatter) {
          scatterCount++;
          scatterPositions.push({ reel, row });
        }
      }
    }
    
    // Find scatter symbol data
    const scatterSymbol = this.config.symbols.find(s => s.isScatter);
    
    if (scatterSymbol && scatterSymbol.pays[scatterCount]) {
      const totalBet = betPerLine * this.config.paylines.length;
      const multiplier = scatterSymbol.pays[scatterCount];
      
      return {
        isScatter: true,
        symbol: scatterSymbol,
        count: scatterCount,
        multiplier: multiplier,
        win: totalBet * multiplier,
        positions: scatterPositions,
        triggersBonus: scatterCount >= 3
      };
    }
    
    return null;
  }

  // Get current RTP (Return to Player) stats
  getRTP() {
    if (this.state.totalWagered === 0) return 0;
    return (this.state.totalWon / this.state.totalWagered) * 100;
  }

  // Get game statistics
  getStats() {
    return {
      totalSpins: this.state.totalSpins,
      totalWagered: this.state.totalWagered,
      totalWon: this.state.totalWon,
      rtp: this.getRTP().toFixed(2) + '%',
      lastResult: this.state.lastResult
    };
  }

  // Reset statistics
  resetStats() {
    this.state = {
      lastResult: null,
      totalSpins: 0,
      totalWagered: 0,
      totalWon: 0
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SlotMachine };
}

// Make available globally in browser
if (typeof window !== 'undefined') {
  window.SlotMachine = SlotMachine;
}

