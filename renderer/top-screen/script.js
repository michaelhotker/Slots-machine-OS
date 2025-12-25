// Top Screen Controller
class TopScreenController {
  constructor() {
    this.jackpots = {
      mega: 5000000,   // $50,000 in cents
      major: 1000000,  // $10,000
      minor: 100000,   // $1,000
      mini: 10000      // $100
    };
    
    this.recentWins = [];
    this.init();
  }

  init() {
    this.setupElements();
    this.setupIPCListeners();
    this.startJackpotTicker();
    this.generateRecentWins();
    
    console.log('Top screen initialized');
  }

  setupElements() {
    // Jackpot displays
    this.megaJackpot = document.getElementById('mega-jackpot');
    this.majorJackpot = document.getElementById('major-jackpot');
    this.minorJackpot = document.getElementById('minor-jackpot');
    this.miniJackpot = document.getElementById('mini-jackpot');
    
    // Celebration overlays
    this.winCelebration = document.getElementById('win-celebration');
    this.celebrationTitle = document.getElementById('celebration-title');
    this.celebrationAmount = document.getElementById('celebration-amount');
    
    this.jackpotCelebration = document.getElementById('jackpot-celebration');
    this.jackpotWinAmount = document.getElementById('jackpot-win-amount');
    
    // Wins carousel
    this.winsCarousel = document.getElementById('wins-carousel');
  }

  setupIPCListeners() {
    // State updates
    window.slotAPI.onStateUpdate((state) => {
      this.updateFromState(state);
    });
    
    // Spin events
    window.slotAPI.onSpinStarted(() => {
      this.onSpinStarted();
    });
    
    // Win events
    window.slotAPI.onWinEvent((data) => {
      this.onWinEvent(data);
    });
    
    // Jackpot wins
    window.slotAPI.onJackpotWon((amount) => {
      this.onJackpotWon(amount);
    });
  }

  updateFromState(state) {
    // Update jackpots based on main state
    // Progressive jackpot increases with each spin
    if (state.jackpot) {
      this.jackpots.mega = state.jackpot * 5;
      this.jackpots.major = state.jackpot;
      this.jackpots.minor = Math.floor(state.jackpot / 10);
      this.jackpots.mini = Math.floor(state.jackpot / 100);
    }
    
    this.updateJackpotDisplays();
  }

  startJackpotTicker() {
    // Slowly increment jackpots for visual effect
    setInterval(() => {
      // Random small increments
      this.jackpots.mega += Math.floor(Math.random() * 100);
      this.jackpots.major += Math.floor(Math.random() * 20);
      this.jackpots.minor += Math.floor(Math.random() * 5);
      this.jackpots.mini += Math.floor(Math.random() * 1);
      
      this.updateJackpotDisplays();
    }, 2000);
  }

  updateJackpotDisplays() {
    this.megaJackpot.textContent = this.formatCurrency(this.jackpots.mega);
    this.majorJackpot.textContent = this.formatCurrency(this.jackpots.major);
    this.minorJackpot.textContent = this.formatCurrency(this.jackpots.minor);
    this.miniJackpot.textContent = this.formatCurrency(this.jackpots.mini);
  }

  formatCurrency(cents) {
    return '$' + (cents / 100).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  generateRecentWins() {
    const names = [
      'Lucky Player', 'Fortune Seeker', 'High Roller', 'Diamond Dan',
      'Golden Girl', 'Slot Master', 'Big Winner', 'Jack Pot',
      'Lady Luck', 'Wild Card'
    ];
    
    // Generate random recent wins
    this.recentWins = [];
    for (let i = 0; i < 10; i++) {
      this.recentWins.push({
        player: names[Math.floor(Math.random() * names.length)],
        game: 'Lucky Fortune',
        prize: Math.floor(Math.random() * 5000) + 100
      });
    }
    
    this.updateWinsCarousel();
    this.startWinsRotation();
  }

  updateWinsCarousel() {
    const visibleWins = this.recentWins.slice(0, 3);
    
    this.winsCarousel.innerHTML = visibleWins.map(win => `
      <div class="win-card">
        <span class="win-player">${win.player}</span>
        <span class="win-game">${win.game}</span>
        <span class="win-prize">${this.formatCurrency(win.prize * 100)}</span>
      </div>
    `).join('');
  }

  startWinsRotation() {
    // Rotate wins display every 5 seconds
    setInterval(() => {
      const first = this.recentWins.shift();
      this.recentWins.push(first);
      
      // Animate transition
      this.winsCarousel.style.opacity = '0';
      setTimeout(() => {
        this.updateWinsCarousel();
        this.winsCarousel.style.opacity = '1';
      }, 300);
    }, 5000);
  }

  onSpinStarted() {
    // Could add visual effects when spin starts
    // Like highlighting jackpots or adding anticipation effects
  }

  onWinEvent(data) {
    const { amount, bet } = data;
    const multiplier = amount / (bet * 20);
    
    // Only show celebration for significant wins
    if (multiplier >= 5) {
      this.showWinCelebration(amount, multiplier);
      
      // Add to recent wins
      this.addRecentWin(amount);
    }
  }

  showWinCelebration(amount, multiplier) {
    let title = 'WINNER!';
    if (multiplier >= 20) title = 'BIG WIN!';
    if (multiplier >= 50) title = 'MEGA WIN!';
    if (multiplier >= 100) title = 'SUPER WIN!';
    
    this.celebrationTitle.textContent = title;
    this.celebrationAmount.textContent = this.formatCurrency(amount);
    
    this.winCelebration.classList.add('active');
    
    // Animate the amount counting up
    this.animateAmount(this.celebrationAmount, amount);
    
    // Hide after a delay
    setTimeout(() => {
      this.winCelebration.classList.remove('active');
    }, 4000);
  }

  onJackpotWon(amount) {
    this.jackpotWinAmount.textContent = this.formatCurrency(amount);
    this.jackpotCelebration.classList.add('active');
    
    // Animate the amount
    this.animateAmount(this.jackpotWinAmount, amount);
    
    // Add to recent wins
    this.addRecentWin(amount);
    
    // Hide after a longer delay for jackpots
    setTimeout(() => {
      this.jackpotCelebration.classList.remove('active');
    }, 8000);
  }

  animateAmount(element, finalAmount) {
    const duration = 2000;
    const startTime = Date.now();
    const startValue = 0;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(startValue + (finalAmount - startValue) * eased);
      
      element.textContent = this.formatCurrency(current);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  }

  addRecentWin(amount) {
    // Add new win to the front
    this.recentWins.unshift({
      player: 'YOU!',
      game: 'Lucky Fortune',
      prize: amount / 100
    });
    
    // Keep only last 10 wins
    this.recentWins = this.recentWins.slice(0, 10);
    
    this.updateWinsCarousel();
  }
}

// Add transition styles
const style = document.createElement('style');
style.textContent = `
  .wins-carousel {
    transition: opacity 0.3s ease;
  }
`;
document.head.appendChild(style);

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.topController = new TopScreenController();
});

