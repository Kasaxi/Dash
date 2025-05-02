'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import apiClient from '../lib/apiClient';
import { useRouter } from 'next/navigation'; // Use next/navigation for App Router

interface User {
    user_id: number;
    username: string;
    email: string;
    full_name?: string;
    role: { role_id: number; role_name: string };
    created_at: string;
    updated_at: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    // register: (userData: any) => Promise<void>; // Optional
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true); // Start loading until auth status is checked
    const router = useRouter();

    // Check auth status on initial load (client-side)
    useEffect(() => {
        const storedToken = localStorage.getItem('authToken');
        if (storedToken) {
            console.log('Found token in localStorage, verifying...');
            setToken(storedToken);
            // Verify token by fetching user data
            apiClient.get('/auth/me') // Assumes /auth/me endpoint exists and uses the token interceptor
                .then(response => {
                    setUser(response.data);
                    console.log('Token verified, user set:', response.data.username);
                })
                .catch(error => {
                    console.error('Token verification failed:', error.message);
                    localStorage.removeItem('authToken');
                    setToken(null);
                    setUser(null);
                    // Optionally redirect to login if verification fails
                    // router.push('/login');
                })
                .finally(() => {
                    setIsLoading(false);
                });
        } else {
            console.log('No token found in localStorage.');
            setIsLoading(false); // No token, stop loading
        }
    }, []); // Run only once on mount

    const login = useCallback(async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const response = await apiClient.post('/auth/login', { email, password });
            const { token: newToken, user: loggedInUser } = response.data;
            localStorage.setItem('authToken', newToken);
            setToken(newToken);
            setUser(loggedInUser);
            console.log('Login successful, user:', loggedInUser.username);
            // Redirect to dashboard or desired page after login
            router.push('/'); // Redirect to home/dashboard
        } catch (error: any) {
            console.error('Login failed:', error.response?.data?.message || error.message);
            // Handle login errors (e.g., show message to user)
            throw error; // Re-throw error for the component to handle
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    const logout = useCallback(() => {
        console.log('Logging out user...');
        localStorage.removeItem('authToken');
        setToken(null);
        setUser(null);
        // Redirect to login page
        router.push('/login');
    }, [router]);

    // Optional register function
    // const register = async (userData: any) => { ... };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

