'use client';

import { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Link from 'next/link';
import { createAddressCloud, saveCloud, SchrodingersWalletClient } from '../../lib/sdk';

export default function CreateCloud() {
  const wallet = useWallet();
  const { connection } = useConnection();
  const [cloudSize, setCloudSize] = useState(10);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [cloudDetails, setCloudDetails] = useState<any>(null);
  const [txSignature, setTxSignature] = useState('');

  const handleCreateCloud = async () => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      setError('Please connect your wallet first');
      return;
    }

    setStatus('Generating Vexil Probability Cloud...');
    setError('');
    setCloudDetails(null);
    setTxSignature('');

    try {
      const cloud = createAddressCloud(cloudSize);
      
      setCloudDetails({
        totalAddresses: cloud.addresses.length,
        cloudId: cloud.cloudId,
        anonymitySet: cloud.addresses.length,
        userAddress: cloud.addresses[cloud.userIndex].toBase58(),
      });

      setStatus('Deploying to Solana...');

      const client = new SchrodingersWalletClient(connection, wallet);
      const signature = await client.createCloud(cloud.addresses, cloud.cloudId);

      saveCloud(cloud);

      setTxSignature(signature);
      setStatus('Success! Cloud deployed to Solana');
    } catch (err: any) {
      console.error('Error creating cloud:', err);
      setError(err.message || 'Failed to create cloud');
      setStatus('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <nav className="p-6 flex justify-between items-center border-b border-gray-800">
        <Link href="/" className="text-2xl font-bold">Vex.zk Protocol</Link>
        <div className="flex gap-4 items-center">
          <Link href="/dashboard" className="text-purple-400 hover:text-purple-300">Dashboard</Link>
          <Link href="/demo" className="text-blue-400 hover:text-blue-300">Demo</Link>
          <WalletMultiButton />
        </div>
      </nav>

      <main className="container mx-auto px-6 py-12 max-w-2xl">
        <h1 className="text-4xl font-bold mb-4">Create Vexil Probability Cloud</h1>
        <p className="text-gray-400 mb-8">
          Generate a probability cloud to hide your identity on-chain
        </p>

        <div className="bg-gray-800 rounded-lg p-8 mb-6">
          <h2 className="text-2xl font-bold mb-6">Configure Your Cloud</h2>

          <div className="mb-6">
            <label className="block text-gray-300 mb-2">
              Cloud Size: {cloudSize} addresses
            </label>
            <input
              type="range"
              min="2"
              max="20"
              value={cloudSize}
              onChange={(e) => setCloudSize(Number(e.target.value))}
              className="w-full"
            />
            <p className="text-sm text-gray-500 mt-2">
              Anonymity set: 1 in {cloudSize} ({((1/cloudSize) * 100).toFixed(1)}% chance to guess correctly)
            </p>
          </div>

          <button
            onClick={handleCreateCloud}
            disabled={!wallet.connected}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 py-4 rounded-lg font-bold text-lg transition"
          >
            {wallet.connected ? 'Create Cloud' : 'Connect Wallet First'}
          </button>
        </div>

        {status && (
          <div className={`p-4 rounded-lg mb-4 ${error ? 'bg-red-900' : 'bg-blue-900'}`}>
            {error ? 'Error: ' : ''}{status}
          </div>
        )}

        {error && (
          <div className="bg-red-900 border border-red-700 p-4 rounded-lg mb-4">
            Error: {error}
          </div>
        )}

        {cloudDetails && (
          <div className="bg-gray-800 rounded-lg p-6 mb-4">
            <h3 className="text-xl font-bold mb-4">Cloud Generated!</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Addresses:</strong> {cloudDetails.totalAddresses}</p>
              <p><strong>Cloud ID:</strong> {cloudDetails.cloudId}</p>
              <p><strong>Your Address:</strong> <span className="font-mono text-xs break-all">{cloudDetails.userAddress}</span></p>
            </div>
          </div>
        )}

        {txSignature && (
          <div className="bg-green-900 border border-green-700 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">Success!</h3>
            <p className="mb-4">Cloud deployed to Solana</p>
            <p className="text-xs font-mono break-all mb-6">{txSignature}</p>
            
            <div className="flex gap-4">
              <Link
                href="/dashboard"
                className="flex-1 bg-purple-600 hover:bg-purple-700 py-3 rounded-lg font-semibold text-center transition"
              >
                Go to Dashboard
              </Link>
              
                href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-semibold text-center transition"
              >
                View on Explorer
              </a>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
