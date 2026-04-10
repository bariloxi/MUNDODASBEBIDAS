import React from 'react';
import Image from 'next/image';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <div className="relative inline-block w-fit group">
        <div className="absolute -inset-1.5 bg-gradient-to-tr from-primary/40 to-transparent rounded-none blur-lg opacity-40 group-hover:opacity-60 transition-all duration-700" />
        <Image
          src="/logo-disk.jpg"
          alt="Mundo das Bebidas"
          width={180}
          height={180}
          className="relative rounded-none border border-white/5 shadow-2xl transition-all duration-500 hover:scale-[1.02]"
          priority
        />
      </div>
      <div className="space-y-0.5">
        <h2 className="text-sm font-bold tracking-tight text-white uppercase leading-none">MUNDO DAS BEBIDAS</h2>
        <div className="flex items-center gap-1.5">
          <div className="h-[2px] w-6 bg-primary rounded-none" />
          <span className="text-[10px] font-medium text-slate-500 tracking-wider">Premium Hub</span>
        </div>
      </div>
    </div>
  );
};

export default Logo;
