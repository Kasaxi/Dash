
'use client';

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import apiClient from '@/lib/apiClient'; // Adjust path if needed
import ChartContainer from './ChartContainer'; // Adjust path if needed
import { DateRange } from 'react-day-picker';

interface SalesDataPoint {
    date: string; // Expecting ISO date string like 'YYYY-MM-DD'
    total_sales: number;
}

interface SalesTimeSeriesChartProps {
    dateRange: DateRange | undefined;
    granularity?: 'daily' | 'weekly' | 'monthly';
}

const SalesTimeSeriesChart: React.FC<SalesTimeSeriesChartProps> = ({ dateRange, granularity = 'daily' }) => {
    const [data, setData] = useState<SalesDataPoint[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!dateRange?.from || !dateRange?.to) {
            // Don't fetch if date range is incomplete
            setData([]);
            setIsLoading(false);
            return;
        }

        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const startDate = format(dateRange.from!, 'yyyy-MM-dd');
                const endDate = format(dateRange.to!, 'yyyy-MM-dd');

                const response = await apiClient.get('/dashboard/sales-time-series', {
                    params: {
                        startDate,
                        endDate,
                        granularity,
                    },
                });
                setData(response.data);
            } catch (err: any) {
                console.error("Error fetching sales time series data:", err);
                setError('Falha ao carregar dados de vendas.');
                setData([]); // Clear data on error
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [dateRange, granularity]);

    // Format date for XAxis ticks
    const formatDateTick = (tickItem: string) => {
        try {
            // Adjust format based on granularity or data density if needed
            return format(parseISO(tickItem), 'dd/MM', { locale: ptBR });
        } catch {
            return tickItem; // Fallback if parsing fails
        }
    };

    // Format currency for YAxis and Tooltip
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    return (
        <ChartContainer
            title="Vendas ao Longo do Tempo"
            description={`Volume de vendas (${granularity === 'daily' ? 'diário' : granularity === 'weekly' ? 'semanal' : 'mensal'}) no período selecionado.`}
            isLoading={isLoading}
        >
            {error ? (
                <div className="flex items-center justify-center h-full text-red-600">
                    {error}
                </div>
            ) : data.length === 0 && !isLoading ? (
                 <div className="flex items-center justify-center h-full text-muted-foreground">
                    Sem dados para o período selecionado.
                </div>
            ) : (
                <LineChart data={data} margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                        dataKey="date"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={formatDateTick}
                    />
                    <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={formatCurrency}
                        width={80} // Adjust width to fit currency values
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                        labelFormatter={(label) => format(parseISO(label), 'dd/MM/yyyy', { locale: ptBR })}
                        formatter={(value: number) => [formatCurrency(value), 'Vendas']}
                    />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="total_sales"
                        name="Vendas Totais"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            )}
        </ChartContainer>
    );
};

export default SalesTimeSeriesChart;

