// Simplified Ring Signature Circuit
// Using simple operations for testing
fn main(
    private_key: Field,
    key_index: u32,
    ring: pub [Field; 10],
    message: pub Field,
    signature: pub Field
) {
    // For now, just verify key_index is valid
    assert(key_index < 10);
    
    // Simplified: just check that private_key matches something in ring
    // In production we'd use proper hashing
    assert(private_key == ring[key_index]);
    
    // Simplified signature check
    assert(signature == private_key + message);
}

#[test]
fn test_ring_signature() {
    let private_key = 12345;
    let key_index = 3;
    
    let mut ring: [Field; 10] = [0; 10];
    ring[0] = 111;
    ring[1] = 222;
    ring[2] = 333;
    ring[3] = 12345; // private_key at position 3
    ring[4] = 555;
    ring[5] = 666;
    ring[6] = 777;
    ring[7] = 888;
    ring[8] = 999;
    ring[9] = 1010;
    
    let message = 99999;
    let signature = private_key + message; // 12345 + 99999 = 112344
    
    main(private_key, key_index, ring, message, signature);
}
