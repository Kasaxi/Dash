
'use client';

import React, { useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient'; // Adjust path if needed
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress"; // Shadcn UI component
import { format, startOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SalesVsTargetData {
    user_id: number;
    username: string;
    total_sales: number;
    target_amount: number;
    percentage_achieved: number;
}

interface SalesVsTargetIndicatorProps {
    month?: Date; // Optional: Allow specifying a month, defaults to current
    className?: string;
}

const SalesVsTargetIndicator: React.FC<SalesVsTargetIndicatorProps> = ({ month, className }) => {
    const [data, setData] = useState<SalesVsTargetData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const targetMonth = month || startOfMonth(new Date()); // Default to start of current month

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Format month to YYYY-MM-DD for the API endpoint path
                const monthString = format(targetMonth, 'yyyy-MM-dd');
                const response = await apiClient.get(`/dashboard/sales-targets/vs-actual/${monthString}`);
                // Assuming API returns an array of SalesVsTargetData
                // Sort by percentage achieved descending
                const sortedData = response.data.sort((a: SalesVsTargetData, b: SalesVsTargetData) => b.percentage_achieved - a.percentage_achieved);
                setData(sortedData);
            } catch (err: any) {
                console.error("Error fetching sales vs target data:", err);
                setError('Falha ao carregar dados de metas vs realizado.');
                setData([]); // Clear data on error
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [targetMonth]);

    // Format currency
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle>Metas vs Realizado</CardTitle>
                <CardDescription>
                    Progresso das metas de vendas para {format(targetMonth, 'MMMM yyyy', { locale: ptBR })}.
                    (Visível baseado na sua permissão)
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="text-center text-muted-foreground">Carregando...</div>
                ) : error ? (
                    <div className="text-center text-red-600">{error}</div>
                ) : data.length === 0 ? (
                    <div className="text-center text-muted-foreground">Nenhuma meta definida ou vendas registradas para este período.</div>
                ) : (
                    <div className="space-y-4">
                        {data.map((item) => (
                            <div key={item.user_id} className="space-y-1">
                                <div className="flex justify-between items-baseline">
                                    <span className="text-sm font-medium">{item.username}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {formatCurrency(item.total_sales)} / {formatCurrency(item.target_amount)}
                                    </span>
                                </div>
                                <Progress value={item.percentage_achieved} className="h-2" />
                                <div className="text-right text-sm font-semibold">
                                    {item.percentage_achieved.toFixed(1)}%
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default SalesVsTargetIndicator;

