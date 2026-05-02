'use client';

import React from 'react';
import { Download, Receipt } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PrintButtonProps {
  label: string;
  className?: string;
  variant?: 'primary' | 'outline' | 'ghost';
  icon?: 'download' | 'receipt';
}

export default function PrintButton({ label, className, variant = 'outline', icon = 'download' }: PrintButtonProps) {
  return (
    <button 
      onClick={() => window.print()}
      className={cn(
        "flex items-center gap-3 px-5 py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all shadow-sm group",
        variant === 'outline' && "bg-bg-surface/50 border border-border text-slate-400 hover:text-white hover:border-primary/40",
        variant === 'primary' && "bg-primary text-white border border-primary/20 hover:bg-primary/80",
        variant === 'ghost' && "p-2 hover:bg-bg-surface text-slate-500 hover:text-white border border-transparent hover:border-border",
        className
      )}
    >
      {icon === 'download' && <Download size={16} className="text-primary group-hover:scale-110 transition-transform" />}
      {icon === 'receipt' && <Receipt size={16} className="text-primary group-hover:scale-110 transition-transform" />}
      <span>{label}</span>
    </button>
  );
}
