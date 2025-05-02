
'use client';

import React from 'react';
import Sidebar from './Sidebar'; // Adjust path if needed
import { AuthProvider } from '@/context/AuthContext'; // Adjust path if needed
import ProtectedRoute from './ProtectedRoute'; // Adjust path if needed

// This component defines the overall structure for authenticated dashboard pages
const DashboardLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
    return (
        <AuthProvider> { /* AuthProvider wraps everything that needs auth context */ }
            <ProtectedRoute> { /* ProtectedRoute ensures user is logged in */ }
                <div className="flex min-h-screen w-full flex-col bg-muted/40">
                    <Sidebar />
                    <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-60"> { /* Adjust pl based on sidebar width */ }
                        {/* Optional Header could go here */}
                        {/* <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                            Header Content (e.g., User menu, Search)
                        </header> */}
                        <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                            {children} { /* Page content goes here */ }
                        </main>
                        {/* Optional Footer could go here */}
                    </div>
                </div>
            </ProtectedRoute>
        </AuthProvider>
    );
};

export default DashboardLayout;

// How to use this layout:
// In your main layout file (e.g., src/app/layout.tsx) or specific page layouts,
// you would import and use DashboardLayout to wrap the content for authenticated sections.

// Example for src/app/layout.tsx (simplified):
/*
import DashboardLayout from '@/components/DashboardLayout'; // Adjust path
import { Inter } from 'next/font/google';
import './globals.css'; // Assuming global styles are imported here

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // You might need logic here to determine if the current route
  // should use the DashboardLayout or a different layout (e.g., for login page)
  const isAuthRoute = true; // Replace with actual logic based on pathname

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {isAuthRoute ? (
          <DashboardLayout>{children}</DashboardLayout>
        ) : (
          <AuthProvider>{children}</AuthProvider> // Login page might still need AuthProvider
        )}
      </body>
    </html>
  );
}
*/

