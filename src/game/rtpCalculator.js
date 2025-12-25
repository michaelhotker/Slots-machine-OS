// RTP (Return to Player) Calculator & Simulator
// Use this to verify and tune slot machine odds

/**
 * Simulates many spins to calculate actual RTP
 * Run this in Node.js: node src/game/rtpCalculator.js
 */

// Import game modules (works in Node.js)
let SYMBOLS, TOTAL_WEIGHT, PAYLINES, SlotMachine;

try {
  const symbolsModule = require('./symbols.js');
  SYMBOLS = symbolsModule.SYMBOLS;
  TOTAL_WEIGHT = symbolsModule.TOTAL_WEIGHT;
  
  const paytableModule = require('./paytable.js');
  PAYLINES = paytableModule.PAYLINES;
  
  const slotModule = require('./slotMachine.js');
  SlotMachine = slotModule.SlotMachine;
} catch (e) {
  console.log('Run this file from project root: node src/game/rtpCalculator.js');
  process.exit(1);
}

/**
 * Calculate theoretical symbol probabilities
 */
function calculateSymbolProbabilities() {
  console.log('\n═══════════════════════════════════════');
  console.log('       SYMBOL PROBABILITY ANALYSIS');
  console.log('═══════════════════════════════════════\n');
  
  console.log('Symbol         | Weight | Probability');
  console.log('---------------|--------|------------');
  
  SYMBOLS.forEach(sym => {
    const prob = (sym.weight / TOTAL_WEIGHT * 100).toFixed(2);
    const name = sym.name.padEnd(14);
    const weight = String(sym.weight).padStart(6);
    console.log(`${sym.icon} ${name}| ${weight} | ${prob}%`);
  });
  
  console.log('---------------|--------|------------');
  console.log(`Total Weight:  | ${TOTAL_WEIGHT.toString().padStart(6)} | 100.00%`);
}

/**
 * Calculate probability of getting N matching symbols
 */
function calculateMatchProbability(symbolWeight, count, includeWilds = true) {
  const wildWeight = SYMBOLS.find(s => s.isWild)?.weight || 0;
  const symbolProb = symbolWeight / TOTAL_WEIGHT;
  const wildProb = includeWilds ? wildWeight / TOTAL_WEIGHT : 0;
  const combinedProb = symbolProb + wildProb;
  
  // Probability of exactly 'count' consecutive matches from left
  // P = (combined)^count * (1 - combined) for count < 5
  // P = (combined)^5 for count = 5
  
  if (count === 5) {
    return Math.pow(combinedProb, 5);
  } else {
    return Math.pow(combinedProb, count) * (1 - combinedProb);
  }
}

/**
 * Run Monte Carlo simulation to determine actual RTP
 */
