'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === '/login';

  return (
    <main className={isLogin ? "w-full min-h-screen" : "main-content"}>
      <div className="animate-fade-in">
        {children}
      </div>
    </main>
  );
}
