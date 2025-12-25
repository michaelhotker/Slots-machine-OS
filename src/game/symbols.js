// Asian Lucky Fortune Slot Machine Symbols
// Tuned for ~90% RTP with lower hit frequency (fewer but bigger wins)

const SYMBOLS = [
  {
    id: 'wild',
    name: 'Gold Ingot',
    icon: '🥇',
    weight: 6,
    isWild: true,
    pays: {
      3: 125,
      4: 820,
      5: 8200
    }
  },
  {
    id: 'scatter',
    name: 'Yin Yang',
    icon: '☯️',
    weight: 5,
    isScatter: true,
    pays: {
      3: 8,
      4: 42,
      5: 165
    }
  },
  {
    id: 'seven',
    name: 'King',
    icon: '👑',
    display: 'K',
    isCard: true,
    cardColor: 'red',
    weight: 10,
    pays: {
      3: 68,
      4: 500,
      5: 3300
    }
  },
  {
    id: 'bar',
    name: 'Queen',
    icon: '💎',
    display: 'Q',
    isCard: true,
    cardColor: 'gold',
    weight: 12,
    pays: {
      3: 50,
      4: 290,
      5: 1500
    }
  },
  {
    id: 'bell',
    name: 'Ace',
    icon: '🅰️',
    display: 'A',
    isCard: true,
    cardColor: 'purple',
    weight: 14,
    pays: {
      3: 42,
      4: 210,
      5: 750
    }
  },
  {
    id: 'horseshoe',
    name: 'Ten',
    icon: '🔟',
    display: '10',
    isCard: true,
    cardColor: 'purple',
    weight: 18,
    pays: {
      3: 30,
      4: 125,
      5: 500
    }
  },
  {
    id: 'clover',
    name: 'Orange',
    icon: '🍊',
    weight: 20,
    pays: {
      3: 24,
      4: 92,
      5: 375
    }
  },
  {
    id: 'cherry',
    name: 'Tangerine',
    icon: '🍑',
    weight: 22,
    pays: {
      3: 19,
      4: 68,
      5: 250
    }
  },
  {
    id: 'lemon',
    name: 'Fortune Cookie',
    icon: '🥠',
    weight: 24,
    pays: {
      3: 15,
      4: 50,
      5: 185
    }
  },
  {
    id: 'orange',
    name: 'Lantern',
    icon: '🏮',
    weight: 24,
    pays: {
      3: 15,
      4: 50,
      5: 185
    }
  },
  {
    id: 'grape',
    name: 'Dragon',
    icon: '🐉',
    weight: 16,
    pays: {
      3: 22,
      4: 75,
      5: 235
    }
  },
  {
    id: 'watermelon',
    name: 'Lucky Cat',
    icon: '🐱',
    weight: 14,
    pays: {
      3: 26,
      4: 85,
      5: 335
    }
  }
];

// Total weight for probability calculation
const TOTAL_WEIGHT = SYMBOLS.reduce((sum, s) => sum + s.weight, 0);

// Helper function to get symbol by ID
function getSymbolById(id) {
  return SYMBOLS.find(s => s.id === id);
}

// Export for Node.js or make global for browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SYMBOLS, TOTAL_WEIGHT, getSymbolById };
} else {
  window.SYMBOLS = SYMBOLS;
  window.TOTAL_WEIGHT = TOTAL_WEIGHT;
  window.getSymbolById = getSymbolById;
}
