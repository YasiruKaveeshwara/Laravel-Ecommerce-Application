"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      position='top-right'
      closeButton
      toastOptions={{
        classNames: {
          toast: "bg-card text-text mt-14 border border-border shadow-card rounded-xl",
          title: "font-medium",
          description: "text-sm text-muted",
          actionButton: "bg-[var(--primary)] text-[var(--primary-foreground)]",
          cancelButton: "bg-transparent",
        },
      }}
    />
  );
}
