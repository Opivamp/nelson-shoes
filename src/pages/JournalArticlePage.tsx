import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Share2, BookOpen, ArrowRight } from 'lucide-react';
import { getArticleBySlug, JOURNAL_ARTICLES } from '../data/journal';

export const JournalArticlePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const article = slug ? getArticleBySlug(slug) : undefined;

  if (!article) {
    return (
      <div className="bg-[#0A0A0A] text-[#F5F1E8] min-h-screen pt-40 pb-24 text-center px-6">
        <h1 className="font-serif text-3xl">STORY NOT FOUND</h1>
        <Link to="/journal" className="inline-block mt-4 text-[#B89B5E] text-xs uppercase tracking-widest hover:underline">
          Return to Journal
        </Link>
      </div>
    );
  }

  const related = JOURNAL_ARTICLES.filter(a => a.id !== article.id).slice(0, 2);

  return (
    <div className="bg-[#0A0A0A] text-[#F5F1E8] min-h-screen pt-28 md:pt-36 pb-24">
      <div className="max-w-4xl mx-auto px-6 md:px-10 space-y-12">
        
        {/* Back Link */}
        <Link
          to="/journal"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#B89B5E] hover:text-[#F5F1E8] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>RETURN TO JOURNAL</span>
        </Link>

        {/* Article Header */}
        <div className="space-y-6 text-center max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-3 text-[10px] md:text-xs uppercase tracking-[0.3em] text-[#B89B5E] font-medium">
            <span>{article.category}</span>
            <span>•</span>
            <span>{article.publishedDate}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> {article.readTime}
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-[#F5F1E8] leading-[1.12]">
            {article.title}
          </h1>

          <p className="font-serif italic text-base md:text-xl text-[#D8CBB8]/80 max-w-2xl mx-auto leading-relaxed">
            "{article.subtitle}"
          </p>

          <div className="pt-2 text-[11px] uppercase tracking-widest text-[#D8CBB8]/60 font-sans">
            DISPATCH FROM {article.author.name.toUpperCase()} • {article.author.role.toUpperCase()}
          </div>
        </div>

        {/* Hero Image */}
        <div className="aspect-[16/9] bg-[#141414] border border-[#D8CBB8]/15 overflow-hidden">
          <img
            src={article.heroImage}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Main Content Body */}
        <div className="max-w-2xl mx-auto space-y-10 font-sans text-sm md:text-base text-[#D8CBB8]/85 leading-relaxed font-light">
          {article.content.map((block, idx) => (
            <div key={idx} className="space-y-6">
              {block.heading && (
                <h2 className="font-serif text-2xl md:text-3xl font-normal text-[#F5F1E8] pt-4">
                  {block.heading}
                </h2>
              )}

              {block.paragraphs.map((p, pIdx) => (
                <p key={pIdx} className="leading-relaxed">
                  {p}
                </p>
              ))}

              {block.quote && (
                <blockquote className="my-8 p-6 md:p-8 bg-[#121212] border-l-2 border-[#B89B5E] text-center italic font-serif text-lg md:text-xl text-[#F5F1E8]">
                  "{block.quote}"
                </blockquote>
              )}

              {block.subImage && (
                <div className="my-8 space-y-2">
                  <div className="aspect-[16/10] bg-[#141414] border border-[#D8CBB8]/15 overflow-hidden">
                    <img
                      src={block.subImage}
                      alt={block.subImageCaption || article.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {block.subImageCaption && (
                    <p className="text-[11px] text-[#D8CBB8]/60 italic font-serif text-center">
                      {block.subImageCaption}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Related Stories */}
        <div className="pt-16 border-t border-[#D8CBB8]/15 space-y-8">
          <h3 className="font-serif text-2xl text-[#F5F1E8]">
            RELATED ESSAYS
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {related.map(rel => (
              <Link
                key={rel.id}
                to={`/journal/${rel.slug}`}
                className="p-6 bg-[#121212] border border-[#D8CBB8]/10 hover:border-[#B89B5E]/50 transition-colors space-y-3 group"
              >
                <span className="text-[9px] uppercase tracking-widest text-[#B89B5E]">
                  {rel.category} • {rel.readTime}
                </span>
                <h4 className="font-serif text-lg text-[#F5F1E8] group-hover:text-[#B89B5E] transition-colors leading-tight">
                  {rel.title}
                </h4>
                <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-[#B89B5E]">
                  <span>READ</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
