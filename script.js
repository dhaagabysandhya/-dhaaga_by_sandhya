/* =========================================================
   DHAGA — script.js
   Handmade with Love. Styled with You.

   Sections
   1. CONFIG ............ edit WhatsApp number, Instagram URL here
   2. DATA .............. categories, navigation, PRODUCTS array
   3. HELPERS ........... formatting, escaping, storage, image fallback
   4. STATE MODULES ..... Cart (sessionStorage), Wishlist (localStorage)
   5. RENDERING ......... grid, chips, cart, wishlist, quick view
   6. LAYERS ............ drawers, modals, overlay, focus handling
   7. WHATSAPP ORDER .... message builder + two-step handoff
   8. INTERACTIONS ...... toast, fly-to-cart, reveal, events
   9. INIT
   ========================================================= */
'use strict';

/* =========================================================
   1. CONFIG — the only place you need to edit for contact info
   ========================================================= */
const CONFIG = {
  brandName: 'DHAGA',
  // Mobile number 7728990513 for WhatsApp orders
  whatsappNumber: '917728990513',
  whatsappDisplay: '+91 77289 90513',
  instagramUrl: 'https://www.instagram.com/your_dhaga_handle/',
  instagramHandle: '@dhaga.crochet',
  contactEmail: 'orders@dhaga.in',
  locale: 'en-IN',
  currency: 'INR',
  cartKey: 'dhaga_cart_v1',        // sessionStorage (per tab)
  wishlistKey: 'dhaga_wishlist_v1', // localStorage (per browser)
  profileKey: 'dhaga_order_profile_v1', // localStorage for saved delivery details
  maxQtyPerLine: 20,
};

/* =========================================================
   2. DATA
   ========================================================= */
const CATEGORIES = [
  { id: 'gajras',     name: 'Crochet Gajras',                short: 'Gajras',            desc: 'Blooming floral gajras for festive braids and everyday joy.',  image: 'assets/images/categories/gajras.jpg' },
  { id: 'bags',       name: 'Crochet Bags',                  short: 'Bags',              desc: 'Slings, totes and buckets stitched to carry your whole mood.', image: 'assets/images/categories/bags.jpg' },
  { id: 'keychains',  name: 'Crochet Keychains',             short: 'Keychains',         desc: 'Tiny amigurumi charms for your keys, bags and zips.',          image: 'assets/images/categories/keychains.jpg' },
  { id: 'hair',       name: 'Hair Accessories',              short: 'Hair Accessories',  desc: 'Scrunchies, clips and bows with a handmade twist.',            image: 'assets/images/categories/hair.jpg' },
  { id: 'bouquets',   name: 'Crochet Flower Bouquets',       short: 'Bouquets',          desc: 'Blooms that never wilt. Gift them, keep them, love them.',     image: 'assets/images/categories/bouquets.jpg' },
  { id: 'jewelry',    name: 'Crochet Jewelry',               short: 'Jewelry',           desc: 'Light-as-air earrings and necklaces with a pop of colour.',    image: 'assets/images/categories/jewelry.jpg' },
  { id: 'gifts',      name: 'Customized Gifts',              short: 'Gifts',             desc: 'Made-to-order pieces with names, colours and personal notes.', image: 'assets/images/categories/gifts.jpg' },
  { id: 'decor',      name: 'Crochet Coasters & Home Decor', short: 'Home Decor',        desc: 'Cosy coasters and mats to warm up every corner.',              image: 'https://images.unsplash.com/photo-1584589167171-541ce45f1eea?auto=format&fit=crop&w=600&q=80' },
  { id: 'pouches',    name: 'Crochet Pouches & Mini Wallets',short: 'Pouches',           desc: 'Pocket-sized stitched stashes for cards, coins and lip balm.', image: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=600&q=80' },
];

// A filter value is either 'all', a category id, or a group key below.
const FILTER_GROUPS = {
  accessories: { label: 'Accessories', categories: ['keychains', 'hair', 'jewelry', 'pouches'] },
};

const NAV_LINKS = [
  { label: 'Home',           href: '#top' },
  { label: 'Shop All',       href: '#shop', filter: 'all' },
  { label: 'Crochet Bags',   href: '#shop', filter: 'bags' },
  { label: 'Gajras',         href: '#shop', filter: 'gajras' },
  { label: 'Accessories',    href: '#shop', filter: 'accessories' },
  { label: 'Gifts',          href: '#shop', filter: 'gifts' },
];

const INSTAGRAM_TILES = [
  { src: 'assets/images/instagram/ig-1.jpg', alt: 'Handmade crochet red rose gajra styled in a braid' },
  { src: 'assets/images/instagram/ig-2.jpg', alt: 'Pink and pastel crochet sling bags' },
  { src: 'assets/images/instagram/ig-3.jpg', alt: 'Crochet ice cream cone keychains in a circle' },
  { src: 'assets/images/instagram/ig-4.jpg', alt: 'Crochet butterfly keychains with pearls and yarn' },
  { src: 'assets/images/instagram/ig-5.jpg', alt: 'Crochet sunflower and daisy bouquet with ribbon' },
  { src: 'assets/images/instagram/ig-6.jpg', alt: 'Crochet heart keychains with gift note' },
];

const COLORS = {
  red:      { name: 'Red',        hex: '#D1495B' },
  pink:     { name: 'Blush Pink', hex: '#F2A7B8' },
  white:    { name: 'Cream',      hex: '#FFF3E2' },
  yellow:   { name: 'Butter',     hex: '#F7E7A8' },
  lavender: { name: 'Lavender',   hex: '#BFAEF0' },
  sage:     { name: 'Sage',       hex: '#A9C5A0' },
  peach:    { name: 'Peach',      hex: '#F7B995' },
  sky:      { name: 'Sky',        hex: '#A9D4F0' },
  brown:    { name: 'Cocoa',      hex: '#8B6B5A' },
  black:    { name: 'Black',      hex: '#2E2623' },
};

const img = (slug, n = 1) => `assets/images/products/${slug}-${n}.jpg`;
const makeProduct = (o) => {
  const mainImage = o.image || img(o.slug, 1);
  return {
    image: mainImage,
    gallery: o.gallery || [mainImage, img(o.slug, 2), img(o.slug, 3)],
    variantLabel: 'Size',
    variants: [],
    isFeatured: false,
    isNewArrival: false,
    isBestseller: false,
    ...o,
  };
};

/* ---------------------------------------------------------
   PRODUCTS — 26 crochet pieces with uploaded photos and
   name-matching web image URLs.
   --------------------------------------------------------- */
const PRODUCTS = [
  // Gajras
  makeProduct({
    id: 1,
    slug: 'red-rose-gajra',
    name: 'Red Rose Crochet Hair Gajra',
    category: 'gajras',
    price: 299,
    image: 'assets/images/products/red-rose-hair-gajra.jpg',
    gallery: [
      'assets/images/products/red-rose-hair-gajra.jpg',
      'assets/images/products/rose-pearl-gajra.jpg'
    ],
    description: 'A lush gajra of handcrafted red crochet roses styled around a hair bun. Featherlight, everlasting and 100% crochet handmade.',
    availableColors: [COLORS.red, COLORS.pink, COLORS.white],
    isFeatured: true,
    isBestseller: true
  }),
  makeProduct({
    id: 2,
    slug: 'rose-pearl-gajra',
    name: 'Rose & Pearl Festive Crochet Gajra',
    category: 'gajras',
    price: 349,
    image: 'assets/images/products/rose-pearl-gajra.jpg',
    gallery: [
      'assets/images/products/rose-pearl-gajra.jpg',
      'assets/images/products/red-rose-hair-gajra.jpg'
    ],
    description: 'Festive handmade crochet red roses adorned with delicate white florets and pearls. Adds timeless charm to traditional hair buns and festive celebrations.',
    availableColors: [COLORS.red, COLORS.white, COLORS.pink],
    isFeatured: true,
    isNewArrival: true
  }),

  // Bags
  makeProduct({
    id: 4,
    slug: 'pink-sling-bag',
    name: 'Mini Crochet Crossbody Sling Bags',
    category: 'bags',
    price: 899,
    image: 'assets/images/products/crochet-mini-crossbody-bags.jpg',
    gallery: [
      'assets/images/products/crochet-mini-crossbody-bags.jpg',
      'assets/images/products/crochet-netted-tote-bags.jpg'
    ],
    description: 'Handcrafted crochet mini crossbody bags with chic metallic twist locks, silky tassel accents and chain straps in assorted vibrant colours.',
    availableColors: [COLORS.pink, COLORS.lavender, COLORS.peach, COLORS.black],
    variantLabel: 'Size',
    variants: ['Mini', 'Regular'],
    isFeatured: true,
    isBestseller: true
  }),
  makeProduct({
    id: 5,
    slug: 'butter-tote',
    name: 'Pastel Netted Crochet Market Totes',
    category: 'bags',
    price: 1299,
    image: 'assets/images/products/crochet-netted-tote-bags.jpg',
    gallery: [
      'assets/images/products/crochet-netted-tote-bags.jpg',
      'assets/images/products/crochet-mini-crossbody-bags.jpg'
    ],
    description: 'Airy open-weave crochet shoulder totes in cheerful pastel tones (butter yellow, peach, mint and lilac). Perfect for daily essentials.',
    availableColors: [COLORS.yellow, COLORS.white, COLORS.sage],
    isFeatured: true,
    isNewArrival: true
  }),
  makeProduct({
    id: 6,
    slug: 'lavender-bucket-bag',
    name: 'Lavender Bucket Bag',
    category: 'bags',
    price: 999,
    image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80',
      'assets/images/products/pink-sling-bag-1.jpg'
    ],
    description: 'A drawstring crochet bucket bag with braided strap and handmade charms in soothing lavender.',
    availableColors: [COLORS.lavender, COLORS.pink, COLORS.sky]
  }),
  makeProduct({
    id: 7,
    slug: 'granny-square-bag',
    name: 'Granny Square Shoulder Bag',
    category: 'bags',
    price: 1199,
    image: 'assets/images/products/granny-square-bag-1.jpg',
    gallery: [
      'assets/images/products/granny-square-bag-1.jpg',
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Handwoven artisanal crochet shoulder tote featuring scalloped stitches in happy pastel hues.',
    availableColors: [COLORS.peach, COLORS.sky, COLORS.sage],
    isBestseller: true
  }),

  // Keychains
  makeProduct({
    id: 8,
    slug: 'daisy-keychain',
    name: 'Handmade Crochet Heart Keychains',
    category: 'keychains',
    price: 149,
    image: 'assets/images/products/crochet-heart-keychains.jpg',
    gallery: [
      'assets/images/products/crochet-heart-keychains.jpg',
      'assets/images/products/crochet-fruit-keychains.jpg'
    ],
    description: 'Delightful handcrafted crochet heart charms with gold keychains in blush pink, lavender, butter cream and sky blue.',
    availableColors: [COLORS.white, COLORS.yellow, COLORS.pink],
    isBestseller: true
  }),
  makeProduct({
    id: 9,
    slug: 'strawberry-keychain',
    name: 'Amigurumi Fruit Keychains (Avocado, Banana, Berries)',
    category: 'keychains',
    price: 199,
    image: 'assets/images/products/crochet-fruit-keychains.jpg',
    gallery: [
      'assets/images/products/crochet-fruit-keychains.jpg',
      'assets/images/products/crochet-icecream-keychains.jpg'
    ],
    description: 'Cheerful amigurumi fruit keychains handcrafted in high definition: avocado, banana cluster, strawberry, orange, kiwi and apple.',
    availableColors: [COLORS.red, COLORS.pink],
    isNewArrival: true,
    isFeatured: true
  }),
  makeProduct({
    id: 10,
    slug: 'bear-keychain',
    name: 'Pastel Ice Cream Cone Charm Keychain',
    category: 'keychains',
    price: 179,
    image: 'assets/images/products/crochet-icecream-keychains.jpg',
    gallery: [
      'assets/images/products/crochet-icecream-keychains.jpg',
      'assets/images/products/crochet-heart-keychains.jpg'
    ],
    description: 'Crochet ice cream cone charms with textured waffle cones and colorful scoops. Gold key rings included.',
    availableColors: [COLORS.pink, COLORS.yellow, COLORS.white]
  }),

  // Hair accessories
  makeProduct({
    id: 13,
    slug: 'scrunchie-trio',
    name: 'Crochet Flower Scrunchie',
    category: 'hair',
    price: 249,
    image: 'assets/images/products/scrunchie-trio-1.jpg',
    gallery: [
      'assets/images/products/scrunchie-trio-1.jpg',
      'assets/images/products/red-rose-gajra-1.jpg'
    ],
    description: 'Handcrafted floral crochet hair scrunchie with soft white petals and central blossom. Stretchy and gentle on hair.',
    availableColors: [COLORS.pink, COLORS.lavender, COLORS.yellow, COLORS.peach]
  }),
  makeProduct({
    id: 14,
    slug: 'daisy-hair-clips',
    name: 'Daisy Hair Clips (Set of 4)',
    category: 'hair',
    price: 199,
    image: 'https://images.unsplash.com/photo-1535295972055-1c762f4483e5?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1535295972055-1c762f4483e5?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Four tiny crochet daisy clips for a fun, scattered flower look. Gentle grip on hair.',
    availableColors: [COLORS.white, COLORS.yellow, COLORS.pink],
    isBestseller: true,
    isFeatured: true
  }),
  makeProduct({
    id: 15,
    slug: 'bow-claw-clip',
    name: 'Bow Claw Clip',
    category: 'hair',
    price: 279,
    image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'A strong claw clip wrapped in a soft crochet bow. Effortless up-dos for all hair lengths.',
    availableColors: [COLORS.pink, COLORS.black, COLORS.lavender],
    isNewArrival: true
  }),

  // Bouquets
  makeProduct({
    id: 16,
    slug: 'tulip-bouquet',
    name: 'Everlasting Tulip Bouquet',
    category: 'bouquets',
    price: 699,
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
      'assets/images/products/sunflower-bouquet-1.jpg'
    ],
    description: 'Hand-stitched tulips wrapped in craft paper with a satin ribbon. A bouquet that stays fresh forever.',
    availableColors: [COLORS.pink, COLORS.yellow, COLORS.lavender],
    variantLabel: 'Stems',
    variants: ['5 stems', '10 stems'],
    isFeatured: true
  }),
  makeProduct({
    id: 17,
    slug: 'sunflower-bouquet',
    name: 'Sunflower & Daisy Mini Bouquet',
    category: 'bouquets',
    price: 449,
    image: 'assets/images/products/sunflower-bouquet.jpg',
    gallery: [
      'assets/images/products/sunflower-bouquet.jpg'
    ],
    description: 'Handcrafted crochet sunflowers and white daisies wrapped in white paper with "Just for You!" ribbon. Pure sunshine.',
    availableColors: [COLORS.yellow, COLORS.white],
    isBestseller: true
  }),

  // Jewelry
  makeProduct({
    id: 18,
    slug: 'flower-earrings',
    name: 'Crochet Flower Earrings',
    category: 'jewelry',
    price: 229,
    image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Featherlight dangle earrings with delicate handmade petals and hypoallergenic hooks.',
    availableColors: [COLORS.white, COLORS.pink, COLORS.lavender, COLORS.yellow]
  }),
  makeProduct({
    id: 19,
    slug: 'daisy-necklace',
    name: 'Beaded Daisy Necklace',
    category: 'jewelry',
    price: 329,
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Tiny crochet daisies strung between lustrous beads. An artisanal summer essential.',
    availableColors: [COLORS.white, COLORS.sky],
    isNewArrival: true
  }),

  // Customised gifts
  makeProduct({
    id: 20,
    slug: 'name-keychain-gift',
    name: 'Heart Crochet Charm Gift Box',
    category: 'gifts',
    price: 499,
    image: 'assets/images/products/name-keychain-gift-1.jpg',
    gallery: [
      'assets/images/products/name-keychain-gift-1.jpg',
      'assets/images/products/love-hamper-1.jpg'
    ],
    description: 'A crochet heart charm with gold key ring and personalized greeting card packed in a gift box. Custom name & colours on WhatsApp.',
    availableColors: [COLORS.pink, COLORS.lavender, COLORS.yellow, COLORS.white],
    isFeatured: true
  }),
  makeProduct({
    id: 21,
    slug: 'love-hamper',
    name: 'Butterfly & Craft Love Hamper',
    category: 'gifts',
    price: 1099,
    image: 'assets/images/products/love-hamper-1.jpg',
    gallery: [
      'assets/images/products/love-hamper-1.jpg',
      'assets/images/products/name-keychain-gift-1.jpg'
    ],
    description: 'A curated hamper with handcrafted butterfly charms, pearls, scrunchie and accessories. Gift-wrapped with personalized card.',
    availableColors: [COLORS.pink, COLORS.lavender],
    variantLabel: 'Pack',
    variants: ['Classic', 'Deluxe'],
    isBestseller: true,
    isNewArrival: true
  }),

  // Home decor
  makeProduct({
    id: 22,
    slug: 'flower-coasters',
    name: 'Flower Coaster Set (4)',
    category: 'decor',
    price: 349,
    image: 'https://images.unsplash.com/photo-1584589167171-541ce45f1eea?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1584589167171-541ce45f1eea?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Four absorbent crochet flower coasters in cheerful pastel tones. Protects tables with handmade warmth.',
    availableColors: [COLORS.pink, COLORS.yellow, COLORS.sage]
  }),
  makeProduct({
    id: 23,
    slug: 'boho-table-mat',
    name: 'Boho Round Table Mat',
    category: 'decor',
    price: 499,
    image: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'A scalloped circular crochet mandala mat to warm up your tea tables, bedside or vanity.',
    availableColors: [COLORS.white, COLORS.peach],
    variantLabel: 'Size',
    variants: ['20 cm', '30 cm'],
    isNewArrival: true
  }),

  // Pouches & wallets
  makeProduct({
    id: 24,
    slug: 'zip-pouch',
    name: 'Crochet Zip Pouch',
    category: 'pouches',
    price: 399,
    image: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'A zip crochet pouch for makeup, coins, earphones and keepsakes. Fully lined with cotton interior.',
    availableColors: [COLORS.lavender, COLORS.sage, COLORS.pink],
    variantLabel: 'Size',
    variants: ['Small', 'Large']
  }),
  makeProduct({
    id: 25,
    slug: 'mini-card-wallet',
    name: 'Mini Card Wallet',
    category: 'pouches',
    price: 349,
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'A snap-button crochet mini wallet with dedicated compartments for cards, IDs and folded notes.',
    availableColors: [COLORS.pink, COLORS.brown, COLORS.yellow],
    isBestseller: true,
    isNewArrival: true
  }),
  makeProduct({
    id: 26,
    slug: 'ice-cream-keychains',
    name: 'Pastel Ice Cream Cone Keychains',
    category: 'keychains',
    price: 189,
    image: 'assets/images/products/crochet-icecream-keychains.jpg',
    gallery: [
      'assets/images/products/crochet-icecream-keychains.jpg',
      'assets/images/products/crochet-heart-keychains.jpg'
    ],
    description: 'Deliciously cute crochet ice cream cones with textured waffle cones and colorful scoops. Gold key rings included.',
    availableColors: [COLORS.pink, COLORS.yellow, COLORS.sky, COLORS.peach],
    isNewArrival: true
  }),
];

