// Coin Acceptor Driver
// Supports common coin acceptor protocols (MDB, Pulse, Serial)
// Common acceptors: Coinco, Mars, Azkoyen

const EventEmitter = require('events');

class CoinAcceptor extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      port: config.port || '/dev/ttyUSB1',
      baudRate: config.baudRate || 9600,
      protocol: config.protocol || 'SERIAL', // SERIAL, MDB, PULSE
      
      // Coin denominations to accept (in cents)
      acceptedCoins: config.acceptedCoins || [1, 5, 10, 25, 50, 100],
      
      // Polling interval in ms
      pollInterval: config.pollInterval || 50,
      
      ...config
    };
    
    this.state = {
      connected: false,
      accepting: false,
      coinCount: 0
    };
    
    this.serial = null;
    this.pollTimer = null;
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
        this.serial.on('open', async () => {
          console.log(`Coin Acceptor connected on ${this.config.port}`);
          this.state.connected = true;
          
          await this.initialize();
          this.startPolling();
          
          resolve(true);
        });
        
        this.serial.on('error', (error) => {
          console.error('Coin Acceptor serial error:', error);
          this.emit('error', error);
          reject(error);
        });
        
        this.serial.on('data', (data) => {
          this.handleResponse(data);
        });
      });
      
    } catch (error) {
      console.error('Failed to connect coin acceptor:', error.message);
      throw error;
    }
  }

  async initialize() {
    // Send initialization command
    await this.sendCommand('RESET');
    await this.delay(500);
    await this.sendCommand('ENABLE');
    
    console.log('Coin Acceptor initialized');
  }

  startPolling() {
    this.pollTimer = setInterval(() => {
      if (this.state.connected && this.state.accepting) {
        this.poll();
      }
    }, this.config.pollInterval);
  }

  stopPolling() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  async poll() {
    await this.sendCommand('STATUS');
  }

  async sendCommand(command) {
    // Generic serial protocol for coin acceptors
    const commands = {
      'RESET': Buffer.from([0xFC]),
      'STATUS': Buffer.from([0xFE]),
      'ENABLE': Buffer.from([0xFF, 0x3F]), // Enable all coin channels
      'DISABLE': Buffer.from([0xFF, 0x00]),
      'ACK': Buffer.from([0x00])
    };
    
    if (commands[command] && this.serial && this.serial.isOpen) {
      return new Promise((resolve) => {
        this.serial.write(commands[command], resolve);
      });
    }
  }

  handleResponse(data) {
    // Parse coin acceptor response
    for (let i = 0; i < data.length; i++) {
      const byte = data[i];
      
      // Check for coin accepted signals
      // Most coin acceptors send a byte indicating which channel accepted a coin
      if (byte >= 0x01 && byte <= 0x10) {
        const coinValue = this.getCoinValue(byte);
        
        if (coinValue > 0 && this.config.acceptedCoins.includes(coinValue)) {
          this.state.coinCount++;
          this.emit('credit', coinValue);
          console.log(`Coin accepted: ${coinValue}¢`);
          
          // Send acknowledgment
          this.sendCommand('ACK');
        }
      }
      
      // Check for error codes
      if (byte === 0xF0) {
        console.log('Coin Acceptor: Coin rejected');
      } else if (byte === 0xF1) {
        console.log('Coin Acceptor: Sensor blocked');
        this.emit('error', new Error('Sensor blocked'));
      } else if (byte === 0xF2) {
        console.log('Coin Acceptor: Motor jammed');
        this.emit('error', new Error('Motor jammed'));
      }
    }
  }

  getCoinValue(channel) {
    // Map channel numbers to coin values
    // This varies by acceptor - configure based on your hardware
    const coinMap = {
      0x01: 1,    // 1¢
      0x02: 5,    // 5¢
      0x03: 10,   // 10¢
      0x04: 25,   // 25¢
      0x05: 50,   // 50¢
      0x06: 100,  // $1
      0x07: 200,  // $2 (for countries with $2 coins)
    };
    
    return coinMap[channel] || 0;
  }

  setAccepting(accepting) {
    this.state.accepting = accepting;
    
    if (this.state.connected) {
      if (accepting) {
        this.sendCommand('ENABLE');
      } else {
        this.sendCommand('DISABLE');
      }
    }
  }

  isConnected() {
    return this.state.connected;
  }

  async disconnect() {
    this.stopPolling();
    
    if (this.serial && this.serial.isOpen) {
      await this.sendCommand('DISABLE');
      await new Promise(resolve => this.serial.close(resolve));
    }
    
    this.state.connected = false;
    console.log('Coin Acceptor disconnected');
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = CoinAcceptor;

