import { useState, useCallback } from 'react';
import { CryptoService } from '../crypto/keyDerivation';
import { Vault } from '../crypto/types';

export const useVault = () => {
    const [vault, setVault] = useState<Vault | null>(null);
    const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null);
    const [isLocked, setIsLocked] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Vault unlock karna
    const unlockVault = useCallback(async (
        masterPassword: string,
        salt: Uint8Array,
        encryptedData: string | null
    ) => {
        try {
            setError(null);
            
            console.log('Unlocking vault...');
            
            // Keys derive karo
            const keys = await CryptoService.deriveKeys(masterPassword, salt);
            
            // Agar vault empty hai toh new banao
            if (!encryptedData) {
                const newVault: Vault = {
                    version: 1,
                    entries: []
                };
                setVault(newVault);
                setEncryptionKey(keys.encryptionKey);
                setIsLocked(false);
                console.log('New vault created');
                return;
            }
            
            // Existing vault decrypt karo
            const decryptedVault = await CryptoService.decryptVault(
                encryptedData,
                keys.encryptionKey
            );
            
            setVault(decryptedVault);
            setEncryptionKey(keys.encryptionKey);
            setIsLocked(false);
            
            console.log('Vault unlocked successfully');
            
        } catch (err) {
            setError('Invalid master password');
            console.error('Unlock failed:', err);
        }
    }, []);

    // New entry add karna
    const addEntry = useCallback(async (
        site: string,
        username: string,
        password: string,
        notes?: string
    ) => {
        if (!vault || !encryptionKey || isLocked) {
            throw new Error('Vault is locked');
        }
        
        const newEntry = {
            id: crypto.randomUUID(),
            site,
            username,
            password,
            notes,
            created: Date.now()
        };
        
        const updatedVault = {
            ...vault,
            entries: [...vault.entries, newEntry]
        };
        
        // Encrypt karo
        const encrypted = await CryptoService.encryptVault(
            updatedVault,
            encryptionKey
        );
        
        setVault(updatedVault);
        
        // Return encrypted data for server
        return encrypted;
        
    }, [vault, encryptionKey, isLocked]);

    // Vault lock karo
    const lockVault = useCallback(() => {
        setVault(null);
        setEncryptionKey(null);
        setIsLocked(true);
        console.log('Vault locked');
    }, []);

    return {
        vault,
        isLocked,
        error,
        unlockVault,
        addEntry,
        lockVault
    };
};