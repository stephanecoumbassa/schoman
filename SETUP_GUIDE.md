# 🚀 Guide de Configuration Complète - Schoman

Ce guide vous accompagne pas à pas pour configurer et démarrer l'application Schoman.

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Node.js** (v18 ou supérieur) - [Télécharger ici](https://nodejs.org/)
- **npm** (inclus avec Node.js)
- **MongoDB** (une des options ci-dessous)

## 🗄️ Étape 1 : Configuration de MongoDB

Vous avez **trois options** pour la base de données :

### Option A : MongoDB Atlas (Cloud - Recommandé pour le développement)

1. Créez un compte gratuit sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Créez un nouveau cluster (le tier gratuit suffit)
3. Créez un utilisateur de base de données :
   - Allez dans "Database Access"
   - Cliquez sur "Add New Database User"
   - Choisissez un nom d'utilisateur et un mot de passe
   - Donnez les droits de lecture/écriture
4. Autorisez les connexions :
   - Allez dans "Network Access"
   - Cliquez sur "Add IP Address"
   - Choisissez "Allow Access from Anywhere" (0.0.0.0/0) pour le développement
5. Récupérez votre URL de connexion :
   - Allez dans "Database" > "Connect" > "Connect your application"
   - Copiez l'URL de connexion
   - Elle ressemble à : `mongodb+srv://username:password@cluster.mongodb.net/schoman?retryWrites=true&w=majority`

### Option B : MongoDB Local

**Installation sur Ubuntu/Debian :**
```bash
# Importez la clé publique
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Ajoutez le dépôt
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Installez MongoDB
sudo apt-get update
sudo apt-get install -y mongodb-org

# Démarrez MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

**Installation sur macOS (avec Homebrew) :**
```bash
# Installez MongoDB
brew tap mongodb/brew
brew install mongodb-community@6.0

# Démarrez MongoDB
brew services start mongodb-community@6.0
```

**Installation sur Windows :**
1. Téléchargez MongoDB Community Server depuis [mongodb.com](https://www.mongodb.com/try/download/community)
2. Lancez l'installateur et suivez les instructions
3. MongoDB se lancera automatiquement comme service Windows

### Option C : MongoDB avec Docker

```bash
# Lancez un conteneur MongoDB
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Pour arrêter MongoDB
docker stop mongodb

# Pour redémarrer MongoDB
docker start mongodb
```

## ⚙️ Étape 2 : Configuration du Backend

1. **Naviguez vers le dossier backend :**
   ```bash
   cd backend
   ```

2. **Installez les dépendances :**
   ```bash
   npm install
   ```

3. **Configurez les variables d'environnement :**
   
   Le fichier `.env` a déjà été créé. Modifiez-le selon votre configuration MongoDB :

   **Pour MongoDB Local ou Docker :**
   ```bash
   nano .env
   # ou utilisez votre éditeur préféré
   ```
   
   Contenu (déjà configuré pour MongoDB local) :
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/schoman
   JWT_SECRET=votre_jwt_secret_tres_securise_ici
   NODE_ENV=development
   ```

   **Pour MongoDB Atlas :**
   Modifiez la ligne `MONGODB_URI` avec votre URL de connexion Atlas :
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/schoman?retryWrites=true&w=majority
   ```
   
   ⚠️ **Important pour la production :** Changez `JWT_SECRET` par une clé secrète forte et unique.

4. **Compilez le TypeScript (optionnel mais recommandé) :**
   ```bash
   npm run build
   ```

## 🌱 Étape 3 : Initialisation de la Base de Données

Créez des données de démonstration pour tester l'application :

```bash
npm run seed
```

Cette commande crée :
- 1 compte administrateur
- 1 compte enseignant
- 5 comptes élèves
- 2 classes (CE1-A et CE2-B)
- Profils complets avec contacts

**Comptes créés :**
- Admin : `admin@schoman.com` / `admin123`
- Enseignant : `teacher@schoman.com` / `teacher123`
- Élève : `student@schoman.com` / `student123`

## 🚀 Étape 4 : Démarrage du Backend

Démarrez le serveur en mode développement :

```bash
npm run dev
```

Vous devriez voir :
```
🚀 Serveur démarré sur http://localhost:3000
✅ Connexion à MongoDB réussie
```

**En cas d'erreur de connexion MongoDB :**
- Vérifiez que MongoDB est bien démarré (local/Docker)
- Vérifiez l'URL de connexion dans le fichier `.env`
- Pour MongoDB Atlas, vérifiez que votre IP est autorisée

## 🎨 Étape 5 : Configuration du Frontend

**Ouvrez un NOUVEAU terminal** et :

1. **Naviguez vers le dossier frontend :**
   ```bash
   cd frontend
   ```

2. **Installez les dépendances :**
   ```bash
   npm install
   ```

3. **Vérifiez la configuration :**
   
   Le fichier `.env` existe déjà avec :
   ```env
   VITE_API_URL=http://localhost:3000/api
   ```
   
   Cette configuration est correcte si le backend tourne sur le port 3000.

4. **Démarrez le serveur de développement :**
   ```bash
   npm run dev
   ```

Vous devriez voir :
```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

## 🎉 Étape 6 : Accéder à l'Application

1. **Ouvrez votre navigateur** et allez sur : `http://localhost:5173`

2. **Connectez-vous** avec un des comptes de démonstration :
   - Admin : `admin@schoman.com` / `admin123`
   - Enseignant : `teacher@schoman.com` / `teacher123`
   - Élève : `student@schoman.com` / `student123`

3. **Explorez les fonctionnalités :**
   - 📊 Tableau de bord avec statistiques
   - 👥 Gestion des élèves
   - 🏫 Gestion des classes
   - 📝 Gestion des notes
   - ✅ Gestion des présences

## 🔧 Commandes Utiles

### Backend
```bash
# Démarrage en développement (avec hot-reload)
npm run dev

# Compilation TypeScript
npm run build

# Démarrage en production (après build)
npm start

# Réinitialiser la base de données
npm run seed
```

### Frontend
```bash
# Démarrage en développement
npm run dev

# Build pour la production
npm run build

# Preview du build de production
npm run preview

# Vérification TypeScript
npm run type-check
```

## 🐛 Dépannage

### Le backend ne démarre pas

**Erreur : "Cannot find module"**
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

**Erreur : "Cannot connect to MongoDB"**
- Vérifiez que MongoDB est démarré
- Testez la connexion : `mongosh` (pour MongoDB local)
- Vérifiez l'URL dans `.env`

### Le frontend ne démarre pas

**Erreur de port déjà utilisé**
```bash
# Changez le port dans vite.config.ts ou tuez le processus
lsof -ti:5173 | xargs kill -9  # Sur Unix/Mac
```

**Erreur : "Network Error" lors des appels API**
- Vérifiez que le backend tourne sur le port 3000
- Vérifiez `VITE_API_URL` dans `frontend/.env`
- Vérifiez les paramètres CORS dans le backend

### Problèmes de connexion

**"Invalid token" ou "Token expired"**
- Déconnectez-vous et reconnectez-vous
- Effacez le localStorage : `localStorage.clear()` dans la console du navigateur

**Impossible de se connecter**
- Vérifiez que vous avez bien exécuté `npm run seed`
- Vérifiez que MongoDB contient des données : `mongosh schoman` puis `db.users.find()`

## 📚 Documentation Supplémentaire

- **README.md** - Vue d'ensemble du projet
- **USAGE.md** - Guide d'utilisation détaillé
- **IMPLEMENTATION.md** - Documentation technique
- **Project.md** - Spécifications complètes

## 🎯 Prochaines Étapes

Maintenant que votre application est configurée :

1. **Explorez l'interface** avec les différents rôles utilisateur
2. **Testez les fonctionnalités** CRUD (Create, Read, Update, Delete)
3. **Lisez USAGE.md** pour des exemples d'utilisation détaillés
4. **Consultez IMPLEMENTATION.md** pour comprendre l'architecture

## 💡 Conseils de Développement

- **Hot Reload** : Les modifications de code sont automatiquement rechargées
- **Console du navigateur** : Utilisez F12 pour voir les erreurs JavaScript/API
- **Logs backend** : Surveillez le terminal backend pour les erreurs serveur
- **MongoDB Compass** : Installez [MongoDB Compass](https://www.mongodb.com/products/compass) pour visualiser vos données

## 🔒 Sécurité

⚠️ **Pour la production :**
1. Changez `JWT_SECRET` par une clé forte
2. Utilisez HTTPS
3. Configurez CORS correctement
4. Utilisez des variables d'environnement sécurisées
5. Ne committez JAMAIS les fichiers `.env`

## ✅ Checklist de Vérification

Avant de commencer à développer, vérifiez que :

- [ ] Node.js v18+ est installé (`node --version`)
- [ ] MongoDB est installé et démarré (ou Atlas configuré)
- [ ] Les dépendances backend sont installées (`backend/node_modules/`)
- [ ] Les dépendances frontend sont installées (`frontend/node_modules/`)
- [ ] Le fichier `backend/.env` est configuré
- [ ] La commande `npm run seed` a été exécutée avec succès
- [ ] Le backend démarre sans erreur sur le port 3000
- [ ] Le frontend démarre sans erreur sur le port 5173
- [ ] Vous pouvez vous connecter avec `admin@schoman.com` / `admin123`

## 🆘 Besoin d'aide ?

Si vous rencontrez des problèmes :

1. Consultez la section **Dépannage** ci-dessus
2. Vérifiez que toutes les étapes ont été suivies
3. Vérifiez les logs dans les terminaux backend et frontend
4. Assurez-vous que MongoDB est accessible

---

**Félicitations ! 🎉** Votre application Schoman est maintenant prête à être utilisée.
