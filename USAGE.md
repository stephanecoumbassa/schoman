# Guide d'utilisation - Schoman

Ce guide vous aidera à démarrer et tester l'application Schoman.

## 🚀 Démarrage rapide

### Prérequis

Avant de commencer, assurez-vous d'avoir installé :
- Node.js (v18 ou supérieur)
- MongoDB (version 5.0 ou supérieur)
- Git

### Installation

1. **Clonez le repository**
```bash
git clone https://github.com/stephanecoumbassa/schoman.git
cd schoman
```

2. **Démarrez MongoDB**

Sur Linux/Mac:
```bash
# Avec systemd
sudo systemctl start mongod

# Ou directement
mongod
```

Avec Docker:
```bash
docker run -d -p 27017:27017 --name schoman-mongo mongo:latest
```

3. **Installez et configurez le backend**
```bash
cd backend
npm install

# Le fichier .env existe déjà avec les valeurs par défaut
# Si vous utilisez un autre port ou URI MongoDB, modifiez-le
# nano .env
```

4. **Initialisez la base de données avec des données de test**
```bash
npm run seed
```

Vous devriez voir :
```
✅ Connecté à MongoDB
🗑️  Suppression des données existantes...
👤 Création de l'administrateur...
👨‍🏫 Création de l'enseignant...
🏫 Création des classes...
👨‍🎓 Création des élèves...
✅ Données de démonstration créées avec succès!

📋 Comptes disponibles:
   Admin: admin@schoman.com / admin123
   Enseignant: teacher@schoman.com / teacher123
   Élève: student@schoman.com / student123

🎉 Le système est prêt à être utilisé!
```

5. **Démarrez le serveur backend**
```bash
npm run dev
```

Le serveur démarre sur http://localhost:3000

6. **Dans un nouveau terminal, installez et démarrez le frontend**
```bash
cd ../frontend
npm install
npm run dev
```

L'application web démarre sur http://localhost:5173

## 👤 Comptes de test

Après avoir exécuté `npm run seed`, vous avez accès à ces comptes :

### Administrateur
- **Email:** admin@schoman.com
- **Mot de passe:** admin123
- **Permissions:** Accès complet à toutes les fonctionnalités

### Enseignant
- **Email:** teacher@schoman.com
- **Mot de passe:** teacher123
- **Permissions:** Gestion des élèves (lecture et modification)

### Élève
- **Email:** student@schoman.com
- **Mot de passe:** student123
- **Permissions:** Consultation des informations

## 🎯 Fonctionnalités à tester

### 1. Connexion
1. Ouvrez http://localhost:5173
2. Connectez-vous avec l'un des comptes ci-dessus
3. Vous serez redirigé vers le tableau de bord

### 2. Tableau de bord
Le dashboard affiche :
- 📊 Statistiques en temps réel
  - Nombre total d'élèves
  - Nombre d'enseignants
  - Nombre de classes
  - Nombre de parents
- 📝 Liste des élèves récemment ajoutés
- 🔗 Liens rapides vers les différents modules

### 3. Gestion des élèves
1. Cliquez sur "Gérer les élèves" ou accédez à la section "Élèves"
2. Vous verrez la liste complète des élèves avec :
   - Numéro d'élève
   - Nom complet
   - Email
   - Niveau
   - Statut (actif/inactif)

#### Recherche et filtres
- **Recherche:** Tapez un nom ou email dans le champ de recherche
- **Filtrer par niveau:** Sélectionnez un niveau (Maternelle, CP, CE1, CE2, CM1, CM2)
- **Filtrer par statut:** Choisissez entre Actifs, Inactifs ou Tous

#### Actions sur les élèves (selon votre rôle)
- **Voir:** Affiche les détails de l'élève
- **Désactiver:** (Admin uniquement) Désactive un élève

### 4. Pagination
- Naviguez entre les pages avec les boutons "Précédent" et "Suivant"
- Le nombre total de résultats est affiché

## 🔧 Tester l'API directement

Vous pouvez aussi tester l'API avec curl ou Postman :

### 1. Connexion et obtention du token
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@schoman.com",
    "password": "admin123"
  }'
```

Réponse :
```json
{
  "message": "Connexion réussie",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "admin@schoman.com",
    "firstName": "Admin",
    "lastName": "Principal",
    "role": "admin"
  }
}
```

### 2. Obtenir les statistiques du dashboard
```bash
curl http://localhost:3000/api/dashboard/stats \
  -H "Authorization: Bearer VOTRE_TOKEN"
```

### 3. Lister les élèves
```bash
curl http://localhost:3000/api/students \
  -H "Authorization: Bearer VOTRE_TOKEN"
```

### 4. Rechercher un élève
```bash
curl "http://localhost:3000/api/students?search=Pierre" \
  -H "Authorization: Bearer VOTRE_TOKEN"
```

### 5. Créer un nouvel élève (Admin/Enseignant uniquement)
```bash
curl -X POST http://localhost:3000/api/students \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nouveau.eleve@schoman.com",
    "password": "student123",
    "firstName": "Nouveau",
    "lastName": "Élève",
    "studentNumber": "STU2024006",
    "dateOfBirth": "2013-01-01",
    "placeOfBirth": "Paris",
    "gender": "M",
    "level": "CE1",
    "parentContact": {
      "name": "Parent Test",
      "phone": "0612345678",
      "email": "parent@email.com",
      "relationship": "Père"
    },
    "emergencyContact": {
      "name": "Contact Urgence",
      "phone": "0698765432"
    }
  }'
```

## 📋 Endpoints API disponibles

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/profile` - Profil utilisateur (protégé)

### Élèves
- `GET /api/students` - Liste des élèves (avec paramètres de recherche)
- `POST /api/students` - Créer un élève (admin/enseignant)
- `GET /api/students/:id` - Détails d'un élève
- `PUT /api/students/:id` - Modifier un élève (admin/enseignant)
- `DELETE /api/students/:id` - Désactiver un élève (admin)

### Dashboard
- `GET /api/dashboard/stats` - Statistiques

### Système
- `GET /` - Message de bienvenue
- `GET /health` - État de l'API et de la base de données

## 🐛 Dépannage

### MongoDB ne démarre pas
```bash
# Vérifier si MongoDB est installé
mongod --version

# Vérifier si le port 27017 est disponible
lsof -i :27017

# Démarrer MongoDB avec des logs
mongod --dbpath /data/db --logpath /var/log/mongodb/mongodb.log
```

### Le backend ne démarre pas
```bash
# Vérifier les variables d'environnement
cat backend/.env

# Vérifier que MongoDB est accessible
mongo --eval "db.version()"

# Réinstaller les dépendances
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Le frontend ne démarre pas
```bash
# Réinstaller les dépendances
cd frontend
rm -rf node_modules package-lock.json
npm install

# Vérifier que le backend est bien sur le port 3000
curl http://localhost:3000/health
```

### Erreur de connexion à l'API
1. Vérifiez que le backend est démarré sur le port 3000
2. Vérifiez le fichier `frontend/.env` :
   ```
   VITE_API_URL=http://localhost:3000/api
   ```
3. Redémarrez le frontend après modification

## 📚 Ressources supplémentaires

- [Vue.js Documentation](https://vuejs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js](https://expressjs.com/)

## 🤝 Support

Pour toute question ou problème, consultez la documentation ou ouvrez une issue sur GitHub.
