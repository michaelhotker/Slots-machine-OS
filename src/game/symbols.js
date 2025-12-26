// All Aboard Dynamite Dash Slot Machine Symbols
// Mining and train themed symbols matching the game

const SYMBOLS = [
  {
    id: 'wild',
    name: 'Miner',
    icon: '👨⛏️',
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
    name: 'Dynamite',
    icon: '💣',
    weight: 5,
    isScatter: true,
    pays: {
      3: 8,
      4: 42,
      5: 165
    }
  },
  {
    id: 'train',
    name: 'Train',
    icon: '🚂',
    weight: 8,
    isTrain: true, // Special symbol for All Aboard feature
    pays: {
      3: 68,
      4: 500,
      5: 3300
    }
  },
  {
    id: 'mine',
    name: 'Mine Entrance',
    icon: '⛰️',
    weight: 10,
    pays: {
      3: 50,
      4: 290,
      5: 1500
    }
  },
  {
    id: 'goldCart',
    name: 'Gold Cart',
    icon: '🚛',
    weight: 12,
    pays: {
      3: 42,
      4: 210,
      5: 750
    }
  },
  {
    id: 'gemSack',
    name: 'Gem Sack',
    icon: '💎',
    weight: 14,
    pays: {
      3: 30,
      4: 125,
      5: 500
    }
  },
  {
    id: 'helmet',
    name: 'Miner Helmet',
    icon: '⛑️',
    weight: 16,
    pays: {
      3: 24,
      4: 92,
      5: 375
    }
  },
  {
    id: 'pickaxe',
    name: 'Pickaxe',
    icon: '⛏️',
    weight: 18,
    pays: {
      3: 19,
      4: 68,
      5: 250
    }
  },
  {
    id: 'shovel',
    name: 'Shovel',
    icon: '🔨',
    weight: 20,
    pays: {
      3: 15,
      4: 50,
      5: 185
    }
  },
  {
    id: 'q',
    name: 'Queen',
    icon: 'Q',
    display: 'Q',
    isCard: true,
    cardColor: 'gold',
    weight: 22,
    pays: {
      3: 15,
      4: 50,
      5: 185
    }
  },
  {
    id: 'j',
    name: 'Jack',
    icon: 'J',
    display: 'J',
    isCard: true,
    cardColor: 'gold',
    weight: 24,
    pays: {
      3: 12,
      4: 42,
      5: 150
    }
  },
  {
    id: 'a',
    name: 'Ace',
    icon: 'A',
    display: 'A',
    isCard: true,
    cardColor: 'gold',
    weight: 26,
    pays: {
      3: 10,
      4: 35,
      5: 125
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
