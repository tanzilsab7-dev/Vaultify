import pool from '../config/database';

export interface User {
    id: string;
    username: string;
    salt: Buffer;
    auth_key: string;
    created_at: Date;
    last_login: Date | null;
}

export interface Vault {
    id: string;
    user_id: string;
    encrypted_data: string | null;
    version: number;
    updated_at: Date;
}

export class UserModel {
    
    static async create(username: string, salt: Buffer, authKey: string): Promise<string> {
        const result = await pool.query(
            `INSERT INTO users (username, salt, auth_key) 
             VALUES ($1, $2, $3) RETURNING id`,
            [username, salt, authKey]
        );
        
        const userId = result.rows[0].id;
        
        await pool.query(
            `INSERT INTO vaults (user_id) VALUES ($1)`,
            [userId]
        );
        
        return userId;
    }

    static async findByUsername(username: string): Promise<User | null> {
        const result = await pool.query(
            'SELECT * FROM users WHERE username = $1',
            [username]
        );
        return result.rows[0] || null;
    }

    static async findByAuthKey(username: string, authKey: string): Promise<User | null> {
        const result = await pool.query(
            'SELECT * FROM users WHERE username = $1 AND auth_key = $2',
            [username, authKey]
        );
        return result.rows[0] || null;
    }

    static async getSalt(username: string): Promise<Buffer | null> {
        const result = await pool.query(
            'SELECT salt FROM users WHERE username = $1',
            [username]
        );
        return result.rows[0]?.salt || null;
    }

    static async updateLastLogin(userId: string): Promise<void> {
        await pool.query(
            'UPDATE users SET last_login = NOW() WHERE id = $1',
            [userId]
        );
    }

    static async getVault(userId: string): Promise<string | null> {
        const result = await pool.query(
            'SELECT encrypted_data FROM vaults WHERE user_id = $1',
            [userId]
        );
        return result.rows[0]?.encrypted_data || null;
    }

    static async updateVault(userId: string, encryptedData: string): Promise<void> {
        await pool.query(
            `UPDATE vaults 
             SET encrypted_data = $1, updated_at = NOW(), version = version + 1 
             WHERE user_id = $2`,
            [encryptedData, userId]
        );
    }
}