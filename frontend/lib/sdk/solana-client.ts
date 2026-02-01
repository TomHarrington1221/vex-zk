import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { Connection, PublicKey } from '@solana/web3.js';

const PROGRAM_ID = new PublicKey('83wuRQ6DNzMqsgNDJo1zgvMzYX5pXz4dfcNSTtam5SVU');

export class VexzkClient {
  program: Program;
  connection: Connection;

  constructor(connection: Connection, wallet: any) {
    this.connection = connection;

    const provider = new anchor.AnchorProvider(
      connection,
      wallet,
      { 
        commitment: 'confirmed',
        preflightCommitment: 'confirmed',
        skipPreflight: false
      }
    );

    const IDL = require('./idl.json');
    this.program = new Program(IDL as any, provider);
  }

  async createCloud(
    ringPublicKeys: PublicKey[],
    cloudId: number
  ): Promise<string> {
    if (!this.program.provider.publicKey) {
      throw new Error('Wallet not connected');
    }

    try {
      console.log('Creating cloud with', ringPublicKeys.length, 'addresses');
      
      const [cloudPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('cloud'),
          this.program.provider.publicKey.toBuffer(),
          new anchor.BN(cloudId).toArrayLike(Buffer, 'le', 8),
        ],
        this.program.programId
      );

      console.log('PDA:', cloudPda.toBase58());
      console.log('Sending transaction with fresh blockhash...');

      const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash('confirmed');
      console.log('Got blockhash:', blockhash);

      const tx = await this.program.methods
        .createCloud(
          ringPublicKeys.map(pk => Array.from(pk.toBytes())),
          new anchor.BN(cloudId)
        )
        .accounts({
          cloud: cloudPda,
          authority: this.program.provider.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc({
          skipPreflight: false,
          commitment: 'confirmed',
          maxRetries: 3,
        });

      console.log('Success! TX:', tx);
      
      const confirmation = await this.connection.confirmTransaction({
        signature: tx,
        blockhash,
        lastValidBlockHeight
      }, 'confirmed');

      if (confirmation.value.err) {
        throw new Error('Transaction failed: ' + JSON.stringify(confirmation.value.err));
      }

      return tx;
      
    } catch (error: any) {
      console.error('Full error:', error);
      console.error('Error message:', error.message);
      console.error('Error logs:', error.logs);
      
      if (error.message?.includes('Blockhash not found')) {
        throw new Error('Network timeout - please try again');
      } else if (error.message?.includes('insufficient')) {
        throw new Error('Insufficient SOL for transaction fee');
      } else {
        throw new Error(error.message || 'Transaction failed');
      }
    }
  }

  async getCloud(authority: PublicKey, cloudId: number) {
    const [cloudPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('cloud'),
        authority.toBuffer(),
        new anchor.BN(cloudId).toArrayLike(Buffer, 'le', 8),
      ],
      this.program.programId
    );

    try {
      return await (this.program.account as any).probabilityCloud.fetch(cloudPda);
    } catch (error) {
      return null;
    }
  }

  async transferWithRingProof(
    cloudPda: PublicKey,
    sender: PublicKey,
    recipient: PublicKey,
    amount: number,
    proof: Buffer,
    publicInputs: Buffer
  ): Promise<string> {
    const tx = await this.program.methods
      .transferWithRingProof(
        Array.from(proof),
        Array.from(publicInputs),
        new anchor.BN(amount)
      )
      .accounts({
        cloud: cloudPda,
        sender: sender,
        recipient: recipient,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    return tx;
  }

  getCloudPda(authority: PublicKey, cloudId: number): PublicKey {
    const [cloudPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('cloud'),
        authority.toBuffer(),
        new anchor.BN(cloudId).toArrayLike(Buffer, 'le', 8),
      ],
      this.program.programId
    );
    return cloudPda;
  }
}
