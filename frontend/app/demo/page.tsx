'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function Demo() {
  const [step, setStep] = useState(0);
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
  const [userAddress, setUserAddress] = useState<number>(0);
  const [showResult, setShowResult] = useState(false);

  const cloudSize = 10;
  const addresses = Array.from({ length: cloudSize }, (_, i) => 
    `Wallet${i + 1}...${Math.random().toString(36).substring(7)}`
  );

  useEffect(() => {
    setUserAddress(Math.floor(Math.random() * cloudSize));
  }, []);

  const handleGuess = (index: number) => {
    setSelectedAddress(index);
    setShowResult(true);
  };

  const resetDemo = () => {
    setShowResult(false);
    setSelectedAddress(null);
    setUserAddress(Math.floor(Math.random() * cloudSize));
    setStep(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <nav className="p-6 flex justify-between items-center border-b border-gray-800">
        <Link href="/" className="text-2xl font-bold">Schrodingers Wallet</Link>
        <div className="flex gap-4 items-center">
          <Link href="/create" className="text-purple-400 hover:text-purple-300">Create Cloud</Link>
          <WalletMultiButton />
        </div>
      </nav>

      <main className="container mx-auto px-6 py-12 max-w-5xl">
        <h1 className="text-5xl font-bold mb-4 text-center">See How It Works</h1>
        <p className="text-xl text-gray-400 text-center mb-12">
          Privacy for your blockchain wallet - explained in 2 minutes
        </p>

        {step === 0 && (
          <div className="text-center space-y-6">
            <div className="bg-gray-800 rounded-lg p-8 max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold mb-6">The Problem</h2>
              
              <div className="text-left space-y-4 text-lg">
                <p className="text-gray-300">
                  Imagine if your bank account was 100% public:
                </p>
                <ul className="space-y-3 text-gray-400 pl-6">
                  <li className="flex items-start gap-3">
                    <span className="text-red-400 text-2xl">👁️</span>
                    <span>Anyone can see your balance</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-400 text-2xl">💸</span>
                    <span>Everyone knows when you get paid</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-400 text-2xl">🛒</span>
                    <span>All your purchases are visible</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-400 text-2xl">📍</span>
                    <span>People can track everything you do</span>
                  </li>
                </ul>
                <p className="text-gray-300 font-bold mt-6">
                  This is how blockchain works today. Zero privacy.
                </p>
              </div>
            </div>
            <button
              onClick={() => setStep(1)}
              className="bg-purple-600 hover:bg-purple-700 px-8 py-4 rounded-lg text-xl font-semibold transition"
            >
              Show Me the Solution →
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="text-center space-y-6">
            <div className="bg-gray-800 rounded-lg p-8 max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold mb-6">The Solution: Hide in a Crowd</h2>
              
              <div className="bg-gray-900 p-6 rounded-lg mb-6">
                <p className="text-xl text-gray-300 mb-4">
                  Think of it like this:
                </p>
                <p className="text-lg text-gray-400">
                  Instead of having ONE wallet that everyone can track, you create a GROUP of {cloudSize} wallets.
                </p>
              </div>

              <div className="text-left space-y-4 text-lg">
                <div className="flex items-start gap-4">
                  <span className="text-4xl">🎭</span>
                  <div>
                    <p className="font-bold text-purple-400">You're ONE of {cloudSize} wallets</p>
                    <p className="text-gray-400">But nobody knows which one is actually yours</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <span className="text-4xl">🤷</span>
                  <div>
                    <p className="font-bold text-purple-400">Observers see the group</p>
                    <p className="text-gray-400">They know SOMEONE in the group made a transaction, but can't tell who</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <span className="text-4xl">🔒</span>
                  <div>
                    <p className="font-bold text-purple-400">Only 10% chance of guessing right</p>
                    <p className="text-gray-400">That's real privacy through probability</p>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setStep(2)}
              className="bg-purple-600 hover:bg-purple-700 px-8 py-4 rounded-lg text-xl font-semibold transition"
            >
              Try It Yourself →
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-8">
              <h2 className="text-3xl font-bold mb-4 text-center">🎮 Interactive Challenge</h2>
              <p className="text-lg text-gray-300 text-center mb-2">
                I'm hiding in one of these {cloudSize} wallets.
              </p>
              <p className="text-xl text-purple-400 text-center mb-6 font-bold">
                Can you find me?
              </p>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                {addresses.map((addr, index) => (
                  <button
                    key={index}
                    onClick={() => !showResult && handleGuess(index)}
                    disabled={showResult}
                    className={`
                      p-4 rounded-lg border-2 transition-all
                      ${showResult && index === userAddress ? 'bg-green-900 border-green-500 animate-pulse' : ''}
                      ${showResult && index === selectedAddress && index !== userAddress ? 'bg-red-900 border-red-500' : ''}
                      ${!showResult ? 'bg-gray-900 border-gray-700 hover:border-purple-500 hover:scale-105 cursor-pointer' : ''}
                      ${showResult && index !== userAddress && index !== selectedAddress ? 'opacity-20' : ''}
                    `}
                  >
                    <div className="text-center mb-2 text-2xl">
                      {showResult && index === userAddress ? '✅' : '👤'}
                    </div>
                    <div className="text-xs font-mono">{addr}</div>
                  </button>
                ))}
              </div>

              {showResult && (
                <div className="text-center space-y-4 animate-in">
                  {selectedAddress === userAddress ? (
                    <div className="bg-green-900 border-2 border-green-500 rounded-lg p-6">
                      <div className="text-5xl mb-3">🎉</div>
                      <h3 className="text-2xl font-bold mb-2">Wow, you found me!</h3>
                      <p className="text-green-200 text-lg">
                        But that was pure luck - only a 10% chance!
                      </p>
                      <p className="text-green-300 text-sm mt-3">
                        In real use, you'd have to guess correctly EVERY time to track someone. Nearly impossible!
                      </p>
                    </div>
                  ) : (
                    <div className="bg-blue-900 border-2 border-blue-500 rounded-lg p-6">
                      <div className="text-5xl mb-3">🎭</div>
                      <h3 className="text-2xl font-bold mb-2">Nope! I was here:</h3>
                      <p className="text-blue-200 text-lg mb-3">
                        Wallet {userAddress + 1} (highlighted in green)
                      </p>
                      <p className="text-blue-300">
                        This is how privacy works - hiding in the crowd!
                      </p>
                    </div>
                  )}

                  <div className="bg-gray-900 p-4 rounded-lg max-w-md mx-auto">
                    <p className="text-sm text-gray-400">
                      <strong className="text-purple-400">Fun fact:</strong> With a group of 10, an attacker would need to make 
                      10 correct guesses in a row to track 10 transactions. That's a 0.00000001% chance!
                    </p>
                  </div>

                  <div className="flex gap-4 justify-center flex-wrap">
                    <button
                      onClick={resetDemo}
                      className="bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-lg font-semibold transition"
                    >
                      🔄 Try Again
                    </button>
                    <button
                      onClick={() => setStep(3)}
                      className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold transition"
                    >
                      Learn More →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-8">
              <h2 className="text-3xl font-bold mb-6 text-center">Who Benefits From This?</h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-900 p-6 rounded-lg">
                  <div className="text-4xl mb-3">🐋</div>
                  <h3 className="text-xl font-bold mb-2 text-purple-400">Crypto Whales</h3>
                  <p className="text-gray-300">
                    Large holders don't want everyone knowing when they buy or sell. Privacy prevents front-running and copycats.
                  </p>
                </div>

                <div className="bg-gray-900 p-6 rounded-lg">
                  <div className="text-4xl mb-3">📊</div>
                  <h3 className="text-xl font-bold mb-2 text-purple-400">Traders</h3>
                  <p className="text-gray-300">
                    Professional traders need to hide their strategies. Public wallets = everyone copies your moves.
                  </p>
                </div>

                <div className="bg-gray-900 p-6 rounded-lg">
                  <div className="text-4xl mb-3">🏢</div>
                  <h3 className="text-xl font-bold mb-2 text-purple-400">Businesses</h3>
                  <p className="text-gray-300">
                    Companies don't want competitors seeing their suppliers, customers, or financial patterns.
                  </p>
                </div>

                <div className="bg-gray-900 p-6 rounded-lg">
                  <div className="text-4xl mb-3">👤</div>
                  <h3 className="text-xl font-bold mb-2 text-purple-400">Regular People</h3>
                  <p className="text-gray-300">
                    Everyone deserves privacy. You wouldn't want your bank account public - same for crypto!
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-900 to-blue-900 p-8 rounded-lg text-center">
                <h3 className="text-2xl font-bold mb-4">The Technology Behind It</h3>
                <div className="space-y-3 text-left max-w-2xl mx-auto">
                  <p className="text-gray-200">
                    <strong className="text-purple-300">Ring Signatures:</strong> Cryptographic proof that you're in the group, without revealing which member you are
                  </p>
                  <p className="text-gray-200">
                    <strong className="text-purple-300">Zero-Knowledge Proofs:</strong> Prove you own something without revealing what you own
                  </p>
                  <p className="text-gray-200">
                    <strong className="text-purple-300">Probability Clouds:</strong> Instead of ONE identity, you exist as a quantum superposition of possibilities
                  </p>
                </div>
              </div>

              <div className="text-center space-x-4 mt-8">
                <Link
                  href="/create"
                  className="inline-block bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-8 py-4 rounded-lg font-semibold text-lg transition"
                >
                  🚀 Create Your Privacy Cloud
                </Link>
                <button
                  onClick={resetDemo}
                  className="inline-block bg-gray-700 hover:bg-gray-600 px-8 py-4 rounded-lg font-semibold text-lg transition"
                >
                  ↺ Restart Demo
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
