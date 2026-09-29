import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  className = '',
  showLabel = false 
}) => {
  const { theme, isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`relative p-2 rounded-full bg-[#181818] hover:bg-[#222222] border border-[#D8CBB8]/15 hover:border-[#B89B5E]/50 text-[#D8CBB8] hover:text-[#B89B5E] transition-all flex items-center gap-2 focus:outline-none cursor-pointer shrink-0 shadow-sm group ${className}`}
      title={isDark ? "Switch to Light Mode (Atelier Alabaster)" : "Switch to Dark Mode (Atelier Obsidian)"}
      aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {isDark ? (
          <Sun 
            size={16} 
            className="text-[#B89B5E] group-hover:rotate-45 transition-transform duration-500" 
          />
        ) : (
          <Moon 
            size={16} 
            className="text-[#967B43] group-hover:-rotate-12 transition-transform duration-500" 
          />
        )}
      </div>

      {showLabel && (
        <span className="text-xs font-mono font-medium text-[#D8CBB8] group-hover:text-[#B89B5E]">
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </span>
      )}
    </button>
  );
};
