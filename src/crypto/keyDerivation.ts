import { CRYPTO } from './constants';
import { DerivedKeys } from './types';

export class CryptoService {
    
    // Generate Random Salt
    static generateSalt(): Uint8Array {
        const salt = new Uint8Array(CRYPTO.SALT_LENGTH);
        crypto.getRandomValues(salt);
        return salt;
    }

    // Master Password se Keys Derive Karna
    static async deriveKeys(
        masterPassword: string, 
        salt: Uint8Array
    ): Promise<DerivedKeys> {
        try {
            const encoder = new TextEncoder();
            const passwordBuffer = encoder.encode(masterPassword);

            const baseKey = await crypto.subtle.importKey(
                'raw',                    
                passwordBuffer,            
                { name: 'PBKDF2' },        
                false,                     
                ['deriveBits', 'deriveKey'] 
            );

            const derivedBits = await crypto.subtle.deriveBits(
                {
                    name: 'PBKDF2',
                    salt: salt.buffer as ArrayBuffer,                    
                    iterations: CRYPTO.PBKDF2_ITERATIONS, 
                    hash: CRYPTO.PBKDF2_HASH       
                },
                baseKey,
                CRYPTO.PBKDF2_KEY_LENGTH           
            );

            const combined = new Uint8Array(derivedBits);
            const authKeyBytes = combined.slice(0, 32);    
            const encKeyBytes = combined.slice(32, 64);    

            // Auth Key ko hex mein convert karo (Uint8Array to hex)
            let authKeyHex = '';
            for (let i = 0; i < authKeyBytes.length; i++) {
                authKeyHex += authKeyBytes[i].toString(16).padStart(2, '0');
            }

            // Encryption Key ko import karo
            const encryptionKey = await crypto.subtle.importKey(
                'raw',
                encKeyBytes,
                {
                    name: CRYPTO.AES_ALGORITHM,
                    length: CRYPTO.AES_KEY_LENGTH
                },
                false,                         
                ['encrypt', 'decrypt']          
            );

            return {
                authKey: authKeyHex,
                encryptionKey,
                salt
            };

        } catch (error) {
            console.error('Key derivation error:', error);
            throw new Error('Key derivation failed');
        }
    }

    // Vault Encryption
    static async encryptVault(
        vaultData: any,           
        encryptionKey: CryptoKey  
    ): Promise<string> {
        try {
            const jsonString = JSON.stringify(vaultData);
            const encoder = new TextEncoder();
            const dataBuffer = encoder.encode(jsonString);

            const iv = crypto.getRandomValues(new Uint8Array(CRYPTO.AES_IV_LENGTH));

            const encryptedBuffer = await crypto.subtle.encrypt(
                {
                    name: CRYPTO.AES_ALGORITHM,
                    iv: iv,
                    tagLength: CRYPTO.AES_TAG_LENGTH
                },
                encryptionKey,
                dataBuffer
            );

            // Combine IV and encrypted data
            const encryptedArray = new Uint8Array(encryptedBuffer);
            const result = new Uint8Array(iv.length + encryptedArray.length);
            
            result.set(iv, 0);
            result.set(encryptedArray, iv.length);

            // Convert to Base64
            let binary = '';
            for (let i = 0; i < result.length; i++) {
                binary += String.fromCharCode(result[i]);
            }
            const base64Data = btoa(binary);

            return base64Data;

        } catch (error) {
            console.error('Encryption error:', error);
            throw new Error('Failed to encrypt vault');
        }
    }

    // Vault Decryption
    static async decryptVault(
        encryptedBase64: string,
        encryptionKey: CryptoKey
    ): Promise<any> {
        try {
            // Base64 to binary
            const binary = atob(encryptedBase64);
            const encryptedData = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
                encryptedData[i] = binary.charCodeAt(i);
            }

            const iv = encryptedData.slice(0, CRYPTO.AES_IV_LENGTH);
            const ciphertext = encryptedData.slice(CRYPTO.AES_IV_LENGTH);

            const decryptedBuffer = await crypto.subtle.decrypt(
                {
                    name: CRYPTO.AES_ALGORITHM,
                    iv: iv,
                    tagLength: CRYPTO.AES_TAG_LENGTH
                },
                encryptionKey,
                ciphertext
            );

            const decoder = new TextDecoder();
            const jsonString = decoder.decode(decryptedBuffer);
            const vaultObject = JSON.parse(jsonString);

            return vaultObject;

        } catch (error) {
            console.error('Decryption error:', error);
            throw new Error('Invalid password or corrupted vault');
        }
    }

    // Password Generator
    static generatePassword(options: {
        length?: number;
        includeUppercase?: boolean;
        includeLowercase?: boolean;
        includeNumbers?: boolean;
        includeSymbols?: boolean;
    } = {}): string {
        const config = {
            length: 16,
            includeUppercase: true,
            includeLowercase: true,
            includeNumbers: true,
            includeSymbols: true,
            ...options
        };

        let chars = '';
        if (config.includeUppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (config.includeLowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
        if (config.includeNumbers) chars += '0123456789';
        if (config.includeSymbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
        
        const array = new Uint32Array(config.length);
        crypto.getRandomValues(array);
        
        let password = '';
        for (let i = 0; i < config.length; i++) {
            password += chars[array[i] % chars.length];
        }
        
        return password;
    }
}