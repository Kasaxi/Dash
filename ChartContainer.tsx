
'use client';

import React from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ResponsiveContainer } from 'recharts';

interface ChartContainerProps {
    title: string;
    description?: string;
    isLoading?: boolean;
    children: React.ReactNode;
    className?: string;
}

const ChartContainer: React.FC<ChartContainerProps> = ({ title, description, isLoading, children, className }) => {
    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex items-center justify-center h-60 text-muted-foreground">
                        Carregando dados do gráfico...
                    </div>
                ) : (
                    <div className="h-60"> {/* Set a fixed height for the chart area */}
                        <ResponsiveContainer width="100%" height="100%">
                            {children}
                        </ResponsiveContainer>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default ChartContainer;

