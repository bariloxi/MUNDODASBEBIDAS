'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

import { ToastProvider } from './Toast';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === '/login';

  return (
    <ToastProvider>
      <main className={isLogin ? "w-full min-h-screen" : "main-content"}>
        <div className="animate-fade-in">
          {children}
        </div>
      </main>
    </ToastProvider>
  );
}
