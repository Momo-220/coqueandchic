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

// Helper de lecture API sécurisé multi-domaines (gère les redirections www / non-www)
async function safeFetchApi(endpoint) {
  const ts = Date.now();
  const relativeUrl = `/api/${endpoint}?t=${ts}`;
  const absoluteUrl = `https://www.coqueandchic.shop/api/${endpoint}?t=${ts}`;

  try {
    let res = await fetch(relativeUrl);
    if (res.ok) {
      const data = await res.json();
      if (data !== null && data !== undefined) return data;
    }
  } catch (e) {}

  try {
    let res = await fetch(absoluteUrl);
    if (res.ok) {
      const data = await res.json();
      if (data !== null && data !== undefined) return data;
    }
  } catch (e) {}

  return null;
}

// Helpers sessionStorage & localStorage
const get = (key) => {
  const storage = [DB_KEYS.favs, DB_KEYS.cart].includes(key) ? localStorage : sessionStorage;
  try { return JSON.parse(storage.getItem(key)) || (key === DB_KEYS.settings ? {} : []); }
  catch { return key === DB_KEYS.settings ? {} : []; }
};

const postAction = (endpoint, action, id, payload) => {
  const bodyStr = JSON.stringify({ action, id, [endpoint.slice(0, -1)]: payload });
  fetch(`/api/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: bodyStr
  }).catch(() => {
    fetch(`https://www.coqueandchic.shop/api/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: bodyStr
    }).catch(e => console.warn(`Enregistrement asynchrone échoué pour ${endpoint}:`, e));
  });
};

const set = (key, val) => {
  const storage = [DB_KEYS.favs, DB_KEYS.cart].includes(key) ? localStorage : sessionStorage;
  storage.setItem(key, JSON.stringify(val));
  if ([DB_KEYS.shipping, DB_KEYS.settings].includes(key)) {
    const endpoint = key === DB_KEYS.shipping ? 'shipping' : 'settings';
    const bodyStr = JSON.stringify(val);
    fetch(`/api/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: bodyStr
    }).catch(() => {
      fetch(`https://www.coqueandchic.shop/api/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: bodyStr
      }).catch(e => console.warn(`Enregistrement asynchrone échoué pour ${endpoint}:`, e));
    });
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
    sessionStorage.setItem(DB_KEYS.products, JSON.stringify(list));
    postAction('products', 'add', newP.id, newP);
    return newP;
  },
  updateProduct: (id, data) => {
    const products = get(DB_KEYS.products);
    const list = Array.isArray(products) ? products : [];
    const idx = list.findIndex(p => p.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...data };
    sessionStorage.setItem(DB_KEYS.products, JSON.stringify(list));
    postAction('products', 'update', id, list[idx]);
    return list[idx];
  },
  deleteProduct: (id) => {
    const products = get(DB_KEYS.products);
    const list = Array.isArray(products) ? products : [];
    const filtered = list.filter(p => p.id !== id);
    sessionStorage.setItem(DB_KEYS.products, JSON.stringify(filtered));
    postAction('products', 'delete', id);
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
    sessionStorage.setItem(DB_KEYS.orders, JSON.stringify(list));
    postAction('orders', 'add', newO.id, newO);
    return newO;
  },
  updateOrder: (id, data) => {
    const orders = get(DB_KEYS.orders);
    const list = Array.isArray(orders) ? orders : [];
    const idx = list.findIndex(o => o.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...data };
    sessionStorage.setItem(DB_KEYS.orders, JSON.stringify(list));
    postAction('orders', 'update', id, list[idx]);
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
    sessionStorage.setItem(DB_KEYS.messages, JSON.stringify(list));
    postAction('messages', 'add', newM.id, newM);
    return newM;
  },
  markRead: (id) => {
    const messages = get(DB_KEYS.messages);
    const list = Array.isArray(messages) ? messages : [];
    const m = list.find(x => x.id === id);
    if (m) {
      m.read = true;
      sessionStorage.setItem(DB_KEYS.messages, JSON.stringify(list));
      postAction('messages', 'update', id, m);
    }
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
    const data = await safeFetchApi('settings');
    if (data && typeof data === 'object') {
      sessionStorage.setItem(DB_KEYS.settings, JSON.stringify(data));
      return data;
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
    const data = await safeFetchApi('products');
    if (Array.isArray(data)) {
      sessionStorage.setItem(DB_KEYS.products, JSON.stringify(data));
    }
    return api.getProducts(filter);
  },
  fetchOrders: async () => {
    const data = await safeFetchApi('orders');
    if (Array.isArray(data)) {
      sessionStorage.setItem(DB_KEYS.orders, JSON.stringify(data));
    }
    return api.getOrders();
  },
  fetchMessages: async () => {
    const data = await safeFetchApi('messages');
    if (Array.isArray(data)) {
      sessionStorage.setItem(DB_KEYS.messages, JSON.stringify(data));
    }
    return api.getMessages();
  },
  fetchShippingRates: async () => {
    const data = await safeFetchApi('shipping');
    if (Array.isArray(data)) {
      sessionStorage.setItem(DB_KEYS.shipping, JSON.stringify(data));
    }
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
      const data = await safeFetchApi(ep.name);
      if (data !== null && data !== undefined) {
        sessionStorage.setItem(ep.key, JSON.stringify(data));
      }
    }));
  },
};

export const formatPrice = (n) => new Intl.NumberFormat('fr-FR').format(n || 0) + ' FCFA';
