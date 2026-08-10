// =============================================
// COQUE & CHIC — Couche Données (100% MongoDB Atlas)
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

// Helpers sessionStorage & localStorage
const get = (key) => {
  const storage = [DB_KEYS.favs, DB_KEYS.cart].includes(key) ? localStorage : sessionStorage;
  try { return JSON.parse(storage.getItem(key)) || (key === DB_KEYS.settings ? {} : []); }
  catch { return key === DB_KEYS.settings ? {} : []; }
};

const set = (key, val) => {
  const storage = [DB_KEYS.favs, DB_KEYS.cart].includes(key) ? localStorage : sessionStorage;
  storage.setItem(key, JSON.stringify(val));
  if ([DB_KEYS.products, DB_KEYS.orders, DB_KEYS.messages, DB_KEYS.shipping, DB_KEYS.settings].includes(key)) {
    const endpoint = key === DB_KEYS.products ? 'products' : (key === DB_KEYS.orders ? 'orders' : (key === DB_KEYS.messages ? 'messages' : (key === DB_KEYS.shipping ? 'shipping' : 'settings')));
    fetch(`/api/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(val)
    }).catch(e => console.warn(`Enregistrement asynchrone échoué pour ${endpoint}:`, e));
  }
};

// ============= API 100% MONGODB ATLAS =============
export const api = {
  // Produits
  getProducts: (filter = {}) => {
    let list = get(DB_KEYS.products);
    if (!Array.isArray(list)) list = [];
    if (filter.category) list = list.filter(p => p.category === filter.category);
    if (filter.featured) list = list.filter(p => p.featured);
    if (filter.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    return list.map(p => ({ ...p, image: resolveImage(p.id, p.image) }));
  },
  getProduct: (id) => {
    const list = get(DB_KEYS.products);
    if (!Array.isArray(list)) return null;
    const p = list.find(x => x.id === id);
    return p ? { ...p, image: resolveImage(p.id, p.image) } : null;
  },
  addProduct: (data) => {
    const products = get(DB_KEYS.products);
    const list = Array.isArray(products) ? products : [];
    const newP = { id: 'p' + Date.now(), ...data };
    list.unshift(newP);
    set(DB_KEYS.products, list);
    return newP;
  },
  updateProduct: (id, data) => {
    const products = get(DB_KEYS.products);
    const list = Array.isArray(products) ? products : [];
    const idx = list.findIndex(p => p.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...data };
    set(DB_KEYS.products, list);
    return list[idx];
  },
  deleteProduct: (id) => {
    const products = get(DB_KEYS.products);
    const list = Array.isArray(products) ? products : [];
    const filtered = list.filter(p => p.id !== id);
    set(DB_KEYS.products, filtered);
    return true;
  },

  // Commandes
  getOrders: () => {
    const list = get(DB_KEYS.orders);
    return Array.isArray(list) ? list.sort((a, b) => b.date.localeCompare(a.date)) : [];
  },
  addOrder: (data) => {
    const orders = get(DB_KEYS.orders);
    const list = Array.isArray(orders) ? orders : [];
    const newO = { id: 'o' + Date.now(), date: new Date().toISOString().split('T')[0], status: 'en attente', ...data };
    list.unshift(newO);
    set(DB_KEYS.orders, list);
    return newO;
  },
  updateOrder: (id, data) => {
    const orders = get(DB_KEYS.orders);
    const list = Array.isArray(orders) ? orders : [];
    const idx = list.findIndex(o => o.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...data };
    set(DB_KEYS.orders, list);
    return list[idx];
  },

  // Messages
  getMessages: () => {
    const list = get(DB_KEYS.messages);
    return Array.isArray(list) ? list.sort((a, b) => b.date.localeCompare(a.date)) : [];
  },
  addMessage: (data) => {
    const messages = get(DB_KEYS.messages);
    const list = Array.isArray(messages) ? messages : [];
    const newM = { id: 'm' + Date.now(), date: new Date().toISOString().replace('T', ' ').slice(0, 16), read: false, ...data };
    list.unshift(newM);
    set(DB_KEYS.messages, list);
    return newM;
  },
  markRead: (id) => {
    const messages = get(DB_KEYS.messages);
    const list = Array.isArray(messages) ? messages : [];
    const m = list.find(x => x.id === id);
    if (m) { m.read = true; set(DB_KEYS.messages, list); }
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
    return Array.isArray(rates) ? rates : [];
  },
  updateShippingRates: (rates) => {
    set(DB_KEYS.shipping, rates);
    return rates;
  },

  // Settings & Profile (Source 100% MongoDB Atlas)
  getSettings: () => {
    return get(DB_KEYS.settings) || {};
  },
  fetchSettings: async () => {
    try {
      const res = await fetch('/api/settings?t=' + Date.now());
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data === 'object') {
          sessionStorage.setItem(DB_KEYS.settings, JSON.stringify(data));
          return data;
        }
      }
    } catch (e) {
      console.warn('Lecture directe MongoDB échouée pour settings:', e);
    }
    return api.getSettings();
  },
  updateSettings: async (newSettings) => {
    const current = await api.fetchSettings();
    const updated = { ...current, ...newSettings };
    set(DB_KEYS.settings, updated);
    return updated;
  },
  fetchProducts: async (filter = {}) => {
    try {
      const res = await fetch('/api/products?t=' + Date.now());
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          sessionStorage.setItem(DB_KEYS.products, JSON.stringify(data));
        }
      }
    } catch (e) {}
    return api.getProducts(filter);
  },
  fetchOrders: async () => {
    try {
      const res = await fetch('/api/orders?t=' + Date.now());
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          sessionStorage.setItem(DB_KEYS.orders, JSON.stringify(data));
        }
      }
    } catch (e) {}
    return api.getOrders();
  },
  fetchMessages: async () => {
    try {
      const res = await fetch('/api/messages?t=' + Date.now());
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          sessionStorage.setItem(DB_KEYS.messages, JSON.stringify(data));
        }
      }
    } catch (e) {}
    return api.getMessages();
  },
  fetchShippingRates: async () => {
    try {
      const res = await fetch('/api/shipping?t=' + Date.now());
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          sessionStorage.setItem(DB_KEYS.shipping, JSON.stringify(data));
        }
      }
    } catch (e) {}
    return api.getShippingRates();
  },
  syncAllFromDatabase: async () => {
    const endpoints = [
      { key: DB_KEYS.products, name: 'products' },
      { key: DB_KEYS.orders, name: 'orders' },
      { key: DB_KEYS.messages, name: 'messages' },
      { key: DB_KEYS.shipping, name: 'shipping' },
      { key: DB_KEYS.settings, name: 'settings' }
    ];
    await Promise.all(endpoints.map(async (ep) => {
      try {
        const res = await fetch(`/api/${ep.name}?t=` + Date.now());
        if (res.ok) {
          const data = await res.json();
          if (data !== null && data !== undefined) {
            sessionStorage.setItem(ep.key, JSON.stringify(data));
          }
        }
      } catch (e) {
        console.warn(`Synchronisation échouée pour ${ep.name}:`, e);
      }
    }));
  },
};

export const formatPrice = (n) => new Intl.NumberFormat('fr-FR').format(n || 0) + ' FCFA';
