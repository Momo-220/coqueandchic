import { api, formatPrice } from './api.js';
import { cart, updateBadge, toast } from './cart.js';

async function initProduitDetail() {
  try {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    await api.fetchProducts();
    const product = api.getProduct(id);
    const container = document.getElementById('productDetail');

    if (!product) {
      container.innerHTML = '<p style="text-align:center; padding: var(--space-xl); color: var(--charcoal);">Produit introuvable. <a href="boutique.html" style="color: var(--rose-deep); text-decoration: underline;">Retour à la boutique</a></p>';
    } else {
    let qty = 1;
    const isFav = api.getFavs().includes(id);
    container.innerHTML = `
      <div class="product-detail-img">
        <img src="${product.image}" alt="${product.name}">
      </div>
      <div class="product-detail-info">
        <span class="category-badge" style="background: var(--rose-blush); color: var(--rose-deep); padding: 0.35rem 0.85rem; border-radius: 20px; font-size: 0.8rem; font-weight: 600; display: inline-block; margin-bottom: 1rem;">${product.category === 'coques' ? 'Coques' : 'Accessoires'}</span>
        <h1 style="font-size: 2.2rem; font-weight: 700; margin-bottom: 0.5rem; font-family: 'Playfair Display', serif; color: var(--charcoal);">${product.name}</h1>
        <div class="price" style="color: var(--rose-deep); font-size: 2rem; font-weight: 700; margin-bottom: 1.5rem;">${formatPrice(product.price)}</div>
        
        <div style="margin-bottom: 1.5rem;">
          <h3 style="font-size: 1.1rem; margin-bottom: 0.5rem; font-weight: 600; color: var(--charcoal);">Description</h3>
          <p style="color: var(--gris-fonce); line-height: 1.6; font-size: 0.95rem;">${product.description}</p>
        </div>

        <div style="margin-bottom: 2rem;">
          <h3 style="font-size: 1.1rem; margin-bottom: 0.5rem; font-weight: 600; color: var(--charcoal);">Quantité</h3>
          <div class="qty-control">
            <button id="qtyMinus" style="cursor:pointer;">−</button>
            <span id="qtyVal">1</span>
            <button id="qtyPlus" style="cursor:pointer;">+</button>
          </div>
        </div>

        <div class="action-row" style="display: flex; gap: 0.75rem; margin-bottom: 1rem; align-items: center;">
          <button class="btn btn-primary" id="addBtn" style="flex: 1; border-radius: 8px; font-weight: 600; padding: 1rem; border: none; display: flex; align-items: center; justify-content: center; gap: 0.5rem; height: 50px; font-size: 0.95rem; cursor: pointer; box-shadow: var(--shadow-rose);">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            Ajouter au panier
          </button>
          <button class="icon-btn" id="favBtn" style="background: ${isFav ? 'var(--rose-primary)' : 'var(--rose-blush)'}; color: ${isFav ? 'white' : 'var(--rose-deep)'}; border: none; border-radius: 8px; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; box-shadow: none; transform: none; transition: none;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/></svg>
          </button>
        </div>

        <a href="https://wa.me/2250768613328?text=Bonjour, je suis intéressé par : ${encodeURIComponent(product.name)}" class="btn btn-outline" style="width: 100%; border-radius: 8px; font-weight: 600; padding: 1rem; text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 0.5rem; box-sizing: border-box; height: 50px; font-size: 0.95rem; cursor: pointer;" target="_blank">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l-.999 3.648 3.978-.607zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
          Commander via WhatsApp
        </a>

        <div class="product-meta-card" style="margin-top: 2rem; background: rgba(252,231,243,0.2); border: 1px solid var(--rose-soft); border-radius: 8px; padding: 1rem 1.25rem;">
          <div style="display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid var(--rose-soft);">
            <span style="color: var(--gris-fonce); font-size: 0.9rem;">Disponibilité</span>
            <span style="color: ${product.stock > 0 ? '#10b981' : '#dc2626'}; font-weight: 600; font-size: 0.9rem;">${product.stock > 0 ? 'En stock' : 'Rupture de stock'}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid var(--rose-soft);">
            <span style="color: var(--gris-fonce); font-size: 0.9rem;">Catégorie</span>
            <span style="color: var(--charcoal); font-size: 0.9rem;">${product.category === 'coques' ? 'Coques' : 'Accessoires'}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 0.75rem 0;">
            <span style="color: var(--gris-fonce); font-size: 0.9rem;">Livraison</span>
            <span style="color: var(--charcoal); font-size: 0.9rem;">${product.delivery || '2 à 5 jours ouvrés'}</span>
          </div>
        </div>
      </div>
    `;

    document.getElementById('qtyMinus').onclick = () => {
      if (qty > 1) { qty--; document.getElementById('qtyVal').textContent = qty; }
    };
    document.getElementById('qtyPlus').onclick = () => {
      if (qty < product.stock) { qty++; document.getElementById('qtyVal').textContent = qty; }
    };
    document.getElementById('addBtn').onclick = () => {
      cart.add(id, qty);
      updateBadge();
      toast('Ajouté au panier !');
    };
    document.getElementById('favBtn').onclick = () => {
      api.toggleFav(id);
      location.reload();
    };
    }
  } catch (err) {
    console.error("Error in produit.js:", err);
    const root = document.getElementById('productDetail') || document.body;
    root.innerHTML = `<div style="color:red; padding:20px; background:#ffebee; border:1px solid red; margin:20px; font-family: sans-serif;">Error: ${err.message}<br><pre>${err.stack}</pre></div>`;
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  updateBadge();
  await initProduitDetail();
});
