// Main Screen Controller - Enhanced for Realistic Casino Feel
class MainScreenController {
  constructor() {
    this.slotMachine = null;
    this.state = {
      credits: 0,
      currentBet: 1,
      isSpinning: false,
      autoPlay: false,
      // Free Spins Bonus Feature
      freeSpinsMode: false,
      freeSpinsRemaining: 0,
      freeSpinsTotal: 0,
      freeSpinsWinnings: 0,
      freeSpinsBet: 0,
      freeSpinsMultiplier: 2 // Wins multiplied during free spins
    };
    
    this.reelAnimations = [];
    this.init();
  }

  async init() {
    try {
      // Check if required globals are available
      if (typeof SlotMachine === 'undefined') {
        console.error('SlotMachine class not found! Make sure slotMachine.js is loaded.');
        return;
      }
      
      if (typeof SYMBOLS === 'undefined') {
        console.error('SYMBOLS not found! Make sure symbols.js is loaded.');
        return;
      }
      
      if (typeof PAYLINES === 'undefined') {
        console.error('PAYLINES not found! Make sure paytable.js is loaded.');
        return;
      }
      
      // Initialize slot machine game logic
      this.slotMachine = new SlotMachine();
      
      // Setup UI elements
      this.setupElements();
      this.setupEventListeners();
      this.setupReels();
      
      // Connect to main process
      if (window.slotAPI) {
        await this.syncState();
        this.setupIPCListeners();
      } else {
        console.warn('slotAPI not available - running in standalone mode');
        // Set default credits for testing
        this.state.credits = 1000;
        this.updateDisplays();
        console.log('Game ready! Click "ADD $10" to add more credits, or start playing with your current credits.');
      }
      
      // Populate paytable
      this.populatePaytable();
      
      // Initialize sound manager on first click (required by browsers)
      document.addEventListener('click', () => {
        if (window.soundManager && !window.soundManager.initialized) {
          window.soundManager.init();
        }
      }, { once: true });
      
      console.log('Main screen initialized successfully');
    } catch (error) {
      console.error('Failed to initialize main screen:', error);
      alert('Failed to initialize game. Check console for errors.');
    }
  }

  setupElements() {
    // Display elements
    this.creditsDisplay = document.getElementById('credits-display');
    this.betDisplay = document.getElementById('bet-display');
    this.linesDisplay = document.getElementById('lines-display');
    this.totalBetDisplay = document.getElementById('total-bet-display');
    this.winAmount = document.getElementById('win-amount');
    this.winDisplay = document.getElementById('win-display');
    this.jackpotAmount = document.getElementById('jackpot-amount');
    
    // Buttons
    this.spinBtn = document.getElementById('spin-btn');
    this.betUpBtn = document.getElementById('bet-up-btn');
    this.betDownBtn = document.getElementById('bet-down-btn');
    this.maxBetBtn = document.getElementById('max-bet-btn');
    this.autoBtn = document.getElementById('auto-btn');
    this.cashOutBtn = document.getElementById('cash-out-btn');
    this.demoBtn = document.getElementById('demo-btn');
    
    // Overlays
    this.paytableOverlay = document.getElementById('paytable-overlay');
    this.bigWinOverlay = document.getElementById('big-win-overlay');
    this.bigWinTitle = document.getElementById('big-win-title');
    this.bigWinAmount = document.getElementById('big-win-amount');
    this.freeSpinsOverlay = document.getElementById('free-spins-overlay');
    
    // Reels
    this.reels = [];
    for (let i = 1; i <= 5; i++) {
      this.reels.push(document.getElementById(`reel-${i}`));
    }
  }

