import React from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="bg-[#0A0A0A] text-[#F5F1E8] min-h-[80vh] flex items-center justify-center text-center px-6">
      <div className="max-w-md mx-auto space-y-6">
        <div className="w-16 h-16 border border-[#B89B5E]/40 mx-auto flex items-center justify-center">
          <span className="font-serif text-3xl font-light text-[#B89B5E]">N</span>
        </div>

        <div className="space-y-2">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#B89B5E] font-medium block">
            404 • UNCHARTED PATH
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-light text-[#F5F1E8]">
            NOTHING HERE.
          </h1>
        </div>

        <p className="text-xs text-[#D8CBB8]/70 font-sans leading-relaxed">
          The requested coordinate does not exist in the Nelson archive. Step back into our bespoke collection or speak with the atelier.
        </p>

        <div className="pt-2">
          <Link
            to="/collection"
            className="inline-block px-8 py-3.5 bg-[#B89B5E] text-[#0A0A0A] text-xs uppercase tracking-[0.2em] font-semibold hover:bg-[#D4BD86] transition-colors shadow-lg"
          >
            RETURN TO THE COLLECTION
          </Link>
        </div>
      </div>
    </div>
  );
};
