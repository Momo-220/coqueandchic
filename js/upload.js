// =============================================
// COQUE & CHIC — Upload d'images (côté client)
// Utilise FileReader → base64 → localStorage
// =============================================

const IMG_PREFIX = 'cc_img_';
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

/**
 * Lit un fichier image et retourne une promesse avec le base64
 * @param {File} file - Le fichier image
 * @returns {Promise<string>} URL base64
 */
export const readImageAsDataURL = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error('Aucun fichier fourni'));
    if (!file.type.startsWith('image/')) return reject(new Error('Le fichier doit être une image'));
    if (file.size > MAX_SIZE) return reject(new Error('Image trop volumineuse (max 5 MB)'));

    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
    reader.readAsDataURL(file);
  });
};

/**
 * Compresse une image (réduit la résolution) pour économiser du localStorage
 * @param {string} dataURL - Image en base64
 * @param {number} maxWidth - Largeur max (défaut 1200)
 * @param {number} quality - Qualité 0-1 (défaut 0.85)
 * @returns {Promise<string>} DataURL compressé
 */
export const compressImage = (dataURL, maxWidth = 1200, quality = 0.85) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => reject(new Error('Impossible de charger l\'image'));
    img.src = dataURL;
  });
};

/**
 * Upload + compresse + sauvegarde une image
 * @param {File} file
 * @param {string} key - Identifiant (ex: 'logo', 'p1', 'p2')
 * @returns {Promise<string>} URL finale
 */
export const uploadImage = async (file, key) => {
  try {
    let dataURL = await readImageAsDataURL(file);
    dataURL = await compressImage(dataURL);
    localStorage.setItem(IMG_PREFIX + key, dataURL);
    return dataURL;
  } catch (err) {
    throw err;
  }
};

/**
 * Récupère une image uploadée
 * @param {string} key
 * @returns {string|null} URL ou null
 */
export const getUploadedImage = (key) => {
  return localStorage.getItem(IMG_PREFIX + key);
};

/**
 * Récupère l'URL d'une image : uploadée en priorité, sinon URL fournie
 * @param {string} key - Clé d'upload
 * @param {string} fallback - URL de secours
 * @returns {string}
 */
export const resolveImage = (key, fallback) => {
  return getUploadedImage(key) || fallback;
};

/**
 * Supprime une image uploadée
 * @param {string} key
 */
export const deleteImage = (key) => {
  localStorage.removeItem(IMG_PREFIX + key);
};

/**
 * Crée un input d'upload caché + un bouton stylisé
 * À utiliser dans les pages admin
 */
export const createImageUploader = (options) => {
  const {
    currentImage = '',
    onUpload,
    label = 'Choisir une image',
    accept = 'image/*',
  } = options;

  const container = document.createElement('div');
  container.className = 'image-uploader';
  container.style.cssText = 'display: flex; flex-direction: column; gap: 0.5rem; align-items: flex-start;';

  const preview = document.createElement('img');
  preview.src = currentImage;
  preview.style.cssText = 'max-width: 200px; max-height: 200px; border-radius: 8px; object-fit: cover; border: 2px solid var(--rose-soft);';
  if (!currentImage) preview.style.display = 'none';

  const input = document.createElement('input');
  input.type = 'file';
  input.accept = accept;
  input.style.display = 'none';

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'btn btn-outline';
  button.textContent = label;
  button.onclick = () => input.click();

  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    button.disabled = true;
    button.textContent = '⏳ Upload...';
    try {
      const dataURL = await readImageAsDataURL(file);
      const compressed = await compressImage(dataURL);
      preview.src = compressed;
      preview.style.display = 'block';
      onUpload(compressed);
    } catch (err) {
      alert('❌ ' + err.message);
    } finally {
      button.disabled = false;
      button.textContent = label;
      input.value = ''; // reset pour pouvoir ré-uploader le même fichier
    }
  };

  container.appendChild(preview);
  container.appendChild(input);
  container.appendChild(button);
  container._preview = preview;

  return container;
};
