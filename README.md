# Connect & Send - Solana Wallet Interface

A modern, user-friendly interface for interacting with the Solana blockchain. Built with Next.js, TypeScript, and the Solana Web3.js SDK.

## Features

### Wallet Integration
- Support for multiple wallet providers:
  - Phantom
  - Solflare
  - Torus
- Secure wallet connection and disconnection
- Automatic wallet reconnection

### Network Support
- Switch between Devnet and Mainnet Beta
- Dedicated endpoints for both networks via Alchemy
- Real-time network status monitoring

### Transaction Capabilities
- Send SOL tokens to any valid Solana address
- Real-time lamport to SOL conversion
- Priority fee optimization
- Enhanced transaction confirmation with intelligent polling
- Transaction signature tracking and verification

### User Interface
- Clean, modern design with Tailwind CSS
- Smooth animations powered by Framer Motion
- Responsive layout for all device sizes
- Real-time form validation
- Loading states and progress indicators
- Toast notifications for important events

### Transaction Monitoring
- Transaction status tracking
- Direct links to Solana Explorer
- Last transaction signature display
- Network-aware Explorer links

### Security Features
- Input validation for recipient addresses
- Balance checks before transactions
- Network connection health monitoring
- Secure wallet disconnect handling

## Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: 
  - Tailwind CSS
  - Styled Components
- **Blockchain**: 
  - Solana Web3.js
  - Wallet Adapter
- **UI Components**:
  - Framer Motion
  - React Hot Toast
- **Development**:
  - ESLint
  - PostCSS

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/Abhinavpatra/connect-send.git
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser


## Usage

1. Connect your Solana wallet using the "Connect Wallet" button
2. Select your desired network (Devnet/Mainnet)
3. Enter the recipient's Solana address
4. Specify the amount in lamports (1 SOL = 1,000,000,000 lamports)
5. Click "Send Transaction" to initiate the transfer
6. Confirm the transaction in your wallet
7. Monitor the transaction status via toast notifications
8. View transaction details in the Solana Explorer

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.