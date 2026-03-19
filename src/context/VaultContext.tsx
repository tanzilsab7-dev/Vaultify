import React, { createContext, useState, useContext } from 'react';

export interface VaultEntry {
    id: string;
    site: string;
    username: string;
    password: string;
    notes?: string;
    created: number;
}

export interface Vault {
    version: number;
    entries: VaultEntry[];
}

interface VaultContextType {
    vault: Vault | null;
    isLoading: boolean;
    error: string | null;
    addEntry: (site: string, username: string, password: string, notes?: string) => Promise<void>;
    updateEntry: (id: string, site: string, username: string, password: string, notes?: string) => Promise<void>;
    deleteEntry: (id: string) => Promise<void>;
    lockVault: () => void;
    unlockVault: (password: string) => Promise<void>;
    isLocked: boolean;
}

const VaultContext = createContext<VaultContextType | null>(null);

export const VaultProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [vault, setVault] = useState<Vault | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLocked, setIsLocked] = useState(true);

    const unlockVault = async (password: string) => {
        setIsLoading(true);
        setError(null);
        
        try {
            // Simulate vault unlock
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const savedVault = localStorage.getItem('vaultify_vault');
            
            if (savedVault) {
                setVault(JSON.parse(savedVault));
            } else {
                setVault({ version: 1, entries: [] });
            }
            
            setIsLocked(false);
        } catch (err) {
            setError('Failed to unlock vault');
        } finally {
            setIsLoading(false);
        }
    };

    const lockVault = () => {
        setVault(null);
        setIsLocked(true);
    };

    const saveVault = (updatedVault: Vault) => {
        localStorage.setItem('vaultify_vault', JSON.stringify(updatedVault));
        setVault(updatedVault);
    };

    const addEntry = async (site: string, username: string, password: string, notes?: string) => {
        if (!vault) return;
        
        const newEntry: VaultEntry = {
            id: Date.now().toString(),
            site,
            username,
            password,
            notes: notes || '',
            created: Date.now()
        };
        
        const updatedVault = { ...vault, entries: [...vault.entries, newEntry] };
        saveVault(updatedVault);
    };

    const updateEntry = async (id: string, site: string, username: string, password: string, notes?: string) => {
        if (!vault) return;
        
        const updatedEntries = vault.entries.map(entry => 
            entry.id === id ? { ...entry, site, username, password, notes: notes || '' } : entry
        );
        
        saveVault({ ...vault, entries: updatedEntries });
    };

    const deleteEntry = async (id: string) => {
        if (!vault) return;
        
        saveVault({ ...vault, entries: vault.entries.filter(entry => entry.id !== id) });
    };

    return (
        <VaultContext.Provider value={{
            vault, isLoading, error, addEntry, updateEntry, deleteEntry, lockVault, unlockVault, isLocked
        }}>
            {children}
        </VaultContext.Provider>
    );
};

export const useVault = () => {
    const context = useContext(VaultContext);
    if (!context) {
        throw new Error('useVault must be used within a VaultProvider');
    }
    return context;
};