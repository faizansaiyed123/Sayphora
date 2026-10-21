import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Camera, 
  Sliders, 
  Send, 
  Check, 
  Plus, 
  ShoppingBag, 
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Sun,
  Moon,
  Heart
} from 'lucide-react';
import { api, errorMessage } from '../../lib/api';
import { useApp } from '../../context/AppContext';
import { Product, Shade, SkinTone, Undertone, SkinType } from '../../types';

interface ShadeMatchResult {
  shadeName: string;
  brand: string;
  productName: string;
  hex: string;
  confidence: number;
  shadeId: string;
  undertoneDescription: string;
  applicationTip: string;
  product: Product;
}

export const AIBeautyStudioModal: React.FC = () => {
  const {
    isAIStudioOpen,
    closeAIStudio,
    aiStudioTab,
    setAiStudioTab,
    products,
    addToCart,
    addToast
  } = useApp();

  // Tab 1: Shade Matcher State
  const [skinDepth, setSkinDepth] = useState<SkinTone>('Light');
  const [veinUndertone, setVeinUndertone] = useState<Undertone>('Neutral');
  const [sunReaction, setSunReaction] = useState<'burn' | 'tan' | 'both'>('both');
  const [coveragePref, setCoveragePref] = useState<'Sheer' | 'Medium' | 'Full'>('Medium');
  const [isMatchingShade, setIsMatchingShade] = useState(false);
  const [shadeResult, setShadeResult] = useState<ShadeMatchResult | null>(null);

  // Tab 2: Skincare Regimen Builder State
  const [skinType, setSkinType] = useState<SkinType>('Combination');
  const [concerns, setConcerns] = useState<string[]>(['Hydration', 'Pore Smoothing']);
  const [climate, setClimate] = useState('Urban / City AC');
  const [isGeneratingRoutine, setIsGeneratingRoutine] = useState(false);
  const [routineResult, setRoutineResult] = useState<{
    amRoutine: Array<{ step: string; product: Product; why: string }>;
    pmRoutine: Array<{ step: string; product: Product; why: string }>;
    activeSynergy: string;
  } | null>(null);

  // Tab 3: AI Concierge Chat State
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; recommendedProductId?: string }>>([
    {
      sender: 'ai',
      text: 'Bonjour! I am your Sayphora Virtual Haute Beauté Stylist. Tell me about your skin goals, an upcoming event, or any makeup and fragrance questions you have!'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatSending, setIsChatSending] = useState(false);

  if (!isAIStudioOpen) return null;

  // Handle Shade Match Analysis (the server picks a real, in-stock shade from the catalogue)
  const handleRunShadeMatch = async () => {
    setIsMatchingShade(true);
    setShadeResult(null);
    try {
      const data = await api<Omit<ShadeMatchResult, 'product'> & { productId: string; shadeId: string }>('/ai/shade-match', {
        body: { skinDepth, veinUndertone, sunReaction, coveragePref }
      });
      const product = products.find((p) => p.id === data.productId);
      if (!product) throw new Error('The matched product is no longer available.');
      setShadeResult({ ...data, product });
    } catch (e) {
      addToast('Shade match unavailable', errorMessage(e), 'warning');
    } finally {
      setIsMatchingShade(false);
    }
  };

  // Handle Skincare Regimen Generation
  const handleGenerateRoutine = async () => {
    setIsGeneratingRoutine(true);
    setRoutineResult(null);
    try {
      setRoutineResult(await api('/ai/skincare-routine', { body: { skinType, concerns, climate } }));
    } catch (e) {
      addToast('Regimen unavailable', errorMessage(e), 'warning');
    } finally {
      setIsGeneratingRoutine(false);
    }
  };

  // Handle Chat Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatSending) return;

    const userText = chatInput.trim().slice(0, 500);
    setChatMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setChatInput('');
    setIsChatSending(true);

    try {
      const data = await api<{ reply: string; productId: string }>('/ai/beauty-consultant', { body: { prompt: userText } });
      setChatMessages(prev => [...prev, { sender: 'ai', text: data.reply, recommendedProductId: data.productId }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { sender: 'ai', text: `Sorry — I could not answer just now. ${errorMessage(err)}` }]);
    } finally {
      setIsChatSending(false);
    }
  };

  const toggleConcern = (concern: string) => {
    setConcerns(prev => 
      prev.includes(concern) ? prev.filter(c => c !== concern) : [...prev, concern]
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-stone-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 bg-linear-to-r from-stone-900 via-stone-850 to-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-stone-950 flex items-center justify-center shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold tracking-wide">
                Sayphora AI Beauty Studio
              </h2>
              <p className="text-[11px] text-stone-300">
                Skin diagnostic technology powered by Gemini AI
              </p>
            </div>
          </div>

          <button
            onClick={closeAIStudio}
            className="p-1.5 text-stone-300 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-6 text-xs font-semibold uppercase tracking-wider">
          <button
            onClick={() => setAiStudioTab('shade')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${
              aiStudioTab === 'shade'
                ? 'border-stone-950 text-stone-950 font-bold bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>AI Shade Matcher</span>
          </button>

          <button
            onClick={() => setAiStudioTab('routine')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${
              aiStudioTab === 'routine'
                ? 'border-stone-950 text-stone-950 font-bold bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Skincare Regimen Builder</span>
          </button>

          <button
            onClick={() => setAiStudioTab('chat')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${
              aiStudioTab === 'chat'
                ? 'border-stone-950 text-stone-950 font-bold bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Haute Concierge Stylist</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="overflow-y-auto flex-1 p-6 sm:p-8">
          {/* TAB 1: SHADE MATCHER */}
          {aiStudioTab === 'shade' && (
            <div className="space-y-8">
              <div>
                <h3 className="font-serif text-xl font-bold text-stone-950 mb-1">
                  Find Your Perfect Complexion Match
                </h3>
                <p className="text-xs text-stone-500">
                  Select your skin depth, undertone clues, and coverage preference to reveal your exact foundation shade.
                </p>
              </div>

              <div className="space-y-6">
                {/* Skin Depth */}
                <div>
                  <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
                    1. Skin Tone Depth
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                    {(['Fair', 'Light', 'Medium', 'Tan', 'Deep', 'Rich'] as SkinTone[]).map(tone => (
                      <button
                        key={tone}
                        type="button"
                        onClick={() => setSkinDepth(tone)}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          skinDepth === tone
                            ? 'border-stone-950 bg-stone-950 text-white shadow-sm'
                            : 'border-stone-200 bg-stone-50 hover:border-stone-400 text-stone-700'
                        }`}
                      >
                        <span className="text-xs font-semibold block">{tone}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Vein Undertone */}
                <div>
                  <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
                    2. Undertone (Look at the inside of your wrist)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setVeinUndertone('Cool')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        veinUndertone === 'Cool'
                          ? 'border-stone-950 bg-stone-50 ring-1 ring-stone-950'
                          : 'border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <div className="font-semibold text-xs text-stone-900">Cool Undertone</div>
                      <div className="text-[11px] text-stone-500 mt-0.5">Veins appear purple or blue; silver jewelry flatters most.</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setVeinUndertone('Warm')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        veinUndertone === 'Warm'
                          ? 'border-stone-950 bg-stone-50 ring-1 ring-stone-950'
                          : 'border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <div className="font-semibold text-xs text-stone-900">Warm Undertone</div>
                      <div className="text-[11px] text-stone-500 mt-0.5">Veins appear green or olive; gold jewelry looks glowing.</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setVeinUndertone('Neutral')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        veinUndertone === 'Neutral'
                          ? 'border-stone-950 bg-stone-50 ring-1 ring-stone-950'
                          : 'border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <div className="font-semibold text-xs text-stone-900">Neutral Undertone</div>
                      <div className="text-[11px] text-stone-500 mt-0.5">Veins appear blue-green; looks wonderful in both metals.</div>
                    </button>
                  </div>
                </div>

                {/* Coverage Preference */}
                <div>
                  <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
                    3. Desired Coverage & Finish
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['Sheer', 'Medium', 'Full'] as const).map(cov => (
                      <button
                        key={cov}
                        type="button"
                        onClick={() => setCoveragePref(cov)}
                        className={`p-2.5 rounded-lg border text-xs font-semibold text-center transition-all ${
                          coveragePref === cov
                            ? 'border-stone-950 bg-stone-950 text-white'
                            : 'border-stone-200 bg-stone-50 hover:border-stone-300 text-stone-700'
                        }`}
                      >
                        {cov} Coverage
                      </button>
                    ))}
                  </div>
                </div>

                {/* Match CTA */}
                <button
                  type="button"
                  onClick={handleRunShadeMatch}
                  disabled={isMatchingShade}
                  className="w-full py-3.5 bg-stone-950 hover:bg-stone-850 text-amber-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>{isMatchingShade ? 'Analyzing skin tone with AI...' : 'Calculate My Exact Shade Match'}</span>
                </button>

                {/* Match Result Output */}
                {shadeResult && (
                  <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-4 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        <Check className="w-3.5 h-3.5" />
                        <span>{shadeResult.confidence}% match score</span>
                      </div>
                      <span className="text-xs text-stone-400">Tested across 40+ shade spectrums</span>
                    </div>

                    <div className="flex items-center gap-4">
                      <div
                        className="w-14 h-14 rounded-2xl shadow-md border-2 border-white shrink-0"
                        style={{ backgroundColor: shadeResult.hex }}
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-stone-500 uppercase tracking-wider">{shadeResult.brand}</div>
                        <h4 className="text-base font-serif font-bold text-stone-950">{shadeResult.shadeName}</h4>
                        <div className="text-xs text-stone-600 mt-0.5">{shadeResult.undertoneDescription}</div>
                      </div>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-stone-200 text-xs text-stone-700 space-y-1">
                      <div className="font-semibold text-stone-900">Application Tip:</div>
                      <p className="text-stone-600 leading-relaxed">{shadeResult.applicationTip}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        addToCart(shadeResult.product, shadeResult.product.shades?.find((sh) => sh.id === shadeResult.shadeId));
                        closeAIStudio();
                      }}
                      className="w-full py-3 bg-stone-950 hover:bg-stone-850 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-md"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add Matched Shade to Bag (${shadeResult.product.price.toFixed(2)})</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: SKINCARE REGIMEN BUILDER */}
          {aiStudioTab === 'routine' && (
            <div className="space-y-8">
              <div>
                <h3 className="font-serif text-xl font-bold text-stone-950 mb-1">
                  Custom AI Skincare Regimen
                </h3>
                <p className="text-xs text-stone-500">
                  Formulate a personalized morning and evening routine calibrated to your skin barrier and concerns.
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
                    Primary Skin Type
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {(['Dry', 'Oily', 'Combination', 'Normal', 'Sensitive'] as SkinType[]).map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setSkinType(t)}
                        className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                          skinType === t
                            ? 'border-stone-950 bg-stone-950 text-white'
                            : 'border-stone-200 bg-stone-50 text-stone-700'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
                    Key Concerns (Select all that apply)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['Hydration', 'Pore Smoothing', 'Dark Spots', 'Fine Lines', 'Acne / Breakouts', 'Redness / Sensitivity'].map(concern => {
                      const isSelected = concerns.includes(concern);
                      return (
                        <button
                          key={concern}
                          type="button"
                          onClick={() => toggleConcern(concern)}
                          className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                            isSelected
                              ? 'border-amber-600 bg-amber-50 text-amber-950 font-bold'
                              : 'border-stone-200 bg-stone-50 text-stone-700 hover:border-stone-300'
                          }`}
                        >
                          {isSelected && '✓ '}
                          {concern}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateRoutine}
                  disabled={isGeneratingRoutine}
                  className="w-full py-3.5 bg-stone-950 hover:bg-stone-850 text-amber-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>{isGeneratingRoutine ? 'Formulating your regimen...' : 'Generate My Custom Regimen'}</span>
                </button>

                {routineResult && (
                  <div className="space-y-6 pt-2 animate-in fade-in duration-300">
                    <div className="p-4 bg-amber-50/80 rounded-xl border border-amber-200 text-xs text-stone-800 leading-relaxed">
                      <strong className="text-amber-950 block mb-1">Active Ingredient Synergy:</strong>
                      {routineResult.activeSynergy}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* AM Routine */}
                      <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-stone-900 uppercase tracking-wider pb-2 border-b border-stone-200">
                          <Sun className="w-4 h-4 text-amber-500" />
                          <span>Morning (AM) Regimen</span>
                        </div>

                        {routineResult.amRoutine.map((item, idx) => (
                          <div key={idx} className="p-3 bg-white rounded-xl border border-stone-200/80 space-y-2">
                            <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                              Step {idx + 1}: {item.step}
                            </div>
                            <div className="flex items-center gap-3">
                              <img src={item.product.image} alt={item.product.name} className="w-10 h-10 object-cover rounded-md" />
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-bold text-stone-900 truncate">{item.product.name}</div>
                                <div className="text-[11px] text-stone-500">${item.product.price.toFixed(2)}</div>
                              </div>
                            </div>
                            <p className="text-[11px] text-stone-600 leading-normal">{item.why}</p>
                          </div>
                        ))}
                      </div>

                      {/* PM Routine */}
                      <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-stone-900 uppercase tracking-wider pb-2 border-b border-stone-200">
                          <Moon className="w-4 h-4 text-indigo-400" />
                          <span>Evening (PM) Regimen</span>
                        </div>

                        {routineResult.pmRoutine.map((item, idx) => (
                          <div key={idx} className="p-3 bg-white rounded-xl border border-stone-200/80 space-y-2">
                            <div className="text-[10px] font-bold text-indigo-900 uppercase tracking-wider">
                              Step {idx + 1}: {item.step}
                            </div>
                            <div className="flex items-center gap-3">
                              <img src={item.product.image} alt={item.product.name} className="w-10 h-10 object-cover rounded-md" />
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-bold text-stone-900 truncate">{item.product.name}</div>
                                <div className="text-[11px] text-stone-500">${item.product.price.toFixed(2)}</div>
                              </div>
                            </div>
                            <p className="text-[11px] text-stone-600 leading-normal">{item.why}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: HAUTE CONCIERGE CHAT */}
          {aiStudioTab === 'chat' && (
            <div className="flex flex-col h-[520px]">
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
                {chatMessages.map((msg, index) => {
                  const recProduct = msg.recommendedProductId 
                    ? products.find(p => p.id === msg.recommendedProductId) 
                    : null;

                  return (
                    <div
                      key={index}
                      className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-md p-4 rounded-2xl text-xs leading-relaxed ${
                          msg.sender === 'user'
                            ? 'bg-stone-950 text-white rounded-br-xs'
                            : 'bg-stone-100 text-stone-900 rounded-bl-xs border border-stone-200'
                        }`}
                      >
                        {msg.text}
                      </div>

                      {/* Attached Product Card in Chat */}
                      {recProduct && (
                        <div className="mt-2 w-full max-w-sm p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between gap-3">
                          <img src={recProduct.image} alt={recProduct.name} className="w-12 h-12 object-cover rounded-lg" />
                          <div className="flex-1 min-w-0">
                            <div className="text-[10px] font-bold text-stone-500 uppercase">{recProduct.brand}</div>
                            <div className="text-xs font-semibold text-stone-900 truncate">{recProduct.name}</div>
                            <div className="text-xs font-bold text-stone-950">${recProduct.price.toFixed(2)}</div>
                          </div>
                          <button
                            onClick={() => addToCart(recProduct)}
                            className="px-3 py-1.5 bg-stone-950 text-white text-[11px] font-semibold rounded-lg hover:bg-stone-850"
                          >
                            Add to Bag
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}

                {isChatSending && (
                  <div className="flex items-center gap-2 text-xs text-stone-400 p-2">
                    <Sparkles className="w-3.5 h-3.5 animate-spin text-amber-500" />
                    <span>Stylist is preparing recommendations...</span>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="flex gap-2 pt-2 border-t border-stone-200">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask about skin concerns, shade combinations, or event styling..."
                  className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-xs text-stone-900 focus:outline-none focus:border-stone-950"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isChatSending}
                  className="px-5 py-3 bg-stone-950 hover:bg-stone-850 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
