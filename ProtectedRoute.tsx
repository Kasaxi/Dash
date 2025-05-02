
'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext'; // Adjust path if needed
import { useRouter, usePathname } from 'next/navigation'; // Use next/navigation for App Router

interface WithAuthProps {
    allowedRoles?: string[]; // Roles allowed to access the component/page
}

// This is a client component wrapper to protect routes/pages
const ProtectedRoute: React.FC<React.PropsWithChildren<WithAuthProps>> = ({ children, allowedRoles }) => {
    const { user, isLoading, token } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Don't redirect until loading is finished
        if (isLoading) {
            return;
        }

        // If not authenticated (no token/user), redirect to login
        if (!token || !user) {
            console.log('ProtectedRoute: Not authenticated, redirecting to login.');
            router.replace('/login'); // Use replace to avoid adding the protected route to history
            return;
        }

        // If roles are specified and the user's role is not allowed, redirect (e.g., to home or an unauthorized page)
        if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role.role_name)) {
            console.warn(`ProtectedRoute: User role '${user.role.role_name}' not authorized for path '${pathname}'. Allowed roles: ${allowedRoles.join(', ')}. Redirecting.`);
            // Redirect to a suitable page, like the home page or a specific 'unauthorized' page
            router.replace('/'); // Redirecting to home page for simplicity
            return;
        }

        // If authenticated and authorized (or no specific roles required), allow access
        console.log(`ProtectedRoute: User '${user.username}' authorized for path '${pathname}'.`);

    }, [user, isLoading, token, router, pathname, allowedRoles]);

    // Render loading state or null while checking auth
    if (isLoading || (!token && pathname !== '/login')) {
        // Show a loading indicator or a blank screen while verifying auth
        // Avoid rendering children until auth status is confirmed to prevent flashes of content
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div>Loading authentication status...</div>
            </div>
        );
    }

    // If authenticated and authorized (or roles check passed/not required), render the children
    // Also ensure we don't block the login page itself if somehow wrapped
    if (user && token && (!allowedRoles || allowedRoles.includes(user.role.role_name)) || pathname === '/login') {
        return <>{children}</>;
    }

    // Fallback in case redirection hasn't happened yet (should be handled by useEffect)
    return null;
};

export default ProtectedRoute;

// Example Usage in a page or layout:
/*
import ProtectedRoute from '@/components/ProtectedRoute'; // Adjust path

export default function DashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['admin', 'sales_manager']}>
      <div>
        <h1>Protected Dashboard Content</h1>
        {/* ... dashboard components ... */}
      </div>
    </ProtectedRoute>
  );
}
*/

