// =============================================
// COQUE & CHIC — API Mock (couche données)
// Simule un backend avec localStorage
// =============================================
import { resolveImage } from './upload.js';

const DB_KEYS = {
  products: 'cc_products',
  orders: 'cc_orders',
  messages: 'cc_messages',
  favs: 'cc_favorites',
  cart: 'cc_cart',
  auth: 'cc_auth',
  shipping: 'cc_shipping',
  settings: 'cc_settings',
};

// Données de démo (chargées si localStorage vide)
const SEED_PRODUCTS = [
  { id: 'p1', name: 'Coque iPhone 15 Pro — Rose poudré', category: 'coques', price: 8000, oldPrice: 12000, image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=600', description: 'Coque silicone premium avec finition mate. Protection anti-choc.', stock: 24, featured: true, badge: 'Best', colors: ['#fce7f3', '#0a0a0a', '#ffffff'] },
  { id: 'p2', name: 'Coque iPhone 14 — Marbre rose', category: 'coques', price: 7500, image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600', description: 'Design marbre unique, toucher soyeux.', stock: 18, featured: true },
  { id: 'p3', name: 'Coque Samsung S24 — Élégance noire', category: 'coques', price: 9000, oldPrice: 11000, image: 'https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=600', description: 'Coque rigide ultra-fine, design premium.', stock: 12, featured: true, badge: 'New' },
  { id: 'p4', name: 'Bracelet cœur doré', category: 'accessoires', price: 4500, image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600', description: 'Plaqué or 18K, fermoir mousqueton.', stock: 30, featured: true },
  { id: 'p5', name: 'Boucles d\'oreilles perles', category: 'accessoires', price: 3500, image: 'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=600', description: 'Perles d\'eau douce, monture argent 925.', stock: 22 },
  { id: 'p6', name: 'Porte-cœur en velours', category: 'accessoires', price: 6000, oldPrice: 8000, image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600', description: 'Pendentif velours rose, chaîne dorée 50cm.', stock: 15, featured: true, badge: '-25%' },
  { id: 'p7', name: 'Coque iPhone 13 — Paillettes roses', category: 'coques', price: 6500, image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=600', description: 'Coque paillettes liquides qui bougent !', stock: 8, badge: 'Tendance' },
  { id: 'p8', name: 'Sac à main bandoulière', category: 'accessoires', price: 15000, image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600', description: 'Cuir synthétique, plusieurs compartiments.', stock: 5 },
  { id: 'nw1', name: 'Nouveau Produit 1', category: 'coques', price: 5000, image: 'images/WhatsApp Image 2026-07-03 at 00.39.08.jpeg', description: 'À modifier dans l\'admin', stock: 10, featured: true },
  { id: 'nw2', name: 'Nouveau Produit 2', category: 'coques', price: 5000, image: 'images/WhatsApp Image 2026-07-03 at 00.39.15.jpeg', description: 'À modifier dans l\'admin', stock: 10, featured: true },
  { id: 'nw3', name: 'Nouveau Produit 3', category: 'coques', price: 5000, image: 'images/WhatsApp Image 2026-07-03 at 00.39.29.jpeg', description: 'À modifier dans l\'admin', stock: 10, featured: true },
  { id: 'nw4', name: 'Nouveau Produit 4', category: 'coques', price: 5000, image: 'images/WhatsApp Image 2026-07-03 at 00.39.38.jpeg', description: 'À modifier dans l\'admin', stock: 10, featured: true },
  { id: 'nw5', name: 'Nouveau Produit 5', category: 'coques', price: 5000, image: 'images/WhatsApp Image 2026-07-03 at 00.39.47.jpeg', description: 'À modifier dans l\'admin', stock: 10, featured: true },
  { id: 'nw6', name: 'Nouveau Produit 6', category: 'coques', price: 5000, image: 'images/WhatsApp Image 2026-07-03 at 00.39.54.jpeg', description: 'À modifier dans l\'admin', stock: 10, featured: true },
  { id: 'nw7', name: 'Nouveau Produit 7', category: 'coques', price: 5000, image: 'images/WhatsApp Image 2026-07-03 at 00.40.11.jpeg', description: 'À modifier dans l\'admin', stock: 10, featured: true },
  { id: 'nw8', name: 'Nouveau Produit 8', category: 'coques', price: 5000, image: 'images/WhatsApp Image 2026-07-03 at 00.40.13.jpeg', description: 'À modifier dans l\'admin', stock: 10, featured: true },
  { id: 'nw9', name: 'Nouveau Produit 9', category: 'coques', price: 5000, image: 'images/WhatsApp Image 2026-07-03 at 00.40.17.jpeg', description: 'À modifier dans l\'admin', stock: 10, featured: true },
  { id: 'nw10', name: 'Nouveau Produit 10', category: 'coques', price: 5000, image: 'images/WhatsApp Image 2026-07-03 at 00.40.31.jpeg', description: 'À modifier dans l\'admin', stock: 10, featured: true },
  { id: 'nw11', name: 'Nouveau Produit 11', category: 'coques', price: 5000, image: 'images/WhatsApp Image 2026-07-03 at 00.40.37.jpeg', description: 'À modifier dans l\'admin', stock: 10, featured: true },
  { id: 'nw12', name: 'Nouveau Produit 12', category: 'coques', price: 5000, image: 'images/WhatsApp Image 2026-07-03 at 00.40.43.jpeg', description: 'À modifier dans l\'admin', stock: 10, featured: true },
];

const SEED_ORDERS = [];
const SEED_MESSAGES = [];

// Helpers localStorage with server synchronization
const get = (key) => {
  if ([DB_KEYS.products, DB_KEYS.orders, DB_KEYS.messages, DB_KEYS.shipping, DB_KEYS.settings].includes(key)) {
    const endpoint = key === DB_KEYS.products ? 'products' : (key === DB_KEYS.orders ? 'orders' : (key === DB_KEYS.messages ? 'messages' : (key === DB_KEYS.shipping ? 'shipping' : 'settings')));
    try {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', `/api/${endpoint}`, false);
      xhr.send();
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        if (data !== null && data !== undefined) return data;
      }
    } catch (e) {
      console.warn(`Server unavailable for ${endpoint}, using localStorage:`, e);
    }
  }
  try { return JSON.parse(localStorage.getItem(key)) || (key === DB_KEYS.settings ? {} : []); }
  catch { return key === DB_KEYS.settings ? {} : []; }
};

const set = (key, val) => {
  localStorage.setItem(key, JSON.stringify(val));
  if ([DB_KEYS.products, DB_KEYS.orders, DB_KEYS.messages, DB_KEYS.shipping, DB_KEYS.settings].includes(key)) {
    const endpoint = key === DB_KEYS.products ? 'products' : (key === DB_KEYS.orders ? 'orders' : (key === DB_KEYS.messages ? 'messages' : (key === DB_KEYS.shipping ? 'shipping' : 'settings')));
    try {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `/api/${endpoint}`, false);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify(val));
    } catch (e) {
      console.warn(`Failed to sync ${endpoint} database file:`, e);
    }
  }
};

// Initialisation seed
const init = () => {
  let currentProducts = get(DB_KEYS.products);
  if (!currentProducts || currentProducts.length === 0) {
    set(DB_KEYS.products, SEED_PRODUCTS);
  }
};
init();

// ============= API =============
export const api = {
  // Produits
  getProducts: (filter = {}) => {
    let list = get(DB_KEYS.products);
    if (filter.category) list = list.filter(p => p.category === filter.category);
    if (filter.featured) list = list.filter(p => p.featured);
    if (filter.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    // Résoudre les images uploadées en priorité
    return list.map(p => ({ ...p, image: resolveImage(p.id, p.image) }));
  },
  getProduct: (id) => {
    const p = get(DB_KEYS.products).find(x => x.id === id);
    return p ? { ...p, image: resolveImage(p.id, p.image) } : null;
  },
  addProduct: (data) => {
    const products = get(DB_KEYS.products);
    const newP = { id: 'p' + Date.now(), ...data };
    products.unshift(newP);
    set(DB_KEYS.products, products);
    return newP;
  },
  updateProduct: (id, data) => {
    const products = get(DB_KEYS.products);
    const idx = products.findIndex(p => p.id === id);
    if (idx === -1) return null;
    products[idx] = { ...products[idx], ...data };
    set(DB_KEYS.products, products);
    return products[idx];
  },
  deleteProduct: (id) => {
    const products = get(DB_KEYS.products).filter(p => p.id !== id);
    set(DB_KEYS.products, products);
    return true;
  },

  // Commandes
  getOrders: () => get(DB_KEYS.orders).sort((a, b) => b.date.localeCompare(a.date)),
  addOrder: (data) => {
    const orders = get(DB_KEYS.orders);
    const newO = { id: 'o' + Date.now(), date: new Date().toISOString().split('T')[0], status: 'en attente', ...data };
    orders.unshift(newO);
    set(DB_KEYS.orders, orders);
    return newO;
  },
  updateOrder: (id, data) => {
    const orders = get(DB_KEYS.orders);
    const idx = orders.findIndex(o => o.id === id);
    if (idx === -1) return null;
    orders[idx] = { ...orders[idx], ...data };
    set(DB_KEYS.orders, orders);
    return orders[idx];
  },

  // Messages
  getMessages: () => get(DB_KEYS.messages).sort((a, b) => b.date.localeCompare(a.date)),
  addMessage: (data) => {
    const messages = get(DB_KEYS.messages);
    const newM = { id: 'm' + Date.now(), date: new Date().toISOString().replace('T', ' ').slice(0, 16), read: false, ...data };
    messages.unshift(newM);
    set(DB_KEYS.messages, messages);
    return newM;
  },
  markRead: (id) => {
    const messages = get(DB_KEYS.messages);
    const m = messages.find(x => x.id === id);
    if (m) { m.read = true; set(DB_KEYS.messages, messages); }
  },

  // Favoris
  getFavs: () => {
    try {
      return JSON.parse(localStorage.getItem(DB_KEYS.favs)) || [];
    } catch (e) {
      return [];
    }
  },
  toggleFav: (id) => {
    let favs = api.getFavs();
    if (favs.includes(id)) favs = favs.filter(f => f !== id);
    else favs.push(id);
    localStorage.setItem(DB_KEYS.favs, JSON.stringify(favs));
    return favs;
  },

  // Shipping Rates
  getShippingRates: () => {
    const rates = get(DB_KEYS.shipping);
    return Array.isArray(rates) && rates.length > 0 ? rates : [
      { code: 'CI', country: "Côte d'Ivoire", flag: '🇨🇮', fee: 1500, freeAbove: 20000, prefix: '+225' },
      { code: 'SN', country: 'Sénégal', flag: '🇸🇳', fee: 3500, prefix: '+221' },
      { code: 'ML', country: 'Mali', flag: '🇲🇱', fee: 3500, prefix: '+223' },
      { code: 'BF', country: 'Burkina Faso', flag: '🇧🇫', fee: 3500, prefix: '+226' },
      { code: 'BJ', country: 'Bénin', flag: '🇧🇯', fee: 3500, prefix: '+229' },
      { code: 'TG', country: 'Togo', flag: '🇹🇬', fee: 3500, prefix: '+228' },
      { code: 'GH', country: 'Ghana', flag: '🇬🇭', fee: 4500, prefix: '+233' },
      { code: 'CM', country: 'Cameroun', flag: '🇨🇲', fee: 5000, prefix: '+237' }
    ];
  },
  updateShippingRates: (rates) => {
    set(DB_KEYS.shipping, rates);
    return rates;
  },

  // Settings & Profile
  getSettings: () => {
    const s = get(DB_KEYS.settings);
    return (s && Object.keys(s).length > 0) ? s : {
      adminUser: 'admin',
      adminPass: 'admin',
      storeName: 'Coque & Chic',
      ownerPhone: '+225 07 68 61 33 28',
      transferPhone: '+225 07 15 26 62 21',
      beneficiaryName: 'TRAORE AMINATA',
      beneficiaryCity: 'Abidjan',
      beneficiaryCountry: "Côte d'Ivoire"
    };
  },
  updateSettings: (newSettings) => {
    const current = api.getSettings();
    const updated = { ...current, ...newSettings };
    set(DB_KEYS.settings, updated);
    return updated;
  },
};

export const formatPrice = (n) => new Intl.NumberFormat('fr-FR').format(n) + ' FCFA';
