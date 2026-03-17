// Base URL for backend API
const API_BASE_URL = 'http://localhost:5000/api';

// API Service Class
class ApiService {
    private token: string | null = null;

    constructor() {
        // Load token from localStorage on startup
        this.token = localStorage.getItem('vaultify_token');
    }

    // Set auth token after login
    setToken(token: string) {
        this.token = token;
        localStorage.setItem('vaultify_token', token);
    }

    // Get stored token
    getToken(): string | null {
        return this.token;
    }

    // Clear token on logout
    clearToken() {
        this.token = null;
        localStorage.removeItem('vaultify_token');
    }

    // Get user salt for key derivation
    async getSalt(username: string): Promise<{ salt: string }> {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/salt/${username}`);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'User not found');
            }
            
            return data;
        } catch (error) {
            throw new Error('Network error: Could not connect to server');
        }
    }

    // Register new user
    async register(username: string, salt: string, authKey: string): Promise<any> {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, salt, authKey }),
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }
            
            return data;
        } catch (error: any) {
            throw new Error(error.message || 'Network error');
        }
    }

    // Login user
    async login(username: string, authKey: string): Promise<any> {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, authKey }),
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }
            
            if (data.token) {
                this.setToken(data.token);
            }
            
            return data;
        } catch (error: any) {
            throw new Error(error.message || 'Network error');
        }
    }

    // Logout user
    async logout(): Promise<void> {
        this.clearToken();
    }

    // Get encrypted vault
    async getVault(): Promise<string | null> {
        try {
            const token = this.getToken();
            
            if (!token) {
                throw new Error('Not authenticated');
            }

            const response = await fetch(`${API_BASE_URL}/vault`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to get vault');
            }
            
            return data.data;
        } catch (error: any) {
            console.error('Get vault error:', error);
            return null;
        }
    }

    // Save encrypted vault
    async saveVault(encryptedData: string): Promise<void> {
        try {
            const token = this.getToken();
            
            if (!token) {
                throw new Error('Not authenticated');
            }

            const response = await fetch(`${API_BASE_URL}/vault`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ encryptedData }),
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to save vault');
            }
        } catch (error: any) {
            throw new Error(error.message || 'Network error');
        }
    }
}

// Export a single instance
const apiService = new ApiService();
export default apiService;