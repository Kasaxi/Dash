
'use client';

import React, { createContext, useState, useContext, useCallback, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid'; // Need to install uuid: pnpm install uuid @types/uuid

export interface Notification {
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    message: string;
    duration?: number; // Duration in ms, undefined means persistent
}

interface NotificationContextType {
    notifications: Notification[];
    addNotification: (notification: Omit<Notification, 'id'>) => void;
    removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
    children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
        const id = uuidv4();
        const newNotification = { ...notification, id };
        setNotifications((prev) => [...prev, newNotification]);

        // Auto-remove after duration if specified
        if (notification.duration) {
            setTimeout(() => {
                removeNotification(id);
            }, notification.duration);
        }
    }, []);

    const removeNotification = useCallback((id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, []);

    return (
        <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = (): NotificationContextType => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};

