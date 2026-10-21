import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Leaf, 
  HelpCircle,
  FlaskConical
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const IngredientDecoderModal: React.FC = () => {
  const {
    isIngredientModalOpen,
    closeIngredientModal,
    ingredientProduct
  } = useApp();

  const [activeCheckAllergen, setActiveCheckAllergen] = useState<string | null>(null);

  if (!isIngredientModalOpen || !ingredientProduct) return null;

  const analysis = ingredientProduct.ingredientAnalysis || {
    cleanStandard: 'Clean at Sayphora',
    comedogenicRating: 1,
    phLevel: 5.5,
    allergensFree: ['Paraben-Free', 'Phthalate-Free', 'Cruelty-Free', 'Sulfate-Free'],
    actives: [
      { name: 'Core Botanical Extracts', purpose: 'Nourishes and reinforces natural lipid barrier', safetyScore: 1 },
      { name: 'Humectant Matrix', purpose: 'Attracts atmospheric moisture to epidermal layers', safetyScore: 1 }
    ]
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-stone-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-6 bg-linear-to-r from-emerald-950 via-stone-900 to-emerald-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest flex items-center gap-1.5">
                <Leaf className="w-3.5 h-3.5" />
                <span>Clean & Clinical Ingredient Diagnostic</span>
              </div>
              <h3 className="font-serif text-lg font-bold">
                {ingredientProduct.name}
              </h3>
            </div>
          </div>

          <button
            onClick={closeIngredientModal}
            className="p-1.5 text-stone-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* Diagnostic Metric Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Standard</span>
              <span className="text-xs font-bold text-emerald-950 block mt-0.5">{analysis.cleanStandard}</span>
              <span className="text-[10px] text-emerald-700">Non-toxic verified</span>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-center">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Pore Clog Index</span>
              <span className="text-base font-bold text-stone-900 block mt-0.5">{analysis.comedogenicRating} / 5</span>
              <span className="text-[10px] text-stone-500">
                {analysis.comedogenicRating <= 1 ? 'Will not clog pores' : 'Mild richness'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-center">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Formula pH</span>
              <span className="text-base font-bold text-stone-900 block mt-0.5">
                {analysis.phLevel ? analysis.phLevel.toFixed(1) : '5.5'}
              </span>
              <span className="text-[10px] text-stone-500">Acid-mantle friendly</span>
            </div>
          </div>

          {/* Active Ingredients Spotlight */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                Key Bio-Actives & Safety Ratings
              </h4>
              <span className="text-[11px] text-stone-500">EWG Hazard Scale (1 = Green/Safest)</span>
            </div>

            <div className="space-y-2.5">
              {analysis.actives.map((act, idx) => (
                <div 
                  key={idx}
                  className="p-3 rounded-xl border border-stone-200 bg-stone-50/50 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-stone-900">{act.name}</div>
                    <div className="text-[11px] text-stone-600 mt-0.5">{act.purpose}</div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center border border-emerald-300">
                      {act.safetyScore}
                    </span>
                    <span className="text-[10px] text-emerald-800 font-semibold hidden sm:inline">Low Hazard</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Free-From Verified Certifications */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              Formulated Without (Verified Exclusions)
            </h4>
            <div className="flex flex-wrap gap-2">
              {analysis.allergensFree.map((freeItem, idx) => (
                <span 
                  key={idx}
                  className="px-3 py-1 bg-emerald-50 text-emerald-900 border border-emerald-200/80 rounded-lg text-xs font-medium flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{freeItem}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Conflict Checker Guidance */}
          <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 space-y-1.5 text-xs text-stone-800">
            <div className="flex items-center gap-2 font-bold text-amber-950">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Dermatological Layering Advisory:</span>
            </div>
            <p className="text-[11px] text-stone-700 leading-relaxed">
              When introducing new active formulations to your skincare ritual, patch test on the jawline for 24 hours. Formulated to layer seamlessly with hyaluronic acids and daily SPF without pilling.
            </p>
          </div>

          {/* Full Ingredients Scrollbox */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              Full Transparent Ingredient Declaration
            </h4>
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-[11px] text-stone-600 leading-relaxed max-h-28 overflow-y-auto font-mono">
              {ingredientProduct.ingredients}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
