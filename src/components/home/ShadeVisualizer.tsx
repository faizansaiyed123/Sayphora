import React, { useState } from 'react';
import { Sparkles, Check, ArrowRight, Eye } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ShadeVisualizer: React.FC = () => {
  const { openAIStudio, setQuickViewProduct, products } = useApp();
  const [selectedSkinToneHex, setSelectedSkinToneHex] = useState('#fae3d2');
  const [activeSkinToneLabel, setActiveSkinToneLabel] = useState('Fair Porcelain');

  const skinTones = [
    { label: 'Fair Porcelain', hex: '#fae3d2' },
    { label: 'Light Golden', hex: '#f7dcc6' },
    { label: 'Medium Warm', hex: '#eec7a9' },
    { label: 'Tan Amber', hex: '#cf986c' },
    { label: 'Deep Chestnut', hex: '#8a522f' },
    { label: 'Rich Espresso', hex: '#4f2c1a' }
  ];

  const swatchShades = [
    { name: 'Fenty 120 (Warm)', hex: '#f7dcc6', brand: 'Fenty Beauty', productId: 'fenty-pro-filtr-foundation' },
    { name: 'Rare Hope (Mauve)', hex: '#d48888', brand: 'Rare Beauty', productId: 'rare-beauty-soft-pinch-blush' },
    { name: 'CT Flawless 4.5', hex: '#deaa83', brand: 'Charlotte Tilbury', productId: 'charlotte-tilbury-flawless-filter' },
    { name: 'Dior Gold Strobe', hex: '#f0d9b5', brand: 'DIOR', productId: 'dior-backstage-glow-palette' }
  ];

  return (
    <section className="bg-stone-100 py-16 px-4 sm:px-6 border-y border-stone-200">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Text */}
          <div className="lg:col-span-5 space-y-4">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Virtual Shade Swatch Bar</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-950 leading-snug">
              Compare Pigments on Your True Complexion
            </h2>

            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Select your skin depth below to simulate how high-pigment liquid formulas and mineral powders oxidize, blend, and reflect light against real skin undertones.
            </p>

            {/* Skin Tone Selector */}
            <div className="space-y-2 pt-2">
              <div className="text-xs font-semibold text-stone-700">
                Skin Tone Base: <strong className="text-stone-950">{activeSkinToneLabel}</strong>
              </div>
              <div className="flex items-center gap-3">
                {skinTones.map(tone => (
                  <button
                    key={tone.label}
                    onClick={() => {
                      setSelectedSkinToneHex(tone.hex);
                      setActiveSkinToneLabel(tone.label);
                    }}
                    title={tone.label}
                    className={`w-9 h-9 rounded-full border-2 transition-all relative ${
                      selectedSkinToneHex === tone.hex
                        ? 'border-stone-950 scale-110 shadow-md ring-2 ring-stone-950'
                        : 'border-white hover:scale-105'
                    }`}
                    style={{ backgroundColor: tone.hex }}
                  >
                    {selectedSkinToneHex === tone.hex && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 text-stone-950" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => openAIStudio('shade')}
                className="px-5 py-2.5 bg-stone-950 hover:bg-stone-850 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-2 shadow-md transition-colors"
              >
                <span>Launch Full AI Shade Match Quiz</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Visual Swatch Simulation */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 rounded-2xl bg-white shadow-xl border border-stone-200/80 space-y-6">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <span className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                  Live Swatch Simulation on {activeSkinToneLabel}
                </span>
                <span className="text-[11px] text-stone-500 font-medium">True-to-Skin Colorimetry</span>
              </div>

              {/* Swatch Canvas Canvas Bar */}
              <div 
                className="w-full h-40 rounded-xl relative p-4 flex items-center justify-around overflow-hidden shadow-inner border border-stone-300 transition-colors duration-500"
                style={{ backgroundColor: selectedSkinToneHex }}
              >
                {swatchShades.map((swatch, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-2 group cursor-pointer">
                    {/* Simulated liquid drop swatch */}
                    <div
                      className="w-10 sm:w-12 h-20 rounded-full shadow-lg border border-black/10 group-hover:scale-110 transition-transform duration-300 relative flex items-center justify-center"
                      style={{ backgroundColor: swatch.hex }}
                    >
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white text-[9px] px-1 py-0.5 rounded">
                        View
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-stone-900 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded shadow-xs max-w-[80px] truncate text-center">
                      {swatch.name}
                    </span>
                  </div>
                ))}
              </div>

              {/* Swatch Catalog Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {swatchShades.map(swatch => {
                  const prod = products.find(p => p.id === swatch.productId);
                  return (
                    <div 
                      key={swatch.name}
                      onClick={() => prod && setQuickViewProduct(prod)}
                      className="p-2.5 rounded-lg border border-stone-200 bg-stone-50/50 hover:bg-stone-100 cursor-pointer transition-colors"
                    >
                      <div className="text-[9px] font-bold text-stone-400 uppercase">{swatch.brand}</div>
                      <div className="font-semibold text-stone-900 truncate mt-0.5">{swatch.name}</div>
                      <div className="text-[11px] text-stone-600 mt-1 flex items-center gap-1 font-medium">
                        <Eye className="w-3 h-3 text-stone-400" />
                        <span>Inspect</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
