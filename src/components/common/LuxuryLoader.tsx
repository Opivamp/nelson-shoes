import React, { useEffect, useState } from 'react';

export const LuxuryLoader: React.FC = () => {
  const [visible, setVisible] = useState(() => {
    // Only show once per session for seamless experience
    return !sessionStorage.getItem('nelson_visited');
  });
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (!visible) return;

    const timer = setTimeout(() => {
      setFading(true);
      setTimeout(() => {
        setVisible(false);
        sessionStorage.setItem('nelson_visited', 'true');
      }, 700);
    }, 1200);

    return () => clearTimeout(timer);
  }, [visible]);

  if (!visible) return null;

  return (
    <div 
      className={`fixed inset-0 z-[100] bg-[#0A0A0A] flex flex-col items-center justify-center transition-opacity duration-700 pointer-events-none ${
        fading ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="text-center space-y-4 px-6">
        <div className="w-16 h-16 border border-[#B89B5E]/40 mx-auto flex items-center justify-center mb-6">
          <span className="font-serif text-3xl font-light text-[#B89B5E] tracking-widest">N</span>
        </div>
        <div className="font-display tracking-[0.35em] text-sm md:text-base font-semibold text-[#F5F1E8] uppercase">
          NELSON SHOES
        </div>
        <p className="font-serif italic text-xs md:text-sm text-[#D8CBB8]/70 tracking-widest">
          Crafted Beyond Ordinary
        </p>
        <div className="w-12 h-[1px] bg-[#B89B5E]/40 mx-auto mt-6"></div>
      </div>
    </div>
  );
};
