import { Router } from 'express';
import { VaultController } from '../controllers/vault.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();
const vaultController = new VaultController();

// Protected routes - require authentication
router.get('/', authenticateToken, vaultController.getVault.bind(vaultController));
router.put('/', authenticateToken, vaultController.updateVault.bind(vaultController));

export default router;