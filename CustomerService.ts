import { AppDataSource } from "../data-source";
import { Customer } from "../entities/Customer";
import { FindManyOptions, FindOneOptions } from "typeorm";

interface FindCustomersOptions {
    page?: number;
    limit?: number;
    region?: string;
    search?: string; // Search by name or email
}

export class CustomerService {
    private customerRepository = AppDataSource.getRepository(Customer);

    async findCustomers(options: FindCustomersOptions = {}): Promise<{ data: Customer[], total: number }> {
        const { page = 1, limit = 10, region, search } = options;
        const skip = (page - 1) * limit;

        const queryBuilder = this.customerRepository.createQueryBuilder("customer")
            .skip(skip)
            .take(limit)
            .orderBy("customer.customer_id", "ASC");

        if (region) {
            queryBuilder.andWhere("customer.region = :region", { region });
        }

        if (search) {
            queryBuilder.andWhere("(customer.customer_name LIKE :search OR customer.email LIKE :search)", {
                search: `%${search}%`
            });
        }

        const [data, total] = await queryBuilder.getManyAndCount();
        return { data, total };
    }

    async findCustomerById(customerId: number): Promise<Customer | null> {
        const options: FindOneOptions<Customer> = {
            where: { customer_id: customerId },
        };
        return this.customerRepository.findOne(options);
    }

    async createCustomer(customerData: Partial<Customer>): Promise<Customer> {
        const newCustomer = this.customerRepository.create(customerData);
        return this.customerRepository.save(newCustomer);
    }

    async updateCustomer(customerId: number, updateData: Partial<Customer>): Promise<Customer | null> {
        await this.customerRepository.update(customerId, updateData);
        return this.findCustomerById(customerId);
    }

    async deleteCustomer(customerId: number): Promise<boolean> {
        // Consider implications: deleting a customer might require handling related orders.
        // Maybe soft delete or prevent deletion if orders exist.
        const result = await this.customerRepository.delete(customerId);
        return result.affected !== undefined && result.affected !== null && result.affected > 0;
    }
}

