import { AppDataSource } from "../data-source";
import { Product } from "../entities/Product";
import { FindManyOptions, FindOneOptions } from "typeorm";

interface FindProductsOptions {
    page?: number;
    limit?: number;
    category?: string;
    search?: string; // Search by name or SKU
}

export class ProductService {
    private productRepository = AppDataSource.getRepository(Product);

    async findProducts(options: FindProductsOptions = {}): Promise<{ data: Product[], total: number }> {
        const { page = 1, limit = 10, category, search } = options;
        const skip = (page - 1) * limit;

        const queryBuilder = this.productRepository.createQueryBuilder("product")
            .skip(skip)
            .take(limit)
            .orderBy("product.product_id", "ASC");

        if (category) {
            queryBuilder.andWhere("product.category = :category", { category });
        }

        if (search) {
            queryBuilder.andWhere("(product.product_name LIKE :search OR product.sku LIKE :search)", {
                search: `%${search}%`
            });
        }

        const [data, total] = await queryBuilder.getManyAndCount();
        return { data, total };
    }

    async findProductById(productId: number): Promise<Product | null> {
        const options: FindOneOptions<Product> = {
            where: { product_id: productId },
        };
        return this.productRepository.findOne(options);
    }

    async createProduct(productData: Partial<Product>): Promise<Product> {
        const newProduct = this.productRepository.create(productData);
        return this.productRepository.save(newProduct);
    }

    async updateProduct(productId: number, updateData: Partial<Product>): Promise<Product | null> {
        await this.productRepository.update(productId, updateData);
        return this.findProductById(productId);
    }

    async deleteProduct(productId: number): Promise<boolean> {
        const result = await this.productRepository.delete(productId);
        return result.affected !== undefined && result.affected !== null && result.affected > 0;
    }
}

