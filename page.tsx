
'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext'; // Ajuste o caminho se necessário
import { Button } from "@/components/ui/button"; // Shadcn UI component
import { Input } from "@/components/ui/input";   // Shadcn UI component
import { Label } from "@/components/ui/label";   // Shadcn UI component
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"; // Shadcn UI component

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const { login, isLoading } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            await login(email, password);
            // Redirect is handled within AuthContext
        } catch (err: any) {
            setError(err.response?.data?.message || 'Falha no login. Verifique suas credenciais.');
            console.error("Login error:", err);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">Login</CardTitle>
                    <CardDescription>
                        Entre com seu email e senha para acessar o dashboard.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Senha</Label>
                            <Input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                        {error && (
                            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        )}
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? 'Entrando...' : 'Entrar'}
                        </Button>
                    </CardFooter>
                </form>
                {/* Opcional: Link para registro ou "Esqueci minha senha" */}
                {/* <div className="mt-4 text-center text-sm">
                    Não tem uma conta?{" "}
                    <a href="/register" className="underline">
                        Registrar-se
                    </a>
                </div> */}
            </Card>
        </div>
    );
}

