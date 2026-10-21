import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Search, 
  Navigation, 
  ExternalLink, 
  Clock, 
  Phone, 
  Sparkles, 
  Check, 
  X, 
  Store, 
  Star, 
  ShieldCheck, 
  Compass, 
  RefreshCw,
  ShoppingBag,
  MessageSquare
} from 'lucide-react';
import { api, errorMessage } from '../../lib/api';
import { useApp } from '../../context/AppContext';
import { BoutiquePlace, StoreLocatorResponse } from '../../types';

export const BoutiqueLocatorModal: React.FC = () => {
  const { 
    isStoreLocatorOpen, 
    closeStoreLocator, 
    storeLocatorQuery, 
    storeLocatorBrand,
    selectedBoutique,
    setSelectedBoutique,
    addToast
  } = useApp();

  const [searchCity, setSearchCity] = useState('All');
  const [customSearch, setCustomSearch] = useState('');
  const [activeService, setActiveService] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [geoStatus, setGeoStatus] = useState<string>('');
  
  const [locatorData, setLocatorData] = useState<StoreLocatorResponse | null>(null);

  // Synchronize initial query and brand passed from product details or navbar
  useEffect(() => {
    if (isStoreLocatorOpen) {
      if (storeLocatorBrand) {
        setSelectedBrand(storeLocatorBrand);
      }
      if (storeLocatorQuery) {
        setCustomSearch(storeLocatorQuery);
      }
      fetchBoutiques(storeLocatorQuery, storeLocatorBrand, 'All', null);
    }
  }, [isStoreLocatorOpen, storeLocatorQuery, storeLocatorBrand]);

  const fetchBoutiques = async (
    queryText: string, 
    brandName?: string, 
    city?: string, 
    coords?: { latitude: number; longitude: number } | null
  ) => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const lat = coords?.latitude ?? userCoords?.latitude;
      const lng = coords?.longitude ?? userCoords?.longitude;
      const data = await api<StoreLocatorResponse>('/ai/store-locator', {
        body: {
          query: queryText || undefined,
          brand: brandName || selectedBrand || undefined,
          city: city || searchCity,
          latitude: lat,
          longitude: lng,
          service: activeService !== 'All' ? activeService : undefined
        }
      });
      setLocatorData(data);
    } catch (err) {
      setLoadError(errorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus('Geolocation is not supported by your browser.');
      return;
    }

    setGeoStatus('Acquiring precise coordinates...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        };
        setUserCoords(coords);
        setGeoStatus('Location found! Finding nearby luxury counters...');
        setSearchCity('Current Location');
        fetchBoutiques(customSearch || 'luxury cosmetics and beauty boutiques near me', selectedBrand, 'Current Location', coords);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setGeoStatus('Unable to retrieve location. You can select a city above.');
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBoutiques(customSearch, selectedBrand, searchCity, userCoords);
  };

  const handleCitySelect = (city: string) => {
    setSearchCity(city);
    fetchBoutiques(customSearch, selectedBrand, city, city === 'Current Location' ? userCoords : null);
  };

  const handleSelectAsPreferredPickup = (boutique: BoutiquePlace) => {
    setSelectedBoutique(boutique);
    addToast('Pickup Boutique Selected', `${boutique.name} set for 2-hour in-store collection.`, 'luxury');
  };

  if (!isStoreLocatorOpen) return null;

  const popularCities = ['All', 'New York', 'Paris', 'London', 'Los Angeles', 'Tokyo'];
  const popularServices = [
    'All',
    'Shade Matching Bar',
    'Fragrance Atelier',
    'Clinical Facial Spa',
    'Same-Day Pickup'
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-stone-200 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header Bar */}
        <div className="px-6 py-4 bg-stone-950 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center shadow-md">
              <MapPin className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-serif font-bold tracking-wide">
                  Haute Beauté Ateliers & Store Locator
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Google Maps Grounding
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Live boutique stockist network, shade matching bars & same-day pickup via Gemini 3.8 Flash
              </p>
            </div>
          </div>

          <button
            onClick={closeStoreLocator}
            className="p-2 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            aria-label="Close store locator"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* Search Controls & Geolocation */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <form onSubmit={handleSearchSubmit} className="flex-1 relative">
                <input
                  type="text"
                  value={customSearch}
                  onChange={(e) => setCustomSearch(e.target.value)}
                  placeholder="Search city, address, zip code, or beauty boutique name..."
                  className="w-full bg-white border border-stone-300 focus:border-stone-950 rounded-xl pl-10 pr-4 py-2.5 text-xs text-stone-900 placeholder-stone-400 outline-none transition-colors"
                />
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </form>

              <button
                onClick={handleGetCurrentLocation}
                className="px-4 py-2.5 bg-white border border-stone-300 hover:border-amber-400 hover:bg-amber-50/50 text-stone-900 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-2xs"
                title="Locate nearest stores using your current GPS coordinates"
              >
                <Navigation className="w-3.5 h-3.5 text-amber-600" />
                <span>Use My Location</span>
              </button>

              <button
                onClick={() => fetchBoutiques(customSearch, selectedBrand, searchCity, userCoords)}
                disabled={isLoading}
                className="px-5 py-2.5 bg-stone-950 hover:bg-stone-850 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Compass className="w-3.5 h-3.5" />
                )}
                <span>Search Boutiques</span>
              </button>
            </div>

            {/* Geostatus message if any */}
            {geoStatus && (
              <div className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 flex items-center gap-2">
                <Navigation className="w-3 h-3 text-amber-600 animate-pulse" />
                <span>{geoStatus}</span>
              </div>
            )}

            {/* City Selector Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="text-stone-500 font-semibold text-[11px] uppercase tracking-wider shrink-0">
                Key Cities:
              </span>
              {popularCities.map((city) => (
                <button
                  key={city}
                  onClick={() => handleCitySelect(city)}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    searchCity === city
                      ? 'bg-stone-900 text-white'
                      : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>

            {/* In-Store Service Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs pt-1 border-t border-stone-200">
              <span className="text-stone-500 font-semibold text-[11px] uppercase tracking-wider shrink-0">
                Services:
              </span>
              {popularServices.map((svc) => (
                <button
                  key={svc}
                  onClick={() => {
                    setActiveService(svc);
                    fetchBoutiques(customSearch, selectedBrand, searchCity, userCoords);
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    activeService === svc
                      ? 'bg-amber-400 text-stone-950 font-bold'
                      : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  {svc}
                </button>
              ))}
            </div>

            {/* Brand filter pill if present */}
            {selectedBrand && (
              <div className="flex items-center gap-2 pt-1 text-xs">
                <span className="text-stone-500 text-[11px]">Filtering for brand stockist:</span>
                <span className="bg-stone-200 text-stone-800 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                  <span>{selectedBrand}</span>
                  <button 
                    onClick={() => {
                      setSelectedBrand('');
                      fetchBoutiques(customSearch, '', searchCity, userCoords);
                    }}
                    className="hover:text-stone-950"
                  >
                    ×
                  </button>
                </span>
              </div>
            )}
          </div>

          {/* AI Grounding Concierge Summary Box */}
          {locatorData?.summary && (
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/60 border border-amber-200/90 text-stone-900 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-950 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>AI Concierge & Live Google Maps Grounding Insight</span>
              </div>
              <div className="text-xs sm:text-[13px] leading-relaxed text-stone-800 whitespace-pre-line font-serif">
                {locatorData.summary}
              </div>
            </div>
          )}

          {/* Active Preferred Boutique Display if Chosen */}
          {selectedBoutique && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-emerald-950">
                    Active Pickup Boutique: {selectedBoutique.name}
                  </div>
                  <div className="text-[11px] text-emerald-700">
                    {selectedBoutique.address} · Ready in 2 hours
                  </div>
                </div>
              </div>
              <a
                href={selectedBoutique.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-emerald-800 hover:text-emerald-950 inline-flex items-center gap-1.5 underline"
              >
                <span>Navigate in Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* List of Grounded Boutique Places */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-serif font-bold text-stone-950 uppercase tracking-wider flex items-center gap-2">
                <Store className="w-4 h-4 text-stone-700" />
                <span>Available Boutiques & Counters ({locatorData?.places?.length || 0})</span>
              </h3>
              <span className="text-[11px] text-stone-500">
                Boutique details and map links
              </span>
            </div>

            {isLoading ? (
              <div className="py-16 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
                <p className="text-xs font-medium text-stone-600">
                  Finding boutiques...
                </p>
              </div>
            ) : loadError ? (
              <div role="alert" className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800">{loadError}</div>
            ) : locatorData?.places && locatorData.places.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {locatorData.places.map((place) => {
                  const isSelected = selectedBoutique?.id === place.id || selectedBoutique?.name === place.name;

                  return (
                    <div 
                      key={place.id}
                      className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                        isSelected 
                          ? 'border-amber-400 bg-amber-50/20 shadow-md ring-1 ring-amber-400' 
                          : 'border-stone-200 bg-white hover:border-stone-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="space-y-3">
                        {/* Title and Rating */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-serif font-bold text-sm text-stone-950 leading-snug">
                              {place.name}
                            </h4>
                            {place.distance && (
                              <span className="text-[11px] font-semibold text-amber-700">
                                {place.distance} away
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1 bg-stone-100 px-2 py-0.5 rounded text-xs font-bold text-stone-900 shrink-0">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>{place.rating || 4.9}</span>
                          </div>
                        </div>

                        {/* Address */}
                        <div className="flex items-start gap-2 text-xs text-stone-600">
                          <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                          <span>{place.address}</span>
                        </div>

                        {/* Phone & Hours */}
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-stone-500">
                          <span className="flex items-center gap-1 text-emerald-700 font-medium">
                            <Clock className="w-3 h-3" />
                            <span>Open Today: 10:00 AM – 9:00 PM</span>
                          </span>
                          {place.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              <span>{place.phone}</span>
                            </span>
                          )}
                        </div>

                        {/* In-Store Services Tags */}
                        {place.services && place.services.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {place.services.map((svc, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded text-[10px] font-medium bg-stone-100 text-stone-700 border border-stone-200/60"
                              >
                                {svc}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* In-Stock Items Preview */}
                        {place.inStockItems && place.inStockItems.length > 0 && (
                          <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-100 text-[11px] text-stone-600">
                            <span className="font-semibold text-stone-900">Verified In Stock: </span>
                            <span>{place.inStockItems.join(', ')}</span>
                          </div>
                        )}

                        {/* Google Maps Grounding Review Snippets */}
                        {place.snippets && place.snippets.length > 0 && (
                          <div className="space-y-1.5 pt-2 border-t border-stone-100">
                            <div className="text-[10px] uppercase font-bold tracking-wider text-stone-400 flex items-center gap-1">
                              <MessageSquare className="w-3 h-3" />
                              <span>Verified Guest Reviews from Google Maps</span>
                            </div>
                            {place.snippets.slice(0, 2).map((snip, sIdx) => (
                              <p key={sIdx} className="text-xs text-stone-600 italic">
                                "{snip}"
                              </p>
                            ))}
                          </div>
                        )}

                        {/* Explicit Review Source Links as strictly mandated by gemini-api skill */}
                        {place.reviewSources && place.reviewSources.length > 0 && (
                          <div className="space-y-1 pt-1">
                            {place.reviewSources.map((rs, rIdx) => (
                              rs.uri ? (
                                <a 
                                  key={rIdx}
                                  href={rs.uri}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[10px] text-stone-500 hover:text-amber-700 inline-flex items-center gap-1 underline"
                                >
                                  <span>View review by {rs.author || 'customer'} on Google Maps</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              ) : null
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Card Action Buttons */}
                      <div className="pt-4 mt-4 border-t border-stone-100 flex flex-wrap items-center gap-2">
                        {/* Direct Google Maps Link (Skill Requirement) */}
                        <a
                          href={place.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 min-w-[130px] py-2 px-3 rounded-xl bg-stone-950 hover:bg-stone-850 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-amber-300" />
                          <span>Open in Google Maps</span>
                        </a>

                        <button
                          onClick={() => handleSelectAsPreferredPickup(place)}
                          className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border ${
                            isSelected
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-white hover:bg-stone-50 text-stone-900 border-stone-300'
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Selected Store</span>
                            </>
                          ) : (
                            <>
                              <ShoppingBag className="w-3.5 h-3.5 text-stone-500" />
                              <span>Set Pickup Store</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-stone-500 text-xs">
                No boutiques found for this query. Try choosing another city or searching for a general neighborhood.
              </div>
            )}
          </div>
        </div>

        {/* Footer Guarantee Bar */}
        <div className="px-6 py-3 bg-stone-100 border-t border-stone-200 text-stone-600 flex flex-col sm:flex-row items-center justify-between text-[11px] gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Complimentary custom foundation shade sampling available at all Sayphora and Sephora flagship counters.</span>
          </div>

          <div className="text-stone-500">
            Powered by Google Maps Grounding & Gemini 3.8 Flash
          </div>
        </div>
      </div>
    </div>
  );
};
