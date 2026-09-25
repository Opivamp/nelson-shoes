import React from 'react';

interface SectionHeadingProps {
  category?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  light?: boolean;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  category,
  title,
  subtitle,
  align = 'center',
  light = false,
}) => {
  return (
    <div className={`space-y-3 ${align === 'center' ? 'text-center mx-auto' : 'text-left'} max-w-3xl`}>
      {category && (
        <div className="flex items-center gap-2 justify-center">
          {align === 'center' && <div className="w-6 h-[1px] bg-[#B89B5E]/50"></div>}
          <span className="text-[10px] md:text-[11px] uppercase tracking-[0.3em] font-medium text-[#B89B5E]">
            {category}
          </span>
          {align === 'center' && <div className="w-6 h-[1px] bg-[#B89B5E]/50"></div>}
        </div>
      )}
      
      <h2 className={`font-serif text-3xl sm:text-4xl md:text-5xl font-light tracking-tight leading-[1.15] ${
        light ? 'text-[#0A0A0A]' : 'text-[#F5F1E8]'
      }`}>
        {title}
      </h2>

      {subtitle && (
        <p className={`font-sans text-xs md:text-sm leading-relaxed max-w-xl ${
          align === 'center' ? 'mx-auto' : ''
        } ${
          light ? 'text-[#3A2418]/80' : 'text-[#D8CBB8]/70'
        }`}>
          {subtitle}
        </p>
      )}
    </div>
  );
};
