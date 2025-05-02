
'use client';

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import apiClient from '@/lib/apiClient'; // Adjust path if needed
import ChartContainer from '../ChartContainer'; // Adjust path if needed
import { format } from 'date-fns';

interface SalesPersonRankingData {
    user_id: number;
    username: string;
    total_sales: number;
    target_amount?: number; // Optional: Include target if available from API
}

interface SalesPersonRankingChartProps {
    month: Date; // Expect a Date object for the month
}

const SalesPersonRankingChart: React.FC<SalesPersonRankingChartProps> = ({ month }) => {
    const [data, setData] = useState<SalesPersonRankingData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Format month to YYYY-MM-DD (API expects this format in the path)
                const monthString = format(month, 'yyyy-MM-dd');
                const response = await apiClient.get(`/dashboard/sales-person-ranking/${monthString}`);
                // Assuming API returns [{ user_id: ..., username: '...', total_sales: ... }]
                // Sort data by total_sales descending
                const sortedData = response.data.sort((a: SalesPersonRankingData, b: SalesPersonRankingData) => b.total_sales - a.total_sales);
                setData(sortedData);
            } catch (err: any) {
                console.error("Error fetching sales person ranking data:", err);
                setError('Falha ao carregar ranking de vendedores.');
                setData([]); // Clear data on error
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [month]);

    // Format currency
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    return (
        <ChartContainer
            title={`Ranking de Vendedores (${format(month, 'MMMM yyyy', { locale: require('date-fns/locale/pt-BR') })})`}
            description="Desempenho de vendas por vendedor no mês selecionado."
            isLoading={isLoading}
        >
            {error ? (
                <div className="flex items-center justify-center h-full text-red-600">
                    {error}
                </div>
            ) : data.length === 0 && !isLoading ? (
                 <div className="flex items-center justify-center h-full text-muted-foreground">
                    Sem dados de ranking para o mês selecionado.
                </div>
            ) : (
                // Using a horizontal bar chart for ranking
                <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 50, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                    <XAxis
                        type="number"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={formatCurrency}
                    />
                    <YAxis
                        type="category"
                        dataKey="username"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        width={100} // Adjust width based on expected username length
                        interval={0} // Show all labels
                    />
                    <Tooltip
                        cursor={{ fill: 'hsl(var(--muted))' }}
                        contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                        formatter={(value: number) => [formatCurrency(value), 'Vendas Totais']}
                    />
                    {/* <Legend /> */}
                    <Bar
                        dataKey="total_sales"
                        name="Vendas Totais"
                        fill="hsl(var(--chart-2))" // Use a different chart color
                        radius={[0, 4, 4, 0]} // Rounded corners on the right
                    />
                     {/* Optional: Add a bar for target if available */}
                     {/* {data[0]?.target_amount !== undefined && (
                        <Bar
                            dataKey="target_amount"
                            name="Meta"
                            fill="hsl(var(--border))"
                            radius={[0, 4, 4, 0]}
                        />
                     )} */}
                </BarChart>
            )}
        </ChartContainer>
    );
};

export default SalesPersonRankingChart;