const PRODUCT_MAP = new Map(PRODUCTS.map((p) => [p.id, p]));
const CATEGORY_MAP = new Map(CATEGORIES.map((c) => [c.id, c]));

/* =========================================================
   3. HELPERS
   ========================================================= */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const currencyFormatter = new Intl.NumberFormat(CONFIG.locale, {
  style: 'currency',
  currency: CONFIG.currency,
  maximumFractionDigits: 0,
});
const formatINR = (n) => currencyFormatter.format(n);

const prefersReducedMotion = () =>
  typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const clampQty = (n) => Math.min(CONFIG.maxQtyPerLine, Math.max(1, Math.floor(Number(n)) || 1));
const icon = (id) => `<svg class="icon" aria-hidden="true" focusable="false"><use href="#${id}"></use></svg>`;

/* Safe storage: handles private mode, quota errors and corrupted JSON */
const storage = {
  get(store, key, fallback) {
    try {
      const raw = window[store].getItem(key);
      return raw == null ? fallback : JSON.parse(raw);
    } catch (_) {
      try { window[store].removeItem(key); } catch (__) { /* ignore */ }
      return fallback;
    }
  },
  set(store, key, value) {
    try { window[store].setItem(key, JSON.stringify(value)); } catch (_) { /* storage unavailable: in-memory state still works */ }
  },
};

/* Dummy product images: when a photo file is missing, draw a name-wise illustration
   (category motif + product colour + product name). Replace by adding real photos. */
function hashString(s) { return Array.from(String(s)).reduce((a, c) => a + c.charCodeAt(0), 0); }

