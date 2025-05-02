
'use client';

import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import apiClient from '@/lib/apiClient'; // Adjust path if needed
import ChartContainer from '../ChartContainer'; // Adjust path if needed

interface SalesByRegionData {
    region: string;
    total_sales: number;
}

// Define a list of colors for the pie chart segments
// Ensure these colors contrast well and match the theme if possible
const COLORS = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
    // Add more colors if you expect more regions
    '#FFBB28', '#FF8042', '#AF19FF',
];

const SalesByRegionChart: React.FC = () => {
    const [data, setData] = useState<SalesByRegionData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await apiClient.get('/dashboard/sales-by-region');
                // Assuming API returns [{ region: '...', total_sales: ... }]
                setData(response.data);
            } catch (err: any) {
                console.error("Error fetching sales by region data:", err);
                setError('Falha ao carregar dados de vendas por região.');
                setData([]); // Clear data on error
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // Format currency for Tooltip
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    return (
        <ChartContainer
            title="Vendas por Região"
            description="Distribuição do valor total de vendas por região do cliente."
            isLoading={isLoading}
        >
            {error ? (
                <div className="flex items-center justify-center h-full text-red-600">
                    {error}
                </div>
            ) : data.length === 0 && !isLoading ? (
                 <div className="flex items-center justify-center h-full text-muted-foreground">
                    Sem dados de vendas por região disponíveis.
                </div>
            ) : (
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        // label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                        //     const RADIAN = Math.PI / 180;
                        //     const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                        //     const x = cx + radius * Math.cos(-midAngle * RADIAN);
                        //     const y = cy + radius * Math.sin(-midAngle * RADIAN);
                        //     return (
                        //         <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                        //             {`${(percent * 100).toFixed(0)}%`}
                        //         </text>
                        //     );
                        // }}
                        outerRadius={80} // Adjust size as needed
                        fill="#8884d8"
                        dataKey="total_sales"
                        nameKey="region"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value: number, name: string) => [formatCurrency(value), name]}
                        contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                    />
                    <Legend />
                </PieChart>
            )}
        </ChartContainer>
    );
};

export default SalesByRegionChart;

