import { Request, Response, NextFunction } from 'express';
import { CustomerService } from '../services/CustomerService';

export class CustomerController {
    private customerService = new CustomerService();

    // GET /api/customers
    async getCustomers(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const region = req.query.region as string | undefined;
            const search = req.query.search as string | undefined;

            const { data, total } = await this.customerService.findCustomers({ page, limit, region, search });

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

    // GET /api/customers/:id
    async getCustomerById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const customerId = parseInt(req.params.id);
            if (isNaN(customerId)) {
                res.status(400).json({ message: 'Invalid customer ID' });
                return;
            }
            const customer = await this.customerService.findCustomerById(customerId);
            if (!customer) {
                res.status(404).json({ message: 'Customer not found' });
            } else {
                res.json(customer);
            }
        } catch (error) {
            next(error);
        }
    }

    // POST /api/customers
    async createCustomer(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // TODO: Add validation for req.body
            const newCustomer = await this.customerService.createCustomer(req.body);
            res.status(201).json(newCustomer);
        } catch (error) {
            next(error);
        }
    }

    // PUT /api/customers/:id
    async updateCustomer(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const customerId = parseInt(req.params.id);
            if (isNaN(customerId)) {
                res.status(400).json({ message: 'Invalid customer ID' });
                return;
            }
            // TODO: Add validation for req.body
            const updatedCustomer = await this.customerService.updateCustomer(customerId, req.body);
            if (!updatedCustomer) {
                res.status(404).json({ message: 'Customer not found' });
            } else {
                res.json(updatedCustomer);
            }
        } catch (error) {
            next(error);
        }
    }

    // DELETE /api/customers/:id
    async deleteCustomer(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const customerId = parseInt(req.params.id);
            if (isNaN(customerId)) {
                res.status(400).json({ message: 'Invalid customer ID' });
                return;
            }
            const success = await this.customerService.deleteCustomer(customerId);
            if (!success) {
                res.status(404).json({ message: 'Customer not found' });
            } else {
                res.status(204).send(); // No Content
            }
        } catch (error) {
            // Handle potential foreign key constraints if customer has orders
            if (error.message.includes('FOREIGN KEY constraint')) {
                res.status(400).json({ message: 'Cannot delete customer with existing orders.' });
            } else {
                next(error);
            }
        }
    }
}