const PH_INK = '#45352F';
function phMotif(cat, fg) {
  const st = `stroke="${PH_INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;
  const dash = `${st} stroke-dasharray="7 6"`;
  const flower = (cx, cy, r, c) => [0, 60, 120, 180, 240, 300].map((a) => {
    const t = (a * Math.PI) / 180;
    return `<circle cx="${(cx + r * Math.cos(t)).toFixed(1)}" cy="${(cy + r * Math.sin(t)).toFixed(1)}" r="${(r * 0.66).toFixed(1)}" fill="${c}" ${dash}/>`;
  }).join('') + `<circle cx="${cx}" cy="${cy}" r="${(r * 0.5).toFixed(1)}" fill="#F7E7A8" ${st}/>`;
  switch (cat) {
    case 'gajras':
      return `<path d="M60 230 Q200 150 340 230" fill="none" ${st}/>` +
        [[80, 224, 20], [135, 196, 24], [200, 182, 28], [265, 196, 24], [320, 224, 20]].map(([x, y, r]) => flower(x, y, r, fg)).join('');
    case 'bags':
      return `<path d="M140 190 Q140 90 200 90 Q260 90 260 190" fill="none" ${st}/><rect x="90" y="180" width="220" height="190" rx="34" fill="${fg}" ${dash}/><path d="M90 235 Q200 290 310 235" fill="none" ${st}/><circle cx="200" cy="272" r="13" fill="#F7E7A8" ${st}/>`;
    case 'keychains':
      return `<circle cx="200" cy="108" r="30" fill="none" ${st}/><path d="M200 138 V200" ${dash} fill="none"/>` + flower(200, 275, 44, fg);
    case 'sunglasses':
      return `<circle cx="132" cy="250" r="62" fill="${fg}" ${dash}/><circle cx="268" cy="250" r="62" fill="${fg}" ${dash}/><path d="M194 244 Q200 232 206 244" fill="none" ${st}/><path d="M70 240 L45 205 M330 240 L355 205" ${st} fill="none"/>`;
    case 'hair':
      return `<ellipse cx="200" cy="250" rx="108" ry="82" fill="${fg}" ${dash}/><ellipse cx="200" cy="250" rx="46" ry="30" fill="#FFF8F0" ${st}/><path d="M156 188 Q200 170 244 188 M150 310 Q200 335 250 310" fill="none" ${st}/>`;
    case 'bouquets':
      return `<g transform="translate(0,-55)"><path d="M200 300 V430 M150 290 L190 430 M250 290 L210 430" ${st} fill="none"/>` + flower(150, 250, 28, fg) + flower(250, 250, 28, fg) + flower(200, 190, 34, fg) + `<path d="M170 430 H230 L218 380 H182 Z" fill="#FFE6D2" ${st}/></g>`;
    case 'jewelry':
      return `<path d="M130 100 V170 M270 100 V170" ${st} fill="none"/>` + flower(130, 230, 40, fg) + flower(270, 230, 40, fg) + `<circle cx="130" cy="330" r="14" fill="#F7E7A8" ${st}/><circle cx="270" cy="330" r="14" fill="#F7E7A8" ${st}/>`;
    case 'gifts':
      return `<rect x="95" y="215" width="210" height="150" rx="14" fill="${fg}" ${dash}/><rect x="85" y="180" width="230" height="52" rx="12" fill="${fg}" ${st}/><path d="M200 180 V365" fill="none" ${st}/><path d="M200 180 Q150 110 120 145 Q110 175 200 180 Q290 175 280 145 Q250 110 200 180Z" fill="#F7E7A8" ${st}/>`;
    case 'decor': {
      const scallops = Array.from({ length: 14 }, (_, i) => {
        const t = (i * 360 / 14 * Math.PI) / 180;
        return `<circle cx="${(200 + 100 * Math.cos(t)).toFixed(1)}" cy="${(250 + 100 * Math.sin(t)).toFixed(1)}" r="26" fill="${fg}" ${st}/>`;
      }).join('');
      return scallops + `<circle cx="200" cy="250" r="96" fill="${fg}" ${st}/><circle cx="200" cy="250" r="62" fill="none" ${dash}/><circle cx="200" cy="250" r="28" fill="#F7E7A8" ${st}/>`;
    }
    case 'pouches':
      return `<rect x="85" y="170" width="230" height="170" rx="40" fill="${fg}" ${dash}/><path d="M110 215 H290" ${st} fill="none"/><circle cx="290" cy="215" r="11" fill="#F7E7A8" ${st}/><path d="M150 285 H250" ${dash} fill="none"/>`;
    default:
      return flower(200, 250, 56, fg);
  }
}

function placeholderSVG(label, category) {
  const palettes = [['#F5DCE2', '#E9B8C4'], ['#DCD3F5', '#B9AAE8'], ['#F7E7A8', '#EBCF6B'], ['#FFE6D2', '#F0BE95']];
  const [bg, fg] = palettes[hashString(label) % palettes.length];
  const words = String(label).split(/\s+/);
  const lines = [''];
  words.forEach((w) => { const last = lines.length - 1; if ((lines[last] + ' ' + w).trim().length > 22 && lines.length < 2) lines.push(w); else lines[last] = (lines[last] + ' ' + w).trim(); });
  const text = lines.map((l, i) => `<text x="200" y="${392 + i * 28}" text-anchor="middle" font-family="Georgia,serif" font-style="italic" font-weight="bold" font-size="24" fill="${PH_INK}">${esc(l.slice(0, 26))}</text>`).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"><rect width="400" height="500" fill="${bg}"/>${phMotif(category, fg)}${text}<text x="200" y="${392 + lines.length * 28 + 6}" text-anchor="middle" font-family="Arial,sans-serif" font-size="13" letter-spacing="2" fill="${PH_INK}" opacity=".55">SAMPLE IMAGE · DHAGA</text></svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

const NAME_TO_WEB_IMAGE = {
  'Red Rose Crochet Hair Gajra': 'assets/images/products/red-rose-hair-gajra.jpg',
  'Rose & Pearl Festive Crochet Gajra': 'assets/images/products/rose-pearl-gajra.jpg',
  'Pastel Bloom Gajra Set': 'assets/images/products/rose-pearl-gajra.jpg',
  'Mini Crochet Crossbody Sling Bags': 'assets/images/products/crochet-mini-crossbody-bags.jpg',
  'Pastel Netted Crochet Market Totes': 'assets/images/products/crochet-netted-tote-bags.jpg',
  'Lavender Bucket Bag': 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80',
  'Granny Square Shoulder Bag': 'assets/images/products/granny-square-bag-1.jpg',
  'Handmade Crochet Heart Keychains': 'assets/images/products/crochet-heart-keychains.jpg',
  'Amigurumi Fruit Keychains (Avocado, Banana, Berries)': 'assets/images/products/crochet-fruit-keychains.jpg',
  'Pastel Ice Cream Cone Charm Keychain': 'assets/images/products/crochet-icecream-keychains.jpg',
  'Crochet Flower Scrunchie': 'assets/images/products/scrunchie-trio-1.jpg',
  'Daisy Hair Clips (Set of 4)': 'https://images.unsplash.com/photo-1535295972055-1c762f4483e5?auto=format&fit=crop&w=800&q=80',
  'Bow Claw Clip': 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?auto=format&fit=crop&w=800&q=80',
  'Everlasting Tulip Bouquet': 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
  'Sunflower & Daisy Mini Bouquet': 'assets/images/products/sunflower-bouquet.jpg',
  'Crochet Flower Earrings': 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80',
  'Beaded Daisy Necklace': 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
  'Heart Crochet Charm Gift Box': 'assets/images/products/name-keychain-gift-1.jpg',
  'Butterfly & Craft Love Hamper': 'assets/images/products/love-hamper-1.jpg',
  'Flower Coaster Set (4)': 'https://images.unsplash.com/photo-1584589167171-541ce45f1eea?auto=format&fit=crop&w=800&q=80',
  'Boho Round Table Mat': 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=800&q=80',
  'Crochet Zip Pouch': 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=800&q=80',
  'Mini Card Wallet': 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80',
  'Pastel Ice Cream Cone Keychains': 'assets/images/products/crochet-icecream-keychains.jpg'
};

/* Work out which product / category an <img> belongs to from its alt text */
function placeholderFor(el) {
  const alt = (el.alt || '').trim();
  const product = PRODUCTS.find((p) => alt && alt.startsWith(p.name));
  if (product) return placeholderSVG(product.name, product.category);
  const cat = CATEGORIES.find((c) => alt && alt === c.name);
  if (cat) return placeholderSVG(cat.name, cat.id);
  const guess = [['gajra', 'gajras'], ['bag', 'bags'], ['keychain', 'keychains'], ['bouquet', 'bouquets'], ['gift', 'gifts'], ['earring', 'jewelry']]
    .find(([k]) => alt.toLowerCase().includes(k));
  return placeholderSVG(alt || CONFIG.brandName, guess ? guess[1] : '');
}
function applyImageFallback(el) {
  if (!(el instanceof HTMLImageElement)) return;
  const alt = (el.alt || '').trim();
  // 1. Try web fallback URL matching the product name if not attempted yet
  if (!el.dataset.webAttempted) {
    el.dataset.webAttempted = '1';
    for (const [prodName, webUrl] of Object.entries(NAME_TO_WEB_IMAGE)) {
      if (alt.startsWith(prodName) || alt.includes(prodName)) {
        el.removeAttribute('srcset');
        el.src = webUrl;
        return;
      }
    }
  }
  // 2. Otherwise SVG illustration fallback
  if (el.dataset.fallback) return;
  el.dataset.fallback = '1';
  el.removeAttribute('srcset');
  el.src = placeholderFor(el);
}

/* WhatsApp number helpers */
const waDigits = () => String(CONFIG.whatsappNumber).replace(/\D/g, '');
const isWhatsAppConfigured = () => /^\d{11,15}$/.test(waDigits()) && !/x/i.test(CONFIG.whatsappNumber);
const waUrl = (text) => `https://wa.me/${waDigits()}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

/* =========================================================
   4. STATE MODULES
   ========================================================= */
const defaultColor = (p) => (p.availableColors[0] ? p.availableColors[0].name : '');
const defaultVariant = (p) => (p.variants[0] || '');
const lineKey = (id, color, variant) => [id, color || '', variant || ''].join('|');

/* ---- Cart: sessionStorage, stores only ids/options/qty (never prices or personal data) ---- */
const Cart = {
  items: [],

  sanitize(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const id = Number(raw.id);
    const p = PRODUCT_MAP.get(id);
    if (!p) return null;
    const qty = Math.floor(Number(raw.qty));
    if (!(qty >= 1)) return null;
    const color = p.availableColors.some((c) => c.name === raw.color) ? raw.color : defaultColor(p);
    const variant = p.variants.includes(raw.variant) ? raw.variant : defaultVariant(p);
    return { id, color, variant, qty: clampQty(qty) };
  },

  load() {
    const raw = storage.get('sessionStorage', CONFIG.cartKey, []);
    const merged = new Map();
    (Array.isArray(raw) ? raw : []).forEach((r) => {
      const line = this.sanitize(r);
      if (!line) return;
      const key = lineKey(line.id, line.color, line.variant);
      if (merged.has(key)) merged.get(key).qty = clampQty(merged.get(key).qty + line.qty);
      else merged.set(key, line);
    });
    this.items = Array.from(merged.values());
    this.save();
  },

  save() {
    storage.set('sessionStorage', CONFIG.cartKey, this.items.map(({ id, color, variant, qty }) => ({ id, color, variant, qty })));
  },

  add(id, { color, variant, qty = 1 } = {}) {
    const p = PRODUCT_MAP.get(id);
    if (!p) return { ok: false };
    color = p.availableColors.some((c) => c.name === color) ? color : defaultColor(p);
    variant = p.variants.includes(variant) ? variant : defaultVariant(p);
    qty = clampQty(qty);
    const key = lineKey(id, color, variant);
    const existing = this.items.find((l) => lineKey(l.id, l.color, l.variant) === key);
    let capped = false;
    if (existing) {
      const next = existing.qty + qty;
      capped = next > CONFIG.maxQtyPerLine;
      existing.qty = Math.min(next, CONFIG.maxQtyPerLine);
    } else {
      this.items.push({ id, color, variant, qty });
    }
    this.save();
    return { ok: true, capped, color, variant };
  },

  find(key) { return this.items.find((l) => lineKey(l.id, l.color, l.variant) === key); },

  setQty(key, qty) {
    const line = this.find(key);
    if (!line) return;
    line.qty = clampQty(qty);
    this.save();
  },

  remove(key) {
    this.items = this.items.filter((l) => lineKey(l.id, l.color, l.variant) !== key);
    this.save();
  },

  clear() { this.items = []; this.save(); },

  detailed() {
    return this.items.map((l) => {
      const product = PRODUCT_MAP.get(l.id);
      return { ...l, key: lineKey(l.id, l.color, l.variant), product, lineTotal: product.price * l.qty };
    });
  },

  count() { return this.items.reduce((n, l) => n + l.qty, 0); },
  subtotal() { return this.detailed().reduce((sum, l) => sum + l.lineTotal, 0); },
};

/* ---- Wishlist: localStorage ---- */
const Wishlist = {
  ids: [],
  load() {
    const raw = storage.get('localStorage', CONFIG.wishlistKey, []);
    const seen = new Set();
    this.ids = (Array.isArray(raw) ? raw : [])
      .map(Number)
      .filter((id) => PRODUCT_MAP.has(id) && !seen.has(id) && seen.add(id));
  },
  save() { storage.set('localStorage', CONFIG.wishlistKey, this.ids); },
  has(id) { return this.ids.includes(id); },
  toggle(id) {
    if (this.has(id)) this.ids = this.ids.filter((x) => x !== id);
    else this.ids.push(id);
    this.save();
    return this.has(id);
  },
};

/* UI state */
const view = { filter: 'all', query: '', sort: 'featured' };
const qv = { product: null, color: '', variant: '', qty: 1, imgIndex: 0 };

/* =========================================================
   5. RENDERING
   ========================================================= */
function matchesFilter(p, f) {
  if (f === 'all') return true;
  if (FILTER_GROUPS[f]) return FILTER_GROUPS[f].categories.includes(p.category);
  return p.category === f;
}
function filterLabel(f) {
  if (f === 'all') return 'all pieces';
  if (FILTER_GROUPS[f]) return FILTER_GROUPS[f].label;
  return CATEGORY_MAP.has(f) ? CATEGORY_MAP.get(f).short : 'all pieces';
}

function getVisibleProducts() {
  const q = view.query.trim().toLowerCase();
  const list = PRODUCTS.filter((p) => {
    if (!matchesFilter(p, view.filter)) return false;
    if (!q) return true;
    return p.name.toLowerCase().includes(q) || CATEGORY_MAP.get(p.category).name.toLowerCase().includes(q);
  });
  const original = new Map(PRODUCTS.map((p, i) => [p.id, i]));
  const score = (p) => (p.isFeatured ? 2 : 0) + (p.isBestseller ? 1 : 0);
  switch (view.sort) {
    case 'price-asc': list.sort((a, b) => a.price - b.price || original.get(a.id) - original.get(b.id)); break;
    case 'price-desc': list.sort((a, b) => b.price - a.price || original.get(a.id) - original.get(b.id)); break;
    case 'newest': list.sort((a, b) => Number(b.isNewArrival) - Number(a.isNewArrival) || b.id - a.id); break;
    default: list.sort((a, b) => score(b) - score(a) || original.get(a.id) - original.get(b.id));
  }
  return list;
}

function productCardHTML(p, i) {
  const cat = CATEGORY_MAP.get(p.category);
  const wished = Wishlist.has(p.id);
  const badges = [];
  if (p.isNewArrival) badges.push('<span class="badge badge--new">New Arrival</span>');
  if (p.isBestseller) badges.push('<span class="badge badge--best">Bestseller</span>');
  return `
  <article class="product-card reveal" style="--d:${(i % 8) * 55}ms" data-id="${p.id}">
    <div class="product-card__media" data-action="quick-view" data-id="${p.id}">
      <img src="${esc(p.image)}" alt="${esc(p.name)} — handmade crochet ${esc(cat.short.toLowerCase())}" width="400" height="500" loading="lazy" decoding="async">
      <div class="badges">${badges.join('')}</div>
      <button class="wish-btn${wished ? ' is-active' : ''}" type="button" data-action="toggle-wish" data-id="${p.id}" data-wish-btn aria-pressed="${wished}" aria-label="${wished ? 'Remove from' : 'Add to'} wishlist: ${esc(p.name)}">${icon('i-heart')}</button>
    </div>
    <div class="product-card__body">
      <p class="product-card__cat">${esc(cat.short)}</p>
      <h3 class="product-card__name">${esc(p.name)}</h3>
      <p class="product-card__price">${formatINR(p.price)}</p>
      <div class="product-card__actions">
        <button class="icon-btn icon-btn--outline" type="button" data-action="quick-view" data-id="${p.id}" aria-label="Quick view: ${esc(p.name)}">${icon('i-eye')}</button>
        <button class="icon-btn icon-btn--outline" type="button" data-action="card-order-wa" data-id="${p.id}" aria-label="Order ${esc(p.name)} on WhatsApp" title="Order on WhatsApp: 7728990513" style="color:#16a34a">${icon('i-whatsapp')}</button>
        <button class="btn btn--primary btn--sm add-btn" type="button" data-action="add-to-cart" data-id="${p.id}"><span class="btn__label">Add to Cart</span></button>
      </div>
    </div>
  </article>`;
}

function skeletonHTML(n = 8) {
  return Array.from({ length: n }, () => `
    <div class="product-card product-card--skeleton" aria-hidden="true">
      <div class="skeleton skeleton--media"></div>
      <div class="product-card__body"><div class="skeleton skeleton--line"></div><div class="skeleton skeleton--line short"></div></div>
    </div>`).join('');
}

function renderProducts() {
  const grid = $('#product-grid');
  const list = getVisibleProducts();
  grid.innerHTML = list.map(productCardHTML).join('');
  grid.setAttribute('aria-busy', 'false');
  $('#empty-results').hidden = list.length > 0;
  grid.hidden = list.length === 0;
  const label = filterLabel(view.filter);
  const q = view.query.trim();
  $('#result-meta').textContent =
    `${list.length} ${list.length === 1 ? 'piece' : 'pieces'}` +
    (view.filter !== 'all' ? ` in ${label}` : '') +
    (q ? ` matching “${q}”` : '');
  observeReveals(grid);
}

function renderChips() {
  $('#filter-chips').innerHTML =
    [{ id: 'all', short: 'All Products' }, ...CATEGORIES]
      .map((c) => `<button class="chip" type="button" data-action="filter" data-filter="${c.id}" aria-pressed="${view.filter === c.id}">${esc(c.short)}</button>`)
      .join('');
}
function syncChips() {
  $$('#filter-chips .chip').forEach((chip) => chip.setAttribute('aria-pressed', String(chip.dataset.filter === view.filter)));
  const active = $('#filter-chips .chip[aria-pressed="true"]');
  if (active && active.scrollIntoView) active.scrollIntoView({ inline: 'center', block: 'nearest', behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
}

function renderCategories() {
  $('#category-grid').innerHTML = CATEGORIES.map((c, i) => `
    <a class="cat-card reveal" style="--d:${(i % 5) * 60}ms" href="#shop" data-action="filter" data-filter="${c.id}" aria-label="Explore ${esc(c.name)}">
      <span class="cat-card__img"><img src="${esc(c.image)}" alt="${esc(c.name)}" width="300" height="300" loading="lazy" decoding="async"></span>
      <span class="cat-card__title">${esc(c.name)}</span>
      <span class="cat-card__desc">${esc(c.desc)}</span>
      <span class="cat-card__cta">Explore ${icon('i-arrow')}</span>
    </a>`).join('');
}

function renderNav() {
  const html = NAV_LINKS.map((l) =>
    `<li><a href="${l.href}" ${l.filter ? `data-action="filter" data-filter="${l.filter}"` : ''} data-nav-link>${esc(l.label)}</a></li>`).join('');
  $$('[data-nav-list]').forEach((ul) => { ul.innerHTML = html; });
  $$('[data-footer-categories]').forEach((ul) => {
    ul.innerHTML = CATEGORIES.map((c) => `<li><a href="#shop" data-action="filter" data-filter="${c.id}">${esc(c.short)}</a></li>`).join('');
  });
}

function renderInstagram() {
  $('#insta-grid').innerHTML = INSTAGRAM_TILES.map((t, i) => `
    <a class="insta-tile reveal" style="--d:${i * 60}ms" href="${esc(CONFIG.instagramUrl)}" target="_blank" rel="noopener noreferrer" aria-label="Open DHAGA on Instagram">
      <img src="${esc(t.src)}" alt="${esc(t.alt)}" width="400" height="400" loading="lazy" decoding="async">
      <span class="insta-tile__icon">${icon('i-instagram')}</span>
    </a>`).join('');
}

function applyConfigLinks() {
  $$('[data-instagram-link]').forEach((a) => { a.href = CONFIG.instagramUrl; });
  $$('[data-instagram-handle]').forEach((el) => { el.textContent = CONFIG.instagramHandle; });
  $$('[data-email-link]').forEach((a) => { a.href = `mailto:${CONFIG.contactEmail}`; a.textContent = CONFIG.contactEmail; });
  $$('[data-wa-link]').forEach((a) => {
    a.href = isWhatsAppConfigured() ? waUrl(`Hello ${CONFIG.brandName}! ♡`) : '#';
  });
  $$('[data-wa-display]').forEach((el) => {
    const d = waDigits();
    el.textContent = isWhatsAppConfigured() ? `+${d.slice(0, d.length - 10)} ${d.slice(-10)}` : 'WhatsApp us';
  });
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
}

/* ---- Cart UI ---- */
function snapshotFocus() {
  const a = document.activeElement;
  if (!a || !a.dataset || !a.dataset.action) return null;
  return { action: a.dataset.action, value: a.dataset.value || '', index: a.dataset.index || '', key: a.dataset.key || '' };
}
function restoreFocus(root, snap) {
  if (!snap) return;
  const el = $$('[data-action]', root).find((n) =>
    n.dataset.action === snap.action && (n.dataset.value || '') === snap.value &&
    (n.dataset.index || '') === snap.index && (n.dataset.key || '') === snap.key && !n.disabled);
  if (el) el.focus();
}

function renderCart() {
  const lines = Cart.detailed();
  const body = $('#cart-body');
  const foot = $('#cart-foot');
  const snap = snapshotFocus();

  if (!lines.length) {
    body.innerHTML = `
      <div class="empty-state">
        <svg class="empty-state__art" aria-hidden="true" viewBox="0 0 100 100"><use href="#i-yarn"></use></svg>
        <h3>Your basket is empty</h3>
        <p>Every great outfit starts with one tiny stitch. Go find something you love.</p>
        <button class="btn btn--primary" type="button" data-action="browse">Start browsing</button>
      </div>`;
    foot.hidden = true;
  } else {
    body.innerHTML = `<ul class="cart-list">${lines.map((l) => {
      const meta = [l.color, l.variant].filter(Boolean).map(esc).join(' · ');
      return `
      <li class="cart-item" data-key="${esc(l.key)}">
        <img class="cart-item__img" src="${esc(l.product.image)}" alt="${esc(l.product.name)}" width="80" height="100" loading="lazy">
        <div class="cart-item__info">
          <h3 class="cart-item__name">${esc(l.product.name)}</h3>
          ${meta ? `<p class="cart-item__meta">${meta}</p>` : ''}
          <p class="cart-item__price">${formatINR(l.product.price)} each</p>
          <div class="qty" role="group" aria-label="Quantity for ${esc(l.product.name)}">
            <button type="button" data-action="cart-dec" data-key="${esc(l.key)}" aria-label="Decrease quantity" ${l.qty <= 1 ? 'disabled' : ''}>${icon('i-minus')}</button>
            <output aria-live="polite">${l.qty}</output>
            <button type="button" data-action="cart-inc" data-key="${esc(l.key)}" aria-label="Increase quantity" ${l.qty >= CONFIG.maxQtyPerLine ? 'disabled' : ''}>${icon('i-plus')}</button>
          </div>
        </div>
        <div class="cart-item__side">
          <button class="icon-btn icon-btn--sm" type="button" data-action="cart-remove" data-key="${esc(l.key)}" aria-label="Remove ${esc(l.product.name)} from cart">${icon('i-trash')}</button>
          <strong class="cart-item__total">${formatINR(l.lineTotal)}</strong>
        </div>
      </li>`;
    }).join('')}</ul>`;
    $('#cart-subtotal').textContent = formatINR(Cart.subtotal());
    const quickWa = $('#cart-quick-wa-link');
    if (quickWa) quickWa.href = buildWhatsAppUrl();
    foot.hidden = false;
  }
  updateCounts();
  restoreFocus(body, snap);
}

function updateCounts() {
  const n = Cart.count();
  $$('[data-cart-count]').forEach((el) => {
    el.textContent = n;
    el.classList.toggle('is-empty', n === 0);
  });
  $$('[data-cart-count-text]').forEach((el) => { el.textContent = n ? `(${n})` : ''; });
  $$('[data-cart-total]').forEach((el) => { el.textContent = n ? formatINR(Cart.subtotal()) : 'Empty'; });
  const w = Wishlist.ids.length;
  $$('[data-wish-count]').forEach((el) => { el.textContent = w; el.classList.toggle('is-empty', w === 0); });
}

function bump(selector) {
  $$(selector).forEach((el) => {
    el.classList.remove('is-bump');
    void el.offsetWidth; // restart animation
    el.classList.add('is-bump');
  });
}

/* ---- Wishlist UI ---- */
function syncWishButtons() {
  $$('[data-wish-btn]').forEach((btn) => {
    const id = Number(btn.dataset.id);
    const on = Wishlist.has(id);
    const p = PRODUCT_MAP.get(id);
    btn.classList.toggle('is-active', on);
    btn.setAttribute('aria-pressed', String(on));
    const label = btn.querySelector('.wish-label');
    if (label) label.textContent = on ? 'In Wishlist' : 'Add to Wishlist';
    else if (p) btn.setAttribute('aria-label', `${on ? 'Remove from' : 'Add to'} wishlist: ${p.name}`);
  });
}

function renderWishlist() {
  const body = $('#wishlist-body');
  const snap = snapshotFocus();
  if (!Wishlist.ids.length) {
    body.innerHTML = `
      <div class="empty-state">
        <svg class="empty-state__art" aria-hidden="true" viewBox="0 0 100 100"><use href="#i-flower"></use></svg>
        <h3>No favourites yet</h3>
        <p>Tap the heart on anything you love and it will wait for you here.</p>
        <button class="btn btn--primary" type="button" data-action="browse">Discover pieces</button>
      </div>`;
  } else {
    body.innerHTML = `<ul class="cart-list">${Wishlist.ids.map((id) => {
      const p = PRODUCT_MAP.get(id);
      return `
      <li class="cart-item wish-item" data-id="${p.id}">
        <img class="cart-item__img" src="${esc(p.image)}" alt="${esc(p.name)}" width="80" height="100" loading="lazy">
        <div class="cart-item__info">
          <h3 class="cart-item__name">${esc(p.name)}</h3>
          <p class="cart-item__price">${formatINR(p.price)}</p>
          <div class="wish-item__actions">
            <button class="btn btn--primary btn--sm add-btn" type="button" data-action="add-to-cart" data-id="${p.id}"><span class="btn__label">Add to Cart</span></button>
            <button class="btn btn--ghost btn--sm" type="button" data-action="quick-view" data-id="${p.id}">Options</button>
          </div>
        </div>
        <div class="cart-item__side">
          <button class="icon-btn icon-btn--sm" type="button" data-action="toggle-wish" data-id="${p.id}" aria-label="Remove ${esc(p.name)} from wishlist">${icon('i-close')}</button>
        </div>
      </li>`;
    }).join('')}</ul>`;
  }
  updateCounts();
  restoreFocus(body, snap);
}

/* ---- Quick view ---- */
function renderQuickView() {
  const p = qv.product;
  if (!p) return;
  const snap = snapshotFocus();
  const cat = CATEGORY_MAP.get(p.category);
  const wished = Wishlist.has(p.id);
  const gallery = p.gallery && p.gallery.length ? p.gallery : [p.image];
  const badges = [p.isNewArrival && 'New Arrival', p.isBestseller && 'Bestseller'].filter(Boolean)
    .map((b) => `<span class="badge badge--${b === 'Bestseller' ? 'best' : 'new'}">${b}</span>`).join('');

  $('#qv-content').innerHTML = `
    <div class="qv">
      <div class="qv__gallery">
        <div class="qv__main"><img src="${esc(gallery[qv.imgIndex] || p.image)}" alt="${esc(p.name)} — photo ${qv.imgIndex + 1}" width="600" height="750"></div>
        ${gallery.length > 1 ? `<div class="qv__thumbs">${gallery.map((g, i) => `
          <button type="button" class="qv__thumb" data-action="qv-img" data-index="${i}" aria-label="Show photo ${i + 1}" aria-pressed="${i === qv.imgIndex}">
            <img src="${esc(g)}" alt="" width="80" height="100" loading="lazy">
          </button>`).join('')}</div>` : ''}
      </div>
      <div class="qv__info">
        <p class="eyebrow">${esc(cat.name)}</p>
        <h2 class="qv__title" id="qv-title">${esc(p.name)}</h2>
        <div class="badges badges--inline">${badges}</div>
        <p class="qv__price">${formatINR(p.price)}</p>
        <p class="qv__desc">${esc(p.description)}</p>

        ${p.availableColors.length ? `
        <fieldset class="opt">
          <legend>Colour: <strong>${esc(qv.color)}</strong></legend>
          <div class="swatches">${p.availableColors.map((c) => `
            <button type="button" class="swatch" data-action="qv-color" data-value="${esc(c.name)}" style="--swatch:${esc(c.hex)}" aria-pressed="${c.name === qv.color}" aria-label="${esc(c.name)}"></button>`).join('')}
          </div>
        </fieldset>` : ''}

        ${p.variants.length ? `
        <fieldset class="opt">
          <legend>${esc(p.variantLabel)}: <strong>${esc(qv.variant)}</strong></legend>
          <div class="pills">${p.variants.map((v) => `
            <button type="button" class="pill" data-action="qv-variant" data-value="${esc(v)}" aria-pressed="${v === qv.variant}">${esc(v)}</button>`).join('')}
          </div>
        </fieldset>` : ''}

        <div class="opt">
          <span class="opt__label">Quantity</span>
          <div class="qty qty--lg" role="group" aria-label="Quantity">
            <button type="button" data-action="qv-dec" aria-label="Decrease quantity" ${qv.qty <= 1 ? 'disabled' : ''}>${icon('i-minus')}</button>
            <output aria-live="polite">${qv.qty}</output>
            <button type="button" data-action="qv-inc" aria-label="Increase quantity" ${qv.qty >= CONFIG.maxQtyPerLine ? 'disabled' : ''}>${icon('i-plus')}</button>
          </div>
        </div>

        <div class="qv__actions">
          <button class="btn btn--primary btn--lg add-btn" type="button" data-action="qv-add" data-id="${p.id}"><span class="btn__label">Add to Cart · ${formatINR(p.price * qv.qty)}</span></button>
          <button class="btn btn--whatsapp btn--lg" type="button" data-action="qv-order-wa" data-id="${p.id}"><svg class="icon" aria-hidden="true"><use href="#i-whatsapp"></use></svg> Buy on WhatsApp</button>
          <button class="btn btn--ghost btn--lg${wished ? ' is-active' : ''}" type="button" data-action="toggle-wish" data-id="${p.id}" data-wish-btn aria-pressed="${wished}">${icon('i-heart')}<span class="wish-label">${wished ? 'In Wishlist' : 'Add to Wishlist'}</span></button>
        </div>
        <p class="qv__note">Handmade to order — colours may vary slightly from photos.</p>
      </div>
    </div>`;
  restoreFocus($('#qv-content'), snap);
}

function openQuickView(id, preset = {}) {
  const p = PRODUCT_MAP.get(id);
  if (!p) return;
  qv.product = p;
  qv.color = preset.color || defaultColor(p);
  qv.variant = preset.variant || defaultVariant(p);
  qv.qty = 1;
  qv.imgIndex = 0;
  renderQuickView();
  openLayer('quickview');
}

/* =========================================================
   6. LAYERS — drawers, modals, overlay
   ========================================================= */
const LAYERS = { cart: '#cart-drawer', wishlist: '#wishlist-drawer', quickview: '#quick-view', order: '#order-modal', nav: '#mobile-nav', auth: '#auth-modal', orders: '#orders-modal', admin: '#admin-modal' };
let activeLayer = null;
let lastFocus = null;

function openLayer(name) {
  if (activeLayer && activeLayer !== name) closeLayer({ keepFocus: true });
  const el = $(LAYERS[name]);
  if (!el) return;
  if (!activeLayer) lastFocus = document.activeElement;
  el.classList.add('is-open');
  el.setAttribute('aria-hidden', 'false');
  $('#overlay').classList.add('is-visible');
  document.body.classList.add('layer-open');
  if (name === 'nav') $$('[data-action="nav-toggle"]').forEach((b) => b.setAttribute('aria-expanded', 'true'));
  activeLayer = name;
  window.setTimeout(() => {
    const target = el.querySelector('[data-autofocus]') || el.querySelector('button, a[href], input, select');
    if (target) target.focus({ preventScroll: true });
  }, 60);
}

function closeLayer({ keepFocus = false } = {}) {
  if (!activeLayer) return;
  const el = $(LAYERS[activeLayer]);
  el.classList.remove('is-open');
  el.setAttribute('aria-hidden', 'true');
  $$('[data-action="nav-toggle"]').forEach((b) => b.setAttribute('aria-expanded', 'false'));
  activeLayer = null;
  if (keepFocus) return;
  $('#overlay').classList.remove('is-visible');
  document.body.classList.remove('layer-open');
  if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus({ preventScroll: true });
}

function trapFocus(e) {
  if (e.key !== 'Tab' || !activeLayer) return;
  const el = $(LAYERS[activeLayer]);
  const focusables = $$('button:not([disabled]), a[href], input, select, [tabindex]:not([tabindex="-1"])', el).filter((n) => n.offsetParent !== null || n === document.activeElement);
  if (!focusables.length) return;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}

/* =========================================================
   7. WHATSAPP ORDER & ORDER PROCESS
   ========================================================= */
let currentOrderId = `DH-${Math.floor(1000 + Math.random() * 9000)}`;

function generateNewOrderId() {
  currentOrderId = `DH-${Math.floor(1000 + Math.random() * 9000)}`;
  return currentOrderId;
}

function buildWhatsAppMessage(customer = null) {
  const lines = Cart.detailed();
  const dateStr = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  const orderId = currentOrderId || generateNewOrderId();

  const parts = [
    `🌸 *NEW ORDER - ${CONFIG.brandName} HANDMADE* 🌸`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `📋 *Order ID:* #${orderId}`,
    `📅 *Date:* ${dateStr}`,
  ];

  if (customer && (customer.name || customer.phone || customer.address)) {
    parts.push(
      ``,
      `👤 *CUSTOMER & DELIVERY DETAILS:*`,
      `• *Name:* ${customer.name || 'Not provided'}`,
      `• *WhatsApp:* ${customer.phone || 'Not provided'}`,
      `• *Address:* ${customer.address || 'Not provided'}`,
      `• *City / Pincode:* ${customer.city || ''} ${customer.pincode ? `(${customer.pincode})` : ''}`,
      `• *Payment Preference:* ${customer.payment || 'UPI upon confirmation'}`
    );
    if (customer.notes && customer.notes.trim()) {
      parts.push(`• *Special Note/Customization:* ${customer.notes.trim()}`);
    }
  }

  parts.push(
    ``,
    `🛍️ *ORDERED PRODUCTS:*`
  );

  lines.forEach((l, i) => {
    parts.push(`${i + 1}️⃣ *${l.product.name}*`);
    const opts = [];
    if (l.color) opts.push(`Colour: ${l.color}`);
    if (l.variant) opts.push(`${l.product.variantLabel}: ${l.variant}`);
    if (opts.length) parts.push(`   Options: ${opts.join(' | ')}`);
    parts.push(`   Quantity: ${l.qty}`);
    parts.push(l.qty > 1
      ? `   Price: ${formatINR(l.product.price)} each (${formatINR(l.lineTotal)})`
      : `   Price: ${formatINR(l.product.price)}`);
    parts.push(``);
  });

  parts.push(
    `━━━━━━━━━━━━━━━━━━━━`,
    `📦 *Total Items:* ${Cart.count()} pieces`,
    `💰 *TOTAL AMOUNT:* ${formatINR(Cart.subtotal())}`,
    `🚚 *Shipping:* Standard Delivery`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `Please confirm my order and share UPI details or payment instructions to complete this order.`,
    `Thank you! 🧶✨`
  );

  return parts.join('\n');
}

function buildSingleProductWhatsAppMessage(product, { color = '', variant = '', qty = 1 } = {}) {
  const orderId = generateNewOrderId();
  const dateStr = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  const parts = [
    `🌸 *DIRECT ORDER ENQUIRY - ${CONFIG.brandName}* 🌸`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `📋 *Reference:* #${orderId}`,
    `📅 *Date:* ${dateStr}`,
    ``,
    `Hello DHAGA! I would like to order:`,
    `• *Product:* ${product.name}`,
    `• *Quantity:* ${qty}`,
    color ? `• *Colour:* ${color}` : '',
    variant ? `• *${product.variantLabel}:* ${variant}` : '',
    `• *Price:* ${formatINR(product.price * qty)} (${formatINR(product.price)} each)`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `Please confirm availability, estimated delivery time and share payment instructions (Google Pay/PhonePe/UPI/COD). Thank you! 🧶✨`
  ].filter(Boolean);
  return parts.join('\n');
}

const buildWhatsAppUrl = (customer = null) => waUrl(buildWhatsAppMessage(customer));

function setOrderStep(step) {
  const s1 = $('#order-step-1');
  const s2 = $('#order-step-2');
  const s3 = $('#order-step-3');
  if (s1) s1.hidden = (step !== 1);
  if (s2) s2.hidden = (step !== 2);
  if (s3) s3.hidden = (step !== 3);

  const p1 = $('#pill-step-1');
  const p2 = $('#pill-step-2');
  const p3 = $('#pill-step-3');
  if (p1) p1.classList.toggle('is-active', step >= 1);
  if (p2) p2.classList.toggle('is-active', step >= 2);
  if (p3) p3.classList.toggle('is-active', step >= 3);
}

function startOrder() {
  if (!Cart.items.length) {
    toast('Your cart is empty. Add something lovely first ♡', 'warn');
    return;
  }
  generateNewOrderId();
  const n = Cart.count();
  const summaryEl = $('#order-summary');
  if (summaryEl) {
    summaryEl.innerHTML =
      `<strong>${n} ${n === 1 ? 'item' : 'items'}</strong> · Subtotal <strong>${formatINR(Cart.subtotal())}</strong>`;
  }

  // Populate mini-preview of items
  const preview = $('#order-items-preview');
  if (preview) {
    const lines = Cart.detailed();
    preview.innerHTML = lines.map((l) => {
      const meta = [l.color, l.variant].filter(Boolean).map(esc).join(' · ');
      return `
      <div class="order-item-row">
        <img src="${esc(l.product.image)}" alt="${esc(l.product.name)}">
        <div class="info">
          <div class="title">${esc(l.product.name)}</div>
          <div class="meta">${meta ? `${meta} · ` : ''}Qty: ${l.qty}</div>
        </div>
        <div class="price">${formatINR(l.lineTotal)}</div>
      </div>`;
    }).join('');
  }

  // Pre-fill profile if previously saved
  const profile = storage.get('localStorage', CONFIG.profileKey, {});
  if (profile.name && $('#order-name')) $('#order-name').value = profile.name;
  if (profile.phone && $('#order-phone')) $('#order-phone').value = profile.phone;
  if (profile.address && $('#order-address')) $('#order-address').value = profile.address;
  if (profile.city && $('#order-city')) $('#order-city').value = profile.city;
  if (profile.pincode && $('#order-pincode')) $('#order-pincode').value = profile.pincode;

  setOrderStep(1);
  openLayer('order');
}

function getEnteredCustomerDetails() {
  return {
    name: ($('#order-name')?.value || '').trim(),
    phone: ($('#order-phone')?.value || '').trim(),
    address: ($('#order-address')?.value || '').trim(),
    city: ($('#order-city')?.value || '').trim(),
    pincode: ($('#order-pincode')?.value || '').trim(),
    notes: ($('#order-notes')?.value || '').trim(),
    payment: $('#order-payment')?.value || '',
  };
}

function submitOrderForm() {
  const customer = getEnteredCustomerDetails();

  if (!customer.name) {
    toast('Please enter your full name', 'warn');
    $('#order-name')?.focus();
    return;
  }
  if (!customer.phone || customer.phone.replace(/\D/g, '').length < 10) {
    toast('Please enter a valid 10-digit WhatsApp/mobile number', 'warn');
    $('#order-phone')?.focus();
    return;
  }
  if (!customer.address) {
    toast('Please enter your delivery address', 'warn');
    $('#order-address')?.focus();
    return;
  }
  if (!customer.pincode) {
    toast('Please enter your pincode', 'warn');
    $('#order-pincode')?.focus();
    return;
  }

  // Save profile to localStorage for future orders
  storage.set('localStorage', CONFIG.profileKey, customer);

  const message = buildWhatsAppMessage(customer);
  const url = waUrl(message);

  const previewEl = $('#order-msg-preview');
  if (previewEl) previewEl.textContent = message;

  const reopenBtn = $('#wa-reopen');
  if (reopenBtn) reopenBtn.href = url;

  // Create order via ApiClient & LocalOrders
  const orderData = {
    orderNumber: currentOrderId,
    customerName: customer.name,
    customerPhone: customer.phone,
    deliveryAddress: customer.address,
    city: customer.city,
    pincode: customer.pincode,
    notes: customer.notes,
    paymentMethod: customer.payment || 'UPI',
    totalAmount: Cart.subtotal(),
    items: Cart.detailed().map(l => ({
      productId: l.product.id,
      productName: l.product.name,
      color: l.color,
      variant: l.variant,
      quantity: l.qty,
      unitPrice: l.product.price,
      lineTotal: l.lineTotal
    }))
  };

  ApiClient.createOrder(orderData);

  // Auto-login or update user session with entered phone so they can view My Orders
  if (!currentUser) {
    currentUser = {
      id: Date.now(),
      mobileNumber: customer.phone.replace(/\D/g, '').slice(-10),
      fullName: customer.name
    };
    storage.set('localStorage', 'dhaga_current_user', currentUser);
    renderUserArea();
  }

  // Open WhatsApp in new tab/window
  window.open(url, '_blank');

  setOrderStep(2);
  toast('WhatsApp opened! Send the message to complete your order ♡', 'info');
}

function confirmOrderSent() {
  const badge = $('#order-confirmed-id');
  if (badge) badge.textContent = `#${currentOrderId}`;

  Cart.clear();
  renderCart();
  setOrderStep(3);
  toast(`Order #${currentOrderId} placed! Thank you ♡`, 'success');
}

function copyOrderMessage() {
  const customer = getEnteredCustomerDetails();
  const text = buildWhatsAppMessage(customer.name ? customer : null);
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      toast('Order message copied to clipboard! 📋', 'success');
    }).catch(() => {
      toast('Preview available in step 2.', 'info');
    });
  } else {
    toast('Preview available in step 2.', 'info');
  }
}

function copyWhatsAppOrderLink() {
  const customer = getEnteredCustomerDetails();
  const url = buildWhatsAppUrl(customer.name ? customer : null);
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(() => {
      toast('WhatsApp order link copied! 🔗', 'success');
    }).catch(() => {
      toast('Link ready on button.', 'info');
    });
  } else {
    toast('Link ready on button.', 'info');
  }
}

function quickOrderProduct(id, options = {}) {
  const p = PRODUCT_MAP.get(id);
  if (!p) return;
  const color = options.color || defaultColor(p);
  const variant = options.variant || defaultVariant(p);
  const qty = clampQty(options.qty || 1);
  const msg = buildSingleProductWhatsAppMessage(p, { color, variant, qty });
  const url = waUrl(msg);
  window.open(url, '_blank');
  toast(`Opening WhatsApp to order ${p.name}... ♡`, 'info');
}

/* =========================================================
   7B. USER AUTH, MY ORDERS & ADMIN PORTAL
   ========================================================= */
let currentUser = storage.get('localStorage', 'dhaga_current_user', null);

const API_BASE = 'http://localhost:5000/api';

const LocalOrders = {
  key: 'dhaga_orders_store_v1',
  getAll() {
    return storage.get('localStorage', this.key, []);
  },
  getByPhone(phone) {
    const clean = String(phone).replace(/\D/g, '').slice(-10);
    return this.getAll().filter(o => {
      const p = String(o.customerPhone || '').replace(/\D/g, '').slice(-10);
      return p === clean;
    });
  },
  save(orderNumber, orderData, status = 'PaymentPending') {
    const orders = this.getAll();
    const existingIndex = orders.findIndex(o => (o.orderNumber || o.OrderNumber) === orderNumber);
    const orderRecord = {
      id: existingIndex >= 0 ? orders[existingIndex].id : Date.now(),
      orderNumber,
      customerName: orderData.customerName || 'Customer',
      customerPhone: orderData.customerPhone,
      deliveryAddress: orderData.deliveryAddress,
      city: orderData.city,
      pincode: orderData.pincode,
      notes: orderData.notes,
      totalAmount: orderData.totalAmount,
      status: status,
      createdAt: new Date().toISOString(),
      items: orderData.items || []
    };
    if (existingIndex >= 0) {
      orders[existingIndex] = { ...orders[existingIndex], ...orderRecord };
    } else {
      orders.unshift(orderRecord);
    }
    storage.set('localStorage', this.key, orders);
    return orderRecord;
  },
  markPaid(idOrNumber) {
    const orders = this.getAll();
    const target = orders.find(o => String(o.id) === String(idOrNumber) || (o.orderNumber || o.OrderNumber) === idOrNumber);
    if (target) {
      target.status = 'PaymentConfirmed';
      target.paymentConfirmedAt = new Date().toISOString();
      storage.set('localStorage', this.key, orders);
    }
  }
};

const ApiClient = {
  async sendOtp(mobileNumber) {
    try {
      const res = await fetch(`${API_BASE}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileNumber })
      });
      if (res.ok) return await res.json();
    } catch (_) {}
    return { success: true, message: 'OTP sent (Demo OTP: 123456)', dummyOtp: '123456' };
  },

  async verifyOtp(mobileNumber, otpCode, fullName) {
    try {
      const res = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileNumber, otpCode, fullName })
      });
      if (res.ok) return await res.json();
    } catch (_) {}
    if (String(otpCode).trim() === '123456') {
      return {
        success: true,
        user: {
          id: Date.now(),
          mobileNumber,
          fullName: fullName || 'Handmade Lover'
        }
      };
    }
    return { success: false, message: 'Invalid OTP. Please enter 123456.' };
  },

  async createOrder(orderData) {
    try {
      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      if (res.ok) {
        const data = await res.json();
        LocalOrders.save(data.orderNumber || orderData.orderNumber, orderData, 'PaymentPending');
        return data;
      }
    } catch (_) {}
    const orderNumber = orderData.orderNumber || `DH-${Math.floor(1000 + Math.random() * 9000)}`;
    LocalOrders.save(orderNumber, orderData, 'PaymentPending');
    return { success: true, orderNumber, status: 'PaymentPending' };
  },

  async getMyOrders(phone) {
    try {
      const res = await fetch(`${API_BASE}/orders/my/${encodeURIComponent(phone)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.orders && Array.isArray(data.orders)) return data.orders;
      }
    } catch (_) {}
    return LocalOrders.getByPhone(phone);
  },

  async getAllOrders() {
    try {
      const res = await fetch(`${API_BASE}/orders/all`);
      if (res.ok) {
        const data = await res.json();
        if (data.orders && Array.isArray(data.orders)) return data.orders;
      }
    } catch (_) {}
    return LocalOrders.getAll();
  },

  async getAdminUsers() {
    try {
      const res = await fetch(`${API_BASE}/admin/users`);
      if (res.ok) {
        const data = await res.json();
        if (data.users && Array.isArray(data.users)) return data.users;
      }
    } catch (_) {}
    // Fallback: derive users from local orders
    const orders = LocalOrders.getAll();
    const map = new Map();
    orders.forEach(o => {
      const phone = String(o.customerPhone || '').replace(/\D/g, '').slice(-10);
      if (!phone) return;
      if (!map.has(phone)) {
        map.set(phone, {
          id: map.size + 1,
          mobileNumber: phone,
          fullName: o.customerName || 'Customer',
          deliveryAddress: o.deliveryAddress,
          city: o.city,
          pincode: o.pincode,
          createdAt: o.createdAt,
          ordersCount: 0,
          totalSpent: 0,
          pendingCount: 0
        });
      }
      const u = map.get(phone);
      u.ordersCount++;
      if (o.status !== 'PaymentPending') u.totalSpent += (Number(o.totalAmount) || 0);
      else u.pendingCount++;
    });
    if (currentUser && currentUser.mobileNumber && !map.has(currentUser.mobileNumber)) {
      map.set(currentUser.mobileNumber, {
        id: map.size + 1,
        mobileNumber: currentUser.mobileNumber,
        fullName: currentUser.fullName || 'Registered User',
        ordersCount: 0,
        totalSpent: 0,
        pendingCount: 0,
        createdAt: new Date().toISOString()
      });
    }
    return Array.from(map.values());
  },

  async verifyPayment(orderIdOrNumber) {
    try {
      const numId = Number(orderIdOrNumber);
      if (!isNaN(numId) && numId > 0 && numId < 1000000) {
        const res = await fetch(`${API_BASE}/orders/${numId}/verify-payment`, { method: 'POST' });
        if (res.ok) {
          const data = await res.json();
          LocalOrders.markPaid(data.orderNumber || orderIdOrNumber);
          return data;
        }
      }
    } catch (_) {}
    LocalOrders.markPaid(orderIdOrNumber);
    // Build offline fallback WhatsApp URL
    const orders = LocalOrders.getAll();
    const target = orders.find(o => String(o.id) === String(orderIdOrNumber) || (o.orderNumber || o.OrderNumber) === orderIdOrNumber);
    let waUrl = '';
    if (target && target.customerPhone) {
      const p = String(target.customerPhone).replace(/\D/g, '');
      const digits = p.length === 10 ? `91${p}` : p;
      const msg = `🌸 *ORDER CONFIRMED - DHAGA HANDMADE* 🌸\n━━━━━━━━━━━━━━━━━━━━\nHello *${target.customerName || 'Customer'}*! 👋\n\n✅ *Payment Received & Verified!* We have received your payment of *₹${target.totalAmount}* for Order *#${target.orderNumber || target.OrderNumber}*.\n\n🧶 Our artisans have started crocheting your handmade order with love! Track status in 'My Orders'. Thank you! 🌸✨`;
      waUrl = `https://wa.me/${digits}?text=${encodeURIComponent(msg)}`;
    }
    return { success: true, status: 'PaymentConfirmed', whatsappUrl: waUrl };
  }
};

