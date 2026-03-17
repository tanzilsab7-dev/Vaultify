// Cryptographic constants
export const CRYPTO = {
    // Salt parameters
    SALT_LENGTH: 32,           // 256 bits
    
    // PBKDF2 parameters
    PBKDF2_ITERATIONS: 100000, 
    PBKDF2_HASH: 'SHA-256',    
    PBKDF2_KEY_LENGTH: 512,    
    
    // AES parameters
    AES_ALGORITHM: 'AES-GCM',  
    AES_KEY_LENGTH: 256,       
    AES_IV_LENGTH: 12,         
    AES_TAG_LENGTH: 128,       
    
    // Storage format
    ENCODING: 'base64'         
} as const;