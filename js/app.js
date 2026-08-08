// =============================================
// COQUE & CHIC — App globale (init, reveal, header)
// =============================================
import { api, formatPrice } from './api.js';
import { cart, updateBadge, toast } from './cart.js';
import { getUploadedImage } from './upload.js';

// ============= LOGO =============
export function initLogo() {
  const logoImg = document.querySelector('.logo img');
  if (!logoImg) return;
  const uploaded = getUploadedImage('logo');
  if (uploaded) {
    logoImg.src = uploaded;
    logoImg.style.display = 'block';
    // Cacher le texte si logo présent
    const text = logoImg.nextElementSibling;
    if (text && text.tagName === 'SPAN') text.style.display = 'none';
  }
}

// ============= RENDER PRODUIT (carte) =============
export function renderProductCard(p) {
  const isFav = api.getFavs().includes(p.id);
  const card = document.createElement('div');
  card.className = 'product-card' + (p.stock === 0 ? ' out-of-stock' : '');
  card.setAttribute('data-product-id', p.id);
  card.innerHTML = `
    <div class="product-image">
      <img src="${p.image}" alt="${p.name}" loading="lazy">
      ${p.stock === 0 ? `<span class="product-badge" style="background:#ef4444 !important;">Rupture</span>` : (p.badge ? `<span class="product-badge">${p.badge}</span>` : '')}
      <button class="product-fav ${isFav ? 'active' : ''}" data-fav="${p.id}" aria-label="Ajouter aux favoris">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/></svg>
      </button>
    </div>
    <div class="product-info">
      <div class="product-category">${p.category === 'coques' ? 'Coques' : 'Accessoires'}</div>
      <div class="product-name">${p.name}</div>
      <div class="product-price">
        ${formatPrice(p.price)}
        ${p.oldPrice ? `<span class="product-price-old">${formatPrice(p.oldPrice)}</span>` : ''}
      </div>
      ${p.stock === 0 ? `
        <button class="product-add" disabled style="background:#9ca3af !important; border-color:#9ca3af !important; cursor:not-allowed; opacity:0.8; width:100%; display:flex; justify-content:center; align-items:center; gap:0.5rem;">
          Rupture de stock
        </button>
      ` : `
        <button class="product-add" data-add="${p.id}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
          Ajouter au panier
        </button>
      `}
    </div>
  `;
  return card;
}

// ============= EVENT HANDLERS =============
let eventsBound = false;
export function bindProductEvents(scope = document) {
  if (scope === document) {
    if (eventsBound) return;
    eventsBound = true;
  }
  scope.addEventListener('click', (e) => {
    // Favori
    const favBtn = e.target.closest('[data-fav]');
    if (favBtn) {
      e.preventDefault();
      e.stopPropagation();
      const id = favBtn.dataset.fav;
      const favs = api.toggleFav(id);
      favBtn.classList.toggle('active');
      const svg = favBtn.querySelector('svg');
      if (svg) svg.setAttribute('fill', favs.includes(id) ? 'currentColor' : 'none');
      updateBadge();
      toast(favs.includes(id) ? '❤️ Ajouté aux favoris' : 'Retiré des favoris');
      return;
    }

    // Ajouter au panier
    const addBtn = e.target.closest('[data-add]');
    if (addBtn) {
      e.preventDefault();
      e.stopPropagation();
      const id = addBtn.dataset.add;
      cart.add(id);
      updateBadge();
      toast('✨ Ajouté au panier !');
      return;
    }

    // Clic carte → fiche produit
    const card = e.target.closest('.product-card');
    if (card) {
      const id = card.dataset.productId;
      window.location.href = `produit.html?id=${id}`;
    }
  });
}

// ============= REVEAL ON SCROLL =============
function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ============= HEADER SCROLL =============
function initHeader() {
  const header = document.getElementById('header');
  if (!header) return;
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  }, { passive: true });
}

// ============= MENU MOBILE =============
function initMenu() {
  const toggle = document.getElementById('menuToggle');
  const nav = document.getElementById('mainNav');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', () => nav.classList.toggle('open'));
}

// ============= INIT PAGE D'ACCUEIL =============
function initHome() {
  const catGrid = document.getElementById('categoriesGrid');
  const featGrid = document.getElementById('featuredGrid');
  if (!catGrid || !featGrid) return;

  const categories = [
    { id: 'coques', name: 'Coques téléphone', img: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=600', count: 0 },
    { id: 'accessoires', name: 'Accessoires de charme', img: 'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=600', count: 0 },
  ];

  // Compte par catégorie
  const all = api.getProducts();
  categories.forEach(c => c.count = all.filter(p => p.category === c.id).length);

  categories.forEach(c => {
    const card = document.createElement('a');
    card.href = `boutique.html?cat=${c.id}`;
    card.className = 'product-card';
    card.style.textDecoration = 'none';
    card.innerHTML = `
      <div class="product-image">
        <img src="${c.img}" alt="${c.name}" loading="lazy">
      </div>
      <div class="product-info">
        <div class="product-category">${c.count} produits</div>
        <div class="product-name" style="font-size:1.2rem">${c.name}</div>
        <div class="product-price" style="font-size:1rem; font-weight:500; color: var(--rose-primary);">
          Découvrir →
        </div>
      </div>
    `;
    catGrid.appendChild(card);
  });

  // Produits vedettes
  api.getProducts({ featured: true }).forEach(p => featGrid.appendChild(renderProductCard(p)));
}

// ============= INIT GLOBAL =============
document.addEventListener('DOMContentLoaded', () => {
  initLogo();
  initHeader();
  initMenu();
  initReveal();
  updateBadge();
  bindProductEvents();
  initHome();
});
