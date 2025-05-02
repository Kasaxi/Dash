import { AppDataSource } from "../data-source";
import { Order } from "../entities/Order";
import { FindManyOptions, FindOneOptions } from "typeorm";

// Interface para opções de filtro e paginação
interface FindOrdersOptions {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    status?: string;
    customerId?: number;
    salesPersonId?: number; // Adicionado para filtro específico, embora RLS já possa cuidar disso
}

export class OrderService {
    private orderRepository = AppDataSource.getRepository(Order);

    /**
     * Busca pedidos com filtros e paginação.
     * A segurança em nível de linha (RLS) configurada no banco de dados
     * deve filtrar automaticamente os resultados com base no SESSION_CONTEXT definido (user_id, role_name).
     */
    async findOrders(options: FindOrdersOptions = {}): Promise<{ data: Order[], total: number }> {
        const { page = 1, limit = 10, startDate, endDate, status, customerId, salesPersonId } = options;
        const skip = (page - 1) * limit;

        const queryOptions: FindManyOptions<Order> = {
            relations: ["customer", "sales_person", "order_items", "order_items.product"], // Carrega relações importantes
            skip: skip,
            take: limit,
            order: { order_date: "DESC" }, // Ordena pelos mais recentes por padrão
            where: {},
        };

        // Adiciona filtros ao where clause
        if (startDate) {
            // @ts-ignore - TypeORM where clause can accept date comparisons
            queryOptions.where.order_date = queryOptions.where.order_date || {};
            // @ts-ignore
            queryOptions.where.order_date[Symbol.for("moreThanOrEqual")] = new Date(startDate);
        }
        if (endDate) {
            // @ts-ignore
            queryOptions.where.order_date = queryOptions.where.order_date || {};
            // @ts-ignore
            queryOptions.where.order_date[Symbol.for("lessThanOrEqual")] = new Date(endDate);
        }
        if (status) {
            queryOptions.where.status = status;
        }
        if (customerId) {
            queryOptions.where.customer_id = customerId;
        }
        // Adicionar filtro por salesPersonId apenas se explicitamente fornecido
        // RLS já deve filtrar com base no usuário logado se não for admin/manager
        if (salesPersonId) {
            queryOptions.where.sales_person_id = salesPersonId;
        }

        // Executa a busca e conta o total (considerando os filtros, mas antes da paginação)
        // A contagem também será afetada pelo RLS
        const [data, total] = await this.orderRepository.findAndCount(queryOptions);

        return { data, total };
    }

    /**
     * Busca um pedido específico pelo ID.
     * A segurança em nível de linha (RLS) deve garantir que apenas pedidos acessíveis sejam retornados.
     */
    async findOrderById(orderId: number): Promise<Order | null> {
        const queryOptions: FindOneOptions<Order> = {
            where: { order_id: orderId },
            relations: ["customer", "sales_person", "order_items", "order_items.product"],
        };

        // A busca será filtrada pelo RLS automaticamente se o SESSION_CONTEXT estiver definido
        const order = await this.orderRepository.findOne(queryOptions);
        return order;
    }

    // TODO: Implementar métodos para criar, atualizar e deletar pedidos, se necessário.
    // A criação/atualização precisará lidar com o cálculo do total_amount e a criação dos order_items.
    // async createOrder(orderData: Partial<Order>): Promise<Order> { ... }
    // async updateOrder(orderId: number, updateData: Partial<Order>): Promise<Order | null> { ... }

}

