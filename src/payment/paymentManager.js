// Payment Manager - Handles all payment device communications
// Supports bill validators, coin acceptors, and card readers

const EventEmitter = require('events');

class PaymentManager extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      // Default configuration
      enableBillValidator: true,
      enableCoinAcceptor: true,
      enableCardReader: false,
      
      // Demo mode for testing without hardware
      demoMode: config.demoMode ?? true,
      
      // Serial port settings
      billValidatorPort: config.billValidatorPort || '/dev/ttyUSB0',
      coinAcceptorPort: config.coinAcceptorPort || '/dev/ttyUSB1',
      cardReaderPort: config.cardReaderPort || '/dev/ttyUSB2',
      
      ...config
    };
    
    this.devices = {
      billValidator: null,
      coinAcceptor: null,
      cardReader: null
    };
    
    this.state = {
      initialized: false,
      acceptingPayments: false,
      totalCredits: 0
    };
  }

  async initialize() {
    console.log('Initializing Payment Manager...');
    
    if (this.config.demoMode) {
      console.log('Running in DEMO MODE - no hardware connected');
      this.state.initialized = true;
      this.state.acceptingPayments = true;
      return true;
    }
    
    try {
      // Initialize bill validator
      if (this.config.enableBillValidator) {
        const BillValidator = require('./billValidator.js');
        this.devices.billValidator = new BillValidator({
          port: this.config.billValidatorPort
        });
        
        this.devices.billValidator.on('credit', (amount) => {
          this.handleCredit('bill', amount);
        });
        
        this.devices.billValidator.on('error', (error) => {
          this.emit('error', { device: 'billValidator', error });
        });
        
        await this.devices.billValidator.connect();
      }
      
      // Initialize coin acceptor
      if (this.config.enableCoinAcceptor) {
        const CoinAcceptor = require('./coinAcceptor.js');
        this.devices.coinAcceptor = new CoinAcceptor({
          port: this.config.coinAcceptorPort
        });
        
        this.devices.coinAcceptor.on('credit', (amount) => {
          this.handleCredit('coin', amount);
        });
        
        this.devices.coinAcceptor.on('error', (error) => {
          this.emit('error', { device: 'coinAcceptor', error });
        });
        
        await this.devices.coinAcceptor.connect();
      }
      
      // Initialize card reader (optional)
      if (this.config.enableCardReader) {
        const CardReader = require('./cardReader.js');
        this.devices.cardReader = new CardReader({
          port: this.config.cardReaderPort
        });
        
        this.devices.cardReader.on('credit', (amount) => {
          this.handleCredit('card', amount);
        });
        
        await this.devices.cardReader.connect();
      }
      
      this.state.initialized = true;
      this.state.acceptingPayments = true;
      
      console.log('Payment Manager initialized successfully');
      return true;
      
    } catch (error) {
      console.error('Failed to initialize Payment Manager:', error);
      this.emit('error', { device: 'manager', error });
      
      // Fall back to demo mode
      console.log('Falling back to DEMO MODE');
      this.config.demoMode = true;
      this.state.initialized = true;
      this.state.acceptingPayments = true;
      
      return false;
    }
  }

  handleCredit(source, amount) {
    if (!this.state.acceptingPayments) {
      console.log(`Payment rejected (not accepting): ${source} - ${amount}`);
      return;
    }
    
    console.log(`Credit received from ${source}: ${amount} cents`);
    this.state.totalCredits += amount;
    
    this.emit('credit', amount);
    this.emit('payment', { source, amount, total: this.state.totalCredits });
  }

  // Enable/disable payment acceptance
  setAcceptingPayments(accepting) {
    this.state.acceptingPayments = accepting;
    
    // Update hardware state if not in demo mode
    if (!this.config.demoMode) {
      if (this.devices.billValidator) {
        this.devices.billValidator.setAccepting(accepting);
      }
      if (this.devices.coinAcceptor) {
        this.devices.coinAcceptor.setAccepting(accepting);
      }
    }
    
    console.log(`Payment acceptance: ${accepting ? 'ENABLED' : 'DISABLED'}`);
  }

  // Simulate credit insertion (for demo mode and testing)
  simulateCredit(amount) {
    if (this.config.demoMode) {
      this.handleCredit('demo', amount);
      return true;
    }
    return false;
  }

  // Get current state
  getState() {
    return {
      ...this.state,
      demoMode: this.config.demoMode,
      devices: {
        billValidator: this.devices.billValidator?.isConnected() ?? false,
        coinAcceptor: this.devices.coinAcceptor?.isConnected() ?? false,
        cardReader: this.devices.cardReader?.isConnected() ?? false
      }
    };
  }

  // Shutdown all devices
  async shutdown() {
    console.log('Shutting down Payment Manager...');
    
    this.state.acceptingPayments = false;
    
    const shutdowns = [];
    
    if (this.devices.billValidator) {
      shutdowns.push(this.devices.billValidator.disconnect());
    }
    if (this.devices.coinAcceptor) {
      shutdowns.push(this.devices.coinAcceptor.disconnect());
    }
    if (this.devices.cardReader) {
      shutdowns.push(this.devices.cardReader.disconnect());
    }
    
    await Promise.all(shutdowns);
    
    this.state.initialized = false;
    console.log('Payment Manager shutdown complete');
  }
}

module.exports = PaymentManager;

