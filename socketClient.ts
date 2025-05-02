import { io, Socket } from 'socket.io-client';
import { useEffect, useState, useRef, useCallback } from 'react';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';

let socketInstance: Socket | null = null;

// Function to get or create a socket instance (singleton pattern)
export const getSocket = (): Socket => {
    if (!socketInstance) {
        console.log('Initializing new WebSocket connection to:', WS_URL);
        socketInstance = io(WS_URL, {
            // Optional: Add authentication if your WebSocket server requires it
            // auth: {
            //     token: localStorage.getItem('authToken')
            // },
            transports: ['websocket'], // Force WebSocket transport
        });

        socketInstance.on('connect', () => {
            console.log('WebSocket connected:', socketInstance?.id);
        });

        socketInstance.on('disconnect', (reason) => {
            console.log('WebSocket disconnected:', reason);
            // Optional: Handle reconnection logic here if needed
            socketInstance = null; // Reset instance on disconnect
        });

        socketInstance.on('connect_error', (error) => {
            console.error('WebSocket connection error:', error);
            socketInstance = null; // Reset instance on error
        });

        // Generic message listener for debugging
        socketInstance.on('message', (data) => {
            console.log('WebSocket message received:', data);
        });

    }
    return socketInstance;
};

// Custom hook for using the WebSocket connection in components
export const useWebSocket = () => {
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        // Ensure this only runs on the client side
        if (typeof window === 'undefined') {
            return;
        }

        socketRef.current = getSocket();

        const handleConnect = () => setIsConnected(true);
        const handleDisconnect = () => setIsConnected(false);

        if (socketRef.current.connected) {
            handleConnect();
        } else {
            socketRef.current.on('connect', handleConnect);
        }
        socketRef.current.on('disconnect', handleDisconnect);

        // Cleanup function
        return () => {
            socketRef.current?.off('connect', handleConnect);
            socketRef.current?.off('disconnect', handleDisconnect);
            // Optional: Disconnect if no longer needed globally? Depends on app structure.
            // if (socketRef.current && !socketRef.current.active) {
            //     socketRef.current.disconnect();
            //     socketInstance = null;
            // }
        };
    }, []);

    const emitEvent = useCallback((eventName: string, data?: any) => {
        if (socketRef.current && socketRef.current.connected) {
            socketRef.current.emit(eventName, data);
        } else {
            console.warn('WebSocket not connected. Cannot emit event:', eventName);
        }
    }, []);

    const onEvent = useCallback((eventName: string, callback: (...args: any[]) => void) => {
        useEffect(() => {
            if (socketRef.current) {
                socketRef.current.on(eventName, callback);
            }
            // Cleanup listener on component unmount or eventName/callback change
            return () => {
                socketRef.current?.off(eventName, callback);
            };
        }, [eventName, callback]); // Re-register listener if eventName or callback changes
    }, []);


    return { isConnected, emitEvent, onEvent, socket: socketRef.current };
};

