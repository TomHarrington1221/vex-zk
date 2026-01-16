// Ring Signature Circuit for Schrodinger's Wallet
// Proves: "I know the private key for ONE of these public keys"
// Without revealing: Which specific key I control

use dep::std;

// Main circuit - proves membership in a ring
fn main(
    // Private inputs (only prover knows these)
    private_key: Field,           // Your secret key
    key_index: u32,               // Which position in the ring (secret)
    
    // Public inputs (everyone can see these)
    ring: pub [Field; 10],        // Array of 10 public keys in the ring
    message: pub Field,           // The message being signed
    signature: pub Field          // The signature to verify
) {
    // Step 1: Derive your public key from private key
    let derived_public_key = std::hash::pedersen_hash([private_key]);
    
    // Step 2: Verify that your derived public key is in the ring at the claimed index
    assert(derived_public_key == ring[key_index]);
    
    // Step 3: Verify the signature is valid
    // Sign the message with your private key
    let computed_signature = std::hash::pedersen_hash([private_key, message]);
    assert(computed_signature == signature);
    
    // If we get here, proof is valid:
    // - Prover knows a private key
    // - That private key corresponds to ONE of the public keys in the ring
    // - But we don't know WHICH one (key_index is private)
}

#[test]
fn test_ring_signature() {
    // Test case: create a ring and prove membership
    
    // Private: the prover's secret key
    let private_key = 12345;
    let key_index = 3; // Prover is at position 3 in the ring
    
    // Derive public key
    let public_key = std::hash::pedersen_hash([private_key]);
    
    // Create a ring of 10 public keys (prover is at index 3)
    let mut ring: [Field; 10] = [0; 10];
    ring[0] = std::hash::pedersen_hash([111]);
    ring[1] = std::hash::pedersen_hash([222]);
    ring[2] = std::hash::pedersen_hash([333]);
    ring[3] = public_key; // Prover's public key
    ring[4] = std::hash::pedersen_hash([555]);
    ring[5] = std::hash::pedersen_hash([666]);
    ring[6] = std::hash::pedersen_hash([777]);
    ring[7] = std::hash::pedersen_hash([888]);
    ring[8] = std::hash::pedersen_hash([999]);
    ring[9] = std::hash::pedersen_hash([1010]);
    
    // Create message and signature
    let message = 99999;
    let signature = std::hash::pedersen_hash([private_key, message]);
    
    // This should pass - we're proving we control key at index 3
    main(private_key, key_index, ring, message, signature);
}

