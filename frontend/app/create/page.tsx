'use client';

import { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Link from 'next/link';
import { createAddressCloud, formatCloudInfo, SchrodingersWalletClient, saveCloud } from '../../lib/sdk';

export default function CreateCloud() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [cloudSize, setCloudSize] = useState(10);
  const [creating, setCreating] = useState(false);
  const [status, setStatus] = useState('');
  const [cloud, setCloud] = useState<any>(null);
  const [txSignature, setTxSignature] = useState('');

  const handleCreateCloud = async () => {
    if (!wallet.publicKey) {
      alert('Please connect your wallet first!');
      return;
    }

    setCreating(true);
    try {
      setStatus('Generating cloud locally...');
      const newCloud = createAddressCloud(cloudSize);
      const cloudInfo = formatCloudInfo(newCloud);
      setCloud(cloudInfo);
      
      await new Promise(r => setTimeout(r, 1000));

      setStatus('Deploying to Solana devnet...');
      const client = new SchrodingersWalletClient(connection, wallet);
      const tx = await client.createCloud(newCloud.addresses, newCloud.cloudId);
      
      setTxSignature(tx);
      setStatus('Success! Cloud deployed on-chain!');
      saveCloud(newCloud);
      
    } catch (error) {
      console.error('Error:', error);
      setStatus('Error: ' + (error instanceof Error ? error.message : 'Unknown'));
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <nav className="p-6 flex justify-between items-center border-b border-gray-800">
        <Link href="/" className="text-2xl font-bold">Vex.zk Protocol</Link>
        <WalletMultiButton />
      </nav>

      <main className="container mx-auto px-6 py-12 max-w-3xl">
        <h1 className="text-4xl font-bold mb-8">Create Vexil Probability Cloud</h1>

        <div className="bg-gray-800 rounded-lg p-8 mb-6">
          <h2 className="text-2xl font-bold mb-4">Configure Your Cloud</h2>
          
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
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
          </div>

          <button
            onClick={handleCreateCloud}
            disabled={creating || !wallet.publicKey}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 px-6 py-4 rounded-lg font-semibold text-lg"
          >
            {!wallet.publicKey ? 'Connect Wallet First' : creating ? 'Creating...' : 'Create Cloud'}
          </button>
        </div>

        {status && <div className="bg-blue-900 p-4 rounded mb-4">{status}</div>}
        
        {cloud && (
          <div className="bg-gray-800 p-6 rounded mb-4">
            <h3 className="font-bold mb-2">Cloud Generated!</h3>
            <div className="text-sm space-y-1">
              <div>Addresses: {cloud.totalAddresses}</div>
              <div>Cloud ID: {cloud.cloudId}</div>
              <div>Your Address: {cloud.userAddress}</div>
            </div>
          </div>
        )}

        {txSignature && (
          <div className="bg-green-900 p-6 rounded">
            <h3 className="font-bold mb-2">Success!</h3>
            <p className="text-sm mb-2">Cloud deployed to Solana</p>
            <div className="text-xs font-mono break-all">{txSignature}</div>
          </div>
        )}
      </main>
    </div>
  );
}
