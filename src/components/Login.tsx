import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useVault } from '../context/VaultContext';
import { CryptoService } from '../crypto/keyDerivation';

interface LoginProps {
    onSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onSuccess }) => {
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [localError, setLocalError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const { login, register, error: authError } = useAuth();
    const { unlockVault } = useVault();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError('');
        setIsLoading(true);

        try {
            // Validate passwords match for register
            if (!isLoginMode && password !== confirmPassword) {
                setLocalError('Passwords do not match');
                setIsLoading(false);
                return;
            }

            // First authenticate with backend
            if (isLoginMode) {
                await login(username, password);
            } else {
                await register(username, password);
            }

            // Get salt from backend
            const saltResponse = await fetch(`http://localhost:5000/api/auth/salt/${username}`);
            const saltData = await saltResponse.json();
            
            if (!saltResponse.ok) {
                throw new Error(saltData.error || 'Failed to get salt');
            }

            // Convert salt from base64 to Uint8Array
            const salt = Uint8Array.from(atob(saltData.salt), c => c.charCodeAt(0));

            // Unlock vault with master password
            await unlockVault(password);
            
            onSuccess();
        } catch (err: any) {
            setLocalError(err.message || 'Authentication failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ 
            maxWidth: '400px', 
            margin: '50px auto', 
            padding: '30px',
            border: '1px solid #ccc',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
            <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>
                {isLoginMode ? 'Login to Vaultify' : 'Create Account'}
            </h2>
            
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Username:
                    </label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        style={{ 
                            width: '100%', 
                            padding: '10px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            fontSize: '16px'
                        }}
                    />
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Master Password:
                    </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ 
                            width: '100%', 
                            padding: '10px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            fontSize: '16px'
                        }}
                    />
                </div>

                {!isLoginMode && (
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                            Confirm Password:
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            style={{ 
                                width: '100%', 
                                padding: '10px',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                fontSize: '16px'
                            }}
                        />
                    </div>
                )}

                {(localError || authError) && (
                    <div style={{ 
                        color: '#d32f2f', 
                        marginBottom: '20px',
                        padding: '10px',
                        backgroundColor: '#ffebee',
                        borderRadius: '4px'
                    }}>
                        {localError || authError}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                        width: '100%',
                        padding: '12px',
                        backgroundColor: '#1976d2',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        opacity: isLoading ? 0.7 : 1
                    }}
                >
                    {isLoading ? 'Processing...' : (isLoginMode ? 'Login' : 'Register')}
                </button>
            </form>

            <p style={{ marginTop: '20px', textAlign: 'center' }}>
                {isLoginMode ? "Don't have an account? " : "Already have an account? "}
                <button
                    onClick={() => setIsLoginMode(!isLoginMode)}
                    style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: '#1976d2', 
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        fontSize: '16px'
                    }}
                >
                    {isLoginMode ? 'Register' : 'Login'}
                </button>
            </p>
        </div>
    );
};