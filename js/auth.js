import { api } from './api.js';

const AUTH_KEY = 'cc_auth';

export const auth = {
  login: (user, pass) => {
    const settings = api.getSettings();
    const validUser = (settings.adminUser || 'admin').trim();
    const validPass = (settings.adminPass || 'admin').trim();
    const cleanUser = (user || '').trim();
    const cleanPass = (pass || '').trim();

    if (cleanUser.toLowerCase() === validUser.toLowerCase() && cleanPass === validPass) {
      sessionStorage.setItem(AUTH_KEY, JSON.stringify({ user: cleanUser, loggedAt: Date.now() }));
      return true;
    }
    return false;
  },
  logout: () => {
    sessionStorage.removeItem(AUTH_KEY);
    window.location.href = '/admin/index.html';
  },
  check: () => {
    return !!sessionStorage.getItem(AUTH_KEY);
  },
};

// Bind auto sur le formulaire de login
const form = document.getElementById('loginForm');
if (form) {
  // Pré-chargement asynchrone des identifiants depuis MongoDB
  const preFetch = async () => {
    try {
      await api.syncAllFromDatabase();
    } catch(e) {}
  };
  
  document.addEventListener('DOMContentLoaded', preFetch);
  preFetch(); // Appel immédiat au cas où le DOM est déjà chargé

  // Bouton pour afficher/masquer le mot de passe
  const toggleBtn = document.getElementById('togglePassBtn');
  const passInput = document.getElementById('passInput');
  if (toggleBtn && passInput) {
    toggleBtn.addEventListener('click', () => {
      if (passInput.type === 'password') {
        passInput.type = 'text';
        toggleBtn.textContent = '🙈';
      } else {
        passInput.type = 'password';
        toggleBtn.textContent = '👁️';
      }
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    if (auth.login(data.user, data.pass)) {
      window.location.href = '/admin/dashboard.html';
    } else {
      alert('❌ Identifiants incorrects.');
    }
  });
}

// Redirection auto si déjà connecté
const isLoginPage = window.location.pathname === '/admin' || 
                     window.location.pathname === '/admin/' || 
                     window.location.pathname.endsWith('/admin/index.html') ||
                     window.location.pathname.endsWith('/admin/index');
if (isLoginPage && auth.check()) {
  window.location.href = '/admin/dashboard.html';
}

// Build trigger: v1.0.2 - Redis connection loaded
