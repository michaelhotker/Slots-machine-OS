// Payline Definitions for 5-Reel Slot Machine
// 50 paylines covering all possible winning patterns (All Aboard Dynamite Dash)

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
  { id: 20, positions: [1, 0, 1, 2, 1], name: 'Wave' },
  
  // Additional patterns for 50 lines
  { id: 21, positions: [0, 1, 0, 2, 1], name: 'Zigzag 1' },
  { id: 22, positions: [2, 1, 2, 0, 1], name: 'Zigzag 2' },
  { id: 23, positions: [1, 1, 0, 1, 2], name: 'Step Pattern 1' },
  { id: 24, positions: [1, 1, 2, 1, 0], name: 'Step Pattern 2' },
  { id: 25, positions: [0, 2, 1, 0, 2], name: 'Cross Pattern 1' },
  { id: 26, positions: [2, 0, 1, 2, 0], name: 'Cross Pattern 2' },
  { id: 27, positions: [1, 0, 2, 1, 0], name: 'Arc Pattern 1' },
  { id: 28, positions: [1, 2, 0, 1, 2], name: 'Arc Pattern 2' },
  { id: 29, positions: [0, 0, 2, 0, 1], name: 'Slope Pattern 1' },
  { id: 30, positions: [2, 2, 0, 2, 1], name: 'Slope Pattern 2' },
  { id: 31, positions: [1, 2, 2, 0, 0], name: 'Curve Pattern 1' },
  { id: 32, positions: [1, 0, 0, 2, 2], name: 'Curve Pattern 2' },
  { id: 33, positions: [0, 1, 2, 0, 1], name: 'Wave Pattern 1' },
  { id: 34, positions: [2, 1, 0, 2, 1], name: 'Wave Pattern 2' },
  { id: 35, positions: [0, 2, 2, 1, 0], name: 'Complex 1' },
  { id: 36, positions: [2, 0, 0, 1, 2], name: 'Complex 2' },
  { id: 37, positions: [1, 0, 2, 0, 1], name: 'Alternating 1' },
  { id: 38, positions: [1, 2, 0, 2, 1], name: 'Alternating 2' },
  { id: 39, positions: [0, 1, 1, 2, 0], name: 'Stair Pattern 1' },
  { id: 40, positions: [2, 1, 1, 0, 2], name: 'Stair Pattern 2' },
  { id: 41, positions: [0, 0, 0, 1, 2], name: 'Top Heavy' },
  { id: 42, positions: [2, 2, 2, 1, 0], name: 'Bottom Heavy' },
  { id: 43, positions: [1, 1, 0, 0, 1], name: 'Center Top' },
  { id: 44, positions: [1, 1, 2, 2, 1], name: 'Center Bottom' },
  { id: 45, positions: [0, 2, 0, 1, 2], name: 'Extreme 1' },
  { id: 46, positions: [2, 0, 2, 1, 0], name: 'Extreme 2' },
  { id: 47, positions: [1, 0, 1, 1, 2], name: 'Mixed 1' },
  { id: 48, positions: [1, 2, 1, 1, 0], name: 'Mixed 2' },
  { id: 49, positions: [0, 1, 2, 2, 1], name: 'Final Pattern 1' },
  { id: 50, positions: [2, 1, 0, 0, 1], name: 'Final Pattern 2' }
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

