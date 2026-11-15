import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  ShoppingBag, 
  Heart, 
  User as UserIcon, 
  Sparkles, 
  Menu, 
  X, 
  Truck, 
  ChevronDown,
  Gift,
  Check,
  Globe,
  SlidersHorizontal,
  ShieldCheck,
  MapPin
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Category, Currency } from '../../types';
import { PWAInstallButton } from '../pwa/PWAInstallButton';

export const Navbar: React.FC = () => {
  const { 
    cart, 
    wishlist, 
    user, 
    filters, 
    setCategory, 
    setSearchQuery, 
    products,
    currency,
    setCurrency,
    formatPrice,
    setIsCartOpen,
    setIsWishlistOpen,
    setIsAuthModalOpen,
    setAuthMode,
    setIsBeautyInsiderOpen,
    openAIStudio,
    openOrderTracking,
    setQuickViewProduct,
    comparedProducts,
    setIsCompareOpen,
    setIsAdminOpen,
    isStaff,
    openStoreLocator,
    selectedBoutique,
    logout
  } = useApp();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [localSearch, setLocalSearch] = useState('');
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const currencyRef = useRef<HTMLDivElement>(null);

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, i) => sum + (i.product.price * i.quantity), 0);

  // Keyboard shortcut: Pressing "/" or "Cmd+K" focuses search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key === 'k')) && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close search suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
      if (currencyRef.current && !currencyRef.current.contains(e.target as Node)) {
        setIsCurrencyDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchResults = localSearch.trim() === '' ? [] : products.filter(p => 
    p.name.toLowerCase().includes(localSearch.toLowerCase()) ||
    p.brand.toLowerCase().includes(localSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(localSearch.toLowerCase())
  ).slice(0, 5);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(localSearch);
    setIsSearchFocused(false);
  };

  const handleCategoryClick = (cat: Category) => {
    setCategory(cat);
    setIsMobileMenuOpen(false);
  };

  const navCategories: Category[] = [
    'All',
    'Makeup',
    'Skincare',
    'Fragrance',
    'Haircare',
    'Bath & Body',
    'Tools & Brushes',
    'Clean Beauty'
  ];

  const currencies: Array<{ code: Currency; label: string; flag: string }> = [
    { code: 'USD', label: 'USD ($)', flag: '🇺🇸' },
    { code: 'EUR', label: 'EUR (€)', flag: '🇪🇺' },
    { code: 'GBP', label: 'GBP (£)', flag: '🇬🇧' },
    { code: 'CAD', label: 'CAD ($)', flag: '🇨🇦' },
    { code: 'AUD', label: 'AUD ($)', flag: '🇦🇺' },
    { code: 'JPY', label: 'JPY (¥)', flag: '🇯🇵' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-stone-200">
      {/* Top Announcement & Currency Bar */}
      <div className="bg-stone-900 text-stone-200 text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="w-3.5 h-3.5 text-amber-300" />
            <span className="font-medium tracking-wide">
              Complimentary standard shipping on orders over <strong className="text-amber-300 tracking-wider">$50</strong>
            </span>
            <span className="hidden md:inline text-stone-400">· 2 Complimentary Deluxe Samples on orders over $50</span>
          </div>

          <div className="flex items-center gap-4 text-stone-300">
            {/* Currency Selector */}
            <div ref={currencyRef} className="relative">
              <button
                onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
                className="flex items-center gap-1 hover:text-white transition-colors text-[11px] font-medium"
                aria-label="Change currency"
              >
                <Globe className="w-3 h-3 text-stone-400" />
                <span>{currency}</span>
                <ChevronDown className="w-3 h-3 text-stone-500" />
              </button>

              {isCurrencyDropdownOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-32 bg-stone-900 border border-stone-700 rounded-xl shadow-xl py-1 z-50">
                  {currencies.map(curr => (
                    <button
                      key={curr.code}
                      onClick={() => {
                        setCurrency(curr.code);
                        setIsCurrencyDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-1.5 text-left text-xs flex items-center justify-between hover:bg-stone-800 transition-colors ${
                        currency === curr.code ? 'text-amber-300 font-bold' : 'text-stone-300'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <span>{curr.flag}</span>
                        <span>{curr.code}</span>
                      </span>
                      {currency === curr.code && <Check className="w-3 h-3" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <span className="hidden sm:inline text-stone-600">|</span>

            <button 
              onClick={() => openStoreLocator()}
              className="hover:text-amber-300 transition-colors flex items-center gap-1.5 text-xs font-medium"
              title="Locate Sayphora Ateliers & luxury counters near you with Google Maps grounding"
            >
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>{selectedBoutique ? `Store: ${selectedBoutique.name.split('—')[0].trim()}` : 'Find Boutiques'}</span>
            </button>

            <span className="hidden sm:inline text-stone-600">|</span>

            <button 
              onClick={() => openOrderTracking()}
              className="hidden sm:flex hover:text-white transition-colors items-center gap-1.5 text-xs"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Track Order</span>
            </button>

            <span className="hidden sm:inline text-stone-600">|</span>

            <button 
              onClick={() => setIsBeautyInsiderOpen(true)}
              className="hover:text-amber-300 transition-colors flex items-center gap-1 text-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Beauty Insider {user ? `(${user.points} pts)` : 'Rewards'}</span>
            </button>

            <span className="hidden md:inline text-stone-600">|</span>

            {isStaff && (<button 
              onClick={() => setIsAdminOpen(true)}
              className="hover:text-amber-300 transition-colors hidden md:flex items-center gap-1 text-xs font-semibold text-amber-300/90"
              title="Open Store Operations & Executive Admin Console (Ctrl+Shift+A)"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Admin Portal</span>
            </button>)}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        {/* Mobile menu trigger */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden p-2 -ml-2 text-stone-800 hover:text-stone-950"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Logo */}
        <div className="flex items-center gap-8">
          <a href="#" onClick={() => { setCategory('All'); setSearchQuery(''); }} className="flex flex-col">
            <span className="font-serif text-2xl sm:text-3xl font-bold tracking-[0.2em] text-stone-950 uppercase">
              SAYPHORA
            </span>
            <span className="text-[9px] uppercase tracking-[0.35em] text-stone-500 font-sans -mt-1 font-medium">
              Haute Beauté
            </span>
          </a>
        </div>

        {/* Search Bar with Instant Typeahead & Keyboard Shortcut */}
        <div ref={searchContainerRef} className="hidden md:flex flex-1 max-w-xl mx-4 relative">
          <form onSubmit={handleSearchSubmit} className="w-full relative">
            <input
              ref={searchInputRef}
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              placeholder="Search products, brands, ingredients, shades... (Press /)"
              className="w-full bg-stone-100 hover:bg-stone-100/80 focus:bg-white text-stone-900 placeholder-stone-500 text-sm pl-10 pr-12 py-2.5 rounded-full border border-transparent focus:border-stone-900 focus:outline-none transition-all"
            />
            <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {localSearch ? (
                <button 
                  type="button" 
                  onClick={() => { setLocalSearch(''); setSearchQuery(''); }}
                  className="text-stone-400 hover:text-stone-700 text-xs"
                >
                  Clear
                </button>
              ) : (
                <kbd className="hidden lg:inline text-[10px] bg-white border border-stone-300 text-stone-400 px-1.5 py-0.5 rounded shadow-2xs font-mono">
                  /
                </kbd>
              )}
            </div>
          </form>

          {/* Instant Search Suggestions Dropdown */}
          {isSearchFocused && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-stone-200 overflow-hidden z-50">
              {searchResults.length > 0 ? (
                <div className="p-2">
                  <div className="px-3 py-1.5 text-xs font-semibold text-stone-400 uppercase tracking-wider">
                    Product Matches
                  </div>
                  {searchResults.map(prod => (
                    <button
                      key={prod.id}
                      onClick={() => {
                        setQuickViewProduct(prod);
                        setIsSearchFocused(false);
                      }}
                      className="w-full text-left flex items-center gap-3 p-2 hover:bg-stone-50 rounded-lg transition-colors group"
                    >
                      <img src={prod.image} alt={prod.name} className="w-10 h-10 object-cover rounded" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-stone-500 font-medium">{prod.brand}</div>
                        <div className="text-xs font-semibold text-stone-900 truncate group-hover:text-stone-700">
                          {prod.name}
                        </div>
                      </div>
                      <div className="text-xs font-semibold text-stone-900">
                        {formatPrice(prod.price)}
                      </div>
                    </button>
                  ))}
                </div>
              ) : localSearch ? (
                <div className="p-6 text-center text-stone-500 text-xs">
                  No matching beauty items found. Press enter to search catalog.
                </div>
              ) : (
                <div className="p-4">
                  <div className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
                    Trending Searches
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {['Rare Beauty Blush', 'Fenty Foundation', 'Drunk Elephant AHA', 'Airwrap', 'By the Fireplace', 'Water Cream'].map(tag => (
                      <button
                        key={tag}
                        onClick={() => {
                          setLocalSearch(tag);
                          setSearchQuery(tag);
                          setIsSearchFocused(false);
                        }}
                        className="px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-full transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Navigation Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Comparison Trigger if items added */}
          {comparedProducts.length > 0 && (
            <button
              onClick={() => setIsCompareOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-full transition-colors"
              title="Compare Formulations"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Compare ({comparedProducts.length})</span>
            </button>
          )}

          {/* Store Locator / Boutiques Trigger */}
          <button
            onClick={() => openStoreLocator()}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 hover:text-stone-950 bg-stone-100 hover:bg-stone-200/90 rounded-full transition-colors"
            title="Google Maps Store Locator & Ateliers"
          >
            <MapPin className="w-3.5 h-3.5 text-amber-600" />
            <span>Boutiques</span>
          </button>

          {/* AI Beauty Studio Trigger */}
          <button
            onClick={() => openAIStudio('shade')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-900 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 rounded-full transition-colors"
            title="AI Shade Matcher & Skin Regimen Builder"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">AI Beauty Studio</span>
          </button>

          {/* PWA App Install Button */}
          <PWAInstallButton />

          {/* Executive Admin Portal Button */}
          {isStaff && (<button
            onClick={() => setIsAdminOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-900 bg-stone-100 hover:bg-stone-200/90 border border-stone-200 rounded-full transition-all hover:border-amber-400 group"
            title="Store Operations & Admin Dashboard (Ctrl+Shift+A)"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600 group-hover:text-amber-500" />
            <span className="hidden lg:inline">Admin Portal</span>
          </button>)}

          {/* Account / User Menu */}
          {user ? (
            <div className="relative group">
              <button 
                onClick={() => setIsBeautyInsiderOpen(true)}
                className="flex items-center gap-2 p-1.5 text-stone-700 hover:text-stone-950 rounded-lg"
              >
                <div className="w-8 h-8 rounded-full bg-stone-900 text-amber-300 flex items-center justify-center font-bold text-xs uppercase">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden xl:block text-left">
                  <div className="text-xs font-semibold text-stone-900">{user.name.split(' ')[0]}</div>
                  <div className="text-[10px] text-amber-700 font-medium">{user.tier} · {user.points} pts</div>
                </div>
              </button>

              {/* Hover Dropdown Menu */}
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-stone-200 rounded-xl shadow-xl py-2 hidden group-hover:block z-50">
                <div className="px-3 py-1.5 border-b border-stone-100 text-xs">
                  <p className="font-semibold text-stone-900">{user.name}</p>
                  <p className="text-[10px] text-stone-500">{user.email}</p>
                </div>
                <button
                  onClick={() => setIsBeautyInsiderOpen(true)}
                  className="w-full text-left px-3 py-2 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>VIP Rewards ({user.points} pts)</span>
                </button>
                <button
                  onClick={() => openOrderTracking()}
                  className="w-full text-left px-3 py-2 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                >
                  <Truck className="w-3.5 h-3.5 text-stone-500" />
                  <span>Track Package</span>
                </button>
                {isStaff && (<button
                  onClick={() => setIsAdminOpen(true)}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-amber-900 hover:bg-amber-50 flex items-center gap-2 border-t border-stone-100"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>Admin Operations Panel</span>
                </button>)}
                <button
                  onClick={() => logout()}
                  className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 border-t border-stone-100"
                >
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                setAuthMode('signin');
                setIsAuthModalOpen(true);
              }}
              className="p-2 text-stone-700 hover:text-stone-950 flex items-center gap-1.5 text-xs font-medium"
            >
              <UserIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}

          {/* Saved Wishlist Drawer Trigger */}
          <button
            onClick={() => setIsWishlistOpen(true)}
            className="p-2 text-stone-700 hover:text-stone-950 relative"
            title="View Saved Wishlist"
          >
            <Heart className="w-5 h-5" />
            {wishlist.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Cart / Shopping Bag Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2 bg-stone-950 hover:bg-stone-850 text-white px-3.5 py-2 rounded-full text-xs font-medium transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="font-semibold">{totalCartCount}</span>
            <span className="hidden md:inline text-stone-300">
              · {formatPrice(cartSubtotal)}
            </span>
          </button>
        </div>
      </div>

      {/* Category Mega Bar (Desktop) */}
      <nav className="hidden lg:block border-t border-stone-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-xs font-medium uppercase tracking-wider text-stone-700">
          <div className="flex items-center gap-7 overflow-x-auto py-2.5">
            {navCategories.map(cat => (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={`py-1 transition-colors relative whitespace-nowrap ${
                  filters.category === cat 
                    ? 'text-stone-950 font-bold' 
                    : 'text-stone-600 hover:text-stone-950'
                }`}
              >
                {cat}
                {filters.category === cat && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-stone-950" />
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold normal-case">
            <button
              onClick={() => openAIStudio('shade')}
              className="text-stone-700 hover:text-amber-800 flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Foundation Shade Finder</span>
            </button>
            <button
              onClick={() => openAIStudio('routine')}
              className="text-stone-700 hover:text-stone-950"
            >
              Skincare Regimen Quiz
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[110px] bg-white z-50 overflow-y-auto p-6 border-t border-stone-200">
          <form onSubmit={handleSearchSubmit} className="mb-6 relative">
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search products, brands..."
              className="w-full bg-stone-100 text-stone-900 text-sm pl-10 pr-4 py-2.5 rounded-lg border border-stone-200"
            />
            <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </form>

          <div className="space-y-4">
            <div className="text-xs font-bold text-stone-400 uppercase tracking-widest">
              Categories
            </div>
            <div className="grid grid-cols-1 gap-2">
              {navCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => handleCategoryClick(cat)}
                  className={`text-left py-2.5 px-3 rounded-lg text-sm font-medium transition-colors ${
                    filters.category === cat ? 'bg-stone-100 text-stone-950 font-bold' : 'text-stone-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="pt-4 border-t border-stone-200 space-y-3">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openAIStudio('shade');
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-sm font-medium"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>AI Shade Matcher & Routine Builder</span>
                </div>
                <ChevronDown className="w-4 h-4 -rotate-90" />
              </button>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsWishlistOpen(true);
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-stone-100 text-stone-900 text-sm font-medium"
              >
                <span>My Saved Wishlist</span>
                <span className="text-xs font-bold text-rose-600">{wishlist.length} items</span>
              </button>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsBeautyInsiderOpen(true);
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-stone-100 text-stone-900 text-sm font-medium"
              >
                <span>Beauty Insider Loyalty Rewards</span>
                <span className="text-xs text-amber-700 font-bold">{user ? `${user.points} pts` : 'Join Free'}</span>
              </button>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openStoreLocator();
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-stone-100 text-stone-900 text-sm font-medium"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-600" />
                  <span>Find Boutiques & Ateliers</span>
                </div>
                <span className="text-[10px] text-stone-500 font-semibold uppercase">Google Maps</span>
              </button>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openOrderTracking();
                }}
                className="w-full flex items-center gap-2 p-3 text-stone-700 text-sm font-medium"
              >
                <Truck className="w-4 h-4" />
                <span>Track an Order</span>
              </button>

              {isStaff && (<button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsAdminOpen(true);
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 text-sm font-semibold"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>Store Admin Portal</span>
                </div>
                <span className="text-[10px] bg-amber-400 text-stone-950 font-bold px-2 py-0.5 rounded">Staff</span>
              </button>)}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
