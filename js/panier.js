import { api, formatPrice } from './api.js';
import { cart, updateBadge, toast } from './cart.js';

const itemsEl = document.getElementById('cartItems');
const summaryEl = document.getElementById('cartSummary');

const CITIES_BY_COUNTRY = {
  CI: ["Abidjan", "Bouaké", "Yamoussoukro", "San-Pédro", "Korhogo", "Man", "Daloa", "Gagnoa", "Autre..."],
  SN: ["Dakar", "Thiès", "Saint-Louis", "Mbour", "Ziguinchor", "Kaolack", "Touba", "Rufisque", "Autre..."],
  ML: ["Bamako", "Sikasso", "Ségou", "Mopti", "Kayes", "Gao", "Koutiala", "Autre..."],
  BF: ["Ouagadougou", "Bobo-Dioulasso", "Koudougou", "Banfora", "Ouahigouya", "Autre..."],
  BJ: ["Cotonou", "Porto-Novo", "Parakou", "Abomey-Calavi", "Natitingou", "Autre..."],
  TG: ["Lomé", "Kara", "Sokodé", "Kpalimé", "Atakpamé", "Autre..."],
  GH: ["Accra", "Kumasi", "Tamale", "Sekondi-Takoradi", "Cape Coast", "Autre..."],
  CM: ["Douala", "Yaoundé", "Bafoussam", "Garoua", "Bamenda", "Maroua", "Autre..."]
};

function getSelectedCountryInfo(countryCode) {
  const rates = api.getShippingRates();
  return rates.find(r => r.code === countryCode) || rates[0];
}

function calcDelivery(countryCode, subtotal) {
  const info = getSelectedCountryInfo(countryCode);
  if (info.freeAbove && subtotal >= info.freeAbove) return 0;
  return info.fee;
}

