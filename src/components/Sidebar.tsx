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
  LogOut
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
      "fixed left-0 top-0 h-screen w-[260px] bg-bg-secondary border-r border-border z-[100] flex flex-col transition-all duration-300 print:hidden",
      "lg:translate-x-0 -translate-x-full shadow-[20px_0_50px_rgba(0,0,0,0.5)]" 
    )}>
      {/* Brand Header */}
      <div className="px-8 py-12 border-b border-white/5">
        <Logo className="scale-110 origin-left" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar">
        <p className="px-4 text-[10px] font-black uppercase text-slate-600 tracking-[0.3em] mb-6 opacity-50">Módulo Operacional</p>
        
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-300",
                isActive 
                  ? "bg-primary/10 text-primary shadow-[0_0_20px_rgba(249,115,22,0.05)]" 
                  : "text-slate-500 hover:text-slate-200 hover:bg-white/5"
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "p-2 rounded-lg transition-all duration-300",
                  isActive ? "bg-primary/20 text-primary" : "text-slate-600 group-hover:text-slate-400 group-hover:bg-white/5"
                )}>
                  <item.icon size={18} />
                </div>
                <span className="text-xs font-bold tracking-tight uppercase">{item.name}</span>
              </div>
              {isActive && <div className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_10px_var(--primary)]" />}
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="p-6 bg-bg-primary/50 border-t border-white/5">
        {user ? (
          <div className="flex items-center justify-between bg-bg-surface border border-border p-3 rounded-2xl shadow-inner">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-xs shadow-lg">
                {user.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-black text-white truncate leading-none mb-1.5">{user.name}</p>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-success shadow-[0_0_8px_var(--success)] animate-pulse" />
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{user.role}</span>
                </div>
              </div>
            </div>
            
            <button 
              onClick={handleLogout}
              className="p-2.5 text-slate-600 hover:text-danger hover:bg-danger/10 transition-all cursor-pointer rounded-xl border border-transparent hover:border-danger/20"
              title="Sair do sistema"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <div className="py-2 text-center">
             <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest">Aguardando Acesso</span>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
