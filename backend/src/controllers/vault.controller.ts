import { Request, Response } from 'express';
import { UserModel } from '../models/user.model';

export class VaultController {
    
    // Get user's vault
    async getVault(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user.userId;

            const encryptedData = await UserModel.getVault(userId);
            
            res.json({ data: encryptedData });

        } catch (error) {
            console.error('Get vault error:', error);
            res.status(500).json({ error: 'Server error' });
        }
    }

    // Update vault
    async updateVault(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user.userId;
            const { encryptedData } = req.body;

            if (!encryptedData) {
                res.status(400).json({ error: 'No data provided' });
                return;
            }

            await UserModel.updateVault(userId, encryptedData);
            
            res.json({ message: 'Vault saved successfully' });

        } catch (error) {
            console.error('Save vault error:', error);
            res.status(500).json({ error: 'Server error' });
        }
    }
}