// Bill Validator Driver
// Supports common bill acceptor protocols (ID-003, CCNET, MDB)
// Common validators: Pyramid Apex, ICT, JCM, MEI

const EventEmitter = require('events');

class BillValidator extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      port: config.port || '/dev/ttyUSB0',
      baudRate: config.baudRate || 9600,
      protocol: config.protocol || 'ID-003', // ID-003, CCNET, MDB
      
      // Bill denominations to accept (in cents)
      acceptedBills: config.acceptedBills || [100, 500, 1000, 2000, 5000, 10000],
      
      // Polling interval in ms
      pollInterval: config.pollInterval || 100,
      
      ...config
    };
    
    this.state = {
      connected: false,
      accepting: false,
      lastStatus: null,
      billInEscrow: null
    };
    
    this.serial = null;
    this.pollTimer = null;
  }

  async connect() {
    try {
      // Dynamic import of serialport to avoid issues when not installed
      const { SerialPort } = require('serialport');
      
      this.serial = new SerialPort({
        path: this.config.port,
        baudRate: this.config.baudRate,
        dataBits: 8,
        stopBits: 1,
        parity: 'even'
      });
      
      return new Promise((resolve, reject) => {
        this.serial.on('open', async () => {
          console.log(`Bill Validator connected on ${this.config.port}`);
          this.state.connected = true;
          
          // Initialize the validator
          await this.initialize();
          
          // Start polling
          this.startPolling();
          
          resolve(true);
        });
        
        this.serial.on('error', (error) => {
          console.error('Bill Validator serial error:', error);
          this.emit('error', error);
          reject(error);
        });
        
        this.serial.on('data', (data) => {
          this.handleResponse(data);
        });
      });
      
    } catch (error) {
      console.error('Failed to connect bill validator:', error.message);
      throw error;
    }
  }

  async initialize() {
    // Send initialization commands based on protocol
    switch (this.config.protocol) {
      case 'ID-003':
        await this.sendID003Command('RESET');
        await this.delay(500);
        await this.sendID003Command('ENABLE');
        break;
        
      case 'CCNET':
        await this.sendCCNETCommand('POLL');
        await this.sendCCNETCommand('ENABLE_BILL_TYPES', this.getEnabledBillMask());
        break;
        
      default:
        console.log('Unknown protocol, using generic initialization');
    }
    
    console.log('Bill Validator initialized');
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
    switch (this.config.protocol) {
      case 'ID-003':
        await this.sendID003Command('STATUS');
        break;
      case 'CCNET':
        await this.sendCCNETCommand('POLL');
        break;
    }
  }

  // ID-003 Protocol Commands (common for Pyramid validators)
  async sendID003Command(command, data = null) {
    const commands = {
      'RESET': Buffer.from([0x02, 0x08, 0x10, 0x00, 0x00, 0x00, 0x1A, 0x03]),
      'STATUS': Buffer.from([0x02, 0x08, 0x11, 0x00, 0x00, 0x00, 0x1B, 0x03]),
      'ENABLE': Buffer.from([0x02, 0x08, 0x12, 0x7F, 0x00, 0x00, 0x9B, 0x03]),
      'DISABLE': Buffer.from([0x02, 0x08, 0x12, 0x00, 0x00, 0x00, 0x1C, 0x03]),
      'STACK': Buffer.from([0x02, 0x08, 0x14, 0x00, 0x00, 0x00, 0x1E, 0x03]),
      'RETURN': Buffer.from([0x02, 0x08, 0x15, 0x00, 0x00, 0x00, 0x1F, 0x03])
    };
    
    if (commands[command] && this.serial) {
      return this.serial.write(commands[command]);
    }
  }

  // CCNET Protocol Commands (common for ICT/CashCode validators)
  async sendCCNETCommand(command, data = null) {
    // CCNET packet structure: SYNC + ADR + LNG + CMD + DATA + CRC
    const sync = 0x02;
    const address = 0x03; // Bill validator address
    
    const commands = {
      'POLL': [0x33],
      'RESET': [0x30],
      'ENABLE_BILL_TYPES': [0x34, ...(data || [0xFF, 0xFF, 0xFF])],
      'STACK': [0x35],
      'RETURN': [0x36],
      'IDENTIFICATION': [0x37]
    };
    
    if (commands[command] && this.serial) {
      const cmd = commands[command];
      const length = cmd.length + 5; // SYNC + ADR + LNG + CMD + CRC(2)
      
      const packet = Buffer.from([sync, address, length, ...cmd]);
      const crc = this.calculateCRC16(packet);
      
      const fullPacket = Buffer.concat([packet, Buffer.from([crc & 0xFF, (crc >> 8) & 0xFF])]);
      
      return this.serial.write(fullPacket);
    }
  }

  handleResponse(data) {
    // Parse response based on protocol
    switch (this.config.protocol) {
      case 'ID-003':
        this.parseID003Response(data);
        break;
      case 'CCNET':
        this.parseCCNETResponse(data);
        break;
    }
  }

  parseID003Response(data) {
    if (data.length < 8) return;
    
    const status = data[2];
    const billType = data[3];
    
    // Status codes
    const STATUS = {
      0x10: 'ACCEPTING',
      0x11: 'ESCROWED',
      0x12: 'STACKING',
      0x13: 'STACKED',
      0x14: 'RETURNING',
      0x15: 'RETURNED',
      0x16: 'REJECTED',
      0x1C: 'DISABLED'
    };
    
    const currentStatus = STATUS[status] || 'UNKNOWN';
    
    if (currentStatus !== this.state.lastStatus) {
      console.log(`Bill Validator Status: ${currentStatus}`);
      this.state.lastStatus = currentStatus;
      
      // Handle bill acceptance
      if (currentStatus === 'ESCROWED') {
        this.state.billInEscrow = this.getBillValue(billType);
        console.log(`Bill in escrow: $${(this.state.billInEscrow / 100).toFixed(2)}`);
        
        // Auto-accept if bill type is enabled
        if (this.config.acceptedBills.includes(this.state.billInEscrow)) {
          this.sendID003Command('STACK');
        } else {
          this.sendID003Command('RETURN');
        }
      }
      
      if (currentStatus === 'STACKED') {
        // Bill accepted - emit credit event
        const amount = this.state.billInEscrow;
        this.state.billInEscrow = null;
        
        if (amount) {
          this.emit('credit', amount);
          console.log(`Bill accepted: $${(amount / 100).toFixed(2)}`);
        }
      }
    }
  }

  parseCCNETResponse(data) {
    if (data.length < 5) return;
    
    const status = data[3];
    
    // CCNET status codes
    if (status === 0x80) { // Bill in escrow
      const billType = data[4];
      const value = this.getCCNETBillValue(billType);
      
      // Stack the bill
      this.sendCCNETCommand('STACK');
    }
    
    if (status === 0x81) { // Bill stacked
      const billType = data[4];
      const value = this.getCCNETBillValue(billType);
      
      this.emit('credit', value);
      console.log(`Bill accepted: $${(value / 100).toFixed(2)}`);
    }
  }

  getBillValue(typeCode) {
    // ID-003 bill type mapping (common for US currency)
    const billTypes = {
      0x01: 100,    // $1
      0x02: 500,    // $5
      0x03: 1000,   // $10
      0x04: 2000,   // $20
      0x05: 5000,   // $50
      0x06: 10000   // $100
    };
    
    return billTypes[typeCode] || 0;
  }

  getCCNETBillValue(typeCode) {
    // CCNET bill type mapping
    const billTypes = {
      0x00: 100,
      0x01: 500,
      0x02: 1000,
      0x03: 2000,
      0x04: 5000,
      0x05: 10000
    };
    
    return billTypes[typeCode] || 0;
  }

  getEnabledBillMask() {
    let mask = 0;
    const billValues = [100, 500, 1000, 2000, 5000, 10000];
    
    billValues.forEach((value, index) => {
      if (this.config.acceptedBills.includes(value)) {
        mask |= (1 << index);
      }
    });
    
    return [mask & 0xFF, (mask >> 8) & 0xFF, 0x00];
  }

  calculateCRC16(data) {
    let crc = 0;
    for (let i = 0; i < data.length; i++) {
      crc ^= data[i];
      for (let j = 0; j < 8; j++) {
        if (crc & 1) {
          crc = (crc >> 1) ^ 0x8408;
        } else {
          crc >>= 1;
        }
      }
    }
    return crc ^ 0xFFFF;
  }

  setAccepting(accepting) {
    this.state.accepting = accepting;
    
    if (this.state.connected) {
      if (accepting) {
        this.sendID003Command('ENABLE');
      } else {
        this.sendID003Command('DISABLE');
      }
    }
  }

  isConnected() {
    return this.state.connected;
  }

  async disconnect() {
    this.stopPolling();
    
    if (this.serial && this.serial.isOpen) {
      await this.sendID003Command('DISABLE');
      await new Promise(resolve => this.serial.close(resolve));
    }
    
    this.state.connected = false;
    console.log('Bill Validator disconnected');
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = BillValidator;