function renderUserArea() {
  const container = $('#user-header-area');
  if (!container) return;
  if (currentUser && currentUser.mobileNumber) {
    const displayName = currentUser.fullName || currentUser.mobileNumber;
    container.innerHTML = `
      <div class="user-pill" title="Logged in as +91 ${esc(currentUser.mobileNumber)}">
        <svg class="icon" aria-hidden="true" style="width:14px;height:14px;"><use href="#i-user"></use></svg>
        <span class="user-pill__name">${esc(displayName)}</span>
        <button class="user-pill__logout" type="button" data-action="logout-user" title="Logout">Logout</button>
      </div>`;
  } else {
    container.innerHTML = `
      <button class="btn btn--ghost btn--sm" type="button" data-action="open-auth" id="header-login-btn">
        <svg class="icon" aria-hidden="true"><use href="#i-user"></use></svg> Login
      </button>`;
  }
}

function openAuthModal() {
  const step1 = $('#auth-step-1');
  const step2 = $('#auth-step-2');
  if (step1) step1.hidden = false;
  if (step2) step2.hidden = true;
  openLayer('auth');
}

async function handleSendOtp() {
  const mobileInput = $('#auth-mobile');
  const nameInput = $('#auth-fullname');
  const mobile = (mobileInput?.value || '').trim().replace(/\D/g, '');
  const name = (nameInput?.value || '').trim();

  if (!mobile || mobile.length < 10) {
    toast('Please enter a valid 10-digit mobile number', 'warn');
    mobileInput?.focus();
    return;
  }

  const targetMobile = $('#auth-target-mobile');
  if (targetMobile) targetMobile.textContent = `+91 ${mobile}`;

  const otpInput = $('#auth-otp-input');
  if (otpInput) otpInput.value = '123456';

  $('#auth-step-1').hidden = true;
  $('#auth-step-2').hidden = false;

  await ApiClient.sendOtp(mobile);
  toast('Demo OTP is 123456 ⚡', 'info');
  otpInput?.focus();
}

async function handleVerifyOtp() {
  const mobile = ($('#auth-mobile')?.value || '').trim().replace(/\D/g, '');
  const name = ($('#auth-fullname')?.value || '').trim();
  const otp = ($('#auth-otp-input')?.value || '').trim();

  if (!otp) {
    toast('Please enter the OTP (Demo: 123456)', 'warn');
    $('#auth-otp-input')?.focus();
    return;
  }

  const res = await ApiClient.verifyOtp(mobile, otp, name);
  if (res.success && res.user) {
    currentUser = {
      id: res.user.id || Date.now(),
      mobileNumber: res.user.mobileNumber || mobile,
      fullName: res.user.fullName || name || 'Handmade Lover'
    };
    storage.set('localStorage', 'dhaga_current_user', currentUser);
    renderUserArea();
    closeLayer();
    toast(`Welcome, ${currentUser.fullName}! Logged in successfully ♡`, 'success');
  } else {
    toast(res.message || 'Invalid OTP. Please enter 123456.', 'warn');
  }
}

function handleLogout() {
  currentUser = null;
  try { window.localStorage.removeItem('dhaga_current_user'); } catch (_) {}
  renderUserArea();
  toast('Logged out successfully', 'info');
}

async function openMyOrders() {
  if (!currentUser || !currentUser.mobileNumber) {
    toast('Please login with your mobile number to view orders.', 'info');
    openAuthModal();
    return;
  }

  const badge = $('#orders-user-badge');
  if (badge) {
    badge.innerHTML = `Logged in: <strong>+91 ${esc(currentUser.mobileNumber)}</strong> ${currentUser.fullName ? `(${esc(currentUser.fullName)})` : ''}`;
  }

  openLayer('orders');
  await renderMyOrdersList();
}