function simulateRTP(numSpins = 1000000, betPerLine = 1) {
  console.log('\n═══════════════════════════════════════');
  console.log('       MONTE CARLO RTP SIMULATION');
  console.log('═══════════════════════════════════════\n');
  
  console.log(`Simulating ${numSpins.toLocaleString()} spins...`);
  console.log(`Bet per line: ${betPerLine}`);
  console.log(`Total lines: ${PAYLINES.length}`);
  console.log(`Total bet per spin: ${betPerLine * PAYLINES.length}`);
  
  const slot = new SlotMachine();
  
  let totalWagered = 0;
  let totalWon = 0;
  let wins = 0;
  let bigWins = 0;
  let megaWins = 0;
  
  const winDistribution = {};
  
  const startTime = Date.now();
  
  for (let i = 0; i < numSpins; i++) {
    const result = slot.spin(betPerLine);
    const totalBet = betPerLine * PAYLINES.length;
    
    totalWagered += totalBet;
    totalWon += result.totalWin;
    
    if (result.totalWin > 0) {
      wins++;
      
      const multiplier = result.totalWin / totalBet;
      const bucket = Math.floor(multiplier);
      winDistribution[bucket] = (winDistribution[bucket] || 0) + 1;
      
      if (multiplier >= 10) bigWins++;
      if (multiplier >= 50) megaWins++;
    }
    
    // Progress indicator
    if (i > 0 && i % 100000 === 0) {
      const progress = ((i / numSpins) * 100).toFixed(0);
      const currentRTP = ((totalWon / totalWagered) * 100).toFixed(2);
      process.stdout.write(`\rProgress: ${progress}% | Current RTP: ${currentRTP}%    `);
    }
  }
  
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  
  console.log('\n');
  console.log('───────────────────────────────────────');
  console.log('              RESULTS');
  console.log('───────────────────────────────────────\n');
  
  const rtp = (totalWon / totalWagered) * 100;
  const hitFrequency = (wins / numSpins) * 100;
  
  console.log(`Total Wagered:    ${totalWagered.toLocaleString()}`);
  console.log(`Total Won:        ${totalWon.toLocaleString()}`);
  console.log(`Net Result:       ${(totalWon - totalWagered).toLocaleString()}`);
  console.log('');
  console.log(`★ RTP:            ${rtp.toFixed(2)}%`);
  console.log(`★ Hit Frequency:  ${hitFrequency.toFixed(2)}%`);
  console.log(`★ House Edge:     ${(100 - rtp).toFixed(2)}%`);
  console.log('');
  console.log(`Big Wins (10x+):  ${bigWins.toLocaleString()} (${(bigWins/numSpins*100).toFixed(3)}%)`);
  console.log(`Mega Wins (50x+): ${megaWins.toLocaleString()} (${(megaWins/numSpins*100).toFixed(4)}%)`);
  console.log('');
  console.log(`Simulation time:  ${elapsed}s`);
  
  // Win distribution
  console.log('\n───────────────────────────────────────');
  console.log('         WIN DISTRIBUTION');
  console.log('───────────────────────────────────────\n');
  
  const sortedBuckets = Object.keys(winDistribution).map(Number).sort((a, b) => a - b);
  
  console.log('Multiplier | Count      | Percentage');
  console.log('-----------|------------|------------');
  
  sortedBuckets.slice(0, 20).forEach(bucket => {
    const count = winDistribution[bucket];
    const pct = (count / numSpins * 100).toFixed(3);
    const label = bucket === 0 ? '0-1x' : `${bucket}-${bucket+1}x`;
    console.log(`${label.padEnd(10)} | ${count.toString().padStart(10)} | ${pct}%`);
  });
  
  if (sortedBuckets.length > 20) {
    const highWins = sortedBuckets.slice(20).reduce((sum, b) => sum + winDistribution[b], 0);
    console.log(`20x+       | ${highWins.toString().padStart(10)} | ${(highWins/numSpins*100).toFixed(4)}%`);
  }
  
  return {
    rtp,
    hitFrequency,
    houseEdge: 100 - rtp,
    totalSpins: numSpins
  };
}

/**
 * Compare with real slot machine standards
 */
function compareToRealSlots(rtp) {
  console.log('\n═══════════════════════════════════════');
  console.log('     COMPARISON TO REAL SLOTS');
  console.log('═══════════════════════════════════════\n');
  
  const standards = [
    { name: 'Nevada Minimum', rtp: 75 },
    { name: 'New Jersey Min', rtp: 83 },
    { name: 'UK Minimum', rtp: 70 },
    { name: 'Typical Land Casino', rtp: 92 },
    { name: 'Typical Online Slot', rtp: 96 },
    { name: 'YOUR SLOT', rtp: rtp },
  ];
  
  standards.sort((a, b) => a.rtp - b.rtp);
  
  standards.forEach(s => {
    const bar = '█'.repeat(Math.floor(s.rtp / 2));
    const marker = s.name === 'YOUR SLOT' ? ' ◄◄◄' : '';
    console.log(`${s.name.padEnd(20)} ${s.rtp.toFixed(1)}% ${bar}${marker}`);
  });
  
  console.log('\n');
  
  if (rtp >= 94 && rtp <= 97) {
    console.log('✅ Your RTP is within the IDEAL range for a realistic slot machine!');
  } else if (rtp >= 90 && rtp < 94) {
    console.log('⚠️  Your RTP is slightly low. Consider increasing payouts.');
  } else if (rtp > 97 && rtp <= 99) {
    console.log('⚠️  Your RTP is high (very player-friendly). May want to reduce slightly.');
  } else if (rtp < 90) {
    console.log('❌ Your RTP is too low! Players will lose money too fast.');
  } else if (rtp > 99) {
    console.log('❌ Your RTP is too high! The house will lose money.');
  }
}

// Run if executed directly
if (require.main === module) {
  console.log('\n🎰 SLOT MACHINE RTP ANALYZER 🎰');
  console.log('================================\n');
  
  calculateSymbolProbabilities();
  
  // Run simulation (default 1 million spins)
  const spins = parseInt(process.argv[2]) || 1000000;
  const result = simulateRTP(spins);
  
  compareToRealSlots(result.rtp);
  
  console.log('\n════════════════════════════════════════');
  console.log('To run with different spin count:');
  console.log('  node src/game/rtpCalculator.js 5000000');
  console.log('════════════════════════════════════════\n');
}

module.exports = { simulateRTP, calculateSymbolProbabilities, calculateMatchProbability };

