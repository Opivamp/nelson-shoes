import React from 'react';

export const RouteLoader: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center py-24 bg-[#0A0A0A]">
      <div className="relative flex items-center justify-center mb-6">
        {/* Outer glowing pulsing border */}
        <div className="w-16 h-16 border border-[#B89B5E]/30 rounded-none animate-pulse"></div>
        {/* Inner spinning luxury diamond */}
        <div className="absolute w-8 h-8 border-t-2 border-r-2 border-[#B89B5E] rotate-45 animate-spin"></div>
        {/* Center monogram */}
        <span className="absolute font-serif text-lg font-light text-[#B89B5E]">N</span>
      </div>
      <p className="font-serif italic text-xs text-[#D8CBB8]/70 tracking-[0.25em] uppercase">
        Loading Nelson Atelier...
      </p>
    </div>
  );
};

export default RouteLoader;