async function renderMyOrdersList() {
  const container = $('#orders-container');
  if (!container) return;
  container.innerHTML = '<p style="text-align:center;padding:24px;color:var(--brown-soft);">Loading your orders...</p>';

  const orders = await ApiClient.getMyOrders(currentUser.mobileNumber);

  if (!orders || orders.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:40px 16px;background:var(--cream);border:var(--stroke);border-radius:var(--radius-md);">
        <div style="font-size:2.5rem;margin-bottom:8px;">🧶</div>
        <h3 style="font-family:var(--font-display);margin-bottom:6px;">No Orders Yet</h3>
        <p style="font-size:.9rem;color:var(--brown-soft);margin-bottom:16px;">You haven't placed any crochet orders with this mobile number yet.</p>
        <button class="btn btn--primary" type="button" data-action="browse">Explore Crochet Collection</button>
      </div>`;
    return;
  }

  container.innerHTML = orders.map((o) => {
    const isPending = (o.status === 'PaymentPending');
    const orderNum = o.orderNumber || o.OrderNumber || 'DH-0000';
    const dateFormatted = o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently';

    const itemsHtml = (o.items || []).map((it) => `
      <div class="order-item-chip">
        <span><strong>${esc(it.productName || it.name || 'Crochet Item')}</strong> ${it.color ? `(${esc(it.color)})` : ''} × ${it.quantity || it.qty || 1}</span>
        <span>${formatINR(it.lineTotal || (it.unitPrice * (it.quantity || 1)) || 0)}</span>
      </div>`).join('');

    if (isPending) {
      return `
      <div class="order-card" style="border-left: 6px solid #D97706; background: #FFFDF9;">
        <div class="order-card__header">
          <div>
            <span class="order-card__num">#${esc(orderNum)}</span>
            <div class="order-card__date">Placed: ${dateFormatted}</div>
          </div>
          <span class="status-badge status-badge--pending">⏳ Payment Verification Pending</span>
        </div>

        <div class="pending-pay-notice">
          <div>
            <strong>Awaiting Admin Payment Confirmation</strong><br>
            Please send payment of <strong>${formatINR(o.totalAmount || 0)}</strong> via UPI / GPay / PhonePe to <strong>+91 7728990513</strong>.
          </div>
          <p style="margin: 0; font-size: .82rem; color: #78350F;">
            As requested by store rules: Once our Admin verifies and confirms receipt of payment, your order will be confirmed and tracking will activate!
          </p>
          <div class="pending-pay-notice__cta">
            <a class="btn btn--whatsapp btn--sm" href="https://wa.me/917728990513?text=${encodeURIComponent(`Hello DHAGA! I have completed payment of ₹${o.totalAmount || ''} for Order #${orderNum}. Please verify and confirm my order.`)}" target="_blank" rel="noopener noreferrer">
              <svg class="icon" aria-hidden="true" style="width:14px;height:14px;"><use href="#i-whatsapp"></use></svg> Share Payment Screenshot (+91 7728990513)
            </a>
          </div>
        </div>

        <div class="order-items-mini">
          <div style="font-size: .8rem; font-weight: 700; color: var(--brown-soft); text-transform: uppercase;">Items in Order:</div>
          ${itemsHtml}
          <div style="display:flex;justify-content:space-between;font-weight:700;font-size:.92rem;margin-top:4px;border-top:1px dashed rgba(62,47,40,.15);padding-top:6px;">
            <span>Total Payable:</span>
            <span>${formatINR(o.totalAmount || 0)}</span>
          </div>
        </div>
      </div>`;
    }

    const stepClass = (st, target) => {
      const orderSteps = ['PaymentConfirmed', 'InCrafting', 'Dispatched', 'Delivered'];
      const curIdx = orderSteps.indexOf(st);
      const targetIdx = orderSteps.indexOf(target);
      if (curIdx > targetIdx) return 'is-done';
      if (curIdx === targetIdx) return 'is-active';
      return '';
    };

    return `
    <div class="order-card" style="border-left: 6px solid #10B981;">
      <div class="order-card__header">
        <div>
          <span class="order-card__num">#${esc(orderNum)}</span>
          <div class="order-card__date">Confirmed · Placed ${dateFormatted}</div>
        </div>
        <span class="status-badge status-badge--confirmed">✅ Payment Received &amp; Confirmed</span>
      </div>

      <div class="order-stepper" role="list" aria-label="Order Tracking">
        <div class="order-stepper__step is-done" role="listitem">
          <div class="order-stepper__circle">✓</div>
          <span>Payment Done</span>
        </div>
        <div class="order-stepper__step ${stepClass(o.status, 'InCrafting') || 'is-active'}" role="listitem">
          <div class="order-stepper__circle">🧶</div>
          <span>Crafting</span>
        </div>
        <div class="order-stepper__step ${stepClass(o.status, 'Dispatched')}" role="listitem">
          <div class="order-stepper__circle">🚚</div>
          <span>Shipped</span>
        </div>
        <div class="order-stepper__step ${stepClass(o.status, 'Delivered')}" role="listitem">
          <div class="order-stepper__circle">🎁</div>
          <span>Delivered</span>
        </div>
      </div>

      <div class="order-items-mini">
        <div style="font-size: .8rem; font-weight: 700; color: var(--brown-soft); text-transform: uppercase;">Items Ordered:</div>
        ${itemsHtml}
        <div style="display:flex;justify-content:space-between;font-weight:700;font-size:.92rem;margin-top:4px;border-top:1px dashed rgba(62,47,40,.15);padding-top:6px;">
          <span>Paid Total:</span>
          <span>${formatINR(o.totalAmount || 0)}</span>
        </div>
      </div>

      <div style="font-size: .8rem; color: var(--brown-soft); background: rgba(16, 185, 129, .08); padding: 8px 12px; border-radius: 8px;">
        📍 Delivering to: <strong>${esc(o.customerName || 'Customer')}</strong>, ${esc(o.deliveryAddress || '')}, ${esc(o.city || '')} ${esc(o.pincode || '')}
      </div>
    </div>`;
  }).join('');
}

const ADMIN_PIN = '7728';
let adminCurrentTab = 'orders';
let adminFilterUserPhone = null;
let adminFilterUserName = null;

function openAdminModal() {
  $('#admin-lock-screen').hidden = false;
  $('#admin-dashboard-screen').hidden = true;
  $('#admin-pin-input').value = '';
  openLayer('admin');
}

async function handleAdminUnlock(pinOverride) {
  const pinInput = $('#admin-pin-input');
  const enteredPin = pinOverride || (pinInput ? pinInput.value.trim() : '');
  if (enteredPin !== ADMIN_PIN) {
    toast('Invalid Admin PIN. (Hint: 7728)', 'warn');
    if (pinInput) pinInput.focus();
    return;
  }
  $('#admin-lock-screen').hidden = true;
  $('#admin-dashboard-screen').hidden = false;
  toast('Admin portal unlocked!', 'success');
  await renderAdminDashboard();
}

function setAdminTab(tabName) {
  adminCurrentTab = tabName;
  const tabBtns = $$('.admin-tab-btn');
  tabBtns.forEach(btn => {
    btn.classList.toggle('is-active', btn.dataset.tab === tabName);
  });
  const viewOrders = $('#admin-view-orders');
  const viewUsers = $('#admin-view-users');
  if (viewOrders) viewOrders.hidden = (tabName !== 'orders');
  if (viewUsers) viewUsers.hidden = (tabName !== 'users');
}

async function renderAdminDashboard() {
  const statsEl = $('#admin-stats-row');
  const ordersListEl = $('#admin-orders-list');
  const usersListEl = $('#admin-users-list');
  const pendingBadge = $('#admin-pending-tab-badge');
  const usersBadge = $('#admin-users-tab-badge');

  if (ordersListEl) ordersListEl.innerHTML = '<p style="text-align:center;padding:20px;">Loading orders...</p>';
  if (usersListEl) usersListEl.innerHTML = '<p style="text-align:center;padding:20px;">Loading registered users...</p>';

  const [orders, users] = await Promise.all([
    ApiClient.getAllOrders(),
    ApiClient.getAdminUsers()
  ]);

  const totalCount = orders.length;
  const pendingCount = orders.filter(o => o.status === 'PaymentPending').length;
  const confirmedCount = totalCount - pendingCount;
  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

  if (pendingBadge) pendingBadge.textContent = String(pendingCount);
  if (usersBadge) usersBadge.textContent = String(users.length);

  if (statsEl) {
    statsEl.innerHTML = `
      <div class="admin-stat-card">
        <div class="admin-stat-card__val">${totalCount}</div>
        <div class="admin-stat-card__lbl">Total Orders</div>
      </div>
      <div class="admin-stat-card" style="border-color: #D97706; background: #FFFBEB;">
        <div class="admin-stat-card__val" style="color: #D97706;">${pendingCount}</div>
        <div class="admin-stat-card__lbl">Pending Verification</div>
      </div>
      <div class="admin-stat-card" style="border-color: #3B82F6; background: #EFF6FF;">
        <div class="admin-stat-card__val" style="color: #1D4ED8;">${users.length}</div>
        <div class="admin-stat-card__lbl">Registered Users</div>
      </div>
      <div class="admin-stat-card">
        <div class="admin-stat-card__val">${formatINR(totalRevenue)}</div>
        <div class="admin-stat-card__lbl">Total Sales</div>
      </div>`;
  }

  // Handle user filter banner
  const filterBanner = $('#admin-user-filter-banner');
  const filterNameEl = $('#admin-filtered-user-name');
  if (filterBanner) {
    if (adminFilterUserPhone) {
      filterBanner.style.display = 'inline-flex';
      if (filterNameEl) filterNameEl.textContent = `${adminFilterUserName || 'Customer'} (+91 ${adminFilterUserPhone})`;
    } else {
      filterBanner.style.display = 'none';
    }
  }

  // 1. RENDER ORDERS
  let displayedOrders = orders;
  if (adminFilterUserPhone) {
    displayedOrders = orders.filter(o => {
      const p = String(o.customerPhone || '').replace(/\D/g, '').slice(-10);
      return p === adminFilterUserPhone;
    });
  }

  if (ordersListEl) {
    if (!displayedOrders.length) {
      ordersListEl.innerHTML = `<p style="text-align:center;padding:28px;color:var(--brown-soft);">${adminFilterUserPhone ? 'No orders found for this user.' : 'No customer orders yet.'}</p>`;
    } else {
      ordersListEl.innerHTML = displayedOrders.map(o => {
        const isPending = (o.status === 'PaymentPending');
        const orderNum = o.orderNumber || o.OrderNumber || 'DH-0000';
        const dateFormatted = o.createdAt ? new Date(o.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : 'Recent';
        const itemsDesc = (o.items || []).map(i => `${i.productName || i.ProductName || 'Item'} (${i.quantity || 1})`).join(', ');

        return `
        <div class="admin-order-card ${isPending ? 'admin-order-card--pending' : 'admin-order-card--confirmed'}">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
            <div>
              <strong style="font-size:1.05rem;">#${esc(orderNum)}</strong>
              <span style="font-size:.82rem;color:var(--brown-soft);margin-left:8px;">${dateFormatted}</span>
            </div>
            <span class="status-badge ${isPending ? 'status-badge--pending' : 'status-badge--confirmed'}">
              ${isPending ? '⏳ Awaiting Payment Approval' : '✅ Payment Verified &amp; Confirmed'}
            </span>
          </div>

          <div style="font-size:.88rem;">
            👤 <strong>${esc(o.customerName || 'Customer')}</strong> · 📞 <a href="tel:${esc(o.customerPhone)}" style="color:var(--terracotta);font-weight:600;">+91 ${esc(o.customerPhone)}</a> · 💰 <strong>${formatINR(o.totalAmount || 0)}</strong>
          </div>
          <div style="font-size:.82rem;color:var(--brown-soft);">
            📦 Items: ${esc(itemsDesc || 'Crochet Items')}
          </div>
          <div style="font-size:.8rem;color:var(--brown-soft);">
            📍 Address: ${esc(o.deliveryAddress || '')}, ${esc(o.city || '')} ${esc(o.pincode || '')}
          </div>

          <div class="admin-order-actions">
            ${isPending ? `
              <button class="btn-verify-pay" type="button" data-action="admin-verify-pay" data-id="${esc(o.id)}" data-num="${esc(orderNum)}" data-phone="${esc(o.customerPhone)}" data-name="${esc(o.customerName)}">
                ✅ Approve Payment &amp; Send WhatsApp to User
              </button>
              <a class="btn btn--whatsapp btn--sm" href="https://wa.me/91${esc(String(o.customerPhone).replace(/\D/g,'').slice(-10))}?text=${encodeURIComponent(`Hello ${o.customerName}! We have your DHAGA order #${orderNum}. Please complete payment of ₹${o.totalAmount} to confirm.`)}" target="_blank" rel="noopener noreferrer">
                Chat on WhatsApp
              </a>
            ` : `
              <span style="font-size:.85rem;color:#065F46;font-weight:600;">✓ Payment Confirmed · User can view full order</span>
              <a class="btn btn--whatsapp btn--sm" href="https://wa.me/91${esc(String(o.customerPhone).replace(/\D/g,'').slice(-10))}?text=${encodeURIComponent(`Hello ${o.customerName}! Your payment for order #${orderNum} has been received and confirmed by DHAGA! Our artisans are handcrafting your pieces with love. 🧶✨`)}" target="_blank" rel="noopener noreferrer">
                Send WhatsApp Update
              </a>
            `}
          </div>
        </div>`;
      }).join('');
    }
  }

  // 2. RENDER REGISTERED USERS
  if (usersListEl) {
    if (!users.length) {
      usersListEl.innerHTML = '<p style="text-align:center;padding:28px;color:var(--brown-soft);">No registered users yet. Customers will appear here when they login with mobile and OTP.</p>';
    } else {
      usersListEl.innerHTML = users.map(u => {
        const cleanP = String(u.mobileNumber || '').replace(/\D/g, '').slice(-10);
        const joinDate = u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent';

        return `
        <div class="admin-user-card">
          <div class="admin-user-card__header">
            <div style="display:flex;align-items:center;gap:10px;">
              <div class="admin-user-avatar">👤</div>
              <div>
                <strong style="font-size:1.02rem;">${esc(u.fullName || 'Registered User')}</strong>
                <div style="font-size:.82rem;color:var(--brown-soft);">Registered on: ${joinDate}</div>
              </div>
            </div>
            <div style="font-size:.9rem;font-weight:700;color:var(--brown);">
              📱 +91 ${esc(cleanP)}
            </div>
          </div>

          <div class="admin-user-meta">
            <div>📦 Orders Placed: <strong>${u.ordersCount || 0}</strong></div>
            <div>💰 Total Paid: <strong>${formatINR(u.totalSpent || 0)}</strong></div>
            ${u.pendingCount > 0 ? `<div style="color:#D97706;font-weight:700;">⏳ ${u.pendingCount} Pending Payment</div>` : ''}
            ${u.city ? `<div>📍 ${esc(u.city)} ${esc(u.pincode ? `(${u.pincode})` : '')}</div>` : ''}
          </div>

          <div class="admin-user-actions">
            <button class="btn btn--primary btn--sm" type="button" data-action="admin-view-user-orders" data-phone="${esc(cleanP)}" data-name="${esc(u.fullName || 'Customer')}">
              👁️ View Customer Orders (${u.ordersCount || 0})
            </button>
            <a class="btn btn--whatsapp btn--sm" href="https://wa.me/91${esc(cleanP)}?text=${encodeURIComponent(`Hello ${u.fullName || ''}! Greetings from DHAGA Handmade Crochet. How may we assist you today? 🌸`)}" target="_blank" rel="noopener noreferrer">
              <svg class="icon" aria-hidden="true" style="width:14px;height:14px;"><use href="#i-whatsapp"></use></svg> Chat on WhatsApp
            </a>
          </div>
        </div>`;
      }).join('');
    }
  }

  setAdminTab(adminCurrentTab);
}

