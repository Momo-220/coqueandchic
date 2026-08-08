import { api } from './api.js';

const AUTH_KEY = 'cc_auth';

export const auth = {
  login: (user, pass) => {
    const settings = api.getSettings();
    const validUser = settings.adminUser || 'admin';
    const validPass = settings.adminPass || 'admin';
    if (user === validUser && pass === validPass) {
      sessionStorage.setItem(AUTH_KEY, JSON.stringify({ user, loggedAt: Date.now() }));
      return true;
    }
    return false;
  },
  logout: () => {
    sessionStorage.removeItem(AUTH_KEY);
    window.location.href = 'index.html';
  },
  check: () => {
    return !!sessionStorage.getItem(AUTH_KEY);
  },
};

// Bind auto sur le formulaire de login
const form = document.getElementById('loginForm');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    if (auth.login(data.user, data.pass)) {
      window.location.href = 'dashboard.html';
    } else {
      alert('❌ Identifiants incorrects. Démo : admin / admin');
    }
  });
}

// Redirection auto si déjà connecté
if (window.location.pathname.endsWith('index.html') && auth.check()) {
  window.location.href = 'dashboard.html';
}
