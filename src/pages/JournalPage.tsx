import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight, BookOpen } from 'lucide-react';
import { JOURNAL_ARTICLES } from '../data/journal';
import { SectionHeading } from '../components/common/SectionHeading';

export const JournalPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', 'The Craft', 'Philosophy', 'The Process', 'Style'];

  const filteredArticles = selectedCategory === 'all'
    ? JOURNAL_ARTICLES
    : JOURNAL_ARTICLES.filter(a => a.category === selectedCategory);

  const featured = JOURNAL_ARTICLES[0];
  const rest = filteredArticles.filter(a => a.id !== featured.id);

  return (
    <div className="bg-[#0A0A0A] text-[#F5F1E8] min-h-screen pt-28 md:pt-36 pb-24">
      <div className="max-w-7xl mx-auto px-6 md:px-10 space-y-20">
        
        {/* Magazine Editorial Header */}
        <div className="space-y-4 max-w-3xl">
          <span className="text-[10px] md:text-xs tracking-[0.4em] uppercase text-[#B89B5E] font-medium block">
            THE EDITORIAL MAGAZINE
          </span>
          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-light text-[#F5F1E8] leading-tight">
            THE ATELIER JOURNAL
          </h1>
          <p className="text-xs md:text-sm text-[#D8CBB8]/75 font-sans leading-relaxed font-light">
            Essays on classical cordwaining, leather tanneries, anatomical lasts, and the evolving narrative of contemporary African luxury.
          </p>
        </div>

        {/* Category Navigation */}
        <div className="flex border-b border-[#D8CBB8]/15 gap-2 overflow-x-auto pb-2 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 text-xs uppercase tracking-[0.2em] font-medium transition-colors border-b-2 whitespace-nowrap ${
                selectedCategory === cat
                  ? 'border-[#B89B5E] text-[#B89B5E] bg-[#141414]'
                  : 'border-transparent text-[#D8CBB8]/60 hover:text-[#F5F1E8]'
              }`}
            >
              {cat === 'all' ? 'ALL ESSAYS' : cat}
            </button>
          ))}
        </div>

        {/* Featured Editorial Story (Hero Spread) */}
        {selectedCategory === 'all' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center bg-[#121212] border border-[#D8CBB8]/15 p-6 md:p-10">
            <div className="lg:col-span-7 aspect-[16/10] overflow-hidden bg-[#181818] border border-[#D8CBB8]/10 group">
              <Link to={`/journal/${featured.slug}`}>
                <img
                  src={featured.heroImage}
                  alt={featured.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </Link>
            </div>

            <div className="lg:col-span-5 space-y-6">
              <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-[#B89B5E] font-medium">
                <span>{featured.category}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-[#D8CBB8]/60">
                  <Clock className="w-3 h-3" /> {featured.readTime}
                </span>
              </div>

              <Link to={`/journal/${featured.slug}`}>
                <h2 className="font-serif text-3xl md:text-4xl text-[#F5F1E8] hover:text-[#B89B5E] transition-colors leading-tight">
                  {featured.title}
                </h2>
              </Link>

              <p className="text-xs md:text-sm text-[#D8CBB8]/75 font-sans leading-relaxed font-light">
                {featured.excerpt}
              </p>

              <div className="pt-2">
                <Link
                  to={`/journal/${featured.slug}`}
                  className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#B89B5E] hover:text-[#F5F1E8] font-semibold"
                >
                  <span>READ ESSAY</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Secondary Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {(selectedCategory === 'all' ? rest : filteredArticles).map((article) => (
            <article 
              key={article.id}
              className="bg-[#121212] border border-[#D8CBB8]/10 hover:border-[#B89B5E]/50 transition-colors flex flex-col justify-between group overflow-hidden"
            >
              <div className="aspect-[16/10] overflow-hidden bg-[#181818]">
                <Link to={`/journal/${article.slug}`}>
                  <img
                    src={article.heroImage}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </Link>
              </div>

              <div className="p-6 md:p-8 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-[#B89B5E] font-medium">
                    <span>{article.category}</span>
                    <span className="text-[#D8CBB8]/50">{article.readTime}</span>
                  </div>

                  <Link to={`/journal/${article.slug}`}>
                    <h3 className="font-serif text-xl md:text-2xl text-[#F5F1E8] group-hover:text-[#B89B5E] transition-colors leading-tight">
                      {article.title}
                    </h3>
                  </Link>

                  <p className="text-xs text-[#D8CBB8]/70 font-sans line-clamp-3 leading-relaxed font-light">
                    {article.excerpt}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#D8CBB8]/10 flex items-center justify-between text-[10px] uppercase tracking-widest text-[#B89B5E] font-medium">
                  <span>{article.publishedDate}</span>
                  <Link
                    to={`/journal/${article.slug}`}
                    className="group-hover:translate-x-1 transition-transform flex items-center gap-1"
                  >
                    <span>READ</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

      </div>
    </div>
  );
};