  setupEventListeners() {
    // Spin button - blur after click so Enter key works globally
    if (this.spinBtn) {
      this.spinBtn.addEventListener('click', (e) => {
        this.spin();
        e.target.blur();
      });
    }
    
    // Bet controls (if they exist)
    if (this.betUpBtn) {
      this.betUpBtn.addEventListener('click', (e) => { this.changeBet(1); e.target.blur(); });
    }
    if (this.betDownBtn) {
      this.betDownBtn.addEventListener('click', (e) => { this.changeBet(-1); e.target.blur(); });
    }
    if (this.maxBetBtn) {
      this.maxBetBtn.addEventListener('click', (e) => { this.setMaxBet(); e.target.blur(); });
    }
    
    // Auto play
    if (this.autoBtn) {
      this.autoBtn.addEventListener('click', (e) => { this.toggleAutoPlay(); e.target.blur(); });
    }
    
    // Cash out / Lobby button
    if (this.cashOutBtn) {
      this.cashOutBtn.addEventListener('click', (e) => { this.addDemoCredits(); e.target.blur(); });
    }
    
    // Demo credits
    if (this.demoBtn) {
      this.demoBtn.addEventListener('click', () => this.addDemoCredits());
    }
    
    // Sound toggle
    const soundBtn = document.getElementById('sound-btn');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => this.toggleSound());
    }
    
    // Paytable button
    const paytableBtn = document.getElementById('paytable-btn');
    if (paytableBtn) {
      paytableBtn.addEventListener('click', () => {
        if (this.paytableOverlay) {
          this.paytableOverlay.classList.add('active');
        }
      });
    }
    
    // Paytable close
    const closePaytable = document.getElementById('close-paytable');
    if (closePaytable) {
      closePaytable.addEventListener('click', () => {
        if (this.paytableOverlay) {
          this.paytableOverlay.classList.remove('active');
        }
      });
    }
    
    // Lines selection buttons
    const lineButtons = [4, 8, 14, 20, 26];
    lineButtons.forEach(lines => {
      const btn = document.getElementById(`lines-${lines}`);
      if (btn) {
        btn.addEventListener('click', (e) => { this.setLines(lines); e.target.blur(); });
      }
    });
    
    // Keyboard controls
    document.addEventListener('keydown', (e) => this.handleKeyPress(e));
  }
  
  async setLines(numLines) {
    // Update active line button
    document.querySelectorAll('.lines-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    const activeBtn = document.getElementById(`lines-${numLines}`);
    if (activeBtn) {
      activeBtn.classList.add('active');
    }
    
    // Update bet based on lines
    this.state.currentBet = numLines;
    
    // Sync bet to main process
    if (window.slotAPI && window.slotAPI.setBet) {
      await window.slotAPI.setBet(numLines);
    }
    this.updateDisplays();
    this.playSound('click');
  }

  toggleSound() {
    if (window.soundManager) {
      window.soundManager.enabled = !window.soundManager.enabled;
      const icon = document.getElementById('sound-icon');
      if (icon) {
        icon.textContent = window.soundManager.enabled ? '🔊' : '🔇';
      }
      // Play a test sound if enabling
      if (window.soundManager.enabled) {
        this.playSound('click');
      }
    }
  }

  setupIPCListeners() {
    if (!window.slotAPI) {
      console.warn('slotAPI not available - IPC listeners not set up');
      return;
    }
    
    // Listen for state updates from main process
    if (window.slotAPI.onStateUpdate) {
      window.slotAPI.onStateUpdate((state) => {
        this.updateFromState(state);
      });
    }
    
    // Listen for credit insertions
    if (window.slotAPI.onCreditInserted) {
      window.slotAPI.onCreditInserted((amount) => {
        this.showCreditAnimation(amount);
      });
    }
  }

  async syncState() {
    try {
      if (window.slotAPI && window.slotAPI.getState) {
        const state = await window.slotAPI.getState();
        this.updateFromState(state);
      } else {
        // Fallback: use default state
        this.state.credits = 0;
        this.state.currentBet = 1;
        this.updateDisplays();
      }
    } catch (error) {
      console.error('Failed to sync state:', error);
      // Fallback: use default state
      this.state.credits = 0;
      this.state.currentBet = 1;
      this.updateDisplays();
    }
  }

  updateFromState(state) {
    this.state.credits = state.credits;
    this.state.currentBet = state.currentBet;
    
    this.updateDisplays();
    this.updateJackpot(state.jackpot);
  }

  setupReels() {
    // Create symbol elements for each reel
    this.reels.forEach((reel, index) => {
      const strip = reel.querySelector('.reel-strip');
      strip.innerHTML = '';
      strip.style.transform = 'translateY(0)';
      
      // Add initial symbols (3 visible rows - matches game logic)
      for (let i = 0; i < 3; i++) {
        const symbol = this.createSymbolElement(this.slotMachine.getRandomSymbol());
        strip.appendChild(symbol);
      }
    });
  }

  createSymbolElement(symbolData) {
    const div = document.createElement('div');
    div.className = 'symbol';
    div.dataset.symbol = symbolData.id;
    
    // Check if this is a card symbol with special display
    if (symbolData.isCard && symbolData.display) {
      // Create styled card symbol
      const cardSpan = document.createElement('span');
      cardSpan.className = `card-symbol card-${symbolData.cardColor || 'gold'}`;
      cardSpan.textContent = symbolData.display;
      div.appendChild(cardSpan);
    } else {
      // Regular emoji symbol
      div.innerHTML = symbolData.icon;
    }
    
    return div;
  }

  // Helper to format cents as dollar amount
  formatMoney(cents) {
    return '$' + (cents / 100).toFixed(2);
  }

  updateDisplays() {
    // Update credits/balance display (show as dollars)
    if (this.creditsDisplay) {
      this.creditsDisplay.textContent = this.formatMoney(this.state.credits);
    }
    
    // Update bet display (show as dollars - bet per line * 20 lines)
    if (this.betDisplay) {
      this.betDisplay.textContent = this.formatMoney(this.state.currentBet * 20);
    }
    
    // Update total bet display
    if (this.totalBetDisplay) {
      this.totalBetDisplay.textContent = this.formatMoney(this.state.currentBet * 20);
    }
    
    // Update win display
    if (this.winAmount && !this.state.isSpinning) {
      // Win amount is set elsewhere during wins
    }
    
    // Update button states
    if (this.spinBtn) {
      this.spinBtn.disabled = this.state.credits < this.state.currentBet * 20 || this.state.isSpinning;
    }
  }

  updateJackpot(amount) {
    if (this.jackpotAmount) {
      this.jackpotAmount.textContent = '$' + (amount / 100).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }
  }

  async changeBet(direction) {
    if (this.state.isSpinning) return;
    
    const betLevels = [1, 2, 3, 5, 10, 20, 50, 100];
    const currentIndex = betLevels.indexOf(this.state.currentBet);
    let newIndex = currentIndex + direction;
    
    newIndex = Math.max(0, Math.min(newIndex, betLevels.length - 1));
    const newBet = betLevels[newIndex];
    
    if (window.slotAPI && window.slotAPI.setBet) {
      await window.slotAPI.setBet(newBet);
    }
    this.state.currentBet = newBet;
    this.updateDisplays();
    
    this.playSound('click');
  }

  async setMaxBet() {
    if (this.state.isSpinning) return;
    
    if (window.slotAPI && window.slotAPI.setBet) {
      await window.slotAPI.setBet(100);
    }
    this.state.currentBet = 100;
    this.updateDisplays();
    
    this.playSound('click');
  }

  async spin() {
    if (this.state.isSpinning) return;
    
    const totalBet = this.state.currentBet * 20;
    
    // During free spins, don't deduct credits
    if (!this.state.freeSpinsMode) {
      if (this.state.credits < totalBet) {
        this.showMessage('Insufficient balance!');
        return;
      }
    }

    // Start spin
    this.state.isSpinning = true;
    this.spinBtn.disabled = true;
    this.spinBtn.classList.add('spinning');
    
    // Deduct bet from credits (only if not in free spins)
    if (!this.state.freeSpinsMode) {
      this.state.credits -= totalBet;
    }
    this.updateDisplays();
    
    // Notify main process
    if (window.slotAPI && window.slotAPI.startSpin) {
      await window.slotAPI.startSpin();
    }
    
    // Clear previous win
    if (this.winAmount) this.winAmount.textContent = '$0.00';
    if (this.winDisplay) this.winDisplay.classList.remove('has-win');
    
    // Clear previous highlights
    document.querySelectorAll('.symbol.winning').forEach(s => s.classList.remove('winning'));
    document.querySelectorAll('.payline.active').forEach(p => p.classList.remove('active'));
    
    // Play spin sound
    this.playSound('spin');
    
    // Get spin result FIRST (like real machines - outcome is determined before spin)
    // Use free spins bet if in free spins mode
    const betToUse = this.state.freeSpinsMode ? this.state.freeSpinsBet : this.state.currentBet;
    const result = this.slotMachine.spin(betToUse);
    
    // Apply free spins multiplier to wins
    let actualWin = result.totalWin;
    if (this.state.freeSpinsMode && result.totalWin > 0) {
      actualWin = result.totalWin * this.state.freeSpinsMultiplier;
      this.state.freeSpinsWinnings += actualWin;
    }
    
    // Animate reels with realistic casino-style mechanics
    await this.animateReelsRealistic(result.reels, result);
    
    // Calculate and show win (with multiplier in free spins)
    if (actualWin > 0) {
      // Override result.totalWin for display
      const displayResult = { ...result, totalWin: actualWin };
      await this.showWin(displayResult);
    } else {
      // WA EGM COMPLIANCE: Near-miss displays are PROHIBITED
      // Section 8(ii): "perceptions of control or near miss displays are not permitted"
      // Reference: https://www.dlgsc.wa.gov.au/department/publications/publication/electronic-gaming-machines-policy
      
      // Brief pause after no-win spin
      await this.delay(500);
    }
    
    // Add win to credits
    this.state.credits += actualWin;
    
    // Notify main process of result
    if (window.slotAPI && window.slotAPI.endSpin) {
      await window.slotAPI.endSpin(actualWin);
    }
    
    // Update display with new credits
    this.updateDisplays();
    
    // Check for free spins trigger (3+ scatter symbols)
    if (result.triggersBonus) {
      await this.triggerFreeSpins(result.scatterWin ? result.scatterWin.count : 3);
    }
    
    // Handle free spins countdown
    if (this.state.freeSpinsMode) {
      this.state.freeSpinsRemaining--;
      this.updateFreeSpinsDisplay();
      
      if (this.state.freeSpinsRemaining <= 0) {
        await this.endFreeSpins();
      }
    }
    
    // End spin
    this.state.isSpinning = false;
    this.spinBtn.disabled = false;
    this.spinBtn.classList.remove('spinning');
    
    // Auto-continue free spins after a delay
    if (this.state.freeSpinsMode && this.state.freeSpinsRemaining > 0) {
      await this.delay(1500);
      this.spin();
    }
    
    // Continue auto play if enabled
    // WA EGM COMPLIANCE: Auto-play disabled
    // if (this.state.autoPlay && this.state.credits >= totalBet) {
    //   setTimeout(() => this.spin(), 2000);
    // }
  }

  // Reel animation - Faster paced gameplay
  async animateReelsRealistic(finalSymbols, result) {
    const spinDuration = 1200; // Faster spin time
    const reelStopDelays = [0, 200, 400, 600, 800]; // Quick staggered stops
    
    // Start all reels spinning simultaneously
    this.reels.forEach((reel, index) => {
      this.startReelSpin(reel);
    });
    
    // Wait for spin duration
    await this.delay(spinDuration);
    
    // Stop reels one by one with final symbols
    for (let i = 0; i < this.reels.length; i++) {
      await this.delay(reelStopDelays[i] > 0 ? 200 : 0);
      await this.stopReel(this.reels[i], finalSymbols[i], i, result);
    }
    
    // Total time: ~1.2s spin + ~0.8s stops = ~2 seconds
  }

  startReelSpin(reel) {
    const strip = reel.querySelector('.reel-strip');
    
    // Mark reel as spinning
    reel.classList.add('spinning');
    
    // Clear existing symbols and create spinning set
    strip.innerHTML = '';
    strip.style.transition = 'none';
    strip.style.transform = 'translateY(0)';
    
    // Add spinning symbols (more than visible for scrolling effect)
    const spinSymbolCount = 20;
    for (let i = 0; i < spinSymbolCount; i++) {
      const symbol = this.createSymbolElement(this.slotMachine.getRandomSymbol());
      strip.appendChild(symbol);
    }
    
    // Add CSS animation class for spinning
    strip.classList.add('spinning-animation');
  }

  stopReel(reel, reelSymbols, reelIndex, result) {
    return new Promise((resolve) => {
      const strip = reel.querySelector('.reel-strip');
      
      // Remove spinning animation
      strip.classList.remove('spinning-animation');
      reel.classList.remove('spinning');
      reel.classList.add('stopping');
      
      // Clear and set final symbols (3 visible symbols)
      strip.innerHTML = '';
      strip.style.transition = 'none';
      strip.style.transform = 'translateY(0)';
      
      // reelSymbols is an array of 3 symbols (top, middle, bottom row)
      // Create each symbol element
      for (let i = 0; i < reelSymbols.length; i++) {
        const symbol = this.createSymbolElement(reelSymbols[i]);
        strip.appendChild(symbol);
      }
      
      // Play stop sound
      this.playSound('reelStop');
      
      // Brief bounce effect
      const stopTime = 150;
      setTimeout(() => {
        reel.classList.remove('stopping');
        
        // Check if this reel is part of a winning combination
        const isWinningReel = result.winLines && result.winLines.some(win => 
          win.positions && win.positions.some(pos => pos.reel === reelIndex)
        );
        
        if (isWinningReel) {
          // Add winning highlight to middle symbol
          const symbols = strip.querySelectorAll('.symbol');
          if (symbols[1]) {
            symbols[1].classList.add('symbol-landing');
          }
        }
        
        resolve();
      }, stopTime);
    });
  }

  async showWin(result) {
    // Brief pause before win celebration (realistic)
    await this.delay(300);
    
    this.playSound('win');
    
    // Animate win amount
    await this.animateWinAmount(result.totalWin);
    
    // Highlight winning symbols and paylines
    this.highlightWinningSymbols(result.winLines);
    this.highlightPaylines(result.winLines);
    
    // Show big win overlay for large wins
    const betMultiplier = result.totalWin / (this.state.currentBet * 20);
    if (betMultiplier >= 10) {
      await this.showBigWin(result.totalWin, betMultiplier);
    } else if (betMultiplier >= 5) {
      // Medium win celebration
      this.playSound('bigWin');
    }
  }

  animateWinAmount(amount) {
    return new Promise((resolve) => {
      if (this.winDisplay) {
        this.winDisplay.classList.add('has-win');
      }
      
      const duration = 1500;
      const startTime = Date.now();
      const startValue = 0;
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-out cubic)
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(startValue + (amount - startValue) * eased);
        
        // Format as currency with $ prefix
        if (this.winAmount) {
          this.winAmount.textContent = this.formatMoney(current);
        }
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
      
      animate();
    });
  }

  highlightWinningSymbols(winLines) {
    // Clear previous highlights
    document.querySelectorAll('.symbol.winning').forEach(s => s.classList.remove('winning'));
    
    // Add highlights to winning positions with delay
    winLines.forEach((line, lineIndex) => {
      setTimeout(() => {
        line.positions.forEach(pos => {
          const reel = this.reels[pos.reel];
          const symbols = reel.querySelectorAll('.symbol');
          // Middle symbol is at index 1 (of 3 symbols: 0, 1, 2)
          if (symbols[1]) {
            symbols[1].classList.add('winning');
          }
        });
      }, lineIndex * 100);
    });
    
    // Remove highlights after delay
    setTimeout(() => {
      document.querySelectorAll('.symbol.winning').forEach(s => s.classList.remove('winning'));
    }, 4000);
  }

  highlightPaylines(winLines) {
    // Show active paylines (if payline elements exist)
    winLines.forEach(win => {
      if (win.payline) {
        const paylineId = win.payline.id;
        const paylineElement = document.querySelector(`.payline[data-payline="${paylineId}"]`);
        if (paylineElement) {
          paylineElement.classList.add('active');
        }
      }
    });
    
    // Also highlight middle payline if any win
    if (winLines.length > 0) {
      const middlePayline = document.querySelector('.payline-middle');
      if (middlePayline) {
        middlePayline.classList.add('active');
      }
    }
    
    // Remove highlights after delay
    setTimeout(() => {
      document.querySelectorAll('.payline.active').forEach(p => p.classList.remove('active'));
    }, 3000);
  }

  async showBigWin(amount, multiplier) {
    let title = 'BIG WIN!';
    let soundType = 'bigWin';
    
    if (multiplier >= 50) {
      title = 'MEGA WIN!';
      soundType = 'megaWin';
    }
    if (multiplier >= 100) {
      title = 'JACKPOT!';
      soundType = 'jackpot';
    }
    
    if (this.bigWinTitle) {
      this.bigWinTitle.textContent = title;
    }
    if (this.bigWinOverlay) {
      this.bigWinOverlay.classList.add('active');
    }
    
    // Play the appropriate win sound immediately
    this.playSound(soundType);
    
    // Animate amount
    await this.animateBigWinAmount(amount);
    
    // Hide after delay
    await this.delay(4000);
    if (this.bigWinOverlay) {
      this.bigWinOverlay.classList.remove('active');
    }
  }

  animateBigWinAmount(amount) {
    return new Promise((resolve) => {
      const duration = 2500;
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(amount * eased);
        
        // Format as currency
        if (this.bigWinAmount) {
          this.bigWinAmount.textContent = this.formatMoney(current);
        }
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
      
      animate();
    });
  }

  toggleAutoPlay() {
    // WA EGM COMPLIANCE: Auto-play is PROHIBITED
    // Section 2(ii): "games shall not incorporate any form of auto play feature"
    // Reference: https://www.dlgsc.wa.gov.au/department/publications/publication/electronic-gaming-machines-policy
    console.warn('Auto-play disabled for WA EGM compliance');
    this.showMessage('Auto-play not available');
    // Feature disabled - do nothing
  }

  async cashOut() {
    if (this.state.credits <= 0) return;
    
    let amount = this.state.credits;
    if (window.slotAPI && window.slotAPI.cashOut) {
      amount = await window.slotAPI.cashOut();
    }
    this.showMessage(`Cashing out: ${this.formatMoney(amount)}`);
    this.state.credits = 0;
    this.updateDisplays();
    
    this.playSound('cashOut');
  }

  // ===== FREE SPINS BONUS FEATURE =====
  
  async triggerFreeSpins(scatterCount) {
    // Calculate free spins awarded based on scatter count
    const freeSpinsTable = {
      3: 8,   // 3 scatters = 8 free spins
      4: 15,  // 4 scatters = 15 free spins  
      5: 25   // 5 scatters = 25 free spins
    };
    
    const spinsAwarded = freeSpinsTable[scatterCount] || 8;
    
    // If already in free spins, add to existing (retrigger)
    if (this.state.freeSpinsMode) {
      this.state.freeSpinsRemaining += spinsAwarded;
      this.state.freeSpinsTotal += spinsAwarded;
      this.showFreeSpinsRetrigger(spinsAwarded);
    } else {
      // Start new free spins session
      this.state.freeSpinsMode = true;
      this.state.freeSpinsRemaining = spinsAwarded;
      this.state.freeSpinsTotal = spinsAwarded;
      this.state.freeSpinsWinnings = 0;
      this.state.freeSpinsBet = this.state.currentBet; // Lock in bet
      
      await this.showFreeSpinsIntro(spinsAwarded);
    }
    
    this.updateFreeSpinsDisplay();
  }
  
  async showFreeSpinsIntro(spinsAwarded) {
    // Play bonus trigger sound
    this.playSound('bonus');
    
    // Show the free spins overlay
    const overlay = this.freeSpinsOverlay;
    if (overlay) {
      const titleEl = overlay.querySelector('.free-spins-title');
      const countEl = overlay.querySelector('.free-spins-awarded');
      const multiplierEl = overlay.querySelector('.free-spins-multiplier');
      
      if (titleEl) titleEl.textContent = '🎰 FREE SPINS! 🎰';
      if (countEl) countEl.textContent = `${spinsAwarded} FREE SPINS`;
      if (multiplierEl) multiplierEl.textContent = `All wins x${this.state.freeSpinsMultiplier}!`;
      
      overlay.classList.add('active');
      
      // Wait for player to see the intro
      await this.delay(4000);
      
      overlay.classList.remove('active');
      overlay.classList.add('minimized');
    }
  }
  
  showFreeSpinsRetrigger(additionalSpins) {
    this.playSound('megaWin');
    this.showMessage(`🎉 RETRIGGER! +${additionalSpins} FREE SPINS!`);
  }
  
  updateFreeSpinsDisplay() {
    const overlay = this.freeSpinsOverlay;
    if (overlay && this.state.freeSpinsMode) {
      const counterEl = overlay.querySelector('.free-spins-counter');
      const winningsEl = overlay.querySelector('.free-spins-winnings');
      
      if (counterEl) {
        counterEl.textContent = `SPINS: ${this.state.freeSpinsRemaining} / ${this.state.freeSpinsTotal}`;
      }
      if (winningsEl) {
        winningsEl.textContent = `WON: ${this.formatMoney(this.state.freeSpinsWinnings)}`;
      }
    }
  }
  
  async endFreeSpins() {
    const totalWon = this.state.freeSpinsWinnings;
    
    // Play celebration sound
    if (totalWon > 0) {
      this.playSound('megaWin');
    }
    
    // Show final summary
    const overlay = this.freeSpinsOverlay;
    if (overlay) {
      overlay.classList.remove('minimized');
      overlay.classList.add('active');
      
      const titleEl = overlay.querySelector('.free-spins-title');
      const countEl = overlay.querySelector('.free-spins-awarded');
      const multiplierEl = overlay.querySelector('.free-spins-multiplier');
      
      if (titleEl) titleEl.textContent = '🏆 BONUS COMPLETE! 🏆';
      if (countEl) countEl.textContent = `TOTAL WON: ${this.formatMoney(totalWon)}`;
      if (multiplierEl) multiplierEl.textContent = `From ${this.state.freeSpinsTotal} Free Spins`;
      
      await this.delay(4000);
      
      overlay.classList.remove('active');
    }
    
    // Reset free spins state
    this.state.freeSpinsMode = false;
    this.state.freeSpinsRemaining = 0;
    this.state.freeSpinsTotal = 0;
    this.state.freeSpinsWinnings = 0;
    this.state.freeSpinsBet = 0;
    
    this.showMessage('FREE SPINS COMPLETE!');
  }

  async addDemoCredits() {
    if (window.slotAPI && window.slotAPI.addDemoCredits) {
      await window.slotAPI.addDemoCredits(1000); // Add $10 (1000 cents)
    } else {
      // Fallback: add credits locally
      this.state.credits += 1000;
      this.updateDisplays();
    }
    this.playSound('coin');
  }

  showCreditAnimation(amount) {
    // Create floating credit indicator
    const indicator = document.createElement('div');
    indicator.className = 'credit-indicator';
    indicator.textContent = `+$${(amount / 100).toFixed(2)}`;
    indicator.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 3rem;
      color: #00ff88;
      text-shadow: 0 0 20px #00ff88;
      z-index: 1000;
      animation: creditFloat 1.5s ease-out forwards;
    `;
    
    document.body.appendChild(indicator);
    
    setTimeout(() => indicator.remove(), 1500);
    
    this.playSound('coin');
  }

  showMessage(message) {
    console.log(message);
    // Could add a toast notification here
  }

  populatePaytable() {
    const grid = document.getElementById('paytable-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    if (typeof SYMBOLS === 'undefined') {
      grid.innerHTML = '<p>Paytable data not available</p>';
      return;
    }
    
    SYMBOLS.forEach(symbol => {
      const item = document.createElement('div');
      item.className = 'paytable-item';
      
      const pays = Object.entries(symbol.pays || {})
        .map(([count, mult]) => `${count}x = ${mult}x bet`)
        .join('<br>');
      
      item.innerHTML = `
        <div class="paytable-symbol">${symbol.icon}</div>
        <div class="paytable-name">${symbol.name}</div>
        <div class="paytable-pays">${pays}</div>
      `;
      
      grid.appendChild(item);
    });
  }

  handleKeyPress(e) {
    // Don't trigger spin if typing in an input field
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    
    switch(e.code) {
      case 'Enter':
      case 'NumpadEnter':
      case 'Space':
        e.preventDefault();
        e.stopPropagation();
        // Blur any focused button to prevent double-triggering
        if (document.activeElement && document.activeElement.blur) {
          document.activeElement.blur();
        }
        if (!this.state.isSpinning) this.spin();
        break;
      case 'ArrowUp':
        this.changeBet(1);
        break;
      case 'ArrowDown':
        this.changeBet(-1);
        break;
      case 'KeyM':
        this.setMaxBet();
        break;
      case 'KeyP':
        this.paytableOverlay.classList.toggle('active');
        break;
    }
  }

  playSound(type) {
    // Use the global sound manager
    if (window.soundManager) {
      window.soundManager.play(type);
    }
  }

  // ============================================================================
  // WA EGM COMPLIANCE: NEAR-MISS FEATURES DISABLED
  // Section 8(ii): "perceptions of control or near miss displays are not permitted"
  // Reference: https://www.dlgsc.wa.gov.au/department/publications/publication/electronic-gaming-machines-policy
  // ============================================================================
  
  checkNearMiss(reels) {
    // DISABLED FOR WA COMPLIANCE - Near-miss detection is prohibited
    return null;
  }

  async showNearMiss(nearMiss) {
    // DISABLED FOR WA COMPLIANCE - Near-miss displays are prohibited
    // Do nothing
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Add CSS for credit animation
const style = document.createElement('style');
style.textContent = `
  @keyframes creditFloat {
    0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
    20% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
    100% { opacity: 0; transform: translate(-50%, -150%) scale(1); }
  }
  
  .symbol-landing {
    animation: symbolBounce 0.3s ease-out;
  }
  
  @keyframes symbolBounce {
    0% { transform: scale(1); }
    50% { transform: scale(1.15); }
    100% { transform: scale(1); }
  }
`;
document.head.appendChild(style);

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // WA EGM Compliance Disclaimer Handler
  const disclaimer = document.getElementById('compliance-disclaimer');
  const acceptBtn = document.getElementById('accept-disclaimer');
  
  if (disclaimer && acceptBtn) {
    // Check if already accepted this session
    if (sessionStorage.getItem('wa-disclaimer-accepted')) {
      disclaimer.classList.add('hidden');
    }
    
    acceptBtn.addEventListener('click', () => {
      disclaimer.classList.add('hidden');
      sessionStorage.setItem('wa-disclaimer-accepted', 'true');
    });
  }
  
  // Initialize game controller
  window.mainController = new MainScreenController();
});
