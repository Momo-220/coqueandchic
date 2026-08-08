// =============================================
// COQUE & CHIC — Init minimal pour toutes les pages
// Initialise : logo uploadé, badges, menu mobile
// =============================================
import { getUploadedImage } from './upload.js';

function initLogo() {
  const uploaded = getUploadedImage('logo');
  if (!uploaded) return;
  document.querySelectorAll('.logo img').forEach(img => {
    img.src = uploaded;
    img.style.display = 'block';
    const text = img.nextElementSibling;
    if (text && text.tagName === 'SPAN') text.style.display = 'none';
  });
}

function initMenu() {
  const toggle = document.getElementById('menuToggle');
  const nav = document.getElementById('mainNav');
  if (!toggle || !nav) return;
  // Ouvre la nav au clic sur le logo en mobile, ou via un bouton dédié
  // Pour mobile, on va utiliser un système : clic sur le logo ouvre la nav
  const logo = document.querySelector('.logo');
  if (logo && window.innerWidth <= 768) {
    logo.style.cursor = 'pointer';
    logo.addEventListener('click', (e) => {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        nav.classList.toggle('open');
      }
    });
  }
  toggle?.addEventListener('click', () => nav.classList.toggle('open'));
}

document.addEventListener('DOMContentLoaded', () => {
  initLogo();
  initMenu();
});
