import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/UserService';
import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { AppDataSource } from '../data-source'; // Needed for setting session context

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

export class AuthController {
    private userService = new UserService();

    // POST /api/auth/login
    async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ message: 'Email and password are required.' });
            return;
        }

        try {
            const user = await this.userService.findByEmail(email);

            if (!user) {
                res.status(401).json({ message: 'Invalid credentials.' }); // User not found
                return;
            }

            const isPasswordValid = await user.comparePassword(password);

            if (!isPasswordValid) {
                res.status(401).json({ message: 'Invalid credentials.' }); // Incorrect password
                return;
            }

            // Generate JWT
            const payload = {
                userId: user.user_id,
                username: user.username,
                role: user.role.role_name, // Assuming role is eagerly loaded
            };

            const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

            // IMPORTANT: Set session context for RLS *before* sending the response
            // This ensures subsequent requests using this token will have the correct context
            // Note: This context is typically tied to the *database connection/session*,
            // not the JWT itself. Setting it here might only affect the *next* query on this specific connection.
            // A more robust approach involves setting it via middleware *after* token verification on each request.
            // We will refine this when integrating the middleware.
            try {
                await AppDataSource.query(`EXEC sp_set_session_context @key = N'user_id', @value = @0`, [user.user_id]);
                await AppDataSource.query(`EXEC sp_set_session_context @key = N'role_name', @value = @0`, [user.role.role_name]);
                console.log(`Session context potentially set during login for user ${user.user_id}`);
            } catch (dbError) {
                console.error('Failed to set session context during login:', dbError);
                // Log error but proceed with login for now
            }

            // Send token and user info (excluding password)
            const { password_hash, ...userInfo } = user;
            res.json({ token, user: userInfo });

        } catch (error) {
            next(error);
        }
    }

    // POST /api/auth/register (Optional - depends on requirements)
    async register(req: Request, res: Response, next: NextFunction): Promise<void> {
        const { username, email, password, full_name, role_name = 'viewer' } = req.body; // Default role?

        if (!username || !email || !password) {
            res.status(400).json({ message: 'Username, email, and password are required.' });
            return;
        }

        try {
            // Check if user already exists
            const existingUser = await this.userService.findByEmail(email);
            if (existingUser) {
                res.status(409).json({ message: 'Email already in use.' });
                return;
            }
            const existingUsername = await this.userService.findByUsername(username);
            if (existingUsername) {
                res.status(409).json({ message: 'Username already taken.' });
                return;
            }

            // Find role ID
            const role = await AppDataSource.getRepository('Role').findOne({ where: { role_name } });
            if (!role) {
                res.status(400).json({ message: `Invalid role specified: ${role_name}` });
                return;
            }

            // Create user (password hashing is handled in User entity)
            const newUser = await this.userService.createUser({
                username,
                email,
                password_hash: password, // Pass plain password, entity will hash it
                full_name,
                role_id: role.role_id,
                role: role // Pass role object for potential immediate use
            });

            // Exclude password hash from response
            const { password_hash, ...userInfo } = newUser;
            res.status(201).json(userInfo);

        } catch (error) {
            next(error);
        }
    }

    // GET /api/auth/me (Example: Get current user info based on token)
    async getCurrentUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        // This route assumes authenticateToken middleware has run and attached req.user
        if (!req.user) {
            res.status(401).json({ message: 'Not authenticated.' });
            return;
        }

        try {
            // Fetch fresh user data if needed, or just return payload info
            const user = await this.userService.findById(req.user.userId);
            if (!user) {
                res.status(404).json({ message: 'User not found.' }); // Should not happen if token is valid
                return;
            }
            const { password_hash, ...userInfo } = user;
            res.json(userInfo);
        } catch (error) {
            next(error);
        }
    }

    // TODO: Implement OAuth2 related methods if required
    // async googleLogin(req: Request, res: Response, next: NextFunction): Promise<void> { ... }
    // async googleCallback(req: Request, res: Response, next: NextFunction): Promise<void> { ... }
}

