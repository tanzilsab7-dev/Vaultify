import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

const router = Router();
const authController = new AuthController();

// Public routes
router.post('/register', authController.register.bind(authController));
router.post('/login', authController.login.bind(authController));
router.get('/salt/:username', authController.getSalt.bind(authController));
router.post('/logout', authController.logout.bind(authController));

export default router;