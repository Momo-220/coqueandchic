# 🛍️ Coque & Chic — Site E-commerce

Site e-commerce moderne avec espace client et dashboard propriétaire.

## 🚀 Lancer le site

### Méthode 1 : Double-clic
1. Ouvre le dossier `CoqueChic/`
2. Double-clique sur **`index.html`**
3. Le site s'ouvre dans ton navigateur par défaut

### Méthode 2 : Glisser-déposer
1. Ouvre Safari, Chrome ou Firefox
2. Glisse `index.html` dans la fenêtre du navigateur

### Méthode 3 : Terminal
```bash
cd ~/CoqueChic
open index.html
```

## 🖼️ Ajouter ton logo

1. Place ton image `logo.png` (ou `logo.jpg`) dans le dossier `images/`
2. Rafraîchis le site (F5)
3. Le logo apparaîtra automatiquement dans le header

Si ton logo ne s'affiche pas, le nom "Coque & Chic" en dégradé rose reste visible.

## 🔑 Accéder au dashboard propriétaire

1. Va à l'URL : `http://localhost:.../admin/login.html`
   (ou double-clique sur `admin/login.html`)
2. **Identifiants** : `admin` / `admin`
3. Tu accèdes au tableau de bord

⚠️ **À changer en production** — voir `js/auth.js` ligne 8

## 📂 Structure

```
CoqueChic/
├── index.html              # Accueil client
├── boutique.html           # Catalogue
├── produit.html            # Fiche produit
├── panier.html             # Panier + checkout
├── contact.html            # Formulaire de contact
├── admin/                  # Dashboard propriétaire
│   ├── login.html          # Connexion
│   ├── dashboard.html      # Vue d'ensemble
│   ├── products.html       # CRUD produits
│   ├── orders.html         # Gestion commandes
│   └── messages.html       # Messagerie clients
├── css/
│   ├── main.css            # Design system + site client
│   └── admin.css           # Styles dashboard
├── js/
│   ├── api.js              # Couche données (mock localStorage)
│   ├── cart.js             # Logique panier
│   ├── app.js              # Init accueil
│   ├── boutique.js         # Init catalogue
│   ├── produit.js          # Init fiche produit
│   ├── panier.js           # Init panier
│   └── auth.js             # Authentification admin
└── images/                 # Tes images (logo, produits…)
```

## ✨ Fonctionnalités

### 🛍️ Côté client
- Hero animé avec effet de fond
- Catalogue avec recherche + filtres
- Fiche produit détaillée (couleurs, stock, quantité)
- Panier persistant (localStorage)
- Favoris ❤️
- Commande via WhatsApp
- Formulaire de contact
- Notifications toast
- Animations fluides
- Design responsive

### 🎛️ Côté admin
- **Dashboard** : CA, stats, dernières commandes
- **Produits** : Ajouter / modifier / supprimer (CRUD complet)
- **Commandes** : Voir toutes les commandes, changer le statut
- **Messages** : Boîte de réception, répondre via WhatsApp
- **Sécurité** : Login simple avec session

## 🎨 Design

- **Couleurs** : Rose (#ec4899) + blanc + fond dégradé
- **Typo** : Inter (corps) + Playfair Display (titres)
- **Style** : Élégant, féminin, moderne

## 📱 Responsive

Le site s'adapte à toutes les tailles :
- 📱 Mobile (320px+)
- 📱 Tablette (768px+)
## 🚀 Déploiement sur Vercel

Le projet est préconfiguré pour un déploiement instantané sur Vercel avec Serverless Functions et `cleanUrls`.

### Méthode 1 : Via GitHub (Recommandé)
1. Pousse ton code sur GitHub (`git push origin main`).
2. Rends-toi sur [Vercel.com](https://vercel.com) et connecte-toi.
3. Clique sur **"Add New Project"** -> Importe ton dépôt GitHub **CoqueChic**.
4. Laisse les paramètres par défaut et clique sur **"Deploy"**.
5. Ton site est en ligne en moins de 30 secondes ! 🎉

### Méthode 2 : Via Vercel CLI (Ligne de commande)
1. Installe Vercel CLI : `npm i -g vercel`
2. Dans le dossier `CoqueChic`, exécute :
   ```bash
   vercel
   ```
3. Suis les instructions à l'écran pour lier ton compte et déployer.

## 🔧 Personnalisation rapide

### Changer les couleurs
Ouvre `css/main.css` et modifie les variables dans `:root` :
```css
--rose-primary: #ec4899;   /* rose vif */
--rose-deep: #be185d;      /* rose foncé */
```

### Changer le numéro WhatsApp
Cherche `22300000000` dans tous les fichiers et remplace par ton numéro.

### Changer les identifiants admin
Ouvre `js/auth.js` ligne 8 :
```js
const CREDS = { user: 'admin', pass: 'admin' };
```

## 💡 Évolutions futures

- [ ] Paiement Mobile Money intégré (Orange/MTN)
- [ ] Upload d'images depuis l'admin
- [ ] Système d'avis clients
- [ ] Emails automatiques
- [ ] Multi-langue (français/bambara/anglais)
- [ ] PWA (installable comme une app)

## 🐛 Besoin d'aide ?

Toutes les données sont stockées dans le **localStorage** de ton navigateur.
Pour reset : ouvre la console (F12) et tape :
```js
localStorage.clear(); location.reload();
```
