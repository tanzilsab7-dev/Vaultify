import { Request, Response } from 'express';
const jwt = require('jsonwebtoken');
import pool from '../config/database';
import { UserModel } from '../models/user.model';

export class AuthController {
    
    // Register new user
    async register(req: Request, res: Response): Promise<void> {
        try {
            const { username, salt, authKey } = req.body;

            if (!username || !salt || !authKey) {
                res.status(400).json({ error: 'Missing required fields' });
                return;
            }

            const existingUser = await UserModel.findByUsername(username);
            if (existingUser) {
                res.status(409).json({ error: 'Username already exists' });
                return;
            }

            const userId = await UserModel.create(
                username,
                Buffer.from(salt, 'base64'),
                authKey
            );

            res.status(201).json({ 
                message: 'User created successfully',
                userId 
            });

        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ error: 'Server error' });
        }
    }

    // Login user
    async login(req: Request, res: Response): Promise<void> {
        try {
            const { username, authKey } = req.body;

            const user = await UserModel.findByAuthKey(username, authKey);
            
            if (!user) {
                res.status(401).json({ error: 'Invalid credentials' });
                return;
            }

            const token = jwt.sign(
                { userId: user.id, username: user.username },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN }
            );

            await pool.query(
                `INSERT INTO sessions (user_id, token, expires_at) 
                 VALUES ($1, $2, NOW() + INTERVAL '24 hours')`,
                [user.id, token]
            );

            await UserModel.updateLastLogin(user.id);

            res.json({ 
                token,
                message: 'Login successful' 
            });

        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'Server error' });
        }
    }

    // Get user's salt
    async getSalt(req: Request, res: Response): Promise<void> {
        try {
            const { username } = req.params;
            console.log('Getting salt for username:', username);
            
            // Temporary fix - bypass database
            res.json({ 
                salt: Buffer.from('sample-salt').toString('base64') 
            });
            
            /* Uncomment when database is fixed
            const salt = await UserModel.getSalt(username);
            
            if (!salt) {
                res.status(404).json({ error: 'User not found' });
                return;
            }

            const saltBase64 = salt.toString('base64');
            res.json({ salt: saltBase64 });
            */
        } catch (error) {
            console.error('Get salt error:', error);
            res.status(500).json({ error: 'Server error' });
        }
    }

    // Logout user
    async logout(req: Request, res: Response): Promise<void> {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            
            if (token) {
                await pool.query('DELETE FROM sessions WHERE token = $1', [token]);
            }

            res.json({ message: 'Logged out successfully' });

        } catch (error) {
            console.error('Logout error:', error);
            res.status(500).json({ error: 'Server error' });
        }
    }
}