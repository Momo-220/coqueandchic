import { api } from './api.js';
import { renderProductCard, bindProductEvents } from './app.js';
import { updateBadge } from './cart.js';

const grid = document.getElementById('productsGrid');
const filtersEl = document.getElementById('filters');
const searchInput = document.getElementById('searchInput');
const noResults = document.getElementById('noResults');

let currentCat = '';
let currentSearch = '';

// Init filtre depuis URL (?cat=coques)
const params = new URLSearchParams(window.location.search);
if (params.get('cat')) {
  currentCat = params.get('cat');
  document.querySelectorAll('.filter-chip').forEach(c => {
    c.classList.toggle('active', c.dataset.cat === currentCat);
  });
}

function render() {
  const products = api.getProducts({ category: currentCat, search: currentSearch });
  grid.innerHTML = '';
  if (products.length === 0) {
    noResults.style.display = 'block';
    return;
  }
  noResults.style.display = 'none';
  products.forEach(p => grid.appendChild(renderProductCard(p)));
}

filtersEl?.addEventListener('click', (e) => {
  const chip = e.target.closest('.filter-chip');
  if (!chip) return;
  filtersEl.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
  chip.classList.add('active');
  currentCat = chip.dataset.cat;
  render();
});

let timeout;
searchInput?.addEventListener('input', (e) => {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    currentSearch = e.target.value;
    render();
  }, 200);
});

document.addEventListener('DOMContentLoaded', () => {
  updateBadge();
  render();
  bindProductEvents();
});
