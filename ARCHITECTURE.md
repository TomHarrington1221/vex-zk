# Technical Architecture

## Overview

Vex.zk Protocol implements probabilistic identity on Solana using ring signatures and zero-knowledge proofs.

## System Components

### 1. Noir Circuits (`noir-circuits/ring_signature`)

**Purpose**: Generate zero-knowledge proofs of ring signature validity

**Key Files**:
- `src/main.nr` - Ring signature circuit
- `Prover.toml` - Proof inputs

**Circuit Logic**:
```noir
fn main(
    private_key: Field,      // Your secret key
    key_index: Field,        // Which position in ring
    message: pub Field,      // Message being signed
    signature: pub Field,    // The signature
    ring: pub [Field; 10]   // All public keys in ring
)
```

**Verification**: Proves `private_key == ring[key_index]` without revealing `key_index`

### 2. Solana Program (`solana-programs/`)

**Program ID**: `83wuRQ6DNzMqsgNDJo1zgvMzYX5pXz4dfcNSTtam5SVU`

**Key Instructions**:
```rust
pub fn create_cloud(
    ctx: Context<CreateCloud>,
    ring_public_keys: Vec<[u8; 32]>,
    cloud_id: u64,
) -> Result<()>
```

**Account Structure**:
```rust
pub struct ProbabilityCloud {
    pub authority: Pubkey,        // Creator
    pub cloud_id: u64,            // Unique ID
    pub ring_size: u8,            // Number of addresses
    pub ring_public_keys: Vec<[u8; 32]>,  // All addresses
    pub created_at: i64,          // Timestamp
}
```

**PDA Derivation**:
```
seeds = [b"cloud", authority.key(), cloud_id.to_le_bytes()]
```

### 3. TypeScript SDK (`sdk/`)

**Cloud Generation** (`ring-signer.ts`):
```typescript
export function createAddressCloud(size: number): AddressCloud {
  // Generate N keypairs
  // Randomly select user index
  // Return cloud data
}
```

**Blockchain Client** (`solana-client.ts`):
```typescript
export class VexzkClient {
  async createCloud(addresses: PublicKey[], cloudId: number)
  async getCloud(authority: PublicKey, cloudId: number)
  async transferWithRingProof(...)
}
```

### 4. Frontend (`frontend/`)

**Pages**:
- `/` - Landing page
- `/demo` - Interactive explanation
- `/create` - Cloud creation
- `/dashboard` - Management interface

**Tech Stack**:
- Next.js 16 (App Router)
- React 19
- Tailwind CSS
- @solana/wallet-adapter

## Data Flow

### Cloud Creation Flow
```
1. User clicks "Create Cloud"
   ↓
2. Frontend: Generate N keypairs locally
   │  - Use @solana/web3.js Keypair.generate()
   │  - Randomly select userIndex
   │  - Store in localStorage
   ↓
3. Frontend: Call SDK createCloud()
   ↓
4. SDK: Build transaction
   │  - Derive PDA
   │  - Prepare instruction data
   ↓
5. Wallet: User approves transaction
   ↓
6. Solana: Program executes
   │  - Validate inputs
   │  - Create PDA account
   │  - Store cloud data
   ↓
7. Frontend: Confirm & display
```

### Transaction Flow (Conceptual)
```
1. User wants to transfer SOL
   ↓
2. Generate ring signature proof
   │  - Use Noir circuit
   │  - Inputs: private_key, message, ring
   │  - Output: proof + public inputs
   ↓
3. Submit to Solana program
   │  - transferWithRingProof instruction
   │  - Include proof bytes
   ↓
4. Program verifies proof
   │  - (Current: mock verification)
   │  - (Future: Sunspot/Light Protocol)
   ↓
5. Execute transfer
   │  - SPL transfer
   │  - Observer sees "someone from ring" acted
```

## Privacy Properties

### Anonymity Set
- Size: Configurable (2-20 addresses)
- Probability of identification: 1/N
- Example: N=10 → 10% chance

### Security Assumptions
- Elliptic curve cryptography (ed25519)
- Zero-knowledge proof soundness
- Solana transaction finality

### Privacy Guarantees
- **Sender Privacy**: Cannot determine which address in ring is sender
- **Unlinkability**: Multiple transactions from same user appear independent
- **Plausible Deniability**: "Could be any of N addresses"

## Storage

### On-Chain (Solana)
- Program accounts (PDAs)
- Cloud metadata
- Ring public keys

### Off-Chain (localStorage)
- Full cloud data
- Private keys (secure in browser)
- User index (secret)

## Security Considerations

### ⚠️ Current Limitations
1. **Mock Verification**: ZK proofs not yet verified on-chain
   - Reason: Sunspot integration complexity
   - Mitigation: Architecture ready for real verification
   
2. **Client-Side Key Storage**: Private keys in browser
   - Risk: Browser compromise
   - Mitigation: Use for demo/testing only

3. **No Key Rotation**: Cannot update cloud once created
   - Risk: Long-term linkability
   - Mitigation: Future feature

### ✅ Security Features
1. **Deterministic PDA**: Prevents address squatting
2. **Authority Checks**: Only creator can modify
3. **Input Validation**: Size limits, type checks
4. **Audit Trail**: All on-chain transactions public

## Performance

### Gas Costs (Approximate)
- Create Cloud (10 addresses): ~0.002 SOL
- Verify Proof: TBD (mock verification)
- Transfer: Standard SPL transfer cost

### Scalability
- Cloud creation: O(N) where N = ring size
- Proof verification: O(1) with Noir
- Dashboard loading: O(M) where M = number of clouds

## Future Enhancements

### 1. Real ZK Verification
- Integrate Sunspot for on-chain verification
- Or use Light Protocol's ZK primitives
- Enable true private transfers

### 2. Advanced Features
- Multi-signature rings
- Threshold signatures
- Cross-chain privacy

### 3. Optimizations
- Batched proof verification
- Compressed state storage
- Off-chain proof aggregation

## Testing

### Unit Tests
```bash
cd noir-circuits/ring_signature
nargo test
```

### Integration Tests
```bash
cd solana-programs
anchor test
```

### E2E Testing
1. Create cloud via UI
2. Verify on Solana Explorer
3. Check localStorage persistence
4. Verify dashboard display

## Deployment

### Devnet (Current)
- Program: `83wuRQ6DNzMqsgNDJo1zgvMzYX5pXz4dfcNSTtam5SVU`
- Cluster: `https://api.devnet.solana.com`

### Mainnet (Future)
- Requires: Full ZK verification
- Requires: Security audit
- Requires: Key management solution

