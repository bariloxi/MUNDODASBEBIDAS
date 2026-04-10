'use client';

import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

interface SearchInputProps {
  placeholder?: string;
  className?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({ 
  placeholder = "Buscar...", 
  className 
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [text, setText] = useState(searchParams.get('q') || '');

  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (text) {
        params.set('q', text);
      } else {
        params.delete('q');
      }
      router.push(`${pathname}?${params.toString()}`);
    }, 300);

    return () => clearTimeout(timeout);
  }, [text, pathname, router, searchParams]);

  return (
    <div className={cn("relative group", className)}>
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-primary transition-colors" size={16} />
      <input 
        type="text" 
        placeholder={placeholder}
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full pl-11 pr-4 py-2.5 rounded-none bg-bg-surface border border-border focus:border-primary/40 outline-none text-xs font-semibold transition-all text-white placeholder:text-slate-600"
      />
    </div>
  );
};

export default SearchInput;
