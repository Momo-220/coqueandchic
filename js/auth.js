const AUTH_KEY = 'cc_auth';

export const auth = {
  login: async (user, pass) => {
    const payload = JSON.stringify({ user, pass });
    try {
      let res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          sessionStorage.setItem(AUTH_KEY, JSON.stringify({ user: user.trim(), loggedAt: Date.now() }));
          return true;
        }
      }
    } catch (e) {}

    try {
      let res = await fetch('https://www.coqueandchic.shop/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          sessionStorage.setItem(AUTH_KEY, JSON.stringify({ user: user.trim(), loggedAt: Date.now() }));
          return true;
        }
      }
    } catch (e) {}

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
  // Bouton pour afficher/masquer le mot de passe (icônes SVG propres)
  const toggleBtn = document.getElementById('togglePassBtn');
  const passInput = document.getElementById('passInput');
  
  const eyeOpenSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-eye"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
  const eyeOffSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-eye-off"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;

  if (toggleBtn && passInput) {
    toggleBtn.addEventListener('click', () => {
      if (passInput.type === 'password') {
        passInput.type = 'text';
        toggleBtn.innerHTML = eyeOffSvg;
      } else {
        passInput.type = 'password';
        toggleBtn.innerHTML = eyeOpenSvg;
      }
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    
    // Désactiver le bouton pendant la connexion
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Connexion en cours...';
    }

    const success = await auth.login(data.user, data.pass);
    
    if (success) {
      window.location.href = '/admin/dashboard.html';
    } else {
      alert('❌ Identifiants incorrects.');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Se connecter';
      }
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
