import React, { useState } from 'react';
import { Login } from './components/Login';
import { Vault } from './components/Vault';
import { AuthProvider, useAuth } from './context/AuthContext';
import { VaultProvider } from './context/VaultContext';
import './App.css';

const AppContent: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const { user, logout } = useAuth();

    const handleLoginSuccess = () => {
        setIsAuthenticated(true);
    };

    const handleLogout = async () => {
        await logout();
        setIsAuthenticated(false);
    };

    if (!isAuthenticated) {
        return <Login onSuccess={handleLoginSuccess} />;
    }

    return (
        <div className="App">
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                padding: '10px 20px', 
                borderBottom: '1px solid #ccc',
                backgroundColor: '#f5f5f5'
            }}>
                <h2 style={{ margin: 0 }}>Vaultify</h2>
                <div>
                    <span style={{ marginRight: '15px' }}>
                        Welcome, {user?.username || 'User'}
                    </span>
                    <button
                        onClick={handleLogout}
                        style={{
                            padding: '5px 10px',
                            backgroundColor: '#f44336',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Logout
                    </button>
                </div>
            </div>
            <Vault />
        </div>
    );
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <VaultProvider>
                <AppContent />
            </VaultProvider>
        </AuthProvider>
    );
};

export default App;