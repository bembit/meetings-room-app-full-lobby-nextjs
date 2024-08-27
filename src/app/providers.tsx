'use client'; 

import { SessionProvider } from "next-auth/react";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider refetchInterval={30}>{children}</SessionProvider>;
}