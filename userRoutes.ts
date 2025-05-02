import { Router } from 'express';
import { UserController } from '../controllers/UserController';
// TODO: Import authentication middleware when implemented
// import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();
const userController = new UserController();

// Apply authentication middleware
// router.use(authenticateToken);

// GET /api/users - List users (Requires admin/manager role)
router.get('/', /* authorizeRoles('admin', 'sales_manager'), */ userController.getUsers.bind(userController));

// GET /api/users/:id - Get specific user details (Requires admin/manager or the user themselves)
router.get('/:id', /* authorizeRoles('admin', 'sales_manager'), */ userController.getUserById.bind(userController)); // Add logic to allow self-retrieval

// Note: User creation is often part of the authentication/registration flow (e.g., in AuthController)
// POST /api/users - Create user (Admin only?)
// router.post('/', authorizeRoles('admin'), userController.createUser.bind(userController));

// PUT /api/users/:id - Update user (Admin or self?)
// router.put('/:id', authorizeRoles('admin'), userController.updateUser.bind(userController)); // Add logic for self-update

// DELETE /api/users/:id - Delete user (Admin only?)
// router.delete('/:id', authorizeRoles('admin'), userController.deleteUser.bind(userController));

export default router;

