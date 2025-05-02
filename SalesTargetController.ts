import { Request, Response, NextFunction } from 'express';
import { SalesTargetService } from '../services/SalesTargetService';

export class SalesTargetController {
    private salesTargetService = new SalesTargetService();

    // GET /api/sales-targets
    async getSalesTargets(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
            const month = req.query.month as string | undefined; // Expects YYYY-MM-DD

            // RLS should filter based on logged-in user if userId is not provided or if user is not admin/manager
            const { data, total } = await this.salesTargetService.findSalesTargets({ page, limit, userId, month });

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

    // GET /api/sales-targets/:id
    async getSalesTargetById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const targetId = parseInt(req.params.id);
            if (isNaN(targetId)) {
                res.status(400).json({ message: 'Invalid target ID' });
                return;
            }
            // RLS should filter
            const target = await this.salesTargetService.findSalesTargetById(targetId);
            if (!target) {
                res.status(404).json({ message: 'Sales target not found or access denied' });
            } else {
                res.json(target);
            }
        } catch (error) {
            next(error);
        }
    }

    // POST /api/sales-targets
    async createSalesTarget(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // TODO: Add validation for req.body (userId, target_month, target_amount)
            const newTarget = await this.salesTargetService.createSalesTarget(req.body);
            res.status(201).json(newTarget);
        } catch (error) {
            // Handle potential unique constraint violation
            if (error.message.includes('UNIQUE constraint failed') || error.message.includes('Violation of UNIQUE KEY constraint')) {
                 res.status(409).json({ message: 'A sales target for this user and month already exists.' });
            } else {
                next(error);
            }
        }
    }

    // PUT /api/sales-targets/:id
    async updateSalesTarget(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const targetId = parseInt(req.params.id);
            if (isNaN(targetId)) {
                res.status(400).json({ message: 'Invalid target ID' });
                return;
            }
            // TODO: Add validation for req.body
            // RLS/Authorization should be checked here or in middleware
            const updatedTarget = await this.salesTargetService.updateSalesTarget(targetId, req.body);
            if (!updatedTarget) {
                res.status(404).json({ message: 'Sales target not found or access denied' });
            } else {
                res.json(updatedTarget);
            }
        } catch (error) {
             if (error.message.includes('UNIQUE constraint failed') || error.message.includes('Violation of UNIQUE KEY constraint')) {
                 res.status(409).json({ message: 'A sales target for this user and month already exists.' });
            } else {
                next(error);
            }
        }
    }

    // DELETE /api/sales-targets/:id
    async deleteSalesTarget(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const targetId = parseInt(req.params.id);
            if (isNaN(targetId)) {
                res.status(400).json({ message: 'Invalid target ID' });
                return;
            }
            // RLS/Authorization should be checked here or in middleware
            const success = await this.salesTargetService.deleteSalesTarget(targetId);
            if (!success) {
                res.status(404).json({ message: 'Sales target not found or access denied' });
            } else {
                res.status(204).send(); // No Content
            }
        } catch (error) {
            next(error);
        }
    }

    // GET /api/sales-targets/vs-actual/:month
    async getSalesVsTarget(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const month = req.params.month; // Expects YYYY-MM-DD
            if (!month || !/^\[0-9]{4}-\[0-9]{2}-\[0-9]{2}$/.test(month)) {
                res.status(400).json({ message: 'Invalid month format. Use YYYY-MM-DD.' });
                return;
            }
            // RLS context must be set before calling the service method
            const results = await this.salesTargetService.getSalesVsTarget(month);
            res.json(results);
        } catch (error) {
            next(error);
        }
    }
}

