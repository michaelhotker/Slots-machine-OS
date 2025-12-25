// Card Reader Driver
// Supports magnetic stripe readers and chip card readers
// For use with player tracking cards or prepaid game cards

const EventEmitter = require('events');

class CardReader extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      port: config.port || '/dev/ttyUSB2',
      baudRate: config.baudRate || 9600,
      
      // Card type: MAGNETIC, RFID, SMART
      cardType: config.cardType || 'MAGNETIC',
      
      // Track to read (1, 2, or 3 for magnetic)
      track: config.track || 2,
      
      ...config
    };
    
    this.state = {
      connected: false,
      cardInserted: false,
      currentCard: null
    };
    
    this.serial = null;
    this.dataBuffer = '';
  }

  async connect() {
    try {
      const { SerialPort } = require('serialport');
      
      this.serial = new SerialPort({
        path: this.config.port,
        baudRate: this.config.baudRate,
        dataBits: 8,
        stopBits: 1,
        parity: 'none'
      });
      
      return new Promise((resolve, reject) => {
        this.serial.on('open', () => {
          console.log(`Card Reader connected on ${this.config.port}`);
          this.state.connected = true;
          resolve(true);
        });
        
        this.serial.on('error', (error) => {
          console.error('Card Reader serial error:', error);
          this.emit('error', error);
          reject(error);
        });
        
        this.serial.on('data', (data) => {
          this.handleData(data);
        });
      });
      
    } catch (error) {
      console.error('Failed to connect card reader:', error.message);
      throw error;
    }
  }

  handleData(data) {
    // Accumulate data in buffer
    this.dataBuffer += data.toString();
    
    // Check for complete card swipe
    // Magnetic stripe data typically starts with % or ; and ends with ?
    if (this.dataBuffer.includes('%') && this.dataBuffer.includes('?')) {
      const cardData = this.parseCardData(this.dataBuffer);
      this.dataBuffer = '';
      
      if (cardData) {
        this.processCard(cardData);
      }
    }
    
    // Prevent buffer overflow
    if (this.dataBuffer.length > 1000) {
      this.dataBuffer = '';
    }
  }

  parseCardData(rawData) {
    try {
      // Track 2 format: ;CARD_NUMBER=EXPIRATION_DATE?
      const track2Match = rawData.match(/;(\d+)=(\d+)\?/);
      
      if (track2Match) {
        const cardNumber = track2Match[1];
        const additionalData = track2Match[2];
        
        return {
          cardNumber: cardNumber,
          track2: `${cardNumber}=${additionalData}`,
          raw: rawData,
          timestamp: Date.now()
        };
      }
      
      // Track 1 format: %BCARD_NUMBER^NAME^EXPIRATION?
      const track1Match = rawData.match(/%B(\d+)\^([^\^]+)\^(\d+)\?/);
      
      if (track1Match) {
        return {
          cardNumber: track1Match[1],
          name: track1Match[2].trim(),
          track1: rawData,
          raw: rawData,
          timestamp: Date.now()
        };
      }
      
      // Generic card ID (for player tracking cards)
      const genericMatch = rawData.match(/[;%](\d{6,19})[?=]/);
      
      if (genericMatch) {
        return {
          cardNumber: genericMatch[1],
          raw: rawData,
          timestamp: Date.now()
        };
      }
      
      return null;
      
    } catch (error) {
      console.error('Error parsing card data:', error);
      return null;
    }
  }

  processCard(cardData) {
    console.log('Card read:', cardData.cardNumber.replace(/\d(?=\d{4})/g, '*'));
    
    this.state.currentCard = cardData;
    this.emit('cardRead', cardData);
    
    // For prepaid game cards, lookup balance and add credits
    // This would connect to your backend system
    this.lookupCardBalance(cardData);
  }

  async lookupCardBalance(cardData) {
    // In a real implementation, this would query a database or API
    // For demo purposes, we'll simulate a balance lookup
    
    console.log('Looking up card balance...');
    
    // Simulate API call
    await this.delay(500);
    
    // Demo: Cards starting with specific numbers have preset balances
    let balance = 0;
    
    if (cardData.cardNumber.startsWith('1000')) {
      balance = 1000; // $10.00
    } else if (cardData.cardNumber.startsWith('2000')) {
      balance = 2000; // $20.00
    } else if (cardData.cardNumber.startsWith('5000')) {
      balance = 5000; // $50.00
    }
    
    if (balance > 0) {
      console.log(`Card balance: $${(balance / 100).toFixed(2)}`);
      this.emit('credit', balance);
      this.emit('cardBalance', { card: cardData, balance });
    } else {
      console.log('Card not recognized or zero balance');
      this.emit('cardRejected', { card: cardData, reason: 'unknown_card' });
    }
  }

  // Write data to card (for updating balances)
  async writeCard(data) {
    if (!this.state.connected) {
      throw new Error('Card reader not connected');
    }
    
    // This would be implemented based on your specific card writer
    console.log('Writing to card:', data);
    
    return true;
  }

  isConnected() {
    return this.state.connected;
  }

  getCurrentCard() {
    return this.state.currentCard;
  }

  clearCard() {
    this.state.currentCard = null;
    this.state.cardInserted = false;
  }

  async disconnect() {
    if (this.serial && this.serial.isOpen) {
      await new Promise(resolve => this.serial.close(resolve));
    }
    
    this.state.connected = false;
    console.log('Card Reader disconnected');
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = CardReader;

