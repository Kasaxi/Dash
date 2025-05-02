import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/DashboardService';

export class DashboardController {
    private dashboardService = new DashboardService();

    // GET /api/dashboard/kpis
    async getKpis(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const date = req.query.date as string | undefined; // Optional date filter
            // RLS context must be set
            const kpis = await this.dashboardService.getKpis(date);
            res.json(kpis);
        } catch (error) {
            next(error);
        }
    }

    // GET /api/dashboard/sales-time-series
    async getSalesTimeSeries(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const startDate = req.query.startDate as string;
            const endDate = req.query.endDate as string;
            const granularity = req.query.granularity as 'daily' | 'weekly' | 'monthly' || 'daily';

            if (!startDate || !endDate) {
                res.status(400).json({ message: 'startDate and endDate query parameters are required.' });
                return;
            }

            // RLS context must be set
            const timeSeriesData = await this.dashboardService.getSalesTimeSeries(startDate, endDate, granularity);
            res.json(timeSeriesData);
        } catch (error) {
            next(error);
        }
    }

    // GET /api/dashboard/top-products
    async getTopProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const limit = parseInt(req.query.limit as string) || 10;
            // RLS context must be set
            const topProducts = await this.dashboardService.getTopProducts(limit);
            res.json(topProducts);
        } catch (error) {
            next(error);
        }
    }

    // GET /api/dashboard/sales-by-region
    async getSalesByRegion(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // RLS context must be set
            const salesByRegion = await this.dashboardService.getSalesByRegion();
            res.json(salesByRegion);
        } catch (error) {
            next(error);
        }
    }

    // GET /api/dashboard/sales-person-ranking/:month
    async getSalesPersonRanking(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const month = req.params.month; // Expects YYYY-MM-DD
             if (!month || !/^\d{4}-\d{2}-\d{2}$/.test(month)) {
                res.status(400).json({ message: 'Invalid month format in URL path. Use YYYY-MM-DD.' });
                return;
            }
            // RLS context must be set
            const ranking = await this.dashboardService.getSalesPersonRanking(month);
            res.json(ranking);
        } catch (error) {
            next(error);
        }
    }
}

