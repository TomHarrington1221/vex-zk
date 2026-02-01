'use client';

import { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Link from 'next/link';
import { VexzkClient } from '../../lib/sdk';

interface CloudData {
  cloudId: number;
  addresses: string[];
  userIndex: number;
}

export default function Dashboard() {
  const wallet = useWallet();
  const { connection } = useConnection();
  const [clouds, setClouds] = useState<CloudData[]>([]);
  const [selectedCloud, setSelectedCloud] = useState<CloudData | null>(null);
  const [mounted, setMounted] = useState(false);
  const [verifying, setVerifying] = useState<number | null>(null);
  const [verified, setVerified] = useState<{[key: number]: boolean}>({});

  useEffect(() => {
    setMounted(true);
    loadClouds();
  }, []);

  const loadClouds = () => {
    const savedClouds: CloudData[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('cloud_')) {
        const cloudData = localStorage.getItem(key);
        if (cloudData) {
          try {
            const parsed = JSON.parse(cloudData);
            const addresses = parsed.addresses.map((addr: any) => 
              typeof addr === 'string' ? addr : addr.toString()
            );
            savedClouds.push({
              cloudId: parsed.cloudId,
              addresses,
              userIndex: parsed.userIndex
            });
          } catch (e) {
            console.error('Error parsing cloud:', e);
          }
        }
      }
    }
    
    savedClouds.sort((a, b) => b.cloudId - a.cloudId);
    setClouds(savedClouds);
  };

  const verifyOnChain = async (cloud: CloudData) => {
    if (!wallet.publicKey) return;
    
    setVerifying(cloud.cloudId);
    try {
      const client = new VexzkClient(connection, wallet);
      const cloudData = await client.getCloud(wallet.publicKey, cloud.cloudId);
      
      if (cloudData) {
        setVerified(prev => ({...prev, [cloud.cloudId]: true}));
        alert('Cloud verified on Solana blockchain!');
      } else {
        alert('Cloud not found on-chain');
      }
    } catch (error) {
      console.error('Verification error:', error);
      alert('Error verifying cloud');
    } finally {
      setVerifying(null);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    const copyMsg = document.createElement('div');
    copyMsg.textContent = 'Copied!';
    copyMsg.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    document.body.appendChild(copyMsg);
    setTimeout(() => copyMsg.remove(), 2000);
  };

  const getTotalPrivacy = () => {
    return clouds.reduce((total, cloud) => total + cloud.addresses.length, 0);
  };

  const getAverageAnonymity = () => {
    if (clouds.length === 0) return 0;
    return Math.round(clouds.reduce((sum, cloud) => sum + cloud.addresses.length, 0) / clouds.length);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const explorerUrl = wallet.publicKey ? 
    'https://explorer.solana.com/address/' + wallet.publicKey.toBase58() + '?cluster=devnet' : 
    '#';

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <nav className="p-6 flex justify-between items-center border-b border-gray-800 bg-gray-900 bg-opacity-50 backdrop-blur">
        <Link href="/" className="text-2xl font-bold hover:text-purple-400 transition">
          Vex.zk Protocol
        </Link>
        <div className="flex gap-4 items-center">
          <Link href="/create" className="text-purple-400 hover:text-purple-300 transition">
            Create Cloud
          </Link>
          <Link href="/demo" className="text-blue-400 hover:text-blue-300 transition">
            Demo
          </Link>
          <WalletMultiButton />
        </div>
      </nav>

      <main className="container mx-auto px-6 py-12 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
            My Vexil Probability Clouds
          </h1>
          <p className="text-xl text-gray-400">
            Your on-chain privacy management dashboard
          </p>
        </div>

        {wallet.connected && clouds.length > 0 && (
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-lg p-6 border border-purple-700">
              <div className="text-3xl mb-2">☁️</div>
              <div className="text-3xl font-bold">{clouds.length}</div>
              <div className="text-purple-200 text-sm">Total Clouds</div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg p-6 border border-blue-700">
              <div className="text-3xl mb-2">🎭</div>
              <div className="text-3xl font-bold">{getTotalPrivacy()}</div>
              <div className="text-blue-200 text-sm">Total Addresses</div>
            </div>
            
            <div className="bg-gradient-to-br from-green-900 to-green-800 rounded-lg p-6 border border-green-700">
              <div className="text-3xl mb-2">🔒</div>
              <div className="text-3xl font-bold">1 in {getAverageAnonymity()}</div>
              <div className="text-green-200 text-sm">Avg Anonymity</div>
            </div>
            
            <div className="bg-gradient-to-br from-yellow-900 to-yellow-800 rounded-lg p-6 border border-yellow-700">
              <div className="text-3xl mb-2">⛓️</div>
              <div className="text-3xl font-bold">{Object.keys(verified).length}</div>
              <div className="text-yellow-200 text-sm">Verified On-Chain</div>
            </div>
          </div>
        )}

        {wallet.connected && clouds.length > 0 && (
          <div className="bg-blue-900 bg-opacity-30 border border-blue-700 rounded-lg p-4 mb-8">
            <div className="flex items-start gap-3">
              <div className="text-2xl">💡</div>
              <div className="flex-1">
                <h3 className="font-bold text-blue-200 mb-1">How This Works</h3>
                <p className="text-sm text-blue-300">
                  Each cloud contains multiple addresses, but only YOU know which one is actually yours. 
                  Observers can see the group, but cannot identify you specifically.
                </p>
              </div>
            </div>
          </div>
        )}

        {!wallet.connected && (
          <div className="bg-gradient-to-br from-yellow-900 to-orange-900 border-2 border-yellow-600 rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-3xl font-bold mb-3">Connect Your Wallet</h2>
            <p className="text-yellow-200 mb-6 text-lg max-w-md mx-auto">
              Connect your Solana wallet to view and manage your Vexil Probability Clouds
            </p>
            <WalletMultiButton />
            <p className="text-sm text-yellow-300 mt-4">
              Make sure you are on Devnet network
            </p>
          </div>
        )}

        {wallet.connected && clouds.length === 0 && (
          <div className="bg-gray-800 rounded-xl p-16 text-center border-2 border-dashed border-gray-600">
            <div className="text-8xl mb-6">☁️</div>
            <h2 className="text-3xl font-bold mb-3">No Clouds Yet</h2>
            <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
              Create your first Vexil Probability Cloud to start protecting your privacy on-chain
            </p>
            <Link
              href="/create"
              className="inline-block bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-8 py-4 rounded-lg font-bold text-lg transition transform hover:scale-105"
            >
              Create Your First Cloud
            </Link>
          </div>
        )}

        {wallet.connected && clouds.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clouds.map((cloud, index) => {
              const cloudExplorerUrl = 'https://explorer.solana.com/address/' + (wallet.publicKey?.toBase58() || '') + '?cluster=devnet';
              
              return (
                <div
                  key={index}
                  className="bg-gray-800 rounded-xl p-6 border-2 border-gray-700 hover:border-purple-500 transition-all hover:shadow-xl group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold mb-1">Cloud #{index + 1}</h3>
                      <p className="text-xs text-gray-500">{formatDate(cloud.cloudId)}</p>
                    </div>
                    <div className="bg-purple-600 px-3 py-1 rounded-full text-sm font-bold">
                      {cloud.addresses.length} addresses
                    </div>
                  </div>

                  <div className="space-y-3 text-sm mb-4">
                    <div className="bg-gray-900 p-3 rounded-lg">
                      <span className="text-gray-400 block mb-1">Cloud ID</span>
                      <p className="font-mono text-xs text-purple-300">{cloud.cloudId}</p>
                    </div>
                    
                    <div className="bg-gray-900 p-3 rounded-lg">
                      <span className="text-gray-400 block mb-1">Privacy Level</span>
                      <p className="text-green-400 font-bold text-lg">1 in {cloud.addresses.length}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedCloud(cloud)}
                      className="w-full bg-purple-600 hover:bg-purple-700 py-3 rounded-lg font-semibold transition"
                    >
                      View Details
                    </button>
                    
                    <button
                      onClick={() => verifyOnChain(cloud)}
                      disabled={verifying === cloud.cloudId}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 py-2 rounded-lg text-sm font-semibold transition"
                    >
                      {verifying === cloud.cloudId ? 'Verifying...' : 'Verify On-Chain'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {selectedCloud && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-6 z-50">
            <div className="bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border-2 border-purple-500">
              <div className="p-6 border-b border-gray-700 flex justify-between items-start">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Cloud Details</h2>
                  <p className="text-sm text-gray-300">Created: {formatDate(selectedCloud.cloudId)}</p>
                </div>
                <button
                  onClick={() => setSelectedCloud(null)}
                  className="text-gray-400 hover:text-white text-3xl"
                >
                  X
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="bg-yellow-900 border border-yellow-700 p-4 rounded-lg">
                  <h3 className="font-bold mb-2 text-yellow-200">Your Secret Address</h3>
                  <div className="bg-black bg-opacity-30 p-3 rounded mb-3">
                    <p className="font-mono text-sm break-all text-yellow-100">
                      {selectedCloud.addresses[selectedCloud.userIndex]}
                    </p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(selectedCloud.addresses[selectedCloud.userIndex])}
                    className="w-full bg-yellow-700 hover:bg-yellow-600 px-4 py-2 rounded-lg font-semibold transition"
                  >
                    Copy Address
                  </button>
                </div>

                <div>
                  <h3 className="font-bold mb-3">All Addresses in Cloud</h3>
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {selectedCloud.addresses.map((addr, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded text-xs font-mono break-all ${
                          idx === selectedCloud.userIndex
                            ? 'bg-green-900 border border-green-500'
                            : 'bg-gray-900'
                        }`}
                      >
                        {idx + 1}. {addr}
                        {idx === selectedCloud.userIndex && <span className="ml-2 text-green-400">You</span>}
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedCloud(null)}
                  className="w-full bg-gray-700 hover:bg-gray-600 py-3 rounded-lg font-semibold transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