function render() {
  const items = cart.details();
  if (items.length === 0) {
    itemsEl.innerHTML = `<div class="empty-cart"><p style="font-size:1.3rem; color: var(--gris-fonce);">🛍️ Votre panier est vide</p><a href="boutique.html" class="btn btn-primary" style="margin-top: var(--space-md);">Découvrir la boutique</a></div>`;
    summaryEl.innerHTML = '';
    return;
  }

  itemsEl.innerHTML = items.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}">
      <div>
        <div class="name">${item.name}</div>
        <div class="price">${formatPrice(item.price)}</div>
        <div style="display: flex; align-items: center; gap: 0.5rem; margin-top: 0.5rem;">
          <button class="qty-btn" data-id="${item.id}" data-act="-" style="width:30px;height:30px;border-radius:50%;background:var(--rose-blush);color:var(--rose-deep);">−</button>
          <span style="min-width:30px; text-align:center; font-weight:600;">${item.qty}</span>
          <button class="qty-btn" data-id="${item.id}" data-act="+" style="width:30px;height:30px;border-radius:50%;background:var(--rose-blush);color:var(--rose-deep);">+</button>
        </div>
      </div>
      <div style="text-align:right;">
        <div style="font-weight:700; color: var(--rose-deep);">${formatPrice(item.subtotal)}</div>
        <button data-remove="${item.id}" style="color: var(--gris); font-size: 0.85rem; margin-top: 0.5rem;">Supprimer</button>
      </div>
    </div>
  `).join('');

  const subtotal = cart.total();
  const defaultDelivery = calcDelivery('CI', subtotal);
  const settings = api.getSettings();
  const ownerPhone = settings.ownerPhone || '+225 07 68 61 33 28';
  const ownerWa = ownerPhone.replace(/\D/g, '');

  summaryEl.innerHTML = `
    <h3>Récapitulatif</h3>
    <div class="summary-row"><span>Sous-total</span><span>${formatPrice(subtotal)}</span></div>
    <div class="summary-row summary-total"><span>Total (est.)</span><span>${formatPrice(subtotal + defaultDelivery)}</span></div>
    <button class="btn btn-primary" id="checkoutBtn" style="width:100%; margin-top: var(--space-md);">Commander</button>
    <a href="https://wa.me/${ownerWa}?text=${encodeURIComponent('Bonjour, je souhaite commander :\n' + items.map(i => `- ${i.name} x${i.qty} = ${formatPrice(i.subtotal)}`).join('\n') + '\n\nSous-total : ' + formatPrice(subtotal))}" class="btn btn-outline" style="width:100%; margin-top: 0.5rem;" target="_blank">
      Commander via WhatsApp
    </a>
    <p style="font-size:0.8rem; color: var(--gris); text-align:center; margin-top: var(--space-sm);">Expédition internationale : 🇨🇮 🇸🇳 🇲🇱 🇧🇫 🇧🇯 🇹🇬 🇬🇭 🇨🇲</p>
  `;

  // Events
  document.querySelectorAll('.qty-btn').forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      const current = cart.get().find(i => i.id === id);
      const newQty = btn.dataset.act === '+' ? current.qty + 1 : current.qty - 1;
      cart.setQty(id, newQty);
      render();
      updateBadge();
    };
  });
  document.querySelectorAll('[data-remove]').forEach(btn => {
    btn.onclick = () => { cart.remove(btn.dataset.remove); render(); updateBadge(); toast('Produit retiré'); };
  });

  const setupModalCountryCityLogic = () => {
    const countrySel = document.getElementById('orderCountry');
    const citySel = document.getElementById('orderCity');
    const customCityDiv = document.getElementById('customCityContainer');
    const phoneInput = document.getElementById('orderPhone');
    const modalTotal = document.getElementById('modalTotal');

    if (!countrySel || !citySel) return;

    const updateCitiesAndPrice = () => {
      const countryCode = countrySel.value;
      const info = getSelectedCountryInfo(countryCode);
      const cities = CITIES_BY_COUNTRY[countryCode] || ["Autre..."];
      
      citySel.innerHTML = cities.map(c => `<option value="${c}">${c}</option>`).join('');
      
      if (citySel.value === "Autre...") {
        customCityDiv.style.display = "block";
      } else {
        customCityDiv.style.display = "none";
      }

      if (!phoneInput.value || phoneInput.value.startsWith('+')) {
        phoneInput.value = info.prefix + ' ';
      }

      const currentDelivery = calcDelivery(countryCode, subtotal);
      if (modalTotal) {
        modalTotal.textContent = formatPrice(subtotal + currentDelivery);
      }
    };

    countrySel.onchange = updateCitiesAndPrice;
    citySel.onchange = () => {
      if (citySel.value === "Autre...") {
        customCityDiv.style.display = "block";
      } else {
        customCityDiv.style.display = "none";
      }
    };

    updateCitiesAndPrice();
  };

  const bindPaymentCardEvents = () => {
    const hiddenInput = document.getElementById('orderPayment');
    const cards = document.querySelectorAll('.payment-card');
    cards.forEach(card => {
      card.onclick = () => {
        const val = card.dataset.payment;
        if (hiddenInput) hiddenInput.value = val;
        
        cards.forEach(c => {
          c.classList.remove('active');
          c.style.border = '1px solid #d1d5db';
          c.style.background = '#ffffff';
        });
        
        card.classList.add('active');
        if (val === 'Wave') {
          card.style.border = '2px solid #1dc5d8';
          card.style.background = '#f0fdfa';
        } else if (val === 'Orange Money') {
          card.style.border = '2px solid #ff6600';
          card.style.background = '#fff7ed';
        } else if (val === 'Western Union / Ria') {
          card.style.border = '2px solid #eb1c24';
          card.style.background = '#fdf2f8';
        } else {
          card.style.border = '2px solid #10b981';
          card.style.background = '#f0fdf4';
        }
        
        updatePaymentInstructions();
      };
    });
  };

  const updatePaymentInstructions = () => {
    const method = document.getElementById('orderPayment')?.value;
    const box = document.getElementById('paymentInstructions');
    if (!box) return;

    const settings = api.getSettings();
    const tPhone = settings.transferPhone || '+225 07 15 26 62 21';
    const bName = settings.beneficiaryName || 'TRAORE AMINATA';
    const bCity = settings.beneficiaryCity || 'Abidjan';
    const bCountry = settings.beneficiaryCountry || "Côte d'Ivoire";

    if (method === 'Wave') {
      box.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
          <img src="images/wave.png" alt="Wave" style="height: 26px; object-fit: contain;">
          <span style="font-weight: 700; color: #1dc5d8; font-size: 0.9rem;">Instructions de paiement Wave</span>
        </div>
        <p style="margin: 0 0 0.5rem 0; line-height: 1.4;">Effectuez le transfert vers le numéro : <strong style="user-select: all; color: #1dc5d8;">${tPhone}</strong></p>
        <div style="margin-bottom: 0.75rem;">
          <a href="https://wave.com/pay/${tPhone.replace(/\D/g, '')}" target="_blank" class="btn btn-outline" style="display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.45rem 0.85rem; font-size: 0.8rem; border-color: #1dc5d8; color: #1dc5d8; border-radius: 6px; text-decoration: none; font-weight: 700;">
            <span>Ouvrir l'application Wave</span> ➔
          </a>
        </div>
        <label style="display: block; font-size: 0.8rem; font-weight: 600; margin-bottom: 0.25rem;">Numéro émetteur / Référence du transfert :</label>
        <input type="text" id="orderRef" placeholder="Ex: Réf Wave ou N° de téléphone" style="width: 100%; padding: 0.5rem; border: 1px solid var(--rose-soft); border-radius: 6px; font-family: inherit; font-size: 0.85rem; box-sizing: border-box;">
      `;
    } else if (method === 'Orange Money') {
      box.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
          <img src="images/Orange.png" alt="Orange Money" style="height: 26px; object-fit: contain;">
          <span style="font-weight: 700; color: #ff6600; font-size: 0.9rem;">Instructions Orange Money</span>
        </div>
        <p style="margin: 0 0 0.5rem 0; line-height: 1.4;">Effectuez le transfert vers le numéro : <strong style="user-select: all; color: #ff6600;">${tPhone}</strong></p>
        <p style="margin: 0 0 0.75rem 0; font-size: 0.8rem; color: var(--gris-fonce);">Code USSD direct : <code style="background: #fff; padding: 3px 6px; border-radius: 4px; border: 1px solid #fed7aa; font-weight: 600; color: #ff6600;">*144*4*2*${tPhone.replace(/\D/g, '').slice(-10)}*Montant#</code></p>
        <label style="display: block; font-size: 0.8rem; font-weight: 600; margin-bottom: 0.25rem;">Numéro d'ID de la transaction Orange Money :</label>
        <input type="text" id="orderRef" placeholder="Ex: PP240724.XXXX.XXXXX" style="width: 100%; padding: 0.5rem; border: 1px solid var(--rose-soft); border-radius: 6px; font-family: inherit; font-size: 0.85rem; box-sizing: border-box;">
      `;
    } else if (method === 'Western Union / Ria') {
      box.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
          <img src="images/Western.png" alt="Western Union" style="height: 24px; object-fit: contain;">
          <img src="images/ria.png" alt="Ria" style="height: 24px; object-fit: contain;">
          <span style="font-weight: 700; color: var(--rose-deep); font-size: 0.9rem;">Coordonnées du bénéficiaire</span>
        </div>
        <div style="background: #ffffff; padding: 0.65rem 0.85rem; border-radius: 6px; border: 1px solid var(--rose-soft); margin-bottom: 0.75rem; line-height: 1.6; font-size: 0.82rem;">
          <div>• <strong>Nom et prénom :</strong> ${bName}</div>
          <div>• <strong>Ville :</strong> ${bCity}</div>
          <div>• <strong>Pays :</strong> ${bCountry}</div>
          <div>• <strong>Téléphone :</strong> ${tPhone}</div>
        </div>
        <label style="display: block; font-size: 0.8rem; font-weight: 600; margin-bottom: 0.25rem; color: var(--rose-deep);">Numéro de transfert (MTCN ou numéro de référence) * :</label>
        <input type="text" id="orderRef" required placeholder="Saisissez le code MTCN ou N° de référence" style="width: 100%; padding: 0.5rem; border: 1px solid var(--rose-soft); border-radius: 6px; font-family: inherit; font-size: 0.85rem; box-sizing: border-box;">
      `;
    } else {
      box.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.3rem;">
          <img src="images/Hand-holding-money_-Hand-with-banknotes.-Cash-payment-and-receiving-money-icon.-Paying-money-icons.png" alt="Paiement Main à Main" style="height: 26px; object-fit: contain;">
          <span style="font-weight: 700; color: #10b981; font-size: 0.9rem;">Paiement Main à Main (Cash)</span>
        </div>
        <p style="margin: 0; line-height: 1.4; font-size: 0.82rem;">Le règlement s'effectuera directement en espèces (cash) auprès du livreur lors de la remise de votre colis.</p>
      `;
    }
  };

  document.getElementById('checkoutBtn').onclick = () => {
    const modal = document.getElementById('checkoutModal');
    modal.style.display = 'flex';
    setupModalCountryCityLogic();
    bindPaymentCardEvents();
    updatePaymentInstructions();
  };

  document.getElementById('closeModal').onclick = () => {
    document.getElementById('checkoutModal').style.display = 'none';
  };

  const modalEl = document.getElementById('checkoutModal');
  modalEl.onclick = (e) => {
    if (e.target === modalEl) modalEl.style.display = 'none';
  };

  document.getElementById('orderForm').onsubmit = (e) => {
    e.preventDefault();
    const name = document.getElementById('orderName').value.trim();
    const countryCode = document.getElementById('orderCountry').value;
    const countryInfo = getSelectedCountryInfo(countryCode);
    
    let city = document.getElementById('orderCity').value;
    if (city === "Autre...") {
      city = document.getElementById('orderCityCustom').value.trim() || 'Ville non spécifiée';
    }
    
    const street = document.getElementById('orderAddress').value.trim();
    const landmark = document.getElementById('orderLandmark')?.value.trim() || '';
    const phone = document.getElementById('orderPhone').value.trim();
    const payment = document.getElementById('orderPayment').value;
    const ref = document.getElementById('orderRef')?.value.trim() || '';

    const currentDelivery = calcDelivery(countryCode, subtotal);
    const totalOrder = subtotal + currentDelivery;

    const fullAddress = `${countryInfo.flag} ${countryInfo.country} — ${city} (${street}${landmark ? ' — Repère: ' + landmark : ''})`;

    if (name && phone && street) {
      const order = {
        customer: name,
        phone: phone,
        address: fullAddress,
        payment: payment + (ref ? ` (Réf: ${ref})` : ''),
        items: items.map(i => ({ name: i.name, qty: i.qty, price: i.price })),
        total: totalOrder,
        status: 'en attente',
      };
      
      api.addOrder(order);

      const settings = api.getSettings();
      const ownerPhone = settings.ownerPhone || '+225 07 68 61 33 28';
      const ownerWa = ownerPhone.replace(/\D/g, '');
      
      let msg = `Nouvelle commande de ${name}\n`;
      msg += `📞 Téléphone : ${phone}\n`;
      msg += `📍 Destination : ${fullAddress}\n`;
      msg += `💳 Mode de paiement : ${payment}\n`;
      if (ref) msg += `🔑 Référence / MTCN : ${ref}\n`;
      msg += `\n📦 Articles :\n` + 
             items.map(i => `- ${i.name} (x${i.qty}) = ${formatPrice(i.subtotal)}`).join('\n') + 
             `\n\nSous-total : ${formatPrice(subtotal)}\nFrais d'expédition : ${currentDelivery === 0 ? 'Gratuite' : formatPrice(currentDelivery)}\nTotal à payer : ${formatPrice(totalOrder)}`;
      
      cart.clear();
      document.getElementById('checkoutModal').style.display = 'none';

      // Reçu numérique
      const receiptId = `CC-REC-${Math.floor(100000 + Math.random() * 900000)}`;
      const currentDate = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

      let paymentLogoHtml = '';
      if (payment.includes('Wave')) {
        paymentLogoHtml = '<img src="images/wave.png" alt="Wave" style="height: 24px; vertical-align: middle; object-fit: contain; margin-right: 4px;">';
      } else if (payment.includes('Orange')) {
        paymentLogoHtml = '<img src="images/Orange.png" alt="Orange Money" style="height: 24px; vertical-align: middle; object-fit: contain; margin-right: 4px;">';
      } else if (payment.includes('Western') || payment.includes('Ria')) {
        paymentLogoHtml = '<img src="images/Western.png" alt="WU" style="height: 20px; vertical-align: middle; object-fit: contain; margin-right: 4px;"><img src="images/ria.png" alt="Ria" style="height: 20px; vertical-align: middle; object-fit: contain; margin-right: 4px;">';
      } else {
        paymentLogoHtml = '<img src="images/Hand-holding-money_-Hand-with-banknotes.-Cash-payment-and-receiving-money-icon.-Paying-money-icons.png" alt="Cash" style="height: 24px; vertical-align: middle; object-fit: contain; margin-right: 4px;">';
      }

      const receiptModal = document.getElementById('receiptModal');
      const receiptContent = document.getElementById('receiptContent');

      receiptContent.innerHTML = `
        <div id="printableReceipt">
          <div style="text-align: center; border-bottom: 2px dashed var(--rose-soft); padding-bottom: 1rem; margin-bottom: 1rem;">
            <img src="images/coquelogo.png?v=3" alt="Coque & Chic" style="max-height: 55px; width: auto; margin-bottom: 0.3rem;">
            <h3 style="font-family: var(--font-serif); color: var(--rose-deep); margin: 0; font-size: 1.2rem;">REÇU DE COMMANDE</h3>
            <div style="font-size: 0.8rem; color: var(--gris); margin-top: 0.25rem;">N° ${receiptId} — ${currentDate}</div>
          </div>

          <div style="background: #fafafa; border: 1px solid #f1f5f9; border-radius: 10px; padding: 0.85rem; font-size: 0.85rem; margin-bottom: 1rem; line-height: 1.5;">
            <div><strong>Client :</strong> ${name}</div>
            <div><strong>Téléphone :</strong> ${phone}</div>
            <div><strong>Destination :</strong> ${fullAddress}</div>
            <div style="margin-top: 0.3rem; display: flex; align-items: center; gap: 0.4rem;">
              <strong>Paiement :</strong>
              <span>${paymentLogoHtml} ${payment}</span>
            </div>
            ${ref ? `<div style="font-size: 0.8rem; color: var(--rose-deep); font-weight: 600;">Référence / MTCN : ${ref}</div>` : ''}
          </div>

          <div style="margin-bottom: 1rem;">
            <div style="font-size: 0.85rem; font-weight: 700; color: var(--charcoal); margin-bottom: 0.4rem;">Détails du panier :</div>
            <table style="width: 100%; border-collapse: collapse; font-size: 0.82rem;">
              <thead>
                <tr style="border-bottom: 1px solid var(--rose-soft); text-align: left; color: var(--gris-fonce);">
                  <th style="padding: 0.4rem 0;">Article</th>
                  <th style="padding: 0.4rem 0; text-align: center;">Qté</th>
                  <th style="padding: 0.4rem 0; text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${items.map(i => `
                  <tr style="border-bottom: 1px solid #f9fafb;">
                    <td style="padding: 0.4rem 0; font-weight: 500;">${i.name}</td>
                    <td style="padding: 0.4rem 0; text-align: center;">x${i.qty}</td>
                    <td style="padding: 0.4rem 0; text-align: right; font-weight: 600;">${formatPrice(i.subtotal)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div style="border-top: 2px solid var(--rose-soft); padding-top: 0.75rem; margin-bottom: 1.25rem; font-size: 0.85rem; line-height: 1.6;">
            <div style="display: flex; justify-content: space-between; color: var(--gris-fonce);">
              <span>Sous-total :</span>
              <span>${formatPrice(subtotal)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; color: var(--gris-fonce);">
              <span>Livraison :</span>
              <span>${currentDelivery === 0 ? 'Gratuite' : formatPrice(currentDelivery)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-weight: 800; font-size: 1.1rem; color: var(--rose-deep); margin-top: 0.4rem; padding-top: 0.4rem; border-top: 1px solid #f1f5f9;">
              <span>Total Payé / A payer :</span>
              <span>${formatPrice(totalOrder)}</span>
            </div>
          </div>

          <div style="text-align: center; font-size: 0.75rem; color: var(--gris); margin-bottom: 1rem;">
            Merci pour votre confiance chez <strong>Coque & Chic</strong> 🌸<br>
            Colis expédié avec soin.
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 0.6rem;">
          <a href="https://wa.me/${ownerWa}?text=${encodeURIComponent(msg)}" target="_blank" class="btn btn-primary" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem; background: #25d366; border-color: #25d366; text-decoration: none; font-weight: 700; font-size: 0.95rem;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
            <span>Valider la commande sur WhatsApp</span>
          </a>
          <button id="printReceiptBtn" class="btn btn-outline" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem; font-size: 0.88rem;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            <span>Télécharger / Imprimer le Reçu</span>
          </button>
        </div>
      `;

      receiptModal.style.display = 'flex';

      document.getElementById('printReceiptBtn').onclick = () => {
        window.print();
      };

      document.getElementById('closeReceiptModal').onclick = () => {
        receiptModal.style.display = 'none';
        render();
        updateBadge();
      };

      receiptModal.onclick = (e) => {
        if (e.target === receiptModal) {
          receiptModal.style.display = 'none';
          render();
          updateBadge();
        }
      };

      toast('🎉 Reçu numérique généré avec succès !', 'success');
    }
  };
}

document.addEventListener('DOMContentLoaded', () => { updateBadge(); render(); });

