
"use client"

import React, { useEffect } from "react";
import {
  Toast, // Assuming shadcn/ui toast is used
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"; // Adjust path if needed
import { useToast } from "@/components/ui/use-toast"; // Adjust path if needed
import { useNotifications, Notification } from "@/context/NotificationContext"; // Adjust path if needed
import { AlertCircle, CheckCircle, Info, XCircle } from "lucide-react"; // Icons for different types

// Component to display notifications using shadcn/ui toast
export function NotificationDisplay() {
  const { notifications, removeNotification } = useNotifications();
  const { toast } = useToast(); // Use the shadcn toast hook

  useEffect(() => {
    // Process notifications from context and display them as toasts
    notifications.forEach((notification) => {
      const { id, type, message, duration } = notification;

      let IconComponent = Info;
      let title = "Informação";
      let variant: "default" | "destructive" = "default";

      switch (type) {
        case "success":
          IconComponent = CheckCircle;
          title = "Sucesso";
          break;
        case "warning":
          IconComponent = AlertCircle;
          title = "Aviso";
          break;
        case "error":
          IconComponent = XCircle;
          title = "Erro";
          variant = "destructive";
          break;
        case "info":
        default:
          IconComponent = Info;
          title = "Informação";
          break;
      }

      // Display the toast
      toast({
        id: id, // Use notification id for the toast id
        variant: variant,
        title: (
          <div className="flex items-center gap-2">
            <IconComponent className="h-5 w-5" />
            <span>{title}</span>
          </div>
        ),
        description: message,
        duration: duration || 5000, // Default duration if not specified
        onOpenChange: (open) => {
          // When the toast is closed (either automatically or manually),
          // remove it from the context state to prevent re-displaying
          if (!open) {
            removeNotification(id);
          }
        },
        // action: (
        //   <ToastClose onClick={() => removeNotification(id)} />
        // ),
      });

      // Immediately remove the notification from the context after scheduling the toast
      // This prevents the useEffect from re-triggering for the same notification
      // The toast itself will handle its display duration.
      // removeNotification(id); // Let onOpenChange handle removal
    });
  }, [notifications, removeNotification, toast]);

  // The actual rendering of toasts is handled by the Toaster component (see below)
  return null; // This component only triggers toasts
}

// You need to include the Toaster component in your main layout
// Example for src/app/layout.tsx:
/*
import { Toaster } from "@/components/ui/toaster"; // Adjust path

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <NotificationProvider> { /* Wrap relevant parts */ }
          {/* ... other providers like AuthProvider ... */}
          {children}
          <NotificationDisplay /> { /* Component to trigger toasts */ }
          <Toaster /> { /* Component that renders the toasts */ }
        </NotificationProvider>
      </body>
    </html>
  );
}
*/

