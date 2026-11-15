import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, ChevronLeft, ChevronRight, Award, Flame } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface HeroSlide {
  id: string;
  badge: string;
  headline: string;
  italicWord: string;
  description: string;
  image: string;
  primaryAction: {
    label: string;
    action: () => void;
  };
  secondaryAction: {
    label: string;
    action: () => void;
  };
  metrics: Array<{ label: string; value: string }>;
}

export const HeroBanner: React.FC = () => {
  const { openAIStudio, setCategory, setSearchQuery } = useApp();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const slides: HeroSlide[] = [
    {
      id: 'glow',
      badge: 'The Autumn Haute Glow Edit',
      headline: 'Transcendent Radiance,',
      italicWord: 'Perfected by Intelligence.',
      description: 'Discover bespoke foundations, luminous cream bronzers, and pearl finishes matched to your exact undertone and barrier hydration profile.',
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1600&auto=format&fit=crop&q=85',
      primaryAction: {
        label: 'Explore The Collection',
        action: () => {
          setCategory('All');
          setSearchQuery('');
          window.scrollTo({ top: 680, behavior: 'smooth' });
        }
      },
      secondaryAction: {
        label: 'AI Shade Matcher',
        action: () => openAIStudio('shade')
      },
      metrics: [
        { value: '40+', label: 'Digital Shade Spectrums' },
        { value: '100%', label: 'Prestige Formulations' },
        { value: '2 Min', label: 'AI Undertone Scan' }
      ]
    },
    {
      id: 'fragrance',
      badge: "L'Atelier Haute Parfumerie",
      headline: 'Rare French Extraits &',
      italicWord: 'Niche Olfactory Artistry.',
      description: 'Maison Francis Kurkdjian Baccarat Rouge, Tom Ford Private Blends, and rare floral distillations. Hand-poured extracts crafted for high longevity.',
      image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=1600&auto=format&fit=crop&q=85',
      primaryAction: {
        label: 'Explore Haute Fragrance',
        action: () => {
          setCategory('Fragrance');
          window.scrollTo({ top: 680, behavior: 'smooth' });
        }
      },
      secondaryAction: {
        label: 'Fragrance Concierge',
        action: () => openAIStudio('chat')
      },
      metrics: [
        { value: '24hr', label: 'Sillage Persistence' },
        { value: 'Pure', label: 'Botanical Resins' },
        { value: 'Sample', label: '2 Minis with Order' }
      ]
    },
    {
      id: 'skincare',
      badge: 'Clinical Cellular Longevity',
      headline: 'Medical-Grade Actives,',
      italicWord: 'Restoring Skin Barriers.',
      description: 'TFC8 stem cell technology, encapsulated retinal, and fermented botanical squalane proven to reverse photo-fatigue and revive natural lipid moisture.',
      image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1600&auto=format&fit=crop&q=85',
      primaryAction: {
        label: 'Shop Prestige Skincare',
        action: () => {
          setCategory('Skincare');
          window.scrollTo({ top: 680, behavior: 'smooth' });
        }
      },
      secondaryAction: {
        label: 'Build Custom Regimen',
        action: () => openAIStudio('routine')
      },
      metrics: [
        { value: '98%', label: 'Active Barrier Repair' },
        { value: 'Clean', label: 'Paraben & Phthalate Free' },
        { value: '14-Day', label: 'Visible Glow Guarantee' }
      ]
    }
  ];

  // Auto rotation
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length]);

  const activeSlide = slides[currentSlideIndex];

  const brands = [
    'DIOR',
    'AUGUSTINUS BADER',
    'CHANEL',
    'TOM FORD',
    'FENTY BEAUTY',
    'MAISON FRANCIS KURKDJIAN',
    'LA MER',
    'YVES SAINT LAURENT',
    'CHARLOTTE TILBURY',
    'RARE BEAUTY',
    'TATCHA'
  ];

  return (
    <div 
      className="relative overflow-hidden bg-stone-950 text-white select-none"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Background Image Carousel with Smooth Crossfade */}
      <div className="absolute inset-0 z-0">
        {slides.map((s, index) => (
          <div
            key={s.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlideIndex ? 'opacity-40' : 'opacity-0'
            }`}
          >
            <img
              src={s.image}
              alt={s.badge}
              className="w-full h-full object-cover object-center filter brightness-80 contrast-105"
            />
            <div className="absolute inset-0 bg-linear-to-r from-stone-950 via-stone-950/85 to-transparent" />
            <div className="absolute inset-0 bg-linear-to-t from-stone-950 via-transparent to-stone-950/40" />
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 lg:py-28 min-h-[520px] flex flex-col justify-between">
        <div className="max-w-2xl space-y-6">
          {/* Eyebrow Kicker */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-stone-900/80 backdrop-blur-md border border-amber-400/40 rounded-full text-xs font-semibold tracking-wider text-amber-300 shadow-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>{activeSlide.badge}</span>
          </div>

          {/* Editorial Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-white leading-tight">
            {activeSlide.headline} <br />
            <span className="italic font-normal text-amber-200">
              {activeSlide.italicWord}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-stone-300 leading-relaxed max-w-xl font-light">
            {activeSlide.description}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={activeSlide.primaryAction.action}
              className="px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-stone-950 rounded-full text-xs font-bold tracking-wide flex items-center gap-2 shadow-lg hover:shadow-amber-400/20 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <span>{activeSlide.primaryAction.label}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={activeSlide.secondaryAction.action}
              className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/25 backdrop-blur-md rounded-full text-xs font-semibold tracking-wide flex items-center gap-2 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{activeSlide.secondaryAction.label}</span>
            </button>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/15 max-w-lg text-xs">
            {activeSlide.metrics.map((m, idx) => (
              <div key={idx}>
                <div className="font-serif text-xl sm:text-2xl font-bold text-amber-100">
                  {m.value}
                </div>
                <div className="text-[11px] text-stone-400 mt-0.5">
                  {m.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Slide Carousel Pagination Controls */}
        <div className="pt-8 flex items-center justify-between border-t border-white/10 mt-8">
          <div className="flex items-center gap-3">
            {slides.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setCurrentSlideIndex(idx)}
                className={`py-2 px-3 text-xs uppercase tracking-widest font-semibold transition-all rounded-lg flex items-center gap-2 ${
                  currentSlideIndex === idx
                    ? 'text-amber-300 bg-white/10 border border-amber-400/40 shadow-xs'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                <span className="font-mono text-[10px]">0{idx + 1}</span>
                <span className="hidden sm:inline">{s.badge.split(' ')[0]}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentSlideIndex((prev) => (prev - 1 + slides.length) % slides.length)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentSlideIndex((prev) => (prev + 1) % slides.length)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Next slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Prestige Luxury Brand Ticker Marquee */}
      <div className="relative z-10 border-t border-white/10 bg-stone-950/80 backdrop-blur-md py-3 overflow-hidden">
        <div className="flex items-center gap-8 animate-marquee whitespace-nowrap text-stone-400 text-xs font-serif tracking-[0.25em] uppercase">
          {brands.concat(brands).map((b, i) => (
            <span key={i} className="inline-flex items-center gap-8">
              <span className="hover:text-amber-200 transition-colors cursor-default">{b}</span>
              <span className="text-amber-400/60 font-sans text-[10px]">✦</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
