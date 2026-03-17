import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import pool from '../config/database';

interface JwtPayload {
    userId: string;
    username: string;
}

export const authenticateToken = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            res.status(401).json({ error: 'Access token required' });
            return;
        }

        // Check if session exists
        const session = await pool.query(
            'SELECT * FROM sessions WHERE token = $1 AND expires_at > NOW()',
            [token]
        );

        if (session.rows.length === 0) {
            res.status(403).json({ error: 'Invalid or expired session' });
            return;
        }

        // Verify JWT
        const decoded = jwt.verify(
            token, 
            process.env.JWT_SECRET!
        ) as JwtPayload;

        (req as any).user = decoded;
        next();

    } catch (error) {
        res.status(403).json({ error: 'Invalid token' });
    }
};