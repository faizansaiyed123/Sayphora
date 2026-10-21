import { Product, FreeSample } from '../../src/types';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'fenty-pro-filtr-foundation',
    name: "Pro Filt'r Soft Matte Longwear Liquid Foundation",
    brand: 'Fenty Beauty by Rihanna',
    category: 'Makeup',
    subcategory: 'Foundation',
    price: 40.00,
    rating: 4.8,
    reviewCount: 14280,
    isBestseller: true,
    isClean: false,
    stockLeft: 6,
    coverage: 'Medium',
    finish: 'Matte',
    skinTypes: ['Oily', 'Combination', 'Normal'],
    awards: 'Allure Best of Beauty Award Winner',
    description: 'A soft matte, longwear foundation featuring climate-adaptive technology to fight heat and sweat without clogging pores or settling into fine lines.',
    details: [
      'Gives skin an instantly smooth, pore-diffused, shine-free finish',
      'Medium-to-full buildable coverage that feels weightless',
      'Sweat- and humidity-resistant formula',
      'Oil-free, non-comedogenic'
    ],
    howToUse: [
      'Be sure to moisturize skin before foundation application, especially if your skin is dry.',
      'Always shake before use to activate.',
      'For full coverage, dispense 1–2 pumps on the back of your hand and dot onto skin using a foundation brush.',
      'For medium, customizable coverage, use a damp beauty sponge.'
    ],
    ingredients: 'Water, Dimethicone, Talc, Peg-10 Dimethicone, Trimethylsiloxysilicate, Polypropylene, Isododecane, Cetyl Peg/Ppg-10/1 Dimethicone, Nylon-12, Hdi/Trimethylol Hexyllactone Crosspolymer, Phenoxyethanol, Sodium Chloride, Hydrogen Dimethicone, Glycerin, Magnesium Sulfate, Sodium Dehydroacetate, Disteardimonium Hectorite, Aluminum Hydroxide, Methicone, Benzoic Acid, Dehydroacetic Acid, Propylene Carbonate, Ethylhexylglycerin, Parfum/Fragrance, Silica, Biosaccharide Gum-4, Ananas Sativus (Pineapple) Fruit Extract, Carica Papaya (Papaya) Fruit Extract, Paullinia Cupana Seed Extract, Potassium Sorbate, Sorbic Acid.',
    ingredientAnalysis: {
      cleanStandard: 'Clinical',
      comedogenicRating: 1,
      phLevel: 6.2,
      allergensFree: ['Paraben-Free', 'Phthalate-Free', 'Gluten-Free', 'Cruelty-Free'],
      actives: [
        { name: 'Papaya & Pineapple Enzymes', purpose: 'Smooths micro-texture over time', safetyScore: 1 },
        { name: 'Climate-Adaptive Polymers', purpose: 'Resists humidity & sweat perspiration', safetyScore: 2 },
        { name: 'Glycerin Matrix', purpose: 'Maintains skin hydration without oiliness', safetyScore: 1 }
      ]
    },
    frequentlyBoughtWith: ['rare-beauty-soft-pinch-blush', 'charlotte-tilbury-flawless-filter'],
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&auto=format&fit=crop&q=80',
    shades: [
      { id: '100', name: '100 - Very Fair with Neutral undertones', hex: '#fae3d2', inStock: true, finishType: 'Matte' },
      { id: '120', name: '120 - Fair with Warm Neutral undertones', hex: '#f7dcc6', inStock: true, finishType: 'Matte' },
      { id: '185', name: '185 - Light Medium with Neutral undertones', hex: '#eec7a9', inStock: true, finishType: 'Matte' },
      { id: '230', name: '230 - Medium with Warm undertones', hex: '#e5b694', inStock: true, finishType: 'Matte' },
      { id: '310', name: '310 - Tan with Warm Golden undertones', hex: '#cf986c', inStock: true, finishType: 'Matte' },
      { id: '390', name: '390 - Tan Deep with Warm Olive undertones', hex: '#b37748', inStock: true, finishType: 'Matte' },
      { id: '420', name: '420 - Deep with Warm undertones', hex: '#8a522f', inStock: true, finishType: 'Matte' },
      { id: '480', name: '480 - Very Deep with Neutral undertones', hex: '#5c351f', inStock: true, finishType: 'Matte' }
    ],
    sizes: ['32 mL / 1.08 fl oz']
  },
  {
    id: 'rare-beauty-soft-pinch-blush',
    name: 'Soft Pinch Liquid Blush',
    brand: 'Rare Beauty by Selena Gomez',
    category: 'Makeup',
    subcategory: 'Cheek',
    price: 23.00,
    rating: 4.9,
    reviewCount: 28950,
    isBestseller: true,
    isClean: true,
    stockLeft: 3,
    finish: 'Radiant',
    skinTypes: ['All', 'Dry', 'Combination', 'Normal', 'Sensitive'],
    awards: 'Viral TikTok Favorite & Community Choice 2026',
    description: 'An ultra-weightless, long-lasting liquid blush that blends and builds beautifully for a soft, healthy flush. Available in both matte and dewy finishes.',
    details: [
      'Infused with a botanical blend of lotus, gardenia, and white water lily',
      'A single dot provides high-impact, all-day color pigment',
      'Layer seamlessly over liquid/powder formulas without disturbing makeup',
      'Dermatologist tested and cruelty-free'
    ],
    howToUse: [
      'Gently remove excess product from applicator.',
      'Use the doe-foot applicator and place 1–2 dots onto each cheek.',
      'Use fingertips or a dense blush brush and gently pat into skin for a seamless finish.'
    ],
    ingredients: 'Hydrogenated Polyisobutene, Hydrogenated Poly(C6-14 Olefin), Mica, Octyldodecanol, Ethylene/Propylene/Styrene Copolymer, Trimethylsiloxysilicate, Isododecane, 1,2-Hexanediol, Disteardimonium Hectorite, Sorbitan Sesquioleate, Propylene Carbonate, Triethoxycaprylylsilane, Aluminum Hydroxide, Helianthus Annuus (Sunflower) Seed Oil, Gardenia Florida Fruit Extract, Nelumbo Nucifera (Sacred Lotus) Flower Extract, Nymphaea Odorata Root Extract.',
    ingredientAnalysis: {
      cleanStandard: 'Clean at Sayphora',
      comedogenicRating: 0,
      allergensFree: ['Sulfate-Free (SLS & SLES)', 'Paraben-Free', 'Fragrance-Free', 'Vegan', 'Cruelty-Free'],
      actives: [
        { name: 'Sacred Lotus Extract', purpose: 'Calms redness & balances skin', safetyScore: 1 },
        { name: 'White Water Lily Extract', purpose: 'Soothes dermal sensitivity', safetyScore: 1 },
        { name: 'Gardenia Flower Extract', purpose: 'Rich botanical antioxidant protection', safetyScore: 1 }
      ]
    },
    frequentlyBoughtWith: ['fenty-pro-filtr-foundation', 'dior-backstage-glow-palette'],
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&auto=format&fit=crop&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80',
    shades: [
      { id: 'hope', name: 'Hope - Nude Mauve (Dewy)', hex: '#d48888', inStock: true, finishType: 'Dewy' },
      { id: 'encourage', name: 'Encourage - Soft Neutral Pink (Dewy)', hex: '#c97384', inStock: true, finishType: 'Dewy' },
      { id: 'happy', name: 'Happy - Dewy Cool Pink', hex: '#e887a0', inStock: true, finishType: 'Dewy' },
      { id: 'joy', name: 'Joy - Dewy Muted Peach', hex: '#de8666', inStock: true, finishType: 'Dewy' },
      { id: 'worth', name: 'Worth - True Rose (Dewy)', hex: '#bd6574', inStock: true, finishType: 'Dewy' },
      { id: 'virtue', name: 'Virtue - Soft Terracotta (Dewy)', hex: '#cb7b61', inStock: true, finishType: 'Dewy' }
    ],
    sizes: ['7.5 mL / 0.25 fl oz']
  },
  {
    id: 'charlotte-tilbury-flawless-filter',
    name: 'Hollywood Flawless Filter Glow Booster',
    brand: 'Charlotte Tilbury',
    category: 'Makeup',
    subcategory: 'Complexion',
    price: 49.00,
    rating: 4.7,
    reviewCount: 9410,
    isBestseller: true,
    stockLeft: 8,
    coverage: 'Sheer',
    finish: 'Radiant',
    skinTypes: ['All', 'Dry', 'Normal', 'Combination'],
    description: 'A multi-purpose complexion booster infused with squalane and finely milled powders that blurs, smooths, and illuminates for a red-carpet supermodel glow.',
    details: [
      'Can be used as a primer, mixed with foundation, or as a liquid highlighter',
      'Airbrush polymers for a poreless, soft-focus finish',
      'Glossy oil gives a lightweight moisture glide',
      'Finely milled powders blur lines and texture'
    ],
    howToUse: [
      'Glow On: Apply underneath foundation for an all-over illuminated canvas.',
      'Mix In: Mix with your favorite foundation for sheer dewy coverage.',
      'Highlight: Dab onto high points of cheekbones, cupid’s bow, and brow bone.'
    ],
    ingredients: 'Aqua/Water/Eau, Hydrogenated Didecene, Isododecane, Mica, Glycerin, Propanediol, Squalane, Cetyl Peg/Ppg-10/1 Dimethicone, Isoamyl Laurate, Hydrogenated Styrene/Isoprene Copolymer, Sodium Chloride, Caprylic/Capric Triglyceride, Hydroxyacetophenone, Polyglyceryl-4 Isostearate, 1,2-Hexanediol, Caprylyl Glycol, Trisodium Ethylenediamine Disuccinate, Glycosaminoglycans, Hoya Lacunosa Flower Extract.',
    ingredientAnalysis: {
      cleanStandard: 'Clinical',
      comedogenicRating: 1,
      allergensFree: ['Cruelty-Free', 'Paraben-Free', 'Phthalate-Free'],
      actives: [
        { name: 'Olive Squalane', purpose: 'Mimics natural sebum for moisture replenishment', safetyScore: 1 },
        { name: 'Thai Hoya Flower Extract', purpose: 'Illuminates skin with natural bio-lipids', safetyScore: 1 },
        { name: 'Micro-Fine Airbrush Powders', purpose: 'Optically diffuses pores & wrinkles', safetyScore: 1 }
      ]
    },
    frequentlyBoughtWith: ['fenty-pro-filtr-foundation', 'dior-backstage-glow-palette'],
    image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&auto=format&fit=crop&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80',
    shades: [
      { id: '1-fair', name: '1 Fair - Pale with Neutral undertones', hex: '#fae6d9', inStock: true, finishType: 'Radiant' },
      { id: '2-fair', name: '2 Fair - Peach undertones', hex: '#f6dbcc', inStock: true, finishType: 'Radiant' },
      { id: '3-light', name: '3 Light/Medium - Golden undertones', hex: '#eec7a9', inStock: true, finishType: 'Radiant' },
      { id: '4.5-medium', name: '4.5 Medium - Golden olive undertones', hex: '#deaa83', inStock: true, finishType: 'Radiant' },
      { id: '6-tan', name: '6 Tan - Warm amber undertones', hex: '#c58b5b', inStock: true, finishType: 'Radiant' },
      { id: '7-deep', name: '7 Deep - Rich warm undertones', hex: '#945d3c', inStock: true, finishType: 'Radiant' }
    ],
    sizes: ['30 mL / 1.0 fl oz']
  },
  {
    id: 'glow-recipe-dew-drops',
    name: 'Watermelon Glow Niacinamide Dew Drops Serum',
    brand: 'Glow Recipe',
    category: 'Skincare',
    subcategory: 'Serums',
    price: 35.00,
    originalPrice: 38.00,
    rating: 4.8,
    reviewCount: 18200,
    isBestseller: true,
    isClean: true,
    isSale: true,
    stockLeft: 12,
    skinTypes: ['All', 'Dry', 'Oily', 'Combination', 'Normal'],
    description: 'A breakthrough multi-use highlighting serum that hydrates and visibly reduces the look of hyperpigmentation for an effortless, reflective dewy glow without mica or glitter.',
    details: [
      'Niacinamide (Vitamin B3) visibly evens skin tone and minimizes pores',
      'Watermelon amino acids hydrate and soothe irritated skin',
      'Hyaluronic acid delivers deep hydration',
      'Clean + Planet Positive verified'
    ],
    howToUse: [
      'As a treatment serum: Apply 1 pump before moisturizer to brighten and hydrate.',
      'As a makeup primer: Apply 1–2 pumps right before foundation for a lit-from-within finish.',
      'Over makeup: Tap a small drop onto high points for instant glass-skin radiance.'
    ],
    ingredients: 'Aqua/Water/Eau, Propanediol, Glycereth-26, Glycerin, Niacinamide, 2,3-Butanediol, 1,2-Hexanediol, Cetyl Ethylhexanoate, Citrullus Lanatus (Watermelon) Fruit Extract, Sodium Hyaluronate, Eclipta Prostrata Extract, Melia Azadirachta Leaf Extract, Moringa Oleifera Seed Oil, Fragrance/Parfum.',
    ingredientAnalysis: {
      cleanStandard: 'Clean at Sayphora',
      comedogenicRating: 0,
      phLevel: 5.8,
      allergensFree: ['Silicone-Free', 'Mineral Oil-Free', 'Vegan', 'Cruelty-Free', 'Paraben-Free'],
      actives: [
        { name: 'Niacinamide (Vitamin B3)', purpose: 'Evens tone, refines pores & fades spots', safetyScore: 1 },
        { name: 'Watermelon Extract', purpose: 'Vitamins A & C to hydrate & plump cells', safetyScore: 1 },
        { name: 'Hyaluronic Acid Complex', purpose: 'Binds 1000x its weight in moisture', safetyScore: 1 }
      ]
    },
    frequentlyBoughtWith: ['tatcha-water-cream', 'drunk-elephant-babyfacial'],
    image: 'https://images.unsplash.com/photo-1608248597359-5776d5423f05?w=800&auto=format&fit=crop&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80',
    sizes: ['40 mL / 1.35 fl oz', '15 mL / 0.5 fl oz']
  },
  {
    id: 'tatcha-water-cream',
    name: 'The Water Cream Pore-Refining Hydrating Moisturizer',
    brand: 'Tatcha',
    category: 'Skincare',
    subcategory: 'Moisturizers',
    price: 72.00,
    rating: 4.6,
    reviewCount: 7850,
    isBestseller: true,
    isClean: true,
    stockLeft: 5,
    skinTypes: ['Oily', 'Combination', 'Normal'],
    awards: 'Luxury Skincare Trophy 2025',
    description: 'An oil-free, water-burst moisturizer packed with Japanese wild rose and leopard lily to clarify and minimize the appearance of pores while delivering refreshing nutrient-rich hydration.',
    details: [
      'Releases a burst of Japanese nutrients and hydration upon skin contact',
      'Japanese Wild Rose visibly tightens pores and smooths skin texture',
      'Japanese Leopard Lily controls excess oil and clarifies skin',
      'Infused with 23-karat gold dust for an imperceptible subtle radiance'
    ],
    howToUse: [
      'Scoop a pearl-sized amount of cream using the included golden spoon.',
      'Massage gently onto face, neck, and décolletage in upward strokes morning and night.'
    ],
    ingredients: 'Aqua/Water/Eau, Saccharomyces/Camellia Sinensis Leaf/Cladosiphon Okamuranus/Rice Ferment Filtrate, Dimethicone, Propanediol, Glycerin, Diglycerin, Diphenylsiloxy Phenyl Trimethicone, Gold, Belamcanda Chinensis Root Extract, Rosa Multiflora Fruit Extract, Houttuynia Cordata Extract, Sophora Angustifolia Root Extract, Sodium Hyaluronate.',
    ingredientAnalysis: {
      cleanStandard: 'Clean at Sayphora',
      comedogenicRating: 1,
      phLevel: 5.5,
      allergensFree: ['Non-comedogenic', 'Mineral Oil-Free', 'Synthetic Fragrance-Free', 'Dermatologist Tested'],
      actives: [
        { name: 'Hadasei-3™ Bio-Ferment', purpose: 'Triple fermented green tea, rice & algae', safetyScore: 1 },
        { name: 'Japanese Wild Rose', purpose: 'Tightens pore architecture and smooths texture', safetyScore: 1 },
        { name: 'Japanese Leopard Lily', purpose: 'Calms excess sebum production & skin irritation', safetyScore: 1 }
      ]
    },
    frequentlyBoughtWith: ['glow-recipe-dew-drops', 'laneige-lip-sleeping-mask'],
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&auto=format&fit=crop&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80',
    sizes: ['50 mL / 1.7 fl oz', '75 mL / 2.5 fl oz Value Size']
  },
  {
    id: 'sol-de-janeiro-bum-bum',
    name: 'Brazilian Bum Bum Firming Body Cream',
    brand: 'Sol de Janeiro',
    category: 'Bath & Body',
    subcategory: 'Body Moisturizers',
    price: 48.00,
    rating: 4.9,
    reviewCount: 31200,
    isBestseller: true,
    isClean: true,
    stockLeft: 14,
    awards: 'All-Time Sephora Community Hall of Fame',
    description: 'A fast-absorbing, award-winning body cream that visibly firms and tightens skin while enveloping your body in the iconic Cheirosa 62 scent with notes of salted caramel, pistachio, and vanilla.',
    details: [
      'Guaraná extract contains 5x the caffeine of coffee to visibly firm and smooth',
      'Cupuaçu butter locks in moisture and supports skin elasticity',
      'Açaí oil provides potent antioxidant defense',
      'Coconut oil melts into skin to condition and soften'
    ],
    howToUse: [
      'Massage in a circular motion to create warmth for better absorption and circulation.',
      'Use all over the body, paying special attention to legs, bum, tummy, and arms.'
    ],
    ingredients: 'Aqua (Water, Eau), Methyl Glucose Sesquistearate, Phenyl Trimethicone, Dodecane, Caprylic/Capric Triglyceride, Glyceryl Stearate Citrate, Parfum (Fragrance), Cetearyl Alcohol, Sodium Hyaluronate, Cocos Nucifera (Coconut) Oil, Euterpe Oleracea Fruit (Açaí) Oil, Theobroma Grandiflorum (Cupuaçu) Seed Butter, Paullinia Cupana (Guaraná) Seed Extract.',
    ingredientAnalysis: {
      cleanStandard: 'Clean at Sayphora',
      comedogenicRating: 2,
      allergensFree: ['Gluten-Free', 'Soy-Free', 'Paraben-Free', 'Cruelty-Free'],
      actives: [
        { name: 'Caffeine-Rich Guaraná Extract', purpose: 'Visibly tightens and firms dermal tissue', safetyScore: 1 },
        { name: 'Cupuaçu Butter', purpose: 'Infuses deep, long-lasting fatty acid hydration', safetyScore: 1 },
        { name: 'Açaí Oil', purpose: 'Protects skin from environmental pollution', safetyScore: 1 }
      ]
    },
    frequentlyBoughtWith: ['maison-margiela-by-the-fireplace'],
    image: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=800&auto=format&fit=crop&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80',
    sizes: ['240 mL / 8.1 fl oz', '75 mL / 2.5 fl oz Travel']
  },
  {
    id: 'maison-margiela-by-the-fireplace',
    name: 'REPLICA By the Fireplace Eau de Toilette',
    brand: 'Maison Margiela',
    category: 'Fragrance',
    subcategory: 'Warm & Spicy',
    price: 165.00,
    rating: 4.8,
    reviewCount: 4290,
    isBestseller: true,
    stockLeft: 4,
    description: 'A warm, cozy amber-woody fragrance capturing the comforting scent of roasted chestnuts, crackling firewood, and sweet vanilla on a snowy winter evening in Chamonix.',
    details: [
      'Top Notes: Clove Oil, Pink Pepper, Orange Flower Petals',
      'Middle Notes: Chestnut Accord, Gaïac Wood Oil, Cade Oil',
      'Base Notes: Vanilla Accord, Peru Balsam, Cashmeran',
      'Long-lasting Eau de Toilette formulation'
    ],
    howToUse: [
      'Fragrance is intensified by the warmth of your own body.',
      'Apply in the creases of your knees and elbows for a longer-lasting, stronger scent.',
      'Avoid rubbing or dabbing skin after application to preserve top note integrity.'
    ],
    ingredients: 'Alcohol, Parfum / Fragrance, Aqua / Water / Eau, Benzyl Alcohol, Butyl Methoxydibenzoylmethane, Ethylhexyl Methoxycinnamate, Linalool, Isoeugenol, Benzyl Benzoate, Eugenol, Limonene, Benzyl Cinnamate, Ci 15985 / Yellow 6, Geraniol, Ci 19140 / Yellow 5, Bht, Ci 17200 / Red 33, Ci 60730 / Ext. Violet 2.',
    frequentlyBoughtWith: ['sol-de-janeiro-bum-bum'],
    image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&auto=format&fit=crop&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=800&auto=format&fit=crop&q=80',
    sizes: ['100 mL / 3.4 oz', '30 mL / 1.0 oz', '10 mL / 0.34 oz Travel Spray']
  },
  {
    id: 'dior-backstage-glow-palette',
    name: 'Backstage Glow Face Palette',
    brand: 'DIOR',
    category: 'Makeup',
    subcategory: 'Highlighter',
    price: 48.00,
    rating: 4.9,
    reviewCount: 6100,
    isBestseller: true,
    stockLeft: 7,
    finish: 'Radiant',
    skinTypes: ['All'],
    description: 'The secret weapon of Dior runway makeup artists: four multi-dimensional shades of luminous powders that instantly illuminate any complexion with buildable custom glow.',
    details: [
      'Ultra-fine, concentrated mother-of-pearl textures for weightless glow',
      'Four complementary tones: Strobe White, Gold, Blush Rose, and Bronze',
      'Can be applied on cheeks, temples, décolletage, and eyes',
      'Non-chalky, long-wearing radiance'
    ],
    howToUse: [
      'Apply with a blush or fan brush on the high points of the face.',
      'Use the blush shade on the apples of your cheeks for a sculpted sheen.',
      'Mix all four shades together for a bespoke multidimensional veil of light.'
    ],
    ingredients: 'Mica, Cetearyl Ethylhexanoate, Hdi/Trimethylol Hexyllactone Crosspolymer, Squalane, Octyldodecyl Stearoyl Stearate, Glycerin, Polysorbate 20, Caprylyl Glycol, Ethylhexylglycerin, 1,2-Hexanediol, Chondrus Crispus (Carrageenan), Xanthan Gum, Pentaerythrityl Tetra-Di-T-Butyl Hydroxyhydrocinnamate, Silica.',
    frequentlyBoughtWith: ['rare-beauty-soft-pinch-blush', 'fenty-pro-filtr-foundation'],
    image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&auto=format&fit=crop&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80',
    shades: [
      { id: '001-universal', name: '001 Universal - White, Gold, Pink, Bronze', hex: '#f0d9b5', inStock: true, finishType: 'Radiant' },
      { id: '002-glitz', name: '002 Glitz - Peach, Bronze, Gold, Holographic White', hex: '#e8af89', inStock: true, finishType: 'Radiant' }
    ],
    sizes: ['10 g / 0.35 oz']
  },
  {
    id: 'olaplex-no-7-bonding-oil',
    name: 'No. 7 Bonding Oil Heat Protectant',
    brand: 'Olaplex',
    category: 'Haircare',
    subcategory: 'Hair Oils',
    price: 30.00,
    rating: 4.7,
    reviewCount: 16500,
    isBestseller: true,
    isClean: true,
    stockLeft: 11,
    description: 'A highly-concentrated, weightless styling oil that increases shine, softness, and color vibrancy while providing heat protection up to 450°F (232°C).',
    details: [
      'Repairs damaged and compromised hair bonds with patented Bis-Aminopropyl Diglycol Dimaleate',
      'Strengthens hair structure and protects against daily thermal and UV stressors',
      'Controls flyaways and frizz for up to 72 hours',
      'Safe for all hair types and color-treated locks'
    ],
    howToUse: [
      'Turn the bottle upside down and gently tap the index finger on the bottom of the bottle to dispense a metered drop.',
      'Apply a small amount to damp or dry hair, style as desired.',
      'Re-apply sparingly to dry hair to tame static or refresh ends.'
    ],
    ingredients: 'Dimethicone, Isohexadecane, C13-14 Isoparaffin, Coco-Caprylate, Phenyl Trimethicone, Bis-Aminopropyl Diglycol Dimaleate, Propanediol, Zea Mays (Corn) Oil, Beta-Carotene, Helianthus Annuus (Sunflower) Seed Oil, Moringa Oleifera Seed Oil, Punica Granatum Seed Oil, Water (Aqua), Morinda Citrifolia Fruit Powder, Fragrance (Parfum), Hexyl Cinnamal, Limonene.',
    frequentlyBoughtWith: ['dyson-airwrap-styler'],
    image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=800&auto=format&fit=crop&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80',
    sizes: ['30 mL / 1.0 fl oz']
  },
  {
    id: 'dyson-airwrap-styler',
    name: 'Airwrap Multi-Styler Complete Long',
    brand: 'Dyson',
    category: 'Tools & Brushes',
    subcategory: 'Hair Tools',
    price: 599.00,
    rating: 4.8,
    reviewCount: 11200,
    isBestseller: true,
    stockLeft: 2,
    awards: 'Tech & Beauty Innovation Grand Prix',
    description: 'Dry, curl, shape, smooth, and hide flyaways with no extreme heat. Powered by the Dyson digital motor V9 and the aerodynamic Coanda effect for voluminous, salon-quality styling.',
    details: [
      'Intelligent heat control measures airflow temperature over 40 times a second',
      'Includes re-engineered barrels that curl in both directions with one click',
      'Coanda smoothing dryer hides flyaways in a single pass',
      'Storage case cushioned with soft fabric included'
    ],
    howToUse: [
      'Start with damp, 80% dry hair for curling attachments.',
      'Hold the barrel vertically and bring hair section near the barrel; the Coanda airflow will wrap the hair automatically.',
      'Hold for 10–15 seconds, push the cold shot button for 5–10 seconds to set the curl, then release.'
    ],
    ingredients: 'Engineered from ultra-lightweight high-grade heat resistant alloys, ceramic tourmaline ionization core, and copper accents.',
    frequentlyBoughtWith: ['olaplex-no-7-bonding-oil'],
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=800&auto=format&fit=crop&q=80',
    shades: [
      { id: 'prussian-blue-copper', name: 'Prussian Blue & Rich Copper', hex: '#1b2a47', inStock: true },
      { id: 'nickel-copper', name: 'Nickel & Copper', hex: '#8a7d71', inStock: true },
      { id: 'strawberry-bronze', name: 'Strawberry Bronze & Blush Pink', hex: '#d99b9b', inStock: true }
    ],
    sizes: ['Complete Long Set']
  },
  {
    id: 'laneige-lip-sleeping-mask',
    name: 'Lip Sleeping Mask Intense Hydration',
    brand: 'Laneige',
    category: 'Skincare',
    subcategory: 'Lip Treatments',
    price: 24.00,
    rating: 4.8,
    reviewCount: 24700,
    isBestseller: true,
    isClean: true,
    stockLeft: 9,
    skinTypes: ['All', 'Dry'],
    description: 'A leave-on lip mask that delivers intensive moisture and antioxidants while you sleep with Berry Fruit Complex, Murumuru seed, and Shea butter.',
    details: [
      'Berry Fruit Complex rich in Vitamin C and antioxidants helps smooth dry flakey lips',
      'Moisture Wrap technology locks in hydration and active ingredients overnight',
      'Includes custom spatula applicator for hygienic dipping',
      'Wake up with ultra-soft, supple, plumper-looking lips'
    ],
    howToUse: [
      'Before going to bed at night, apply an adequate amount on the lips using the built-in spatula.',
      'The next morning, gently wipe the lips clean with tissue or cotton pad.'
    ],
    ingredients: 'Diisostearyl Malate, Hydrogenated Polyisobutene, Phytosteryl/Isostearyl/Cetyl/Stearyl/Behenyl Dimer Dilinoleate, Hydrogenated Poly(C6-14 Olefin), Polybutene, Microcrystalline Wax / Cera Microcristallina / Cire Microcristalline, Butyrospermum Parkii (Shea) Butter, Synthetic Wax, Euphorbia Cerifera (Candelilla) Wax, Sucrose Tetrastearate Triacetate, Butylene/Ethylene/Styrene Copolymer, Astrocaryum Murumuru Seed Butter.',
    ingredientAnalysis: {
      cleanStandard: 'Clean at Sayphora',
      comedogenicRating: 1,
      allergensFree: ['Paraben-Free', 'Phthalate-Free', 'Cruelty-Free'],
      actives: [
        { name: 'Berry Fruit Complex™', purpose: 'Concentrated Vitamin C antioxidant shield', safetyScore: 1 },
        { name: 'Murumuru Seed Butter', purpose: 'Restores delicate lip lipid barrier', safetyScore: 1 },
        { name: 'Hyaluronic Acid Micro-Spheres', purpose: 'Deep 8-hour lip plumping moisture', safetyScore: 1 }
      ]
    },
    frequentlyBoughtWith: ['tatcha-water-cream', 'glow-recipe-dew-drops'],
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&auto=format&fit=crop&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&auto=format&fit=crop&q=80',
    shades: [
      { id: 'berry', name: 'Berry (Sweet & Fruity)', hex: '#e64980', inStock: true, finishType: 'Glossy' },
      { id: 'sweet-candy', name: 'Sweet Candy', hex: '#f06595', inStock: true, finishType: 'Glossy' },
      { id: 'vanilla', name: 'Vanilla Buttercream', hex: '#ffec99', inStock: true, finishType: 'Glossy' },
      { id: 'caramel', name: 'Salted Caramel', hex: '#d9822b', inStock: true, finishType: 'Glossy' }
    ],
    sizes: ['20 g / 0.70 oz']
  },
  {
    id: 'drunk-elephant-babyfacial',
    name: 'T.L.C. Sukari Babyfacial 25% AHA / 2% BHA Mask',
    brand: 'Drunk Elephant',
    category: 'Skincare',
    subcategory: 'Exfoliators & Peels',
    price: 80.00,
    originalPrice: 90.00,
    rating: 4.7,
    reviewCount: 9320,
    isBestseller: true,
    isClean: true,
    isSale: true,
    stockLeft: 4,
    skinTypes: ['Normal', 'Oily', 'Combination'],
    description: 'A pro-quality facial that resurfaces skin to reveal improved clarity, baby-soft texture, and radiant luminosity while visibly minimizing fine lines and enlarged pores.',
    details: [
      '25% AHA Blend (Glycolic, Tartaric, Lactic, Citric) sweeps away dead skin cells',
      '2% Salicylic Acid (BHA) unblocks clogged pores from deep within',
      'Chickpea flour balances and brightens tone',
      'Formulated at the ideal skin-compatible pH of 3.5'
    ],
    howToUse: [
      'Use once weekly on clean, dry skin.',
      'Apply an even layer over face and neck, avoiding the eye area.',
      'Leave on for 20 minutes, then rinse thoroughly with lukewarm water.',
      'Follow immediately with a soothing luxury facial oil like Marula oil.'
    ],
    ingredients: 'Water/Aqua/Eau, Glycolic Acid, Hydroxyethyl Acrylate/Sodium Acryloyldimethyl Taurate Copolymer, Glycerin, Sodium Hydroxide, Salicylic Acid, Aloe Barbadensis Leaf Extract, Camellia Sinensis Leaf Extract, Lactobacillus/Pumpkin Ferment Extract, Lactobacillus/Punica Granatum Fruit Ferment Extract, Opuntia Ficus-Indica Extract, Pyrus Malus (Apple) Fruit Extract, Tartaric Acid, Lactic Acid, Citric Acid.',
    ingredientAnalysis: {
      cleanStandard: 'Clean at Sayphora',
      comedogenicRating: 0,
      phLevel: 3.5,
      allergensFree: ['Fragrance-Free', 'Silicone-Free', 'Essential Oil-Free', 'Drying Alcohol-Free', 'Vegan'],
      actives: [
        { name: '25% AHA Blend (Glycolic, Tartaric, Lactic)', purpose: 'Exfoliates surface dullness & accelerates cellular renewal', safetyScore: 2 },
        { name: '2% BHA (Salicylic Acid)', purpose: 'Deep pore unclogging & blackhead reduction', safetyScore: 2 },
        { name: 'Pumpkin & Pomegranate Ferment', purpose: 'Enzymatic smoothing without mechanical scrubbing', safetyScore: 1 }
      ]
    },
    frequentlyBoughtWith: ['tatcha-water-cream', 'glow-recipe-dew-drops'],
    image: 'https://images.unsplash.com/photo-1608248597359-5776d5423f05?w=800&auto=format&fit=crop&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80',
    sizes: ['50 mL / 1.69 fl oz']
  }
];

