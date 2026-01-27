import { Keypair, PublicKey } from '@solana/web3.js';
import * as crypto from 'crypto';

export interface AddressCloud {
  addresses: PublicKey[];
  keypairs: Keypair[];
  cloudId: number;
  userIndex: number;
}

export interface RingSignatureInputs {
  privateKey: string;
  keyIndex: string;
  ring: string[];
  message: string;
  signature: string;
}

/**
 * Generate a probability cloud of N addresses
 */
export function createAddressCloud(
  size: number = 10,
  cloudId: number = Date.now()
): AddressCloud {
  if (size < 2 || size > 20) {
    throw new Error('Cloud size must be between 2 and 20');
  }

  const keypairs: Keypair[] = [];
  const addresses: PublicKey[] = [];
  const userIndex = Math.floor(Math.random() * size);

  for (let i = 0; i < size; i++) {
    const keypair = Keypair.generate();
    keypairs.push(keypair);
    addresses.push(keypair.publicKey);
  }

  return { addresses, keypairs, cloudId, userIndex };
}

/**
 * Get user's keypair from cloud
 */
export function getUserKeypair(cloud: AddressCloud): Keypair {
  return cloud.keypairs[cloud.userIndex];
}

/**
 * Generate ring signature inputs for Noir circuit
 */
export function generateRingSignatureInputs(
  cloud: AddressCloud,
  message: string
): RingSignatureInputs {
  const userKeypair = getUserKeypair(cloud);
  const secretKeyBytes = userKeypair.secretKey.slice(0, 32);
  const privateKeyValue = Buffer.from(secretKeyBytes).readBigUInt64LE(0).toString();

  const ring = cloud.keypairs.map((kp, idx) => {
    if (idx === cloud.userIndex) {
      return privateKeyValue;
    }
    return (BigInt(idx) + BigInt(1000)).toString();
  });

  const messageHash = hashMessage(message);
  const signature = (BigInt(privateKeyValue) + BigInt(messageHash)).toString();

  return {
    privateKey: privateKeyValue,
    keyIndex: cloud.userIndex.toString(),
    ring,
    message: messageHash,
    signature,
  };
}

function hashMessage(message: string): string {
  const hash = crypto.createHash('sha256').update(message).digest();
  return hash.readBigUInt64LE(0).toString();
}

/**
 * Generate mock proof for Solana
 */
export function generateMockProof(inputs: RingSignatureInputs): {
  proof: Buffer;
  publicInputs: Buffer;
} {
  const proofData = {
    ring: inputs.ring,
    message: inputs.message,
    signature: inputs.signature,
  };

  const proof = Buffer.from(JSON.stringify(proofData));
  const publicInputs = Buffer.from(JSON.stringify({
    ring: inputs.ring,
    message: inputs.message,
    signature: inputs.signature,
  }));

  return { proof, publicInputs };
}

/**
 * Save cloud to localStorage
 */
export function saveCloud(cloud: AddressCloud, name: string = 'default') {
  if (typeof window === 'undefined') return;

  const cloudData = {
    addresses: cloud.addresses.map(addr => addr.toBase58()),
    keypairs: cloud.keypairs.map(kp => Array.from(kp.secretKey)),
    cloudId: cloud.cloudId,
    userIndex: cloud.userIndex,
  };

  localStorage.setItem(`cloud_${name}`, JSON.stringify(cloudData));
}

/**
 * Load cloud from localStorage
 */
export function loadCloud(name: string = 'default'): AddressCloud | null {
  if (typeof window === 'undefined') return null;

  const stored = localStorage.getItem(`cloud_${name}`);
  if (!stored) return null;

  const cloudData = JSON.parse(stored);
  
  return {
    addresses: cloudData.addresses.map((addr: string) => new PublicKey(addr)),
    keypairs: cloudData.keypairs.map((sk: number[]) => 
      Keypair.fromSecretKey(Uint8Array.from(sk))
    ),
    cloudId: cloudData.cloudId,
    userIndex: cloudData.userIndex,
  };
}

/**
 * Format cloud info for display
 */
export function formatCloudInfo(cloud: AddressCloud) {
  return {
    totalAddresses: cloud.addresses.length,
    cloudId: cloud.cloudId,
    userAddress: cloud.addresses[cloud.userIndex].toBase58(),
    allAddresses: cloud.addresses.map(addr => addr.toBase58()),
    anonymitySet: cloud.addresses.length,
  };
}
