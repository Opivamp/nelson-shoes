import React, { useState } from 'react';
import { Plus, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ATELIER_STORIES, type AtelierStory } from '../../data/stories';
import { AtelierStoryModal } from './AtelierStoryModal';

export const AtelierStoryBar: React.FC = () => {
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);

  const activeStory = selectedStoryIndex !== null ? ATELIER_STORIES[selectedStoryIndex] : null;

  const handleNextStory = () => {
    if (selectedStoryIndex !== null && selectedStoryIndex < ATELIER_STORIES.length - 1) {
      setSelectedStoryIndex(selectedStoryIndex + 1);
    } else {
      setSelectedStoryIndex(null);
    }
  };

  const handlePrevStory = () => {
    if (selectedStoryIndex !== null && selectedStoryIndex > 0) {
      setSelectedStoryIndex(selectedStoryIndex - 1);
    }
  };

  return (
    <>
      <div className="w-full bg-[#0E0E0E] border-b border-[#D8CBB8]/15 py-3.5 px-4 md:px-6">
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar scroll-smooth">
          
          {/* Create Bespoke Story Card (App style) */}
          <Link
            to="/bespoke"
            className="flex-shrink-0 flex flex-col items-center group cursor-pointer focus:outline-none"
            aria-label="Commission Bespoke Pair"
          >
            <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#181818] border-2 border-dashed border-[#B89B5E]/60 flex items-center justify-center group-hover:border-[#B89B5E] group-hover:scale-105 transition-all">
              <span className="font-serif text-lg font-light text-[#B89B5E]">N</span>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#B89B5E] text-[#0A0A0A] flex items-center justify-center shadow-md">
                <Plus size={13} strokeWidth={3} />
              </div>
            </div>
            <span className="text-[11px] font-mono text-[#D8CBB8] font-medium mt-1.5 truncate max-w-[70px] text-center group-hover:text-[#B89B5E] transition-colors">
              Bespoke
            </span>
          </Link>

          {/* Stories List */}
          {ATELIER_STORIES.map((story, idx) => (
            <button
              key={story.id}
              onClick={() => setSelectedStoryIndex(idx)}
              className="flex-shrink-0 flex flex-col items-center group cursor-pointer focus:outline-none"
              aria-label={`View ${story.title} story`}
            >
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full p-0.5 bg-gradient-to-tr from-[#B89B5E] via-[#E8D49E] to-[#91763F] group-hover:scale-105 transition-transform duration-300 shadow-md">
                <div className="w-full h-full rounded-full overflow-hidden bg-black border-2 border-[#0A0A0A]">
                  <img
                    src={story.avatar}
                    alt={story.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
              </div>
              <span className="text-[11px] font-sans text-[#F5F1E8]/90 font-medium mt-1.5 truncate max-w-[74px] text-center group-hover:text-[#B89B5E] transition-colors">
                {story.title}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Story Fullscreen Viewer */}
      <AtelierStoryModal
        story={activeStory}
        onClose={() => setSelectedStoryIndex(null)}
        onNextStory={handleNextStory}
        onPrevStory={handlePrevStory}
      />
    </>
  );
};
