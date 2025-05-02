import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { User } from '../entities/User'; // Assuming User entity has role information

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    console.error("FATAL ERROR: JWT_SECRET is not defined in .env file.");
    process.exit(1);
}

// Extend Express Request interface to include user payload
declare global {
    namespace Express {
        interface Request {
            user?: { userId: number; username: string; role: string };
        }
    }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (token == null) {
        return res.status(401).json({ message: 'Authentication token required.' }); // if there isn't any token
    }

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
        if (err) {
            console.error("JWT Verification Error:", err.message);
            return res.status(403).json({ message: 'Invalid or expired token.' }); // Forbidden
        }

        // Attach user payload to request object
        req.user = { userId: user.userId, username: user.username, role: user.role };
        console.log(`User authenticated: ${req.user.username} (Role: ${req.user.role})`);

        // TODO: Set SESSION_CONTEXT for RLS after successful authentication
        // This needs access to AppDataSource, might need refactoring or passing DB connection
        /*
        try {
            await AppDataSource.query(`EXEC sp_set_session_context @key = N'user_id', @value = @0`, [req.user.userId]);
            await AppDataSource.query(`EXEC sp_set_session_context @key = N'role_name', @value = @0`, [req.user.role]);
            console.log(`Session context set for user ${req.user.userId}`);
        } catch (dbError) {
            console.error('Failed to set session context after auth:', dbError);
            // Handle error - maybe return 500?
            return res.status(500).json({ message: 'Failed to set security context.' });
        }
        */

        next(); // pass the execution off to whatever request the user intended
    });
};

// Middleware for role-based authorization
export const authorizeRoles = (...allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user || !req.user.role) {
            // This should technically not happen if authenticateToken runs first
            return res.status(403).json({ message: 'User role not available.' });
        }

        const userRole = req.user.role;
        if (!allowedRoles.includes(userRole)) {
            console.warn(`Authorization failed: User ${req.user.username} (Role: ${userRole}) tried to access resource restricted to roles [${allowedRoles.join(', ')}]`);
            return res.status(403).json({ message: `Access denied. Required roles: ${allowedRoles.join(', ')}` });
        }

        console.log(`Authorization successful: User ${req.user.username} (Role: ${userRole}) accessed resource allowed for roles [${allowedRoles.join(', ')}]`);
        next(); // Role is allowed, proceed to the next middleware/handler
    };
};

