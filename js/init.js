import { getUploadedImage } from './upload.js';
import { api } from './api.js';

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

document.addEventListener('DOMContentLoaded', async () => {
  try {
    await api.syncAllFromDatabase();
  } catch (e) {}
  initLogo();
  initMenu();

  // Polling intelligent toutes les 15s pour garder les données synchronisées sur tous les appareils
  setInterval(async () => {
    try {
      await api.syncAllFromDatabase();
      initLogo();
    } catch (e) {}
  }, 15000);
});
