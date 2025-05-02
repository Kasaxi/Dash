import express, { Request, Response, NextFunction } from 'express';
import * as dotenv from 'dotenv';
import { initializeDatabase, AppDataSource } from './data-source';
import { Server as SocketIOServer } from 'socket.io';
import http from 'http';

// import authRoutes from './routes/authRoutes';
import authRoutes from './routes/authRoutes'; // Import Auth routes
import orderRoutes from './routes/orderRoutes';
import productRoutes from './routes/productRoutes';
import customerRoutes from './routes/customerRoutes';
import salesTargetRoutes from './routes/salesTargetRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import userRoutes from './routes/userRoutes'; // Added user routes

// Middleware for setting session context (placeholder - needs proper implementation with auth)
const setSessionContext = async (req: Request, res: Response, next: NextFunction) => {
    // ***** IMPORTANT Placeholder *****
    // In a real app, this middleware MUST run AFTER authentication.
    // It should get the authenticated user's ID and role from the JWT payload or session.
    const userId = 1; // Placeholder for Admin User ID
    const roleName = 'admin'; // Placeholder for Admin Role

    if (userId && roleName) {
        try {
            // Set user_id and role_name in session context for RLS
            await AppDataSource.query(`EXEC sp_set_session_context @key = N'user_id', @value = @0`, [userId]);
            await AppDataSource.query(`EXEC sp_set_session_context @key = N'role_name', @value = @0`, [roleName]);
            console.log(`Session context set: user_id=${userId}, role_name=${roleName}`);
        } catch (error) {
            console.error('Failed to set session context:', error);
            // Decide how to handle error: block request or proceed with caution?
            // For now, let's block critical data paths if context fails
            // return res.status(500).json({ message: 'Failed to set security context.' });
        }
    }
    next();
};

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
    cors: {
        origin: "*", // Allow all origins for now, restrict in production
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
// TODO: Add CORS middleware properly
import cors from 'cors';
app.use(cors()); // Basic CORS for now

// Initialize Database Connection
initializeDatabase().then(() => {

    // Apply Session Context Middleware (Placeholder - apply AFTER auth)
    // IMPORTANT: This needs to be applied selectively or after authentication is confirmed.
    // Applying it globally like this is insecure without real auth.
    app.use(setSessionContext);

    app.use(
'/api/auth
	', authRoutes); // Use Auth routes
    // Apply authentication middleware globally or per route as needed
    // Example: app.use('/api/orders', authenticateToken, orderRoutes);
    app.use(
'/api/orders
	', orderRoutes);pp.use('/api/products', productRoutes);
    app.use('/api/customers', customerRoutes);
    app.use('/api/sales-targets', salesTargetRoutes);
    app.use('/api/dashboard', dashboardRoutes);
    app.use('/api/users', userRoutes); // Added user routes

    // Basic Root Route
    app.get('/', (req: Request, res: Response) => {
        res.send('Sales Dashboard Backend Running!');
    });

    // Global Error Handler (Basic)
    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
        console.error(err.stack);
        res.status(500).send('Something broke!');
    });

    // Socket.IO Connection
    io.on('connection', (socket) => {
        console.log('A user connected via WebSocket:', socket.id);

        // Example: Send a welcome message
        socket.emit('message', 'Welcome to the Sales Dashboard!');

        // Handle disconnect
        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });

        // TODO: Add listeners for specific events if needed
    });

    // Make io instance available (e.g., for services to emit events)
    // Option 1: Pass it down
    // Option 2: Use a singleton or context pattern
    app.set('io', io); // Make io accessible via req.app.get('io') in controllers


    server.listen(PORT, () => {
        console.log(`Backend server is running on http://localhost:${PORT}`);
    });

}).catch(error => {
    console.error("Failed to initialize database or start server:", error);
});

