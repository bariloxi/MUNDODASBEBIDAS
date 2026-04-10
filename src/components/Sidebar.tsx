'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  ClipboardList, 
  Truck, 
  BarChart3, 
  Wallet, 
  Settings,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Logo from './Logo';
import { logout } from '@/lib/actions';

interface SidebarProps {
  user?: {
    name: string;
    role: string;
    email: string;
  };
}

const navItems = [
  { icon: LayoutDashboard, name: 'Dashboard', href: '/' },
  { icon: ShoppingCart, name: 'PDV', href: '/pdv' },
  { icon: Package, name: 'Produtos', href: '/products' },
  { icon: Users, name: 'Clientes', href: '/clients' },
  { icon: ClipboardList, name: 'Estoque', href: '/inventory' },
  { icon: Truck, name: 'Delivery', href: '/delivery' },
  { icon: BarChart3, name: 'Relatórios', href: '/reports' },
  { icon: Wallet, name: 'Financeiro', href: '/finance' },
  { icon: Settings, name: 'Ajustes', href: '/settings' },
];

const Sidebar = ({ user }: SidebarProps) => {
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
  };

  if (!user && pathname === '/login') return null;

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-screen w-[240px] bg-bg-secondary border-r border-border z-[100] flex flex-col transition-all duration-300 print:hidden",
      "lg:translate-x-0 -translate-x-full shadow-[10px_0_30px_rgba(0,0,0,0.5)]" 
    )}>
      {/* Brand Header - Estável e Proporcional */}
      <div className="px-6 py-10 border-b border-border/40">
        <Logo className="scale-90 origin-left" />
      </div>

      {/* Navigation - Standard Scroll Flow */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        <p className="px-4 text-[9px] font-bold uppercase text-slate-600 tracking-[0.25em] mb-4">Módulo Operacional</p>
        
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center justify-between px-4 py-2.5 border-l-2 transition-all duration-200",
                isActive 
                  ? "bg-primary/5 text-primary border-primary" 
                  : "text-slate-500 border-transparent hover:text-slate-200 hover:bg-white/5"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon size={16} className={cn(
                  "transition-colors",
                  isActive ? "text-primary" : "text-slate-500 group-hover:text-slate-300"
                )} />
                <span className="text-xs font-semibold tracking-tight">{item.name}</span>
              </div>
              {isActive && <ChevronRight size={14} className="animate-in slide-in-from-left-1" />}
            </Link>
          );
        })}
      </nav>

      {/* User Footer - Static Position */}
      <div className="p-4 bg-bg-primary/50 border-t border-border/50">
        {user ? (
          <div className="flex items-center justify-between bg-bg-surface border border-border p-2">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="flex-shrink-0 h-8 w-8 bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-[10px]">
                {user.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-[10px] font-bold text-white truncate leading-none mb-1">{user.name}</p>
                <div className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-success shadow-[0_0_8px_var(--success)]" />
                  <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{user.role}</span>
                </div>
              </div>
            </div>
            
            <button 
              onClick={handleLogout}
              className="p-1.5 text-slate-600 hover:text-danger hover:bg-danger/10 transition-all cursor-pointer rounded-none border border-transparent hover:border-danger/20"
              title="Sair do sistema"
            >
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <div className="py-2 text-center">
             <span className="text-[9px] font-bold text-slate-700 uppercase tracking-widest">Aguardando Acesso</span>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
