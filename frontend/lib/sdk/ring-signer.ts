import { Keypair, PublicKey } from '@solana/web3.js';

export interface AddressCloud {
  addresses: PublicKey[];
  userIndex: number;
  cloudId: number;
  userKeypair: Keypair;
}

export interface RingSignatureInputs {
  private_key: string;
  key_index: number;
  message: string;
  signature: string;
  ring: string[];
}

export function createAddressCloud(size: number): AddressCloud {
  if (size < 2 || size > 20) {
    throw new Error('Cloud size must be between 2 and 20');
  }

  const addresses: PublicKey[] = [];
  const keypairs: Keypair[] = [];

  for (let i = 0; i < size; i++) {
    const keypair = Keypair.generate();
    keypairs.push(keypair);
    addresses.push(keypair.publicKey);
  }

  const userIndex = Math.floor(Math.random() * size);
  const userKeypair = keypairs[userIndex];
  
  // Add randomness to prevent collisions
  const cloudId = Date.now() + Math.floor(Math.random() * 1000);

  return {
    addresses,
    userIndex,
    cloudId,
    userKeypair,
  };
}

export function getUserKeypair(cloud: AddressCloud): Keypair {
  return cloud.userKeypair;
}

export function generateRingSignatureInputs(
  cloud: AddressCloud,
  message: string
): RingSignatureInputs {
  const privateKeyField = cloud.userKeypair.secretKey[0].toString();
  const signature = (BigInt(privateKeyField) + BigInt(message)).toString();

  return {
    private_key: privateKeyField,
    key_index: cloud.userIndex,
    message,
    signature,
    ring: cloud.addresses.map((addr) => addr.toBase58().slice(0, 10)),
  };
}

export function generateMockProof(inputs: RingSignatureInputs): {
  proof: Buffer;
  publicInputs: Buffer;
} {
  const proofData = JSON.stringify({
    ring_index: inputs.key_index,
    message: inputs.message,
    signature: inputs.signature,
  });

  return {
    proof: Buffer.from(proofData),
    publicInputs: Buffer.from(inputs.message),
  };
}

export function saveCloud(cloud: AddressCloud, name?: string): void {
  if (typeof window === 'undefined') return;

  const cloudData = {
    addresses: cloud.addresses.map((addr) => addr.toBase58()),
    userIndex: cloud.userIndex,
    cloudId: cloud.cloudId,
    userKeypair: Array.from(cloud.userKeypair.secretKey),
  };

  const key = name || `cloud_${cloud.cloudId}`;
  localStorage.setItem(key, JSON.stringify(cloudData));
}

export function loadCloud(name: string): AddressCloud | null {
  if (typeof window === 'undefined') return null;

  const cloudData = localStorage.getItem(name);
  if (!cloudData) return null;

  try {
    const parsed = JSON.parse(cloudData);
    return {
      addresses: parsed.addresses.map((addr: string) => new PublicKey(addr)),
      userIndex: parsed.userIndex,
      cloudId: parsed.cloudId,
      userKeypair: Keypair.fromSecretKey(new Uint8Array(parsed.userKeypair)),
    };
  } catch (error) {
    console.error('Error loading cloud:', error);
    return null;
  }
}

export function loadAllClouds(): AddressCloud[] {
  if (typeof window === 'undefined') return [];

  const clouds: AddressCloud[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('cloud_')) {
      const cloud = loadCloud(key);
      if (cloud) {
        clouds.push(cloud);
      }
    }
  }

  clouds.sort((a, b) => b.cloudId - a.cloudId);
  return clouds;
}

export function formatCloudInfo(cloud: AddressCloud) {
  return {
    totalAddresses: cloud.addresses.length,
    cloudId: cloud.cloudId,
    userAddress: cloud.addresses[cloud.userIndex].toBase58(),
    allAddresses: cloud.addresses.map((addr) => addr.toBase58()),
    anonymitySet: cloud.addresses.length,
  };
}
