import { Router } from 'express';
import { ProductController } from '../controllers/ProductController';
// TODO: Import authentication middleware when implemented
// import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();
const productController = new ProductController();

// Apply authentication middleware (maybe allow public read?)
// router.use(authenticateToken);

// GET /api/products - List products (publicly accessible? or requires viewer+)
router.get('/', /* authorizeRoles('admin', 'sales_manager', 'sales_person', 'viewer'), */ productController.getProducts.bind(productController));

// GET /api/products/:id - Get specific product details (publicly accessible? or requires viewer+)
router.get('/:id', /* authorizeRoles('admin', 'sales_manager', 'sales_person', 'viewer'), */ productController.getProductById.bind(productController));

// POST /api/products - Create a new product (Requires admin role?)
router.post('/', /* authenticateToken, authorizeRoles('admin'), */ productController.createProduct.bind(productController));

// PUT /api/products/:id - Update a product (Requires admin role?)
router.put('/:id', /* authenticateToken, authorizeRoles('admin'), */ productController.updateProduct.bind(productController));

// DELETE /api/products/:id - Delete a product (Requires admin role?)
router.delete('/:id', /* authenticateToken, authorizeRoles('admin'), */ productController.deleteProduct.bind(productController));

export default router;

