// =============================================
// COQUE & CHIC — Logique Panier
// =============================================
import { api, formatPrice } from './api.js';

const CART_KEY = 'cc_cart';

export const cart = {
  get: () => {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch (e) {
      return [];
    }
  },

  add: (productId, qty = 1) => {
    const items = cart.get();
    const existing = items.find(i => i.id === productId);
    if (existing) existing.qty += qty;
    else items.push({ id: productId, qty });
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    updateBadge();
    return items;
  },

  remove: (productId) => {
    const items = cart.get().filter(i => i.id !== productId);
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    updateBadge();
    return items;
  },

  setQty: (productId, qty) => {
    const items = cart.get();
    const item = items.find(i => i.id === productId);
    if (item) {
      if (qty <= 0) return cart.remove(productId);
      item.qty = qty;
    }
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    updateBadge();
    return items;
  },

  clear: () => {
    localStorage.setItem(CART_KEY, '[]');
    updateBadge();
  },

  count: () => cart.get().reduce((sum, i) => sum + i.qty, 0),

  total: () => {
    return cart.get().reduce((sum, item) => {
      const p = api.getProduct(item.id);
      return sum + (p ? p.price * item.qty : 0);
    }, 0);
  },

  details: () => {
    return cart.get().map(item => {
      const p = api.getProduct(item.id);
      return p ? { ...p, qty: item.qty, subtotal: p.price * item.qty } : null;
    }).filter(Boolean);
  },
};

export function updateBadge() {
  const count = cart.count();
  const badge = document.getElementById('cartCount');
  const favBadge = document.getElementById('favCount');
  if (badge) {
    if (count > 0) { badge.style.display = 'grid'; badge.textContent = count; }
    else badge.style.display = 'none';
  }
  if (favBadge) {
    const favs = api.getFavs();
    if (favs.length > 0) { favBadge.style.display = 'grid'; favBadge.textContent = favs.length; }
    else favBadge.style.display = 'none';
  }
}

// Toast notifications
export function toast(msg, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = msg;
  container.appendChild(t);
  setTimeout(() => t.remove(), 3200);
}
