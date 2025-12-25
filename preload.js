const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods to renderer
contextBridge.exposeInMainWorld('slotAPI', {
  // State management
  getState: () => ipcRenderer.invoke('get-state'),
  onStateUpdate: (callback) => {
    ipcRenderer.on('state-update', (event, state) => callback(state));
  },
  
  // Game controls
  updateCredits: (amount) => ipcRenderer.invoke('update-credits', amount),
  setBet: (bet) => ipcRenderer.invoke('set-bet', bet),
  startSpin: () => ipcRenderer.invoke('start-spin'),
  endSpin: (winAmount) => ipcRenderer.invoke('end-spin', winAmount),
  triggerJackpot: () => ipcRenderer.invoke('trigger-jackpot'),
  addDemoCredits: (amount) => ipcRenderer.invoke('add-demo-credits', amount),
  cashOut: () => ipcRenderer.invoke('cash-out'),
  
  // Event listeners
  onCreditInserted: (callback) => {
    ipcRenderer.on('credit-inserted', (event, amount) => callback(amount));
  },
  onSpinStarted: (callback) => {
    ipcRenderer.on('spin-started', () => callback());
  },
  onWinEvent: (callback) => {
    ipcRenderer.on('win-event', (event, data) => callback(data));
  },
  onJackpotWon: (callback) => {
    ipcRenderer.on('jackpot-won', (event, amount) => callback(amount));
  }
});

