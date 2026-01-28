import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { Connection, PublicKey } from '@solana/web3.js';
import IDL from './idl.json';

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

    this.program = new Program(IDL as any, provider);
  }

  /**
   * Create a new Vexil Vexil Probability Cloud (ring of addresses)
   */
  async createCloud(
    ringPublicKeys: PublicKey[],
    cloudId: number
  ): Promise<string> {
    const [cloudPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('cloud'),
        this.program.provider.publicKey!.toBuffer(),
        new anchor.BN(cloudId).toArrayLike(Buffer, 'le', 8),
      ],
      this.program.programId
    );

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
    console.log('Cloud PDA:', cloudPda.toBase58());

    return tx;
  }

  /**
   * Get a Vexil Vexil Probability Cloud by ID
   */
  async getCloud(authority: PublicKey, cloudId: number) {
    const [cloudPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('cloud'),
        authority.toBuffer(),
        new anchor.BN(cloudId).toArrayLike(Buffer, 'le', 8),
      ],
      this.program.programId
    );

    return await this.program.account.probabilityCloud.fetch(cloudPda);
  }

  /**
   * Execute a transfer with ring signature proof
   */
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

  /**
   * Get cloud PDA address
   */
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
