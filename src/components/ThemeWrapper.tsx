// app/ThemeWrapper.tsx
'use client'; // Mark this as a Client Component

import { ThemeProvider } from "@/components/ThemeProvider";

export default function ThemeWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>   
      {children}
    </ThemeProvider>   

  );
}