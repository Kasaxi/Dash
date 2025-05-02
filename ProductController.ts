import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/ProductService';

export class ProductController {
    private productService = new ProductService();

    // GET /api/products
    async getProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const category = req.query.category as string | undefined;
            const search = req.query.search as string | undefined;

            const { data, total } = await this.productService.findProducts({ page, limit, category, search });

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

    // GET /api/products/:id
    async getProductById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const productId = parseInt(req.params.id);
            if (isNaN(productId)) {
                res.status(400).json({ message: 'Invalid product ID' });
                return;
            }
            const product = await this.productService.findProductById(productId);
            if (!product) {
                res.status(404).json({ message: 'Product not found' });
            } else {
                res.json(product);
            }
        } catch (error) {
            next(error);
        }
    }

    // POST /api/products
    async createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // TODO: Add validation for req.body
            const newProduct = await this.productService.createProduct(req.body);
            res.status(201).json(newProduct);
        } catch (error) {
            next(error);
        }
    }

    // PUT /api/products/:id
    async updateProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const productId = parseInt(req.params.id);
            if (isNaN(productId)) {
                res.status(400).json({ message: 'Invalid product ID' });
                return;
            }
            // TODO: Add validation for req.body
            const updatedProduct = await this.productService.updateProduct(productId, req.body);
            if (!updatedProduct) {
                res.status(404).json({ message: 'Product not found' });
            } else {
                res.json(updatedProduct);
            }
        } catch (error) {
            next(error);
        }
    }

    // DELETE /api/products/:id
    async deleteProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const productId = parseInt(req.params.id);
            if (isNaN(productId)) {
                res.status(400).json({ message: 'Invalid product ID' });
                return;
            }
            const success = await this.productService.deleteProduct(productId);
            if (!success) {
                res.status(404).json({ message: 'Product not found' });
            } else {
                res.status(204).send(); // No Content
            }
        } catch (error) {
            next(error);
        }
    }
}