async function handleAdminVerifyPayment(orderId, orderNum, customerPhone, customerName) {
  toast(`Approving order #${orderNum}...`, 'info');
  const res = await ApiClient.verifyPayment(orderId || orderNum);
  
  // Rule requested: "approv krte hi user k pass whatapp pr message chla jay"
  if (res && res.whatsappUrl) {
    window.open(res.whatsappUrl, '_blank');
    toast(`Payment confirmed! WhatsApp confirmation window opened for +91 ${customerPhone || ''} 💬`, 'success');
  } else {
    toast(`Payment confirmed for Order #${orderNum}! Customer can now see confirmed order.`, 'success');
  }
  
  await renderAdminDashboard();
}

/* =========================================================
   8. INTERACTIONS
   ========================================================= */
function toast(message, type = 'info') {
  const region = $('#toast-region');
  while (region.children.length >= 3) region.firstElementChild.remove();
  const t = document.createElement('div');
  t.className = `toast toast--${type}`;
  t.textContent = message;
  region.appendChild(t);
  requestAnimationFrame(() => t.classList.add('is-in'));
  window.setTimeout(() => {
    t.classList.remove('is-in');
    t.classList.add('is-out');
    window.setTimeout(() => t.remove(), 400);
  }, 2800);
}

function flyToCart(sourceImg) {
  if (!sourceImg || prefersReducedMotion() || typeof Element.prototype.animate !== 'function') return;
  const target = $('.header-actions [data-cart-target]');
  if (!target) return;
  const from = sourceImg.getBoundingClientRect();
  const to = target.getBoundingClientRect();
  if (!from.width || !to.width) return;
  const size = 64;
  const fly = document.createElement('img');
  fly.className = 'fly-thumb';
  fly.alt = '';
  fly.src = sourceImg.currentSrc || sourceImg.src;
  fly.style.cssText = `left:${from.left + from.width / 2 - size / 2}px;top:${from.top + from.height / 2 - size / 2}px;width:${size}px;height:${size}px`;
  document.body.appendChild(fly);
  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height / 2 - (from.top + from.height / 2);
  const anim = fly.animate(
    [
      { transform: 'translate(0,0) scale(1) rotate(0deg)', opacity: 1 },
      { transform: `translate(${dx * 0.55}px, ${dy * 0.55 - 40}px) scale(.7) rotate(-10deg)`, opacity: 1, offset: 0.55 },
      { transform: `translate(${dx}px, ${dy}px) scale(.18) rotate(12deg)`, opacity: 0.2 },
    ],
    { duration: 720, easing: 'cubic-bezier(.5,0,.75,.4)' }
  );
  anim.onfinish = () => { fly.remove(); bump('[data-cart-target]'); };
  anim.oncancel = () => fly.remove();
}

function flashAdded(btn) {
  if (!btn) return;
  const label = btn.querySelector('.btn__label');
  if (btn.dataset.busy) return;
  btn.dataset.busy = '1';
  const original = label ? label.textContent : '';
  btn.classList.add('is-added');
  if (label) label.textContent = 'Added ✓';
  window.setTimeout(() => {
    btn.classList.remove('is-added');
    delete btn.dataset.busy;
    if (label && btn.isConnected) {
      // Quick view label includes a live price, so rebuild it instead of restoring stale text.
      if (btn.dataset.action === 'qv-add' && qv.product) label.textContent = `Add to Cart · ${formatINR(qv.product.price * qv.qty)}`;
      else label.textContent = original;
    }
  }, 1400);
}

function addToCart(id, opts, triggerBtn, imgEl) {
  const result = Cart.add(id, opts);
  if (!result.ok) return;
  const p = PRODUCT_MAP.get(id);
  renderCart();
  flyToCart(imgEl);
  flashAdded(triggerBtn);
  bump('[data-cart-target]');
  const detail = [result.color, result.variant].filter(Boolean).join(' · ');
  toast(result.capped ? `Max ${CONFIG.maxQtyPerLine} per item reached for ${p.name}` : `${p.name}${detail ? ` (${detail})` : ''} added to cart`, result.capped ? 'warn' : 'success');
}

function toggleWishlist(id, btn) {
  const on = Wishlist.toggle(id);
  const p = PRODUCT_MAP.get(id);
  syncWishButtons();
  renderWishlist();
  if (btn && on) {
    btn.classList.remove('is-pop');
    void btn.offsetWidth;
    btn.classList.add('is-pop');
  }
  toast(on ? `Saved ${p.name} to wishlist ♡` : `Removed ${p.name} from wishlist`, on ? 'success' : 'info');
}

/* Scroll reveal */
let revealObserver = null;
function setupReveal() {
  if ('IntersectionObserver' in window) {
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add('is-visible');
          revealObserver.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  }
  observeReveals(document);
}
function observeReveals(root) {
  $$('.reveal:not(.is-visible)', root).forEach((el) => {
    if (revealObserver) revealObserver.observe(el);
    else el.classList.add('is-visible');
  });
}

/* Filtering */
function setFilter(f, { scroll = false } = {}) {
  view.filter = f;
  syncChips();
  renderProducts();
  if (scroll) { const shop = $('#shop'); if (shop) shop.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' }); }
}

function resetFilters() {
  view.filter = 'all';
  view.query = '';
  view.sort = 'featured';
  $('#search-input').value = '';
  $('#sort-select').value = 'featured';
  syncChips();
  renderProducts();
}

/* Two-step clear cart (no blocking confirm dialog) */
let clearTimer = null;
function handleClearCart(btn) {
  if (btn.dataset.armed) {
    window.clearTimeout(clearTimer);
    delete btn.dataset.armed;
    btn.textContent = 'Clear cart';
    Cart.clear();
    renderCart();
    toast('Cart cleared', 'info');
    return;
  }
  btn.dataset.armed = '1';
  btn.textContent = 'Tap again to clear';
  clearTimer = window.setTimeout(() => { delete btn.dataset.armed; btn.textContent = 'Clear cart'; }, 3000);
}

/* Cart line removal with animation */
function removeCartLine(key) {
  const row = $$('.cart-item', $('#cart-body')).find((r) => r.dataset.key === key);
  const done = () => { Cart.remove(key); renderCart(); };
  if (!row || prefersReducedMotion()) { done(); return; }
  row.classList.add('is-removing');
  let finished = false;
  const finish = () => { if (finished) return; finished = true; done(); };
  row.addEventListener('animationend', finish, { once: true });
  window.setTimeout(finish, 450);
}

/* Central click handler (event delegation) */
function onClick(e) {
  const waLink = e.target.closest('a[data-wa-link]');
  if (waLink && !isWhatsAppConfigured()) {
    e.preventDefault();
    toast('WhatsApp number not set yet. Add it in CONFIG inside script.js.', 'warn');
    return;
  }

  const trigger = e.target.closest('[data-action]');
  if (!trigger) return;
  const { action } = trigger.dataset;
  const id = Number(trigger.dataset.id);
  const key = trigger.dataset.key;

  switch (action) {
    case 'filter':
      setFilter(trigger.dataset.filter);
      if (activeLayer === 'nav') closeLayer();
      break;
    case 'nav-toggle': activeLayer === 'nav' ? closeLayer() : openLayer('nav'); break;
    case 'open-cart': openLayer('cart'); break;
    case 'open-wishlist': renderWishlist(); openLayer('wishlist'); break;
    case 'close-layer': closeLayer(); break;
    case 'browse':
      closeLayer();
      resetFilters();
      { const shop = $('#shop'); if (shop) shop.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' }); }
      break;
    case 'quick-view':
      openQuickView(id);
      break;
    case 'toggle-wish':
      toggleWishlist(id, trigger);
      break;
    case 'add-to-cart': {
      const scope = trigger.closest('.product-card, .wish-item');
      addToCart(id, {}, trigger, scope ? scope.querySelector('img') : null);
      break;
    }
    case 'qv-add':
      addToCart(qv.product.id, { color: qv.color, variant: qv.variant, qty: qv.qty }, trigger, $('.qv__main img'));
      break;
    case 'qv-color': qv.color = trigger.dataset.value; renderQuickView(); break;
    case 'qv-variant': qv.variant = trigger.dataset.value; renderQuickView(); break;
    case 'qv-img': qv.imgIndex = Number(trigger.dataset.index); renderQuickView(); break;
    case 'qv-inc': qv.qty = clampQty(qv.qty + 1); renderQuickView(); break;
    case 'qv-dec': qv.qty = clampQty(qv.qty - 1); renderQuickView(); break;
    case 'cart-inc': { const l = Cart.find(key); if (l) { Cart.setQty(key, l.qty + 1); renderCart(); } break; }
    case 'cart-dec': { const l = Cart.find(key); if (l) { Cart.setQty(key, l.qty - 1); renderCart(); } break; }
    case 'cart-remove': removeCartLine(key); break;
    case 'clear-cart': handleClearCart(trigger); break;
    case 'checkout': startOrder(); break;
    case 'submit-order': submitOrderForm(); break;
    case 'order-step-1': setOrderStep(1); break;
    case 'copy-order-text': copyOrderMessage(); break;
    case 'copy-order-link': copyWhatsAppOrderLink(); break;
    case 'copy-cart-wa-link': copyWhatsAppOrderLink(); break;
    case 'card-order-wa': quickOrderProduct(id); break;
    case 'qv-order-wa': quickOrderProduct(qv.product.id, { color: qv.color, variant: qv.variant, qty: qv.qty }); break;
    case 'wa-sent': confirmOrderSent(); break;
    case 'wa-keep': closeLayer(); toast('No problem. Your cart is still here.', 'info'); break;
    case 'reset-filters': resetFilters(); break;
    case 'open-auth': openAuthModal(); break;
    case 'auth-send-otp': handleSendOtp(); break;
    case 'auth-verify-otp': handleVerifyOtp(); break;
    case 'auth-back-step1':
      $('#auth-step-1').hidden = false;
      $('#auth-step-2').hidden = true;
      break;
    case 'logout-user': handleLogout(); break;
    case 'open-orders': openMyOrders(); break;
    case 'open-admin': openAdminModal(); break;
    case 'admin-unlock': handleAdminUnlock(); break;
    case 'admin-quick-unlock': handleAdminUnlock('7728'); break;
    case 'admin-refresh-orders': renderAdminDashboard(); break;
    case 'admin-tab': setAdminTab(trigger.dataset.tab); break;
    case 'admin-lock':
      $('#admin-lock-screen').hidden = false;
      $('#admin-dashboard-screen').hidden = true;
      toast('Admin desk locked', 'info');
      break;
    case 'admin-view-user-orders':
      adminFilterUserPhone = trigger.dataset.phone;
      adminFilterUserName = trigger.dataset.name;
      setAdminTab('orders');
      renderAdminDashboard();
      break;
    case 'admin-clear-user-filter':
      adminFilterUserPhone = null;
      adminFilterUserName = null;
      renderAdminDashboard();
      break;
    case 'admin-verify-pay': {
      const orderId = Number(trigger.dataset.id) || trigger.dataset.id;
      const orderNum = trigger.dataset.num;
      const phone = trigger.dataset.phone;
      const name = trigger.dataset.name;
      handleAdminVerifyPayment(orderId, orderNum, phone, name);
      break;
    }
    default: break;
  }
}

function debounce(fn, ms) { let t; return (...a) => { window.clearTimeout(t); t = window.setTimeout(() => fn(...a), ms); }; }

function bindEvents() {
  document.addEventListener('click', onClick);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLayer();
    trapFocus(e);
  });
  // 'error' does not bubble; capture it to swap in placeholders for missing photos
  document.addEventListener('error', (e) => applyImageFallback(e.target), true);

  $('#search-input').addEventListener('input', debounce((e) => { view.query = e.target.value; renderProducts(); }, 120));
  $('#search-form').addEventListener('submit', (e) => e.preventDefault());
  $('#sort-select').addEventListener('change', (e) => { view.sort = e.target.value; renderProducts(); });
  const waCont = $('#wa-continue');
  if (waCont) waCont.addEventListener('click', handleWhatsAppContinue);

  // Sticky header shadow
  const header = $('.site-header');
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { header.classList.toggle('is-scrolled', window.scrollY > 8); ticking = false; });
  }, { passive: true });

  // Keep wishlist in sync across tabs; reload state when returning via back/forward cache
  window.addEventListener('storage', (e) => {
    if (e.key === CONFIG.wishlistKey) { Wishlist.load(); syncWishButtons(); renderWishlist(); }
  });
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) { Cart.load(); Wishlist.load(); renderCart(); renderWishlist(); syncWishButtons(); }
  });
  // Close mobile nav when resizing to desktop
  window.addEventListener('resize', debounce(() => {
    if (activeLayer === 'nav' && window.innerWidth >= 900) closeLayer();
  }, 150));
}

/* =========================================================
   9. INIT
   ========================================================= */
function init() {
  Cart.load();
  Wishlist.load();

  renderUserArea();
  renderNav();
  renderCategories();
  renderChips();
  renderInstagram();
  applyConfigLinks();
  renderCart();
  renderWishlist();
  bindEvents();
  setupReveal();

  // Skeletons first, then real cards (feels smoother on slow connections)
  const grid = $('#product-grid');
  grid.setAttribute('aria-busy', 'true');
  grid.innerHTML = skeletonHTML(8);
  window.setTimeout(renderProducts, prefersReducedMotion() ? 0 : 420);

  // Images that failed before this script ran
  $$('img[src]').forEach((im) => { if (im.complete && im.naturalWidth === 0) applyImageFallback(im); });

  document.body.classList.add('is-ready');
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