export const COMPLIMENTARY_SAMPLES: FreeSample[] = [
  {
    id: 'sample-rare-oil',
    name: 'Find Comfort Hydrating Body & Hair Oil Sample',
    brand: 'Rare Beauty',
    category: 'Bath & Body',
    image: 'https://images.unsplash.com/photo-1608248597359-5776d5423f05?w=200&auto=format&fit=crop&q=80'
  },
  {
    id: 'sample-ysl-libre',
    name: 'Libre Eau de Parfum Deluxe Vial',
    brand: 'Yves Saint Laurent',
    category: 'Fragrance',
    image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=200&auto=format&fit=crop&q=80'
  },
  {
    id: 'sample-tatcha-essence',
    name: 'The Essence Plumping Skin Softener Mini',
    brand: 'Tatcha',
    category: 'Skincare',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=200&auto=format&fit=crop&q=80'
  },
  {
    id: 'sample-olaplex-no3',
    name: 'No. 3 Hair Perfector Intensive Bond Builder',
    brand: 'Olaplex',
    category: 'Haircare',
    image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=200&auto=format&fit=crop&q=80'
  }
];

export const MOCK_REVIEWS: Record<string, import('../../src/types').Review[]> = {
  'fenty-pro-filtr-foundation': [
    {
      id: 'rev-1',
      productId: 'fenty-pro-filtr-foundation',
      userName: 'Camille R.',
      userBadge: 'Rouge Member',
      rating: 5,
      date: 'October 12, 2026',
      title: 'Holy grail foundation for oily & combination skin!',
      comment: 'I have been using this foundation since it first launched and nothing beats it. Shade 230 matches my warm undertone so seamlessly that people think I am not wearing foundation at all. Stays matte for 12+ hours without caking or creasing around smile lines.',
      verifiedPurchase: true,
      shadeUsed: '230 - Medium with Warm undertones',
      skinType: 'Oily',
      skinTone: 'Medium',
      undertone: 'Warm',
      recommended: true,
      helpfulCount: 84,
      unhelpfulCount: 2,
      photos: [
        'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&auto=format&fit=crop&q=80'
      ]
    },
    {
      id: 'rev-2',
      productId: 'fenty-pro-filtr-foundation',
      userName: 'Sienna V.',
      userBadge: 'VIB Member',
      rating: 5,
      date: 'October 3, 2026',
      title: 'Humidity resistant perfection for summer events',
      comment: 'Wore this during an outdoor wedding in 85 degree humid weather and my face stayed immaculate through dancing all night. Just prep well with hydrating moisturizer!',
      verifiedPurchase: true,
      shadeUsed: '310 - Tan with Warm Golden undertones',
      skinType: 'Combination',
      skinTone: 'Tan',
      undertone: 'Warm',
      recommended: true,
      helpfulCount: 42,
      unhelpfulCount: 1,
      photos: [
        'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&auto=format&fit=crop&q=80'
      ]
    },
    {
      id: 'rev-3',
      productId: 'fenty-pro-filtr-foundation',
      userName: 'Isabelle K.',
      userBadge: 'Verified Buyer',
      rating: 4,
      date: 'September 28, 2026',
      title: 'Great coverage, apply with damp sponge for best results',
      comment: 'Dries quickly so work in sections! Once set, it does not transfer onto collars or phones at all. A true matte finish.',
      verifiedPurchase: true,
      shadeUsed: '120 - Fair with Warm Neutral undertones',
      skinType: 'Normal',
      skinTone: 'Fair',
      undertone: 'Neutral',
      recommended: true,
      helpfulCount: 19,
      unhelpfulCount: 0
    }
  ],
  'rare-beauty-soft-pinch-blush': [
    {
      id: 'rev-4',
      productId: 'rare-beauty-soft-pinch-blush',
      userName: 'Elena M.',
      userBadge: 'Rouge Member',
      rating: 5,
      date: 'October 14, 2026',
      title: 'Hope is the prettiest everyday watercolor blush shade ever',
      comment: 'All you need is literally half a dot! The pigment payoff is unbelievable and blends so smoothly with fingertips or a stippling brush. Will never go back to powder blush.',
      verifiedPurchase: true,
      shadeUsed: 'Hope - Nude Mauve (Dewy)',
      skinType: 'Dry',
      skinTone: 'Light',
      undertone: 'Neutral',
      recommended: true,
      helpfulCount: 129,
      unhelpfulCount: 3,
      photos: [
        'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80'
      ]
    },
    {
      id: 'rev-5',
      productId: 'rare-beauty-soft-pinch-blush',
      userName: 'Chloe P.',
      userBadge: 'Verified Buyer',
      rating: 5,
      date: 'October 9, 2026',
      title: 'Encourage gives the most natural pinched-cheek glow',
      comment: 'The dewy finish melts right into bare skin or foundation. It lasts a full 10-hour work shift without fading.',
      verifiedPurchase: true,
      shadeUsed: 'Encourage - Soft Neutral Pink',
      skinType: 'Combination',
      skinTone: 'Medium',
      undertone: 'Cool',
      recommended: true,
      helpfulCount: 56,
      unhelpfulCount: 1,
      photos: [
        'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&auto=format&fit=crop&q=80'
      ]
    }
  ],
  'glow-recipe-dew-drops': [
    {
      id: 'rev-6',
      productId: 'glow-recipe-dew-drops',
      userName: 'Aria S.',
      userBadge: 'Rouge Member',
      rating: 5,
      date: 'October 10, 2026',
      title: 'Glass skin in a bottle without any mica glitter!',
      comment: 'I mix half a pump into my daily SPF and skin looks lit from within. Niacinamide also helped diminish the look of post-blemish redness.',
      verifiedPurchase: true,
      skinType: 'Combination',
      skinTone: 'Fair',
      recommended: true,
      helpfulCount: 91,
      unhelpfulCount: 2,
      photos: [
        'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80'
      ]
    }
  ],
  'tatcha-water-cream': [
    {
      id: 'rev-7',
      productId: 'tatcha-water-cream',
      userName: 'Marissa T.',
      userBadge: 'VIB Member',
      rating: 5,
      date: 'October 8, 2026',
      title: 'The burst of water feeling is divine on pore-prone skin',
      comment: 'Non-comedogenic and leaves skin velvety smooth without any greasy film. The 23k gold dust gives a truly decadent ritual feel.',
      verifiedPurchase: true,
      skinType: 'Oily',
      skinTone: 'Light',
      recommended: true,
      helpfulCount: 67,
      unhelpfulCount: 1,
      photos: [
        'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80'
      ]
    }
  ]
};
