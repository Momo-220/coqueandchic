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

async function render() {
  if (!grid) return; // protection crash si élément absent du DOM
  const products = await api.fetchProducts({ category: currentCat, search: currentSearch });
  grid.innerHTML = '';
  if (!products || products.length === 0) {
    if (noResults) noResults.style.display = 'block';
    return;
  }
  if (noResults) noResults.style.display = 'none';
  products.forEach(p => grid.appendChild(renderProductCard(p)));
}

filtersEl?.addEventListener('click', async (e) => {
  const chip = e.target.closest('.filter-chip');
  if (!chip) return;
  filtersEl.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
  chip.classList.add('active');
  currentCat = chip.dataset.cat;
  await render();
});

let timeout;
searchInput?.addEventListener('input', (e) => {
  clearTimeout(timeout);
  timeout = setTimeout(async () => {
    currentSearch = e.target.value;
    await render();
  }, 200);
});

document.addEventListener('DOMContentLoaded', async () => {
  updateBadge();
  await render();
  bindProductEvents();
});
