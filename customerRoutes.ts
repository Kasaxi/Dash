import { Router } from 'express';
import { CustomerController } from '../controllers/CustomerController';
// TODO: Import authentication middleware when implemented
// import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();
const customerController = new CustomerController();

// Apply authentication middleware
// router.use(authenticateToken);

// GET /api/customers - List customers (Requires viewer+)
router.get('/', /* authorizeRoles('admin', 'sales_manager', 'sales_person', 'viewer'), */ customerController.getCustomers.bind(customerController));

// GET /api/customers/:id - Get specific customer details (Requires viewer+)
router.get('/:id', /* authorizeRoles('admin', 'sales_manager', 'sales_person', 'viewer'), */ customerController.getCustomerById.bind(customerController));

// POST /api/customers - Create a new customer (Requires sales_person, sales_manager, admin?)
router.post('/', /* authorizeRoles('admin', 'sales_manager', 'sales_person'), */ customerController.createCustomer.bind(customerController));

// PUT /api/customers/:id - Update a customer (Requires sales_person, sales_manager, admin?)
router.put('/:id', /* authorizeRoles('admin', 'sales_manager', 'sales_person'), */ customerController.updateCustomer.bind(customerController));

// DELETE /api/customers/:id - Delete a customer (Requires admin? Be careful with related orders)
router.delete('/:id', /* authorizeRoles('admin'), */ customerController.deleteCustomer.bind(customerController));

export default router;

