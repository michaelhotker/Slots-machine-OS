// Payline Definitions for 5-Reel Slot Machine
// 20 paylines covering all possible winning patterns

// Each payline is defined by positions [reel1Row, reel2Row, reel3Row, reel4Row, reel5Row]
// Rows: 0 = top, 1 = middle, 2 = bottom (3 rows visible)

const PAYLINES = [
  // Straight lines
  { id: 1,  positions: [1, 1, 1, 1, 1], name: 'Middle Straight' },
  { id: 2,  positions: [0, 0, 0, 0, 0], name: 'Top Straight' },
  { id: 3,  positions: [2, 2, 2, 2, 2], name: 'Bottom Straight' },
  
  // V shapes
  { id: 4,  positions: [0, 1, 2, 1, 0], name: 'V Shape' },
  { id: 5,  positions: [2, 1, 0, 1, 2], name: 'Inverted V' },
  
  // Zigzags
  { id: 6,  positions: [0, 0, 1, 2, 2], name: 'Downward Slope' },
  { id: 7,  positions: [2, 2, 1, 0, 0], name: 'Upward Slope' },
  { id: 8,  positions: [1, 0, 0, 0, 1], name: 'Top Arc' },
  { id: 9,  positions: [1, 2, 2, 2, 1], name: 'Bottom Arc' },
  
  // W shapes
  { id: 10, positions: [0, 1, 0, 1, 0], name: 'W Pattern' },
  { id: 11, positions: [2, 1, 2, 1, 2], name: 'M Pattern' },
  
  // Stairs
  { id: 12, positions: [0, 1, 1, 1, 2], name: 'Descending Stairs' },
  { id: 13, positions: [2, 1, 1, 1, 0], name: 'Ascending Stairs' },
  
  // Complex patterns
  { id: 14, positions: [1, 0, 1, 0, 1], name: 'Alternating High' },
  { id: 15, positions: [1, 2, 1, 2, 1], name: 'Alternating Low' },
  { id: 16, positions: [0, 2, 0, 2, 0], name: 'Extreme Zigzag' },
  { id: 17, positions: [2, 0, 2, 0, 2], name: 'Reverse Extreme' },
  
  // Step patterns
  { id: 18, positions: [0, 0, 1, 2, 2], name: 'Step Down' },
  { id: 19, positions: [2, 2, 1, 0, 0], name: 'Step Up' },
  { id: 20, positions: [1, 0, 1, 2, 1], name: 'Wave' }
];

// Calculate win for a specific payline
function calculatePaylineWin(symbols, payline, betPerLine) {
  const lineSymbols = payline.positions.map((row, reel) => symbols[reel][row]);
  
  // Find the first non-wild symbol
  let matchSymbol = null;
  for (const sym of lineSymbols) {
    if (!sym.isWild) {
      matchSymbol = sym;
      break;
    }
  }
  
  // All wilds is the best case
  if (!matchSymbol) {
    matchSymbol = lineSymbols[0]; // Use wild as the match
  }
  
  // Count consecutive matches from left to right
  let matchCount = 0;
  const matchPositions = [];
  
  for (let i = 0; i < lineSymbols.length; i++) {
    const sym = lineSymbols[i];
    if (sym.id === matchSymbol.id || sym.isWild) {
      matchCount++;
      matchPositions.push({ reel: i, row: payline.positions[i] });
    } else {
      break; // Stop at first non-match
    }
  }
  
  // Check if we have a winning combination
  const pays = matchSymbol.pays;
  if (pays && pays[matchCount]) {
    const multiplier = pays[matchCount];
    const winAmount = betPerLine * multiplier;
    
    return {
      payline: payline,
      symbol: matchSymbol,
      count: matchCount,
      multiplier: multiplier,
      win: winAmount,
      positions: matchPositions
    };
  }
  
  return null;
}

// Calculate scatter wins (not dependent on paylines)
function calculateScatterWin(symbols, betPerLine, totalLines) {
  let scatterCount = 0;
  const scatterPositions = [];
  
  // Flatten the reels and count scatters
  for (let reel = 0; reel < symbols.length; reel++) {
    for (let row = 0; row < symbols[reel].length; row++) {
      if (symbols[reel][row].isScatter) {
        scatterCount++;
        scatterPositions.push({ reel, row });
      }
    }
  }
  
  // Get scatter symbol - use global function if available, otherwise find it
  let scatterSymbol;
  if (typeof getSymbolById !== 'undefined') {
    scatterSymbol = getSymbolById('scatter');
  } else if (typeof SYMBOLS !== 'undefined') {
    scatterSymbol = SYMBOLS.find(s => s.isScatter);
  } else {
    return null; // Can't calculate without symbols
  }
  if (scatterSymbol && scatterSymbol.pays[scatterCount]) {
    const totalBet = betPerLine * totalLines;
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

// Calculate all wins for a spin result
function calculateAllWins(symbols, betPerLine) {
  const wins = {
    lineWins: [],
    scatterWin: null,
    totalWin: 0,
    triggersBonus: false
  };
  
  // Check each payline
  for (const payline of PAYLINES) {
    const win = calculatePaylineWin(symbols, payline, betPerLine);
    if (win) {
      wins.lineWins.push(win);
      wins.totalWin += win.win;
    }
  }
  
  // Check scatter
  const scatterWin = calculateScatterWin(symbols, betPerLine, PAYLINES.length);
  if (scatterWin) {
    wins.scatterWin = scatterWin;
    wins.totalWin += scatterWin.win;
    wins.triggersBonus = scatterWin.triggersBonus;
  }
  
  return wins;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PAYLINES, calculatePaylineWin, calculateScatterWin, calculateAllWins };
}

