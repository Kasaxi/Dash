
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
    PaginationState,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUpDown, Search } from 'lucide-react';
import apiClient from '@/lib/apiClient'; // Adjust path if needed
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DateRange } from 'react-day-picker';
import { DateRangePicker } from './DateRangePicker'; // Adjust path if needed
import { debounce } from 'lodash'; // Need to install lodash: pnpm install lodash @types/lodash

// Define the Order type based on backend structure
interface Order {
    order_id: number;
    order_date: string;
    customer: { customer_id: number; name: string };
    user: { user_id: number; username: string }; // Sales person
    total_amount: number;
    status: string;
    // Add other relevant fields
}

// Define columns for the table
const columns: ColumnDef<Order>[] = [
    {
        accessorKey: "order_id",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                ID Pedido
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => <div className="text-center">{row.getValue("order_id")}</div>,
    },
    {
        accessorKey: "order_date",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Data
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => {
            try {
                return format(parseISO(row.getValue("order_date")), 'dd/MM/yyyy HH:mm', { locale: ptBR });
            } catch {
                return row.getValue("order_date");
            }
        },
    },
    {
        accessorKey: "customer.name",
        header: "Cliente",
        cell: ({ row }) => row.original.customer.name,
    },
    {
        accessorKey: "user.username",
        header: "Vendedor",
        cell: ({ row }) => row.original.user.username,
    },
    {
        accessorKey: "total_amount",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="text-right w-full"
            >
                Valor Total
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("total_amount"));
            const formatted = new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
            }).format(amount);
            return <div className="text-right font-medium">{formatted}</div>;
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            // Add conditional styling based on status if desired
            let statusClass = "";
            switch (status.toLowerCase()) {
                case 'completed': statusClass = 'text-green-600 dark:text-green-400'; break;
                case 'pending': statusClass = 'text-yellow-600 dark:text-yellow-400'; break;
                case 'cancelled': statusClass = 'text-red-600 dark:text-red-400'; break;
                default: statusClass = 'text-muted-foreground';
            }
            return <div className={statusClass}>{status}</div>;
        },
    },
    // Add more columns as needed (e.g., actions)
];

const OrdersTable: React.FC = () => {
    const [data, setData] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0, // Initial page index
        pageSize: 10, // Initial page size
    });
    const [totalRows, setTotalRows] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: undefined, // Initially no date filter
        to: undefined,
    });

    const pageCount = useMemo(() => Math.ceil(totalRows / pagination.pageSize), [totalRows, pagination.pageSize]);

    // Debounced search term update
    const debouncedSetSearchTerm = useCallback(debounce((value: string) => {
        setSearchTerm(value);
        setPagination(prev => ({ ...prev, pageIndex: 0 })); // Reset page index on search
    }, 500), []);

    // Fetch data function
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const params: any = {
                page: pagination.pageIndex + 1,
                limit: pagination.pageSize,
                // Add sorting params if needed (API needs to support this)
                // sortBy: sorting[0]?.id,
                // sortOrder: sorting[0]?.desc ? 'desc' : 'asc',
                search: searchTerm,
                status: statusFilter || undefined,
                startDate: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
                endDate: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined,
            };

            // Remove undefined params
            Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

            const response = await apiClient.get('/orders', { params });
            setData(response.data.data || []);
            setTotalRows(response.data.total || 0);
        } catch (err: any) {
            console.error("Error fetching orders:", err);
            setError('Falha ao carregar pedidos.');
            setData([]);
            setTotalRows(0);
        } finally {
            setIsLoading(false);
        }
    }, [pagination, searchTerm, statusFilter, dateRange /*, sorting */]);

    // Fetch data on changes
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            pagination,
        },
        manualPagination: true, // Server-side pagination
        manualSorting: true, // Server-side sorting (if implemented)
        pageCount,
        onSortingChange: setSorting,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(), // Optional if using client-side sorting fallback
    });

    const handleStatusChange = (value: string) => {
        setStatusFilter(value === 'all' ? '' : value);
        setPagination(prev => ({ ...prev, pageIndex: 0 })); // Reset page index
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Histórico de Pedidos</CardTitle>
                <CardDescription>Visualize e gerencie os pedidos recentes.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
                    {/* Search Input */}
                    <div className="relative w-full md:w-1/3">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Buscar por cliente, vendedor..."
                            className="pl-8 w-full"
                            onChange={(e) => debouncedSetSearchTerm(e.target.value)}
                        />
                    </div>
                    {/* Status Filter */}
                    <Select value={statusFilter || 'all'} onValueChange={handleStatusChange}>
                        <SelectTrigger className="w-full md:w-[180px]">
                            <SelectValue placeholder="Filtrar por status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos Status</SelectItem>
                            <SelectItem value="Pending">Pendente</SelectItem>
                            <SelectItem value="Processing">Processando</SelectItem>
                            <SelectItem value="Completed">Completo</SelectItem>
                            <SelectItem value="Cancelled">Cancelado</SelectItem>
                        </SelectContent>
                    </Select>
                    {/* Date Range Filter */}
                    <DateRangePicker
                        className="w-full md:w-auto md:ml-auto"
                        onDateChange={setDateRange}
                        initialDateRange={dateRange}
                    />
                </div>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        Carregando...
                                    </TableCell>
                                </TableRow>
                            ) : error ? (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center text-red-600">
                                        {error}
                                    </TableCell>
                                </TableRow>
                            ) : table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        Nenhum pedido encontrado.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                {/* Pagination Controls */}
                <div className="flex items-center justify-between space-x-2 py-4">
                    <div className="text-sm text-muted-foreground">
                        Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
                    </div>
                    <div className="space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            Anterior
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            Próxima
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default OrdersTable;

