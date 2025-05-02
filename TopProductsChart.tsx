
'use client';

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import apiClient from '@/lib/apiClient'; // Adjust path if needed
import ChartContainer from '../ChartContainer'; // Adjust path if needed

interface TopProductData {
    product_name: string;
    total_quantity_sold: number; // Or total_sales_value, depending on API
}

interface TopProductsChartProps {
    limit?: number;
}

const TopProductsChart: React.FC<TopProductsChartProps> = ({ limit = 5 }) => {
    const [data, setData] = useState<TopProductData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await apiClient.get('/dashboard/top-products', {
                    params: {
                        limit,
                    },
                });
                // Assuming API returns [{ product_name: '...', total_quantity_sold: ... }]
                setData(response.data);
            } catch (err: any) {
                console.error("Error fetching top products data:", err);
                setError('Falha ao carregar dados dos produtos mais vendidos.');
                setData([]); // Clear data on error
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [limit]);

    // Format large numbers if needed (e.g., for quantity)
    const formatNumber = (value: number) => {
        return new Intl.NumberFormat('pt-BR').format(value);
    };

    return (
        <ChartContainer
            title={`Top ${limit} Produtos Mais Vendidos`}
            description="Produtos com maior quantidade vendida no período geral."
            isLoading={isLoading}
        >
            {error ? (
                <div className="flex items-center justify-center h-full text-red-600">
                    {error}
                </div>
            ) : data.length === 0 && !isLoading ? (
                 <div className="flex items-center justify-center h-full text-muted-foreground">
                    Sem dados de produtos disponíveis.
                </div>
            ) : (
                <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 50, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                    <XAxis
                        type="number"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={formatNumber}
                    />
                    <YAxis
                        type="category"
                        dataKey="product_name"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        width={100} // Adjust width based on expected product name length
                        interval={0} // Show all labels
                    />
                    <Tooltip
                        cursor={{ fill: 'hsl(var(--muted))' }}
                        contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                        formatter={(value: number) => [formatNumber(value), 'Quantidade Vendida']}
                    />
                    {/* <Legend /> */}
                    <Bar
                        dataKey="total_quantity_sold"
                        name="Quantidade Vendida"
                        fill="hsl(var(--chart-1))" // Use a chart color from theme
                        radius={[0, 4, 4, 0]} // Rounded corners on the right
                    />
                </BarChart>
            )}
        </ChartContainer>
    );
};

export default TopProductsChart;

