import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticateToken } from '../middleware/authMiddleware'; // Import authentication middleware

const router = Router();
const authController = new AuthController();

// POST /api/auth/login - User login
router.post('/login', authController.login.bind(authController));

// POST /api/auth/register - User registration (optional)
router.post('/register', authController.register.bind(authController));

// GET /api/auth/me - Get current user info (requires authentication)
// Apply authenticateToken middleware to this specific route
router.get('/me', authenticateToken, authController.getCurrentUser.bind(authController));

// TODO: Add routes for OAuth2 if implemented
// router.get('/google', authController.googleLogin.bind(authController));
// router.get('/google/callback', authController.googleCallback.bind(authController));

export default router;

