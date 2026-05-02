import React from 'react';
import Image from 'next/image';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <div className="relative inline-block w-fit group">
        <div className="absolute -inset-2 bg-gradient-to-tr from-primary/30 to-primary/5 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-all duration-700" />
        <Image
          src="/logo-disk.jpg"
          alt="Mundo das Bebidas"
          width={160}
          height={160}
          className="relative rounded-2xl border border-white/10 shadow-2xl transition-all duration-500 group-hover:scale-[1.05] group-hover:rotate-1"
          priority
        />
      </div>
      <div className="space-y-1">
        <h2 className="text-base font-black tracking-tighter text-white uppercase leading-none">MUNDO DAS BEBIDAS</h2>
        <div className="flex items-center gap-2">
          <div className="h-[2px] w-8 bg-primary rounded-full" />
          <span className="text-[9px] font-black text-slate-500 tracking-[0.4em] uppercase">Premium Hub</span>
        </div>
      </div>
    </div>
  );
};

export default Logo;
