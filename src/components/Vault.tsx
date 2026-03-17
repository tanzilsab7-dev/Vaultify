import React, { useState, useEffect } from 'react';
import { useVault } from '../context/VaultContext';
import { CryptoService } from '../crypto/keyDerivation';

export const Vault: React.FC = () => {
    const { 
        vault, 
        isLoading, 
        error, 
        addEntry, 
        updateEntry, 
        deleteEntry, 
        lockVault,
        isLocked 
    } = useVault();

    const [showAddForm, setShowAddForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showGenerator, setShowGenerator] = useState(false);
    const [generatedPassword, setGeneratedPassword] = useState('');

    // Form state
    const [formData, setFormData] = useState({
        site: '',
        username: '',
        password: '',
        notes: ''
    });

    // Load generated password
    useEffect(() => {
        if (showGenerator) {
            const password = CryptoService.generatePassword({
                length: 16,
                includeUppercase: true,
                includeLowercase: true,
                includeNumbers: true,
                includeSymbols: true
            });
            setGeneratedPassword(password);
        }
    }, [showGenerator]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await addEntry(
                formData.site,
                formData.username,
                formData.password,
                formData.notes
            );
            setFormData({ site: '', username: '', password: '', notes: '' });
            setShowAddForm(false);
        } catch (err) {
            console.error('Failed to add entry:', err);
        }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingId) return;
        
        try {
            await updateEntry(
                editingId,
                formData.site,
                formData.username,
                formData.password,
                formData.notes
            );
            setFormData({ site: '', username: '', password: '', notes: '' });
            setEditingId(null);
        } catch (err) {
            console.error('Failed to update entry:', err);
        }
    };

    const handleEdit = (entry: any) => {
        setFormData({
            site: entry.site,
            username: entry.username,
            password: entry.password,
            notes: entry.notes || ''
        });
        setEditingId(entry.id);
        setShowAddForm(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this entry?')) {
            try {
                await deleteEntry(id);
            } catch (err) {
                console.error('Failed to delete entry:', err);
            }
        }
    };

    const handleUseGeneratedPassword = () => {
        setFormData({
            ...formData,
            password: generatedPassword
        });
        setShowGenerator(false);
    };

    // Filter entries based on search
    const filteredEntries = vault?.entries.filter(entry =>
        entry.site.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.username.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    if (isLocked) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <h2>Vault is Locked</h2>
                <p>Please login to access your vault.</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <h2>Loading vault...</h2>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>
                <h2>Error</h2>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '30px'
            }}>
                <h1>My Vault</h1>
                <button
                    onClick={lockVault}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Lock Vault
                </button>
            </div>

            {/* Search and Add */}
            <div style={{ 
                display: 'flex', 
                gap: '10px', 
                marginBottom: '20px'
            }}>
                <input
                    type="text"
                    placeholder="Search sites or usernames..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        flex: 1,
                        padding: '10px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        fontSize: '16px'
                    }}
                />
                <button
                    onClick={() => {
                        setFormData({ site: '', username: '', password: '', notes: '' });
                        setEditingId(null);
                        setShowAddForm(!showAddForm);
                    }}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#4caf50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    {showAddForm ? 'Cancel' : '+ Add New'}
                </button>
            </div>

            {/* Add/Edit Form */}
            {showAddForm && (
                <div style={{
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    padding: '20px',
                    marginBottom: '20px',
                    backgroundColor: '#f9f9f9'
                }}>
                    <h3>{editingId ? 'Edit Entry' : 'Add New Entry'}</h3>
                    <form onSubmit={editingId ? handleEditSubmit : handleAddSubmit}>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Site/URL:</label>
                            <input
                                type="text"
                                name="site"
                                value={formData.site}
                                onChange={handleInputChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px'
                                }}
                            />
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Username:</label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleInputChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px'
                                }}
                            />
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Password:</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input
                                    type="text"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    required
                                    style={{
                                        flex: 1,
                                        padding: '8px',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px'
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowGenerator(true)}
                                    style={{
                                        padding: '8px 16px',
                                        backgroundColor: '#ff9800',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Generate
                                </button>
                            </div>
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Notes:</label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleInputChange}
                                rows={3}
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px'
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                type="submit"
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#2196f3',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                {editingId ? 'Update' : 'Save'}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowAddForm(false);
                                    setEditingId(null);
                                    setFormData({ site: '', username: '', password: '', notes: '' });
                                }}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#f44336',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Password Generator Modal */}
            {showGenerator && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '30px',
                        borderRadius: '8px',
                        maxWidth: '400px',
                        width: '90%'
                    }}>
                        <h3>Password Generator</h3>
                        <div style={{
                            backgroundColor: '#f5f5f5',
                            padding: '15px',
                            borderRadius: '4px',
                            marginBottom: '20px',
                            fontFamily: 'monospace',
                            fontSize: '18px',
                            textAlign: 'center'
                        }}>
                            {generatedPassword}
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={() => setShowGenerator(false)}
                                style={{
                                    flex: 1,
                                    padding: '10px',
                                    backgroundColor: '#f44336',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUseGeneratedPassword}
                                style={{
                                    flex: 1,
                                    padding: '10px',
                                    backgroundColor: '#4caf50',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Use Password
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Vault Entries */}
            <div style={{
                display: 'grid',
                gap: '15px',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))'
            }}>
                {filteredEntries.map((entry) => (
                    <div
                        key={entry.id}
                        style={{
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            padding: '15px',
                            backgroundColor: 'white',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                        }}
                    >
                        <div style={{ marginBottom: '10px' }}>
                            <h3 style={{ margin: '0 0 5px 0' }}>{entry.site}</h3>
                            <div style={{ color: '#666', fontSize: '14px' }}>
                                Username: {entry.username}
                            </div>
                            <div style={{ marginTop: '10px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ fontWeight: 'bold' }}>Password:</span>
                                    <span>
                                        {showPassword === entry.id 
                                            ? entry.password 
                                            : '••••••••'}
                                    </span>
                                    <button
                                        onClick={() => setShowPassword(
                                            showPassword === entry.id ? null : entry.id
                                        )}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            fontSize: '16px'
                                        }}
                                    >
                                        {showPassword === entry.id ? 'Hide' : 'Show'}
                                    </button>
                                </div>
                            </div>
                            {entry.notes && (
                                <div style={{ 
                                    marginTop: '10px', 
                                    padding: '8px',
                                    backgroundColor: '#f5f5f5',
                                    borderRadius: '4px',
                                    fontSize: '14px'
                                }}>
                                    {entry.notes}
                                </div>
                            )}
                        </div>
                        <div style={{ 
                            display: 'flex', 
                            gap: '10px', 
                            justifyContent: 'flex-end',
                            borderTop: '1px solid #eee',
                            paddingTop: '10px',
                            marginTop: '10px'
                        }}>
                            <button
                                onClick={() => handleEdit(entry)}
                                style={{
                                    padding: '5px 10px',
                                    backgroundColor: '#2196f3',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => handleDelete(entry.id)}
                                style={{
                                    padding: '5px 10px',
                                    backgroundColor: '#f44336',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {filteredEntries.length === 0 && (
                <div style={{
                    textAlign: 'center',
                    padding: '50px',
                    backgroundColor: '#f9f9f9',
                    borderRadius: '8px'
                }}>
                    <h3>No entries found</h3>
                    <p>Click "Add New" to create your first password entry.</p>
                </div>
            )}
        </div>
    );
};