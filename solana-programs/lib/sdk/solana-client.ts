import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { Connection, PublicKey } from '@solana/web3.js';

const PROGRAM_ID = new PublicKey('83wuRQ6DNzMqsgNDJo1zgvMzYX5pXz4dfcNSTtam5SVU');

export class SchrodingersWalletClient {
  program: Program;
  connection: Connection;

  constructor(connection: Connection, wallet: any) {
    this.connection = connection;

    const provider = new anchor.AnchorProvider(
      connection,
      wallet,
      { commitment: 'confirmed' }
    );

    const IDL = require('./idl.json');
    this.program = new Program(IDL as any, provider);
  }

  async createCloud(
    ringPublicKeys: PublicKey[],
    cloudId: number
  ): Promise<string> {
    console.log('Creating cloud...');
    console.log('Authority (wallet):', this.program.provider.publicKey?.toBase58());
    console.log('Cloud ID:', cloudId);
    console.log('Ring size:', ringPublicKeys.length);

    const [cloudPda, bump] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('cloud'),
        this.program.provider.publicKey!.toBuffer(),
        new anchor.BN(cloudId).toArrayLike(Buffer, 'le', 8),
      ],
      this.program.programId
    );

    console.log('Computed PDA:', cloudPda.toBase58());
    console.log('Bump:', bump);

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
      .rpc();

    console.log('Cloud created! TX:', tx);
    return tx;
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
      console.error('Error fetching cloud:', error);
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

    console.log('Transfer executed! TX:', tx);
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
