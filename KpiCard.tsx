
import React from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { LucideIcon } from 'lucide-react'; // Import LucideIcon type

interface KpiCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon?: LucideIcon; // Use LucideIcon type for the icon prop
    trend?: {
        value: string | number;
        direction: 'up' | 'down' | 'neutral';
    };
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, description, icon: Icon, trend }) => {
    const trendColor = trend?.direction === 'up' ? 'text-green-600 dark:text-green-400' :
                       trend?.direction === 'down' ? 'text-red-600 dark:text-red-400' :
                       'text-muted-foreground';

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {description && (
                    <p className="text-xs text-muted-foreground">
                        {description}
                    </p>
                )}
                {trend && (
                    <p className={`text-xs ${trendColor} mt-1`}>
                        {trend.direction === 'up' ? '+' : trend.direction === 'down' ? '-' : ''}{trend.value}
                        {trend.direction !== 'neutral' && ' vs mês anterior'}
                    </p>
                )}
            </CardContent>
        </Card>
    );
};

export default KpiCard;

