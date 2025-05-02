import { Router } from 'express';
import { SalesTargetController } from '../controllers/SalesTargetController';
// TODO: Import authentication middleware when implemented
// import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();
const salesTargetController = new SalesTargetController();

// Apply authentication middleware
// router.use(authenticateToken);

// GET /api/sales-targets - List targets (RLS filtered, requires viewer+)
router.get('/', /* authorizeRoles('admin', 'sales_manager', 'sales_person', 'viewer'), */ salesTargetController.getSalesTargets.bind(salesTargetController));

// GET /api/sales-targets/vs-actual/:month - Get sales vs target for a month (Requires viewer+)
router.get('/vs-actual/:month', /* authorizeRoles('admin', 'sales_manager', 'sales_person', 'viewer'), */ salesTargetController.getSalesVsTarget.bind(salesTargetController));

// GET /api/sales-targets/:id - Get specific target (RLS filtered, requires viewer+)
router.get('/:id', /* authorizeRoles('admin', 'sales_manager', 'sales_person', 'viewer'), */ salesTargetController.getSalesTargetById.bind(salesTargetController));

// POST /api/sales-targets - Create a new target (Requires admin or sales_manager)
router.post('/', /* authorizeRoles('admin', 'sales_manager'), */ salesTargetController.createSalesTarget.bind(salesTargetController));

// PUT /api/sales-targets/:id - Update a target (Requires admin or sales_manager)
router.put('/:id', /* authorizeRoles('admin', 'sales_manager'), */ salesTargetController.updateSalesTarget.bind(salesTargetController));

// DELETE /api/sales-targets/:id - Delete a target (Requires admin or sales_manager)
router.delete('/:id', /* authorizeRoles('admin', 'sales_manager'), */ salesTargetController.deleteSalesTarget.bind(salesTargetController));

export default router;

