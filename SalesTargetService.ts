import { AppDataSource } from "../data-source";
import { SalesTarget } from "../entities/SalesTarget";
import { FindManyOptions, FindOneOptions } from "typeorm";

interface FindSalesTargetsOptions {
    page?: number;
    limit?: number;
    userId?: number; // Filter by salesperson
    month?: string; // Filter by month (YYYY-MM-DD format, first day)
}

export class SalesTargetService {
    private salesTargetRepository = AppDataSource.getRepository(SalesTarget);

    /**
     * Busca metas de vendas com filtros e paginação.
     * RLS deve filtrar automaticamente com base no usuário logado.
     */
    async findSalesTargets(options: FindSalesTargetsOptions = {}): Promise<{ data: SalesTarget[], total: number }> {
        const { page = 1, limit = 10, userId, month } = options;
        const skip = (page - 1) * limit;

        const queryOptions: FindManyOptions<SalesTarget> = {
            relations: ["user"], // Carrega a relação com o usuário
            skip: skip,
            take: limit,
            order: { target_month: "DESC", user_id: "ASC" },
            where: {},
        };

        if (userId) {
            queryOptions.where.user_id = userId;
        }
        if (month) {
            queryOptions.where.target_month = month;
        }

        // RLS aplicada no DB filtrará os resultados
        const [data, total] = await this.salesTargetRepository.findAndCount(queryOptions);
        return { data, total };
    }

    async findSalesTargetById(targetId: number): Promise<SalesTarget | null> {
        const options: FindOneOptions<SalesTarget> = {
            where: { target_id: targetId },
            relations: ["user"],
        };
        // RLS aplicada no DB filtrará o resultado
        return this.salesTargetRepository.findOne(options);
    }

    async createSalesTarget(targetData: Partial<SalesTarget>): Promise<SalesTarget> {
        if (!targetData.user_id || !targetData.target_month || !targetData.target_amount) {
            throw new Error("User ID, target month, and target amount are required.");
        }
        // Ensure target_month is just the date part (first day of month)
        targetData.target_month = targetData.target_month.split("T")[0];

        const newTarget = this.salesTargetRepository.create(targetData);
        return this.salesTargetRepository.save(newTarget);
    }

    async updateSalesTarget(targetId: number, updateData: Partial<SalesTarget>): Promise<SalesTarget | null> {
        // RLS should prevent unauthorized updates if applied with BLOCK PREDICATE (not implemented in script)
        // Or check permission in controller/service layer
        if (updateData.target_month) {
            updateData.target_month = updateData.target_month.split("T")[0];
        }
        await this.salesTargetRepository.update(targetId, updateData);
        return this.findSalesTargetById(targetId);
    }

    async deleteSalesTarget(targetId: number): Promise<boolean> {
        // RLS should prevent unauthorized deletes if applied with BLOCK PREDICATE
        // Or check permission in controller/service layer
        const result = await this.salesTargetRepository.delete(targetId);
        return result.affected !== undefined && result.affected !== null && result.affected > 0;
    }

    // Método para buscar vendas vs metas (usando a Stored Procedure)
    async getSalesVsTarget(month: string): Promise<any[]> {
        // Ensure month is in YYYY-MM-DD format
        const targetMonth = month.split("T")[0];
        // A execução da SP precisa do contexto de sessão (user_id, role_name) definido
        // Isso deve ser feito no middleware ou antes de chamar este serviço
        const results = await AppDataSource.query("EXEC sp_get_sales_vs_target @target_month = @0", [targetMonth]);
        return results;
    }
}

