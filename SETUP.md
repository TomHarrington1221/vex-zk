# Quick Setup Guide

Get Schrödinger's Wallet running in 10 minutes!

## Prerequisites

- Node.js 18+
- Phantom Wallet browser extension
- Git

## Installation
```bash
# Clone the repo
git clone https://github.com/TomHarrington1221/schrodingers-wallet.git
cd schrodingers-wallet

# Install frontend dependencies
cd frontend
npm install

# Start the dev server
npm run dev
```

Visit http://localhost:3000

## Get Devnet SOL

1. Open Phantom wallet
2. Settings → Developer Settings
3. Change Network → **Devnet**
4. Get SOL from faucet: https://faucet.solana.com

## Try It Out

1. **Connect Wallet** - Click "Connect Wallet" button
2. **Create Cloud** - Go to `/create`, select cloud size
3. **View Dashboard** - See your clouds at `/dashboard`
4. **Interactive Demo** - Try `/demo` to understand the concept

## Verify On-Chain

Every cloud is deployed to Solana devnet:
- Program ID: `83wuRQ6DNzMqsgNDJo1zgvMzYX5pXz4dfcNSTtam5SVU`
- Explorer: https://explorer.solana.com/address/83wuRQ6DNzMqsgNDJo1zgvMzYX5pXz4dfcNSTtam5SVU?cluster=devnet

## Need Help?

Check out the full [README.md](./README.md) for detailed docs.
