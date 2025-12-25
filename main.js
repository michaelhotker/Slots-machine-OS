const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');

// Keep reference to main window to prevent garbage collection
let mainWindow = null;

// Game state
let gameState = {
  credits: 0,
  currentBet: 1,
  totalWon: 0,
  totalBet: 0,
  jackpot: 10000,
  isSpinning: false
};

// Payment manager reference
let paymentManager = null;

function createMainWindow() {
  const displays = screen.getAllDisplays();
  const primaryDisplay = displays[0];
  
  // Single ultrawide portrait display setup
  mainWindow = new BrowserWindow({
    width: primaryDisplay.bounds.width,
    height: primaryDisplay.bounds.height,
    x: primaryDisplay.bounds.x,
    y: primaryDisplay.bounds.y,
    fullscreen: true,
    frame: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    backgroundColor: '#0a0a0a'
  });

  mainWindow.loadFile('renderer/main-screen/index.html');
  
  // Open DevTools in dev mode
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
    app.quit();
  });
}

// Initialize payment manager
async function initPaymentManager() {
  try {
    const PaymentManager = require('./src/payment/paymentManager.js');
    paymentManager = new PaymentManager();
    
    paymentManager.on('credit', (amount) => {
      gameState.credits += amount;
      broadcastState();
      
      if (mainWindow) {
        mainWindow.webContents.send('credit-inserted', amount);
      }
    });

    paymentManager.on('error', (error) => {
      console.error('Payment error:', error);
    });

    await paymentManager.initialize();
    console.log('Payment manager initialized');
  } catch (error) {
    console.log('Payment manager not available (running in demo mode):', error.message);
  }
}

// Broadcast state to main window
function broadcastState() {
  const state = { ...gameState };
  if (mainWindow) mainWindow.webContents.send('state-update', state);
}

// IPC Handlers
ipcMain.handle('get-state', () => {
  return gameState;
});

ipcMain.handle('update-credits', (event, amount) => {
  gameState.credits = Math.max(0, amount);
  broadcastState();
  return gameState.credits;
});

ipcMain.handle('set-bet', (event, bet) => {
  // Allow bet values up to 100 (for lines: 4, 8, 14, 20, 26)
  // Credit check happens at spin time, not here
  gameState.currentBet = Math.max(1, Math.min(bet, 100));
  broadcastState();
  return gameState.currentBet;
});

ipcMain.handle('start-spin', () => {
  // Total bet = bet per line * 20 paylines
  const totalBet = gameState.currentBet * 20;
  
  if (gameState.isSpinning || gameState.credits < totalBet) {
    return false;
  }
  
  gameState.credits -= totalBet;
  gameState.totalBet += totalBet;
  gameState.isSpinning = true;
  broadcastState();
  
  return true;
});

ipcMain.handle('end-spin', (event, winAmount) => {
  gameState.isSpinning = false;
  gameState.credits += winAmount;
  gameState.totalWon += winAmount;
  
  // Update jackpot (small contribution from each spin)
  gameState.jackpot += Math.floor(gameState.currentBet * 0.01);
  
  broadcastState();
  
  return gameState;
});

ipcMain.handle('trigger-jackpot', () => {
  const jackpotAmount = gameState.jackpot;
  gameState.credits += jackpotAmount;
  gameState.totalWon += jackpotAmount;
  gameState.jackpot = 10000; // Reset jackpot
  
  broadcastState();
  
  return jackpotAmount;
});

ipcMain.handle('add-demo-credits', (event, amount) => {
  gameState.credits += amount;
  broadcastState();
  return gameState.credits;
});

ipcMain.handle('cash-out', () => {
  const cashOut = gameState.credits;
  gameState.credits = 0;
  broadcastState();
  
  // In a real system, this would trigger the hopper or ticket printer
  console.log(`Cashing out: $${(cashOut / 100).toFixed(2)}`);
  
  return cashOut;
});

// App lifecycle
app.whenReady().then(async () => {
  createMainWindow();
  await initPaymentManager();
  
  // Initial state broadcast
  setTimeout(broadcastState, 1000);
});

app.on('window-all-closed', () => {
  if (paymentManager) {
    paymentManager.shutdown();
  }
  app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) {
    createMainWindow();
  }
});

