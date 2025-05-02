import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/OrderService';

export class OrderController {
    private orderService = new OrderService();

    // GET /api/orders
    async getOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const startDate = req.query.startDate as string | undefined;
            const endDate = req.query.endDate as string | undefined;
            const status = req.query.status as string | undefined;
            const customerId = req.query.customerId ? parseInt(req.query.customerId as string) : undefined;
            // const salesPersonId = req.query.salesPersonId ? parseInt(req.query.salesPersonId as string) : undefined;
            // salesPersonId filter might be redundant due to RLS, handle based on roles if needed

            const { data, total } = await this.orderService.findOrders({
                page,
                limit,
                startDate,
                endDate,
                status,
                customerId,
                // salesPersonId
            });

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

    // GET /api/orders/:id
    async getOrderById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const orderId = parseInt(req.params.id);
            if (isNaN(orderId)) {
                res.status(400).json({ message: 'Invalid order ID' });
                return;
            }

            const order = await this.orderService.findOrderById(orderId);

            if (!order) {
                // RLS might cause this if the user doesn't have access
                res.status(404).json({ message: 'Order not found or access denied' });
            } else {
                res.json(order);
            }
        } catch (error) {
            next(error);
        }
    }

    // TODO: Implement createOrder, updateOrder, deleteOrder methods if needed
    // POST /api/orders
    // async createOrder(req: Request, res: Response, next: NextFunction): Promise<void> { ... }

    // PUT /api/orders/:id
    // async updateOrder(req: Request, res: Response, next: NextFunction): Promise<void> { ... }

    // DELETE /api/orders/:id
    // async deleteOrder(req: Request, res: Response, next: NextFunction): Promise<void> { ... }
}

