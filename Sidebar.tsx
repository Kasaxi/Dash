
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingCart, Package, Users, BarChart, Settings, LogOut } from 'lucide-react'; // Example icons
import { cn } from "@/lib/utils"; // Utility from shadcn/ui
import { Button } from "@/components/ui/button";
import { useAuth } from '@/context/AuthContext'; // Adjust path if needed

const Sidebar = () => {
    const pathname = usePathname();
    const { logout, user } = useAuth();

    // Define navigation items based on user role
    const navItems = [
        { href: '/', label: 'Dashboard', icon: Home, roles: ['admin', 'sales_manager', 'sales_person', 'viewer'] },
        { href: '/orders', label: 'Pedidos', icon: ShoppingCart, roles: ['admin', 'sales_manager', 'sales_person'] },
        { href: '/products', label: 'Produtos', icon: Package, roles: ['admin', 'sales_manager'] },
        { href: '/customers', label: 'Clientes', icon: Users, roles: ['admin', 'sales_manager', 'sales_person'] },
        { href: '/reports', label: 'Relatórios', icon: BarChart, roles: ['admin', 'sales_manager'] },
        // Add more links as needed
        // { href: '/settings', label: 'Configurações', icon: Settings, roles: ['admin'] },
    ];

    const filteredNavItems = navItems.filter(item => user?.role?.role_name && item.roles.includes(user.role.role_name));

    return (
        <aside className="fixed inset-y-0 left-0 z-10 hidden w-60 flex-col border-r bg-background sm:flex">
            <nav className="flex flex-col items-start gap-2 px-4 py-4">
                <Link
                    href="#"
                    className="group flex h-9 w-full items-center justify-start rounded-lg px-3 text-lg font-semibold text-primary-foreground bg-primary mb-4"
                >
                    {/* <Package className="h-5 w-5 transition-all group-hover:scale-110" /> */}
                    <span>Vendas Dash</span>
                </Link>
                {filteredNavItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                            pathname === item.href && "bg-muted text-primary"
                        )}
                    >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                    </Link>
                ))}
            </nav>
            <div className="mt-auto p-4">
                 {/* Logout Button */}
                 <Button variant="ghost" className="w-full justify-start" onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                </Button>
            </div>
        </aside>
    );
};

export default Sidebar;

