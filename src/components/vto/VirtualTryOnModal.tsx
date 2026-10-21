import React, { useState, useRef } from 'react';
import { 
  X, 
  Camera, 
  Sparkles, 
  ShoppingBag, 
  Sliders, 
  Check, 
  RefreshCw, 
  Split, 
  Sun,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Shade } from '../../types';

export const VirtualTryOnModal: React.FC = () => {
  const {
    isVTOOpen,
    closeVTO,
    vtoProduct,
    vtoShade,
    addToCart,
    formatPrice
  } = useApp();

  const [activeShade, setActiveShade] = useState<Shade | null>(vtoShade);
  const [intensity, setIntensity] = useState<number>(75);
  const [selectedFinish, setSelectedFinish] = useState<'Dewy' | 'Matte' | 'Glossy'>('Dewy');
  const [splitPos, setSplitPos] = useState<number>(50); // 0 to 100%
  const [selectedModel, setSelectedModel] = useState<number>(0);

  const modelPhotos = [
    { name: 'Model Camille (Warm Medium)', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80' },
    { name: 'Model Elena (Fair Porcelain)', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80' },
    { name: 'Model Iman (Deep Golden)', url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&auto=format&fit=crop&q=80' }
  ];

  if (!isVTOOpen || !vtoProduct) return null;

  const shades = vtoProduct.shades || [
    { id: 'shade-1', name: 'Signature Rose', hex: '#d48888', inStock: true },
    { id: 'shade-2', name: 'Terracotta Glow', hex: '#cb7b61', inStock: true },
    { id: 'shade-3', name: 'Berry Flush', hex: '#bd6574', inStock: true }
  ];

  const currentShade = activeShade || shades[0];

  const handleAddVTOToBag = () => {
    addToCart(vtoProduct, currentShade, vtoProduct.sizes?.[0], 1);
    closeVTO();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-stone-900 rounded-3xl shadow-2xl overflow-hidden border border-stone-800 text-white flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-800 flex items-center justify-between bg-stone-950">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center font-bold">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest">
                  Sayphora GLAMlab®
                </span>
                <span className="text-stone-500 text-xs">·</span>
                <span className="text-xs text-stone-400">Live Virtual Mirror</span>
              </div>
              <h3 className="font-serif text-base font-bold text-white">
                {vtoProduct.brand} — {vtoProduct.name}
              </h3>
            </div>
          </div>

          <button
            onClick={closeVTO}
            className="p-2 text-stone-400 hover:text-white rounded-full hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Studio Viewport */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Canvas: Interactive Model with Split Before/After */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="relative aspect-4/5 w-full rounded-2xl overflow-hidden bg-stone-950 border border-stone-800 shadow-2xl group select-none">
              {/* Background Model Photo */}
              <img
                src={modelPhotos[selectedModel].url}
                alt="Virtual Try On Model"
                className="w-full h-full object-cover object-top"
              />

              {/* Tint overlay on right side (Simulated Makeup Application) */}
              <div
                className="absolute inset-0 pointer-events-none transition-all"
                style={{
                  clipPath: `polygon(${splitPos}% 0%, 100% 0%, 100% 100%, ${splitPos}% 100%)`,
                  backgroundColor: currentShade.hex,
                  opacity: (intensity / 100) * (selectedFinish === 'Glossy' ? 0.42 : 0.35),
                  mixBlendMode: selectedFinish === 'Matte' ? 'multiply' : 'soft-light'
                }}
              />

              {/* Highlights for Radiant / Glossy finish */}
              {selectedFinish !== 'Matte' && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    clipPath: `polygon(${splitPos}% 0%, 100% 0%, 100% 100%, ${splitPos}% 100%)`,
                    background: 'radial-gradient(circle at 50% 60%, rgba(255,255,255,0.25) 0%, transparent 60%)',
                    mixBlendMode: 'overlay'
                  }}
                />
              )}

              {/* Split Slider Handle Bar */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize flex items-center justify-center shadow-2xl"
                style={{ left: `${splitPos}%` }}
              >
                <div className="w-7 h-7 rounded-full bg-white text-stone-950 shadow-xl flex items-center justify-center text-[10px] font-bold">
                  <Split className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Drag controller overlay */}
              <input
                type="range"
                min="0"
                max="100"
                value={splitPos}
                onChange={(e) => setSplitPos(Number(e.target.value))}
                className="absolute inset-0 opacity-0 cursor-ew-resize w-full h-full"
                aria-label="Before and after split slider"
              />

              {/* Labels */}
              <div className="absolute bottom-3 left-3 text-[10px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md px-2.5 py-1 rounded text-stone-300">
                Natural Canvas
              </div>
              <div className="absolute bottom-3 right-3 text-[10px] font-bold uppercase tracking-wider bg-amber-400 text-stone-950 px-2.5 py-1 rounded">
                With {currentShade.name.split(' - ')[0]}
              </div>
            </div>

            {/* Model Selector Bar */}
            <div className="flex items-center justify-between gap-2 pt-3">
              <span className="text-xs text-stone-400">Switch Model:</span>
              <div className="flex gap-2">
                {modelPhotos.map((m, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedModel(i)}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                      selectedModel === i
                        ? 'bg-amber-400 border-amber-400 text-stone-950 font-semibold'
                        : 'bg-stone-800 border-stone-700 text-stone-300 hover:text-white'
                    }`}
                  >
                    {m.name.split(' ')[1]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Controls: Shade Palette & Finish Sliders */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-5">
            <div className="space-y-5">
              {/* Active Selected Shade details */}
              <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full border-2 border-white/40 shadow-inner"
                    style={{ backgroundColor: currentShade.hex }}
                  />
                  <div>
                    <div className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">
                      Selected Shade
                    </div>
                    <div className="font-semibold text-sm text-white">{currentShade.name}</div>
                    <div className="text-xs text-stone-400">{formatPrice(vtoProduct.price)}</div>
                  </div>
                </div>
              </div>

              {/* Shades Palette */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-300 mb-2">
                  Select Shade to Test
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
                  {shades.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setActiveShade(s)}
                      className={`p-2 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                        currentShade.id === s.id
                          ? 'border-amber-400 bg-stone-800 text-white'
                          : 'border-stone-800 bg-stone-950 text-stone-400 hover:border-stone-700'
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-white/20 shrink-0"
                        style={{ backgroundColor: s.hex }}
                      />
                      <span className="text-xs font-medium truncate">{s.name.split(' - ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Finish Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-300 mb-2">
                  Finish Formula
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Dewy', 'Matte', 'Glossy'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setSelectedFinish(f)}
                      className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                        selectedFinish === f
                          ? 'bg-amber-400 text-stone-950 border-amber-400'
                          : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-white'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pigment Intensity Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-stone-400">Pigment Intensity</span>
                  <span className="font-bold text-amber-300">{intensity}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={intensity}
                  onChange={(e) => setIntensity(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-stone-800 space-y-2">
              <button
                onClick={handleAddVTOToBag}
                className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xl transition-all"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add Tested Shade to Bag — {formatPrice(vtoProduct.price)}</span>
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-stone-500">
                <ShieldCheck className="w-3.5 h-3.5 text-stone-400" />
                <span>Calibrated against D65 daylight standard color spectrum</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
