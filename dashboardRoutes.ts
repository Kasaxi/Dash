import { Router } from 'express';
import { DashboardController } from '../controllers/DashboardController';
// TODO: Import authentication middleware when implemented
// import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();
const dashboardController = new DashboardController();

// Apply authentication middleware (all dashboard routes likely require login)
// router.use(authenticateToken);

// GET /api/dashboard/kpis - Get key performance indicators (Requires viewer+)
router.get('/kpis', /* authorizeRoles('admin', 'sales_manager', 'sales_person', 'viewer'), */ dashboardController.getKpis.bind(dashboardController));

// GET /api/dashboard/sales-time-series - Get sales data over time (Requires viewer+)
router.get('/sales-time-series', /* authorizeRoles('admin', 'sales_manager', 'sales_person', 'viewer'), */ dashboardController.getSalesTimeSeries.bind(dashboardController));

// GET /api/dashboard/top-products - Get top selling products (Requires viewer+)
router.get('/top-products', /* authorizeRoles('admin', 'sales_manager', 'sales_person', 'viewer'), */ dashboardController.getTopProducts.bind(dashboardController));

// GET /api/dashboard/sales-by-region - Get sales aggregated by region (Requires viewer+)
router.get('/sales-by-region', /* authorizeRoles('admin', 'sales_manager', 'sales_person', 'viewer'), */ dashboardController.getSalesByRegion.bind(dashboardController));

// GET /api/dashboard/sales-person-ranking/:month - Get salesperson performance ranking (Requires manager/admin? or salesperson sees own rank?)
router.get('/sales-person-ranking/:month', /* authorizeRoles('admin', 'sales_manager'), */ dashboardController.getSalesPersonRanking.bind(dashboardController));

export default router;

