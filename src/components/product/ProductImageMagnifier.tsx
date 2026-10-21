import React, { useState, useRef, useCallback } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Sparkles, 
  Layers, 
  RotateCw,
  X,
  Eye,
  Sliders
} from 'lucide-react';
import { Product, Shade } from '../../types';

interface ProductImageMagnifierProps {
  product: Product;
  selectedShade?: Shade;
  className?: string;
}

export const ProductImageMagnifier: React.FC<ProductImageMagnifierProps> = ({
  product,
  selectedShade,
  className = ''
}) => {
  // Gallery images: main, texture macro, hover/model, on-skin
  const galleryImages = [
    {
      id: 'main',
      label: 'Studio Packshot',
      url: product.image
    },
    {
      id: 'texture',
      label: 'Texture & Pigment Macro',
      url: product.hoverImage || 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200&auto=format&fit=crop&q=90'
    },
    {
      id: 'lifestyle',
      label: 'Formula Application',
      url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&auto=format&fit=crop&q=90'
    }
  ];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(2.5); // 2x, 2.8x, 3.5x
  const [lensPosition, setLensPosition] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [magnifierMode, setMagnifierMode] = useState<'lens' | 'pan'>('lens');
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const currentImage = galleryImages[activeImageIndex]?.url || product.image;

  // Track cursor position on image container
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    
    // Position relative to container in pixels
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Constrain within container bounds
    const boundedX = Math.max(0, Math.min(rect.width, mouseX));
    const boundedY = Math.max(0, Math.min(rect.height, mouseY));

    // Convert to percentage (0 - 100%)
    const percentX = (boundedX / rect.width) * 100;
    const percentY = (boundedY / rect.height) * 100;

    setCursorPos({ x: boundedX, y: boundedY });
    setLensPosition({ x: percentX, y: percentY });
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (!containerRef.current || e.touches.length === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const touch = e.touches[0];

    const touchX = touch.clientX - rect.left;
    const touchY = touch.clientY - rect.top;

    const boundedX = Math.max(0, Math.min(rect.width, touchX));
    const boundedY = Math.max(0, Math.min(rect.height, touchY));

    const percentX = (boundedX / rect.width) * 100;
    const percentY = (boundedY / rect.height) * 100;

    setCursorPos({ x: boundedX, y: boundedY });
    setLensPosition({ x: percentX, y: percentY });
    setIsHovering(true);
  }, []);

  const lensSize = 150; // diameter in pixels

  return (
    <div className={`flex flex-col space-y-3 ${className}`}>
      {/* Magnifier Viewport */}
      <div className="relative">
        <div
          ref={containerRef}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onMouseMove={handleMouseMove}
          onTouchStart={() => setIsHovering(true)}
          onTouchEnd={() => setIsHovering(false)}
          onTouchMove={handleTouchMove}
          className="relative aspect-square w-full rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 select-none cursor-crosshair group shadow-inner"
        >
          {/* Base High-Res Image */}
          <img
            src={currentImage}
            alt={product.name}
            className={`w-full h-full object-cover object-center transition-transform duration-300 ${
              isHovering && magnifierMode === 'pan' ? 'opacity-0' : 'opacity-100'
            }`}
          />

          {/* Mode 1: Pan & Inspect Mode (Direct Full-Container Zoom) */}
          {isHovering && magnifierMode === 'pan' && (
            <div
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{
                backgroundImage: `url(${currentImage})`,
                backgroundPosition: `${lensPosition.x}% ${lensPosition.y}%`,
                backgroundSize: `${zoomLevel * 100}%`,
                backgroundRepeat: 'no-repeat'
              }}
            />
          )}

          {/* Mode 2: Precision Floating Loupe Lens */}
          {isHovering && magnifierMode === 'lens' && (
            <div
              className="absolute pointer-events-none rounded-full border-2 border-stone-900 bg-white shadow-2xl overflow-hidden z-30 transition-transform duration-75"
              style={{
                width: `${lensSize}px`,
                height: `${lensSize}px`,
                left: `${cursorPos.x - lensSize / 2}px`,
                top: `${cursorPos.y - lensSize / 2}px`,
                boxShadow: '0 10px 30px rgba(0,0,0,0.35), inset 0 0 10px rgba(0,0,0,0.15)'
              }}
            >
              {/* Magnified Image Slice */}
              <div
                className="w-full h-full rounded-full"
                style={{
                  backgroundImage: `url(${currentImage})`,
                  backgroundPosition: `${lensPosition.x}% ${lensPosition.y}%`,
                  backgroundSize: `${zoomLevel * containerRef.current!.clientWidth}px ${zoomLevel * containerRef.current!.clientHeight}px`,
                  backgroundRepeat: 'no-repeat'
                }}
              />

              {/* High-Precision Reticle Crosshair */}
              <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
                <div className="w-full h-px bg-stone-900" />
                <div className="h-full w-px bg-stone-900 absolute" />
              </div>

              {/* Lens Shimmer Border Accent */}
              <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-amber-400/40 pointer-events-none" />
            </div>
          )}

          {/* Active Zoom & Texture Indicator Badge */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 z-20 pointer-events-none">
            {isHovering ? (
              <span className="text-[10px] font-bold tracking-wider px-2.5 py-1 bg-stone-950/90 text-amber-300 backdrop-blur-md rounded-full shadow-md flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>{zoomLevel}x Macro Texture Focus</span>
              </span>
            ) : (
              <span className="text-[10px] font-medium tracking-wide px-2.5 py-1 bg-white/90 text-stone-800 backdrop-blur-md rounded-full shadow-sm flex items-center gap-1">
                <ZoomIn className="w-3 h-3 text-stone-600" />
                <span>Hover or drag to inspect micro-texture</span>
              </span>
            )}
          </div>

          {/* Lightbox / Fullscreen Trigger */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsLightboxOpen(true);
            }}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white text-stone-700 hover:text-stone-950 shadow-sm backdrop-blur-md z-20 transition-all"
            title="Expand Ultra-HD Lightbox"
            aria-label="Expand Ultra-HD Lightbox"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          {/* Active Shade Swatch Accent if selected */}
          {selectedShade && (
            <div className="absolute bottom-3 left-3 z-20 pointer-events-none flex items-center gap-2 bg-stone-950/85 text-white backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-semibold shadow-md">
              <span
                className="w-3 h-3 rounded-full border border-white/60 shrink-0"
                style={{ backgroundColor: selectedShade.hex }}
              />
              <span className="truncate max-w-[150px]">{selectedShade.name}</span>
            </div>
          )}
        </div>

        {/* Magnification Controls Bar */}
        <div className="flex items-center justify-between pt-2 px-1 text-xs text-stone-600">
          {/* Zoom Factor Buttons */}
          <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-lg border border-stone-200">
            {[2.0, 2.8, 3.5].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setZoomLevel(lvl)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  zoomLevel === lvl
                    ? 'bg-stone-950 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-950'
                }`}
              >
                {lvl}x
              </button>
            ))}
          </div>

          {/* Magnifier Mode Toggle (Loupe Lens vs Container Pan) */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-stone-500 font-medium">Mode:</span>
            <button
              onClick={() => setMagnifierMode(magnifierMode === 'lens' ? 'pan' : 'lens')}
              className="text-[11px] font-semibold text-stone-900 bg-stone-100 hover:bg-stone-200 px-2.5 py-1 rounded-lg border border-stone-200 transition-colors flex items-center gap-1"
            >
              <Eye className="w-3 h-3 text-stone-600" />
              <span>{magnifierMode === 'lens' ? 'Floating Loupe' : 'Full Pan'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Multi-Angle Gallery Thumbnails */}
      <div className="grid grid-cols-3 gap-2.5 pt-1">
        {galleryImages.map((img, idx) => (
          <button
            key={img.id}
            onClick={() => setActiveImageIndex(idx)}
            className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all p-0.5 bg-stone-50 group text-left ${
              activeImageIndex === idx
                ? 'border-stone-950 shadow-sm ring-1 ring-stone-950'
                : 'border-stone-200 hover:border-stone-400 opacity-70 hover:opacity-100'
            }`}
          >
            <img src={img.url} alt={img.label} className="w-full h-full object-cover rounded-lg" />
            <span className="absolute bottom-1 inset-x-1 text-[9px] font-bold text-center bg-black/60 text-white rounded px-1 truncate backdrop-blur-2xs">
              {img.label}
            </span>
          </button>
        ))}
      </div>

      {/* Full-Screen Ultra-HD Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-60 bg-stone-950/95 backdrop-blur-md flex flex-col p-4 sm:p-8 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-4 border-b border-stone-800 text-white">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-300">
                Ultra-HD Texture Inspection
              </span>
              <span className="text-stone-500">·</span>
              <span className="font-serif text-base font-bold text-white truncate max-w-md">
                {product.name}
              </span>
            </div>

            <button
              onClick={() => setIsLightboxOpen(false)}
              className="p-2 text-stone-400 hover:text-white rounded-full hover:bg-stone-800 transition-colors"
              aria-label="Close lightbox"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center p-4 overflow-hidden relative">
            <img
              src={currentImage}
              alt={product.name}
              className="max-h-[80vh] max-w-full object-contain rounded-xl shadow-2xl"
            />
          </div>

          <div className="flex items-center justify-center gap-3 pt-4 border-t border-stone-800 text-stone-400 text-xs">
            <span>Click thumbnail angles or use the precision loupe in the product modal to inspect micro-shimmer.</span>
          </div>
        </div>
      )}
    </div>
  );
};
