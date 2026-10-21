/** Starter boutique network. Replace with your real store locations via SQL or the admin API. */
export interface BoutiqueSeed {
  id: string;
  name: string;
  address: string;
  city: string;
  mapUri: string;
  rating: number;
  reviewsCount: number;
  phone: string;
  services: string[];
  snippets: string[];
  inStockItems: string[];
}

const maps = (q: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

export const BOUTIQUES: BoutiqueSeed[] = [
  {
    id: 'atelier-nyc-5th',
    name: 'Sayphora Flagship Atelier — Fifth Avenue',
    address: '580 5th Avenue, New York, NY 10036',
    city: 'New York',
    mapUri: maps('580 5th Avenue New York NY 10036'),
    rating: 4.9,
    reviewsCount: 1420,
    phone: '+1 (212) 555-0182',
    services: ['Complimentary Shade Matching', 'Dior & Fenty Beauty Bar', 'Custom Fragrance Engraving', 'Same-Day 2hr Pickup'],
    snippets: ['Exceptional master colorists helped me find my exact foundation undertone within minutes.'],
    inStockItems: ["Pro Filt'r Soft Matte Foundation", 'Rare Beauty Liquid Blush', 'Tatcha Water Cream']
  },
  {
    id: 'atelier-nyc-soho',
    name: 'Sayphora SoHo Atelier & Skincare Spa',
    address: '555 Broadway, New York, NY 10012',
    city: 'New York',
    mapUri: maps('555 Broadway New York NY 10012'),
    rating: 4.8,
    reviewsCount: 980,
    phone: '+1 (212) 555-0194',
    services: ['Clinical Hydrafacial Bar', 'Clean Beauty Pavilion', 'Curated Swatch Studio', 'Curbside Pickup'],
    snippets: ['Staff are immensely knowledgeable about acid percentages and sensitive skin regimens.'],
    inStockItems: ['Drunk Elephant Sukari Babyfacial', 'Glow Recipe Dew Drops', 'Laneige Lip Mask']
  },
  {
    id: 'atelier-paris-vendome',
    name: 'Sayphora Maison Haute Beauté — Place Vendôme',
    address: '12 Place Vendôme, 75001 Paris, France',
    city: 'Paris',
    mapUri: maps('12 Place Vendome Paris France'),
    rating: 4.95,
    reviewsCount: 2150,
    phone: '+33 1 42 68 55 00',
    services: ['Haute Parfumerie Consultations', 'Master Colorist Lab', 'VIP Private Salon', 'Tax-Free Luxury Packaging'],
    snippets: ['The shade matching lighting booths simulate morning sunlight, golden hour, and evening candlelight.'],
    inStockItems: ['DIOR Backstage Glow Face Palette', 'Maison Margiela REPLICA', 'Fenty Beauty Foundation']
  },
  {
    id: 'atelier-beverly-hills',
    name: 'Sayphora Beverly Hills Atelier & Glamour Suite',
    address: '9500 Wilshire Blvd, Beverly Hills, CA 90212',
    city: 'Los Angeles',
    mapUri: maps('9500 Wilshire Blvd Beverly Hills CA'),
    rating: 4.9,
    reviewsCount: 1680,
    phone: '+1 (310) 555-0143',
    services: ['Red Carpet Glow Consultations', 'Dyson Blowout & Styling Bar', 'VIP Valet', 'Same-Day Concierge Courier'],
    snippets: ['They have all hard-to-find viral beauty launches in stock with bespoke color matching.'],
    inStockItems: ['Charlotte Tilbury Hollywood Flawless Filter', 'Dyson Airwrap Multi-Styler', 'Sol de Janeiro Bum Bum Cream']
  },
  {
    id: 'atelier-london-covent',
    name: 'Sayphora London Atelier — Covent Garden Piazza',
    address: '28 The Market Building, London WC2E 8RB, United Kingdom',
    city: 'London',
    mapUri: maps('Covent Garden Market Building London WC2E 8RB'),
    rating: 4.85,
    reviewsCount: 1120,
    phone: '+44 20 7946 0912',
    services: ['British & Global Skincare Specialists', 'Express Makeup Touch-ups', 'Click & Collect 1hr', 'Recycling Beauty Drop-off'],
    snippets: ['Fabulous store in the historic market hall with the complete Rare Beauty and Charlotte Tilbury assortments.'],
    inStockItems: ['Rare Beauty Blush', 'Olaplex No. 7 Bonding Oil', 'Tatcha Water Cream']
  },
  {
    id: 'atelier-tokyo-ginza',
    name: 'Sayphora Ginza Six Flagship & Skin Longevity Lab',
    address: '6-10-1 Ginza, Chuo City, Tokyo 104-0061, Japan',
    city: 'Tokyo',
    mapUri: maps('Ginza Six Tokyo Japan'),
    rating: 4.92,
    reviewsCount: 1840,
    phone: '+81 3 5555 0166',
    services: ['J-Beauty & Western Luxury Fusion', 'Micro-Camera Skin Barrier Diagnostic', 'Bilingual Specialists', 'Duty Free Concierge'],
    snippets: ['The skin diagnostic machine accurately tailored my serum routine. Impeccable Japanese hospitality.'],
    inStockItems: ['Tatcha The Water Cream', 'Glow Recipe Dew Drops', 'Dior Backstage Palette']
  }
];
