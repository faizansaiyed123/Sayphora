import React from 'react';
import { 
  SlidersHorizontal, 
  RotateCcw, 
  Sparkles, 
  Check, 
  ChevronDown, 
  LayoutGrid, 
  Columns2,
  Flame,
  Leaf,
  Tag
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Category, SkinType } from '../../types';

export const FilterBar: React.FC = () => {
  const { 
    filters, 
    setFilters, 
    resetFilters, 
    filteredProducts, 
    products,
    viewMode,
    setViewMode
  } = useApp();

  const categories: Category[] = [
    'All',
    'Makeup',
    'Skincare',
    'Fragrance',
    'Haircare',
    'Bath & Body',
    'Tools & Brushes',
    'Clean Beauty'
  ];

  const skinTypes: SkinType[] = ['All', 'Dry', 'Oily', 'Combination', 'Normal', 'Sensitive'];

  const getCategoryCount = (cat: Category) => {
    if (cat === 'All') return products.length;
    if (cat === 'Clean Beauty') return products.filter(p => p.isClean).length;
    return products.filter(p => p.category === cat).length;
  };

  const hasActiveFilters = 
    filters.category !== 'All' || 
    filters.skinType !== undefined || 
    filters.cleanOnly || 
    filters.saleOnly || 
    filters.searchQuery !== '' ||
    filters.maxPrice < 1000 ||
    filters.sortBy !== 'featured';

  return (
    <div className="bg-white border-b border-stone-200/90 py-4 px-4 sm:px-6 sticky top-[69px] z-30 shadow-2xs">
      <div className="max-w-7xl mx-auto space-y-3.5">
        {/* Top Row: Category Tabs & Density Switcher */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map(cat => {
              const count = getCategoryCount(cat);
              const isActive = filters.category === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setFilters(prev => ({ ...prev, category: cat, subcategory: undefined }))}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-stone-950 text-amber-200 shadow-sm'
                      : 'bg-stone-100 hover:bg-stone-200/80 text-stone-700'
                  }`}
                >
                  <span>{cat}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-stone-800 text-amber-200' : 'bg-stone-200 text-stone-600'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Side Controls: View Mode & Sort */}
          <div className="flex items-center gap-3 ml-auto">
            {/* View Mode Switcher */}
            <div className="hidden sm:flex items-center gap-1 bg-stone-100 p-0.5 rounded-lg border border-stone-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-all ${
                  viewMode === 'grid' 
                    ? 'bg-white text-stone-950 shadow-xs' 
                    : 'text-stone-500 hover:text-stone-900'
                }`}
                title="4-Column Grid View"
                aria-label="4-Column Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('editorial')}
                className={`p-1.5 rounded-md transition-all ${
                  viewMode === 'editorial' 
                    ? 'bg-white text-stone-950 shadow-xs' 
                    : 'text-stone-500 hover:text-stone-900'
                }`}
                title="2-Column Editorial Magazine View"
                aria-label="2-Column Editorial Magazine View"
              >
                <Columns2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-stone-400 font-medium hidden md:inline">Sort:</span>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                className="bg-stone-100 border border-stone-200 hover:border-stone-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-stone-900 focus:outline-none focus:border-stone-900 cursor-pointer"
              >
                <option value="featured">Featured Curations</option>
                <option value="bestselling">Bestselling Favorites</option>
                <option value="rating">Highest Customer Rating</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Secondary Row: Curated Micro-Filters */}
        <div className="flex items-center justify-between gap-3 flex-wrap pt-2 border-t border-stone-100 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Skin Type selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-stone-500 font-medium">Skin Type:</span>
              <select
                value={filters.skinType || 'All'}
                onChange={(e) => setFilters(prev => ({ ...prev, skinType: e.target.value === 'All' ? undefined : e.target.value as SkinType }))}
                className="bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1 text-xs text-stone-800 font-medium cursor-pointer"
              >
                {skinTypes.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            {/* Clean Beauty Toggle */}
            <button
              onClick={() => setFilters(prev => ({ ...prev, cleanOnly: !prev.cleanOnly }))}
              className={`px-3 py-1 rounded-full border font-medium flex items-center gap-1.5 transition-all ${
                filters.cleanOnly
                  ? 'bg-emerald-950 border-emerald-950 text-emerald-200 shadow-xs'
                  : 'bg-stone-50 border-stone-200 text-stone-700 hover:border-stone-300'
              }`}
            >
              <Leaf className="w-3 h-3 text-emerald-500" />
              <span>Clean Formulation</span>
              {filters.cleanOnly && <Check className="w-3 h-3 text-emerald-300" />}
            </button>

            {/* Special Offers Toggle */}
            <button
              onClick={() => setFilters(prev => ({ ...prev, saleOnly: !prev.saleOnly }))}
              className={`px-3 py-1 rounded-full border font-medium flex items-center gap-1.5 transition-all ${
                filters.saleOnly
                  ? 'bg-rose-950 border-rose-950 text-rose-200 shadow-xs'
                  : 'bg-stone-50 border-stone-200 text-stone-700 hover:border-stone-300'
              }`}
            >
              <Tag className="w-3 h-3 text-rose-500" />
              <span>Special Offer</span>
              {filters.saleOnly && <Check className="w-3 h-3 text-rose-300" />}
            </button>

            {/* Price under $50 */}
            <button
              onClick={() => setFilters(prev => ({ 
                ...prev, 
                maxPrice: prev.maxPrice === 50 ? 1000 : 50 
              }))}
              className={`px-3 py-1 rounded-full border font-medium flex items-center gap-1.5 transition-all ${
                filters.maxPrice === 50
                  ? 'bg-amber-950 border-amber-950 text-amber-200 shadow-xs'
                  : 'bg-stone-50 border-stone-200 text-stone-700 hover:border-stone-300'
              }`}
            >
              <span>Under $50</span>
              {filters.maxPrice === 50 && <Check className="w-3 h-3 text-amber-300" />}
            </button>
          </div>

          {/* Results Counter & Reset */}
          <div className="flex items-center gap-3">
            <span className="text-stone-500 font-medium">
              Showing <strong className="text-stone-950">{filteredProducts.length}</strong> items
            </span>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-amber-800 hover:text-stone-950 font-semibold flex items-center gap-1 transition-colors hover:underline"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
