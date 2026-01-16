'use client';

import { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Keypair } from '@solana/web3.js';
import Link from 'next/link';

export default function CreateCloud() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [cloudSize, setCloudSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [cloudId, setCloudId] = useState<number | null>(null);
  const [addresses, setAddresses] = useState<string[]>([]);

  const createCloud = async () => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      alert('Please connect your wallet first!');
      return;
    }

    setLoading(true);
    try {
      // Generate ring of addresses
      const ring: Keypair[] = [];
      for (let i = 0; i < cloudSize; i++) {
        ring.push(Keypair.generate());
      }

      const generatedCloudId = Math.floor(Date.now() / 1000);
      
      alert(`✅ Simulated cloud creation!\n\nCloud ID: ${generatedCloudId}\nAddresses: ${cloudSize}\n\n(Full Solana integration coming soon)`);
      
      setCloudId(generatedCloudId);
      setAddresses(ring.map(kp => kp.publicKey.toString()));
      
    } catch (error) {
      console.error('Error creating cloud:', error);
      alert('Error creating cloud: ' + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <nav className="p-6 flex justify-between items-center border-b border-gray-800">
        <Link href="/" className="text-2xl font-bold">Schrödinger's Wallet</Link>
        <WalletMultiButton />
      </nav>

      <main className="container mx-auto px-6 py-20 max-w-2xl">
        <h1 className="text-4xl font-bold mb-8">Create Probability Cloud</h1>

        {!cloudId ? (
          <div className="bg-gray-800 p-8 rounded-lg">
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Cloud Size (Number of Addresses)
              </label>
              <input
                type="range"
                min="5"
                max="20"
                value={cloudSize}
                onChange={(e) => setCloudSize(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="text-center text-2xl font-bold mt-2">{cloudSize} addresses</div>
            </div>

            <p className="text-gray-400 mb-6">
              Your identity will be distributed across {cloudSize} addresses. 
              Observers won't be able to tell which one is you.
            </p>

            <button
              onClick={createCloud}
              disabled={loading || !wallet.connected}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 px-6 py-3 rounded-lg font-semibold transition"
            >
              {loading ? 'Creating Cloud...' : wallet.connected ? 'Create Cloud' : 'Connect Wallet First'}
            </button>
          </div>
        ) : (
          <div className="bg-gray-800 p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-4 text-green-400">✅ Cloud Created!</h2>
            <p className="text-gray-400 mb-4">Cloud ID: {cloudId}</p>
            
            <div className="mb-6">
              <h3 className="font-bold mb-2">Your Probability Cloud ({addresses.length} addresses):</h3>
              <div className="bg-gray-900 p-4 rounded max-h-60 overflow-y-auto">
                {addresses.map((addr, i) => (
                  <div key={i} className="text-xs font-mono mb-1 text-gray-400">
                    {i + 1}. {addr}
                  </div>
                ))}
              </div>
              <p className="text-sm text-purple-400 mt-4">
                💡 Demo Mode: These addresses are generated locally. 
                In production, they would be registered on-chain with ring signatures.
              </p>
            </div>

            <Link
              href="/dashboard"
              className="block text-center bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold transition"
            >
              Go to Dashboard
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
