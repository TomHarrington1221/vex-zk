import { Connection, PublicKey, Transaction, SystemProgram, TransactionInstruction } from '@solana/web3.js';

const PROGRAM_ID = new PublicKey('83wuRQ6DNzMqsgNDJo1zgvMzYX5pXz4dfcNSTtam5SVU');
const CREATE_CLOUD_DISCRIMINATOR = Buffer.from([140, 150, 219, 249, 38, 95, 11, 173]);

export async function createCloudOnChain(
  connection: Connection,
  payer: PublicKey,
  ringPublicKeys: PublicKey[],
  cloudId: number,
  signTransaction: (tx: Transaction) => Promise<Transaction>
): Promise<string> {
  
  console.log('===== CREATE CLOUD DEBUG =====');
  console.log('Payer address:', payer.toString());
  console.log('CloudId:', cloudId);
  console.log('Ring size:', ringPublicKeys.length);
  
  const cloudIdBuffer = Buffer.alloc(8);
  const view = new DataView(cloudIdBuffer.buffer);
  view.setBigUint64(0, BigInt(cloudId), true);
  
  console.log('CloudId buffer:', Array.from(cloudIdBuffer));
  
  const [cloudPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from('cloud'),
      payer.toBuffer(),
      cloudIdBuffer,
    ],
    PROGRAM_ID
  );

  console.log('Derived PDA:', cloudPda.toString());

  const ringBytes = ringPublicKeys.map(pk => pk.toBytes());
  
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32LE(ringBytes.length, 0);
  
  const data = Buffer.concat([
    CREATE_CLOUD_DISCRIMINATOR,
    lenBuf,
    ...ringBytes.map(bytes => Buffer.from(bytes)),
    cloudIdBuffer,
  ]);

  console.log('Instruction data length:', data.length);
  console.log('Expected length:', 8 + 4 + (ringBytes.length * 32) + 8);
  console.log('First 12 bytes:', Array.from(data.slice(0, 12)));
  console.log('Last 8 bytes (cloudId):', Array.from(data.slice(-8)));

  const instruction = new TransactionInstruction({
    keys: [
      { pubkey: cloudPda, isSigner: false, isWritable: true },
      { pubkey: payer, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    programId: PROGRAM_ID,
    data,
  });

  const transaction = new Transaction().add(instruction);
  transaction.feePayer = payer;
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;

  const signed = await signTransaction(transaction);
  
  try {
    const signature = await connection.sendRawTransaction(signed.serialize(), {
      skipPreflight: false,
      preflightCommitment: 'confirmed',
    });
    
    await connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight,
    });
    
    return signature;
  } catch (error: any) {
    console.error('Transaction failed:', error);
    console.error('Error logs:', error.logs);
    const errorMessage = `Transaction failed: ${error.message}`;
    throw new Error(errorMessage);
  }
}

