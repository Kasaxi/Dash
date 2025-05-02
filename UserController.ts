import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/UserService';

export class UserController {
    private userService = new UserService();

    // GET /api/users
    async getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const roleName = req.query.roleName as string | undefined;

            // Authorization check should happen in middleware
            // Only admins/managers should likely list all users
            const { data, total } = await this.userService.listUsers({ page, limit, roleName });

            res.json({
                data,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            });
        } catch (error) {
            next(error);
        }
    }

    // GET /api/users/:id
    async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = parseInt(req.params.id);
            if (isNaN(userId)) {
                res.status(400).json({ message: 'Invalid user ID' });
                return;
            }

            // Authorization check: Admin/Manager or the user themselves?
            const user = await this.userService.findById(userId);

            if (!user) {
                res.status(404).json({ message: 'User not found' });
            } else {
                // Avoid sending password hash
                const { password_hash, ...userData } = user;
                res.json(userData);
            }
        } catch (error) {
            next(error);
        }
    }

    // Other methods like createUser, updateUser, deleteUser might be part of auth flow
    // or specific admin functionalities, potentially in a separate AuthController.
}

