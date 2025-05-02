
import { AppDataSource } from "../data-source";
import { Order } from "../entities/Order";
import { OrderItem } from "../entities/OrderItem";
import { Product } from "../entities/Product";
import { User } from "../entities/User";
import { SalesTarget } from "../entities/SalesTarget";
import { startOfMonth, endOfMonth, formatISO, subMonths, startOfDay, endOfDay } from 'date-fns';
import { Between, MoreThanOrEqual, LessThanOrEqual, Raw } from "typeorm";
import { io } from "../server"; // Import the io instance

interface KpiData {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    newCustomers: number;
    // Add trends if calculated
}

export class DashboardService {

    // Simulate emitting a KPI update event
    simulateKpiUpdate() {
        if (io) {
            console.log("Simulating KPI update event via WebSocket");
            const dummyKpiData: KpiData = {
                totalRevenue: Math.random() * 100000,
                totalOrders: Math.floor(Math.random() * 500),
                averageOrderValue: Math.random() * 200,
                newCustomers: Math.floor(Math.random() * 50),
            };
            io.emit("kpi_update", dummyKpiData);
        } else {
            console.warn("WebSocket server (io) not available in DashboardService");
        }
    }

    async getKpis(date?: string): Promise<KpiData> {
        // Define the date range for KPIs (e.g., today or a specific date)
        const targetDate = date ? new Date(date) : new Date();
        const startDate = startOfDay(targetDate);
        const endDate = endOfDay(targetDate);

        // Use Raw SQL for session context aware queries
        const revenueResult = await AppDataSource.query(
            `SELECT SUM(total_amount) as totalRevenue, COUNT(order_id) as totalOrders
             FROM dbo.orders_rls
             WHERE order_date >= @0 AND order_date <= @1 AND status = 'Completed'`, // Use the RLS view
            [startDate, endDate]
        );

        const totalRevenue = revenueResult[0]?.totalRevenue || 0;
        const totalOrders = revenueResult[0]?.totalOrders || 0;
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Example: New customers today (requires customer creation date)
        // const newCustomersResult = await AppDataSource.query(
        //     `SELECT COUNT(customer_id) as newCustomers
        //      FROM dbo.customers -- RLS might not apply directly here depending on setup
        //      WHERE created_at >= @0 AND created_at <= @1`,
        //     [startDate, endDate]
        // );
        // const newCustomers = newCustomersResult[0]?.newCustomers || 0;
        const newCustomers = 0; // Placeholder

        // Simulate emitting update after fetching
        this.simulateKpiUpdate();

        return {
            totalRevenue,
            totalOrders,
            averageOrderValue,
            newCustomers,
        };
    }

    async getSalesTimeSeries(startDate: string, endDate: string, granularity: 'daily' | 'weekly' | 'monthly' = 'daily'): Promise<{ date: string; total_sales: number }[]> {
        let dateFormat = ", N'%Y-%m-%d'"; // SQL Server format code for YYYY-MM-DD
        if (granularity === 'monthly') {
            dateFormat = ", N'%Y-%m-01'"; // Group by start of month
        } else if (granularity === 'weekly') {
            // SQL Server WEEK starts on Sunday by default. Use DATEPART(iso_week, ...) for ISO week
            // Grouping by week start date is more complex, might need a calendar table or specific SQL Server functions
            // For simplicity, sticking to daily/monthly for now.
            dateFormat = ", N'%Y-%m-%d'"; // Fallback to daily if weekly is complex
        }

        // Use the RLS view for orders
        const results = await AppDataSource.query(
            `SELECT
                FORMAT(order_date ${dateFormat}) as date,
                SUM(total_amount) as total_sales
             FROM dbo.orders_rls
             WHERE order_date >= @0 AND order_date <= @1 AND status = 'Completed'
             GROUP BY FORMAT(order_date ${dateFormat})
             ORDER BY date ASC`,
            [startDate, endDate]
        );

        // Ensure total_sales is a number
        return results.map((r: any) => ({ ...r, total_sales: parseFloat(r.total_sales) || 0 }));
    }

    async getTopProducts(limit: number = 5): Promise<{ product_name: string; total_quantity_sold: number }[]> {
        // Use RLS views/functions if product visibility depends on user
        // This query joins orders_rls with order_items and products
        const results = await AppDataSource.query(
            `SELECT TOP (@0)
                p.name as product_name,
                SUM(oi.quantity) as total_quantity_sold
             FROM dbo.order_items oi
             JOIN dbo.products p ON oi.product_id = p.product_id
             JOIN dbo.orders_rls o ON oi.order_id = o.order_id -- Join with RLS view
             WHERE o.status = 'Completed'
             GROUP BY p.product_id, p.name
             ORDER BY total_quantity_sold DESC`,
            [limit]
        );
        return results.map((r: any) => ({ ...r, total_quantity_sold: parseInt(r.total_quantity_sold) || 0 }));
    }

    async getSalesByRegion(): Promise<{ region: string; total_sales: number }[]> {
        // Join orders_rls with customers
        const results = await AppDataSource.query(
            `SELECT
                c.region,
                SUM(o.total_amount) as total_sales
             FROM dbo.orders_rls o
             JOIN dbo.customers c ON o.customer_id = c.customer_id
             WHERE o.status = 'Completed'
             GROUP BY c.region
             ORDER BY total_sales DESC`
        );
        return results.map((r: any) => ({ ...r, total_sales: parseFloat(r.total_sales) || 0 }));
    }

    async getSalesPersonRanking(month: string): Promise<{ user_id: number; username: string; total_sales: number }[]> {
        const startDate = startOfMonth(new Date(month));
        const endDate = endOfMonth(new Date(month));

        // Use orders_rls view
        const results = await AppDataSource.query(
            `SELECT
                u.user_id,
                u.username,
                SUM(o.total_amount) as total_sales
             FROM dbo.orders_rls o
             JOIN dbo.users u ON o.user_id = u.user_id
             WHERE o.order_date >= @0 AND o.order_date <= @1 AND o.status = 'Completed'
             GROUP BY u.user_id, u.username
             ORDER BY total_sales DESC`,
            [startDate, endDate]
        );
        return results.map((r: any) => ({ ...r, total_sales: parseFloat(r.total_sales) || 0 }));
    }
}

