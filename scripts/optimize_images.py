import os
import re
import sys
import base64
from io import BytesIO
from PIL import Image
from pymongo import MongoClient

def main():
    # 1. Lire .env pour récupérer l'URI MongoDB
    env_path = os.path.join(os.path.dirname(__file__), '../.env')
    mongodb_uri = None
    if os.path.exists(env_path):
        with open(env_path, 'r', encoding='utf-8') as f:
            content = f.read()
            match = re.search(r'^MONGODB_URI\s*=\s*(.+)$', content, re.MULTILINE)
            if match:
                mongodb_uri = match.group(1).strip()
    
    if not mongodb_uri:
        print("❌ MONGODB_URI non trouvé dans le fichier .env")
        sys.exit(1)

    print("🔌 Connexion à MongoDB Atlas...")
    client = MongoClient(mongodb_uri)
    db = client['coqueandchic']
    products_col = db['products']

    products = list(products_col.find({}))
    print(f"📦 Trouvé {len(products)} produits à inspecter.")

    total_saved_kb = 0
    total_original_kb = 0
    total_new_kb = 0

    for p in products:
        p_id = p.get('id')
        name = p.get('name', 'Sans nom')
        img_str = p.get('image', '')

        if not img_str.startswith('data:image'):
            print(f"⏩ Produit '{name}' : Pas d'image base64, ignoré.")
            continue

        # Extraction des métadonnées base64
        header, base64_data = img_str.split(',', 1)
        original_size = len(base64_data) * 3 / 4 / 1024 # KB approx
        total_original_kb += original_size

        try:
            # Décoder
            img_data = base64.b64decode(base64_data)
            img = Image.open(BytesIO(img_data))

            # Si l'image a une couche alpha (RGBA), la convertir en RGB pour JPEG
            if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
                # Créer un fond blanc
                bg = Image.new('RGB', img.size, (255, 255, 255))
                bg.paste(img, mask=img.split()[3] if img.mode == 'RGBA' else None)
                img = bg
            elif img.mode != 'RGB':
                img = img.convert('RGB')

            # Redimensionner (max 600px de large ou haut)
            max_size = 600
            width, height = img.size
            if width > max_size or height > max_size:
                if width > height:
                    new_width = max_size
                    new_height = int(height * max_size / width)
                else:
                    new_height = max_size
                    new_width = int(width * max_size / height)
                img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
                print(f"⚙️ Redimensionnement de {width}x{height} à {new_width}x{new_height}")

            # Compresser et sauvegarder en JPEG
            out_buffer = BytesIO()
            img.save(out_buffer, format='JPEG', quality=70, optimize=True)
            compressed_data = out_buffer.getvalue()

            # Encoder en base64
            new_base64 = base64.b64encode(compressed_data).decode('utf-8')
            new_img_str = f"data:image/jpeg;base64,{new_base64}"
            new_size = len(new_base64) * 3 / 4 / 1024
            total_new_kb += new_size

            saved = original_size - new_size
            total_saved_kb += saved

            # Mettre à jour dans la base
            products_col.update_one({'id': p_id}, {'$set': {'image': new_img_str}})
            print(f"✅ '{name}' : {original_size:.1f} KB ➔ {new_size:.1f} KB (économisé {saved:.1f} KB)")

        except Exception as e:
            print(f"❌ Erreur lors de la compression de '{name}': {e}")
            total_new_kb += original_size

    print("\n📊 RÉSULTAT DE LA COMPRESSION DES PRODUITS :")
    print(f"   Poids original total : {total_original_kb/1024:.2f} MB")
    print(f"   Nouveau poids total  : {total_new_kb/1024:.2f} MB")
    print(f"   Gain d'espace total  : {(total_original_kb - total_new_kb)/1024:.2f} MB (Rapport de {(total_original_kb/total_new_kb if total_new_kb > 0 else 1):.1f}x plus rapide !)")
    
    client.close()

if __name__ == '__main__':
    main()
