'use client'

import { TRPCReactProvider } from "@/lib/trpc-provider";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/theme-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TRPCReactProvider>
      <ThemeProvider defaultTheme="light" storageKey="24lv-theme">
        <SessionProvider>
          {children}
        </SessionProvider>
      </ThemeProvider>
    </TRPCReactProvider>
  );
}