'use client';

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Header */}
      <nav className="p-6 flex justify-between items-center border-b border-gray-800">
        <h1 className="text-2xl font-bold">Schrödinger's Wallet</h1>
        <WalletMultiButton />
      </nav>

      {/* Hero */}
      <main className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-6xl font-bold mb-6">
            Privacy Through
            <span className="text-purple-500"> Uncertainty</span>
          </h2>
          
          <p className="text-xl text-gray-400 mb-12">
            Your wallet exists as a probability cloud. Observers see activity 
            but can never pin down WHO you are. Ring signatures meet zero-knowledge proofs.
          </p>

          <div className="flex gap-4 justify-center">
            <Link 
              href="/create"
              className="bg-purple-600 hover:bg-purple-700 px-8 py-4 rounded-lg font-semibold text-lg transition"
            >
              Create Probability Cloud
            </Link>
            
            <Link 
              href="/dashboard"
              className="bg-gray-800 hover:bg-gray-700 px-8 py-4 rounded-lg font-semibold text-lg transition"
            >
              View Dashboard
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20 max-w-5xl mx-auto">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-3">🎭 Probabilistic Identity</h3>
            <p className="text-gray-400">
              You exist as ONE of N addresses. Observers can't tell which one is you.
            </p>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-3">🔐 Ring Signatures</h3>
            <p className="text-gray-400">
              Prove you're in the group without revealing your specific identity.
            </p>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-3">⚡ Zero-Knowledge Proofs</h3>
            <p className="text-gray-400">
              Prove holdings or attributes without revealing exact details.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

