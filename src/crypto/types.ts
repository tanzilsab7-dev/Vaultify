// Derived keys ka structure
export interface DerivedKeys {
    authKey: string;           
    encryptionKey: CryptoKey;   
    salt: Uint8Array;           
}

// Vault data structure
export interface VaultEntry {
    id: string;
    site: string;
    username: string;
    password: string;
    notes?: string;
    created: number;            
    updated?: number;           
}

export interface Vault {
    entries: VaultEntry[];
    version: number;            
}

// API responses
export interface SaltResponse {
    salt: string;               
}

export interface LoginRequest {
    username: string;
    authKey: string;            
}

export interface VaultResponse {
    data: string | null;        
}