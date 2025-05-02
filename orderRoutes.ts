import { Router } from 'express';
import { OrderController } from '../controllers/OrderController';
// TODO: Import authentication middleware when implemented
// import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();
const orderController = new OrderController();

// Apply authentication middleware to all order routes (once implemented)
// router.use(authenticateToken);

// GET /api/orders - List orders (filtered by RLS, pagination, date range, status, etc.)
// Accessible by admin, sales_manager, and sales_person (sees own orders)
router.get('/', /* authorizeRoles('admin', 'sales_manager', 'sales_person', 'viewer'), */ orderController.getOrders.bind(orderController));

// GET /api/orders/:id - Get specific order details (filtered by RLS)
// Accessible by admin, sales_manager, and the specific sales_person owner
router.get('/:id', /* authorizeRoles('admin', 'sales_manager', 'sales_person'), */ orderController.getOrderById.bind(orderController));

// POST /api/orders - Create a new order (Requires sales_person or admin role?)
// router.post('/', authorizeRoles('admin', 'sales_person'), orderController.createOrder.bind(orderController));

// PUT /api/orders/:id - Update an order (e.g., status) (Requires specific roles?)
// router.put('/:id', authorizeRoles('admin', 'sales_manager'), orderController.updateOrder.bind(orderController));

// DELETE /api/orders/:id - Delete an order (Generally not recommended, maybe cancel status?)
// router.delete('/:id', authorizeRoles('admin'), orderController.deleteOrder.bind(orderController));

export default router;

