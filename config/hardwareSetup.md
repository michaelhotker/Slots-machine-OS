# Hardware Setup Guide

## Overview

This guide covers setting up payment acceptance hardware for your Lucky Fortune Slots machine. The software supports various bill validators, coin acceptors, and card readers commonly used in gaming machines.

## Supported Hardware

### Bill Validators

The following bill validators are supported out of the box:

| Manufacturer | Model | Protocol | Notes |
|-------------|-------|----------|-------|
| Pyramid Technologies | Apex 7000 | ID-003 | Most common, recommended |
| ICT | P70/P77 | CCNET | Good reliability |
| JCM | iVizion | ID-003 | High-end option |
| MEI | SC Advance | MDB | Requires MDB adapter |
| CashCode | SM/MVU | CCNET | Budget option |

### Coin Acceptors

| Manufacturer | Model | Protocol | Notes |
|-------------|-------|----------|-------|
| Coinco | 9302-GX | Serial | Common in US |
| Mars | TRC-6010 | MDB | High capacity |
| Azkoyen | U3 | Serial | European standard |
| Comestero | RM5 | Pulse | Simple installation |

### Card Readers (Optional)

| Type | Use Case |
|------|----------|
| Magnetic Stripe | Player tracking cards |
| RFID/NFC | Contactless cards |
| Smart Card | Prepaid game cards |

## Wiring Connections

### Bill Validator (RS232/Serial)

```
Bill Validator          USB-Serial Adapter
--------------          ------------------
TX (Pin 2)     ------>  RX
RX (Pin 3)     <------  TX
GND (Pin 5)    ------   GND
+12V           <------  External Power Supply
```

**Important:** Most bill validators require 12V DC power (1-2A). Do NOT power from USB.

### Coin Acceptor (Serial)

```
Coin Acceptor          USB-Serial Adapter
-------------          ------------------
TX             ------>  RX
RX             <------  TX
GND            ------   GND
+12V/+24V      <------  External Power Supply
```

**Note:** Check your coin acceptor's voltage requirements. Some need 24V DC.

### Hardware Interface Options

#### Option 1: Direct USB-Serial Connection
- Use USB-to-RS232 adapters (FTDI chipset recommended)
- Each device needs its own adapter
- Appears as `/dev/ttyUSB0`, `/dev/ttyUSB1`, etc.

#### Option 2: USB Hub Setup
```
Computer USB Port
      |
      v
USB Hub (Powered)
   |     |     |
   v     v     v
 USB   USB   USB
Serial Serial Serial
   |     |     |
   v     v     v
 Bill  Coin  Card
Valid. Accpt Reader
```

#### Option 3: Industrial I/O Board
For professional setups, consider:
- Advantech USB-4750
- Sealevel SeaI/O
- National Instruments USB-6008

## Software Configuration

### Finding Your Serial Ports

**macOS:**
```bash
ls /dev/tty.usbserial*
ls /dev/cu.usbserial*
```

**Linux:**
```bash
ls /dev/ttyUSB*
dmesg | grep tty
```

**Windows:**
Check Device Manager → Ports (COM & LPT)

### Configuration File

Edit `config/settings.json`:

```json
{
  "payment": {
    "demoMode": false,
    
    "billValidator": {
      "enabled": true,
      "port": "/dev/ttyUSB0",
      "baudRate": 9600,
      "protocol": "ID-003"
    },
    
    "coinAcceptor": {
      "enabled": true,
      "port": "/dev/ttyUSB1",
      "baudRate": 9600
    }
  }
}
```

### Serial Port Permissions (Linux/macOS)

```bash
# Add user to dialout group (Linux)
sudo usermod -a -G dialout $USER

# Set permissions on macOS
sudo chmod 666 /dev/cu.usbserial*
```

## Testing Hardware

### Bill Validator Test

1. Start the application in dev mode:
   ```bash
   npm run dev
   ```

2. Open the console (Ctrl+Shift+I)

3. Insert a bill and check for log messages:
   ```
   Bill Validator Status: ESCROWED
   Bill in escrow: $1.00
   Bill accepted: $1.00
   ```

### Coin Acceptor Test

1. Insert coins and verify credit appears

2. Check console for:
   ```
   Coin accepted: 25¢
   Credit received from coin: 25 cents
   ```

## Troubleshooting

### Bill Validator Not Responding

1. **Check power:** Ensure 12V supply is connected
2. **Check cables:** Verify TX/RX are not swapped
3. **Check port:** Confirm correct `/dev/ttyUSB*` device
4. **Reset validator:** Power cycle the device

### Coin Acceptor Issues

1. **Coins rejected:** Clean the coin path
2. **No response:** Check wiring and power
3. **Wrong values:** Reconfigure coin channels in settings

### Serial Communication Errors

```bash
# Test serial port
screen /dev/ttyUSB0 9600

# Check port settings
stty -F /dev/ttyUSB0
```

## Safety Notes

⚠️ **IMPORTANT SAFETY INFORMATION** ⚠️

1. **Electrical Safety**
   - Always disconnect power before working on wiring
   - Use proper fuses and circuit protection
   - Ground all metal enclosures

2. **Cash Handling**
   - Secure the cash box with a lock
   - Regular cash collection schedule
   - Keep accurate records

3. **Legal Compliance**
   - This is for HOME HOBBY USE ONLY
   - Check local laws regarding gaming devices
   - Not for commercial gambling operations

## Recommended Suppliers

### New Hardware
- Pyramid Technologies: pyramidacceptors.com
- CashCode: cashcode.com
- ICT: abordo.com

### Used/Refurbished
- eBay (search "bill validator arcade")
- AliExpress (budget options)
- Game room supply stores

### Cables & Adapters
- Amazon (USB-Serial adapters)
- Mouser/DigiKey (connectors)
- SparkFun (prototyping)

## Cost Estimates

| Component | New Price | Used Price |
|-----------|-----------|------------|
| Bill Validator | $150-400 | $50-100 |
| Coin Acceptor | $100-250 | $30-75 |
| USB-Serial Adapter | $15-30 | $10-15 |
| Power Supply (12V 5A) | $20-40 | $10-20 |
| Wiring/Connectors | $20-50 | - |

**Total Budget Estimate:** $200-500 for basic setup

