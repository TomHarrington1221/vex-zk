'use client';

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Link from 'next/link';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <nav className="p-6 flex justify-between items-center border-b border-gray-800">
        <Link href="/" className="text-2xl font-bold">Schrödinger's Wallet</Link>
        <WalletMultiButton />
      </nav>

      <main className="container mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold mb-8">Dashboard</h1>
        
        <div className="bg-gray-800 p-8 rounded-lg">
          <p className="text-gray-400 mb-4">
            Your probability clouds will appear here once created.
          </p>
          
          <Link
            href="/create"
            className="inline-block bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold transition"
          >
            Create Your First Cloud
          </Link>
        </div>
      </main>
    </div>
  );
}

