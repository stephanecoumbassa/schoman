# Schoman - Application Full Stack

Ce projet contient deux applications :

## 🖥️ Frontend (Vue.js + Tailwind CSS + Shadcn/ui)

Le frontend se trouve dans le dossier `frontend/` et utilise :
- **Vue.js 3** avec TypeScript
- **Tailwind CSS v4** pour le styling
- **Shadcn-vue** pour les composants UI
- **Vue Router** pour la navigation
- **Pinia** pour la gestion d'état
- **Vite** comme bundler

### Démarrage du frontend
```bash
cd frontend
npm install
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

## 🚀 Backend (Node.js + TypeScript + MongoDB)

Le backend se trouve dans le dossier `backend/` et utilise :
- **Node.js** avec TypeScript et ES modules
- **Express.js 5.x** pour l'API REST
- **MongoDB** avec Mongoose
- **JWT** pour l'authentification
- **bcryptjs** pour le hachage des mots de passe
- **CORS** pour la sécurité cross-origin

### Démarrage du backend
```bash
cd backend
npm install
cp .env.example .env
# Modifiez le fichier .env avec vos paramètres
npm run dev
```

L'API sera accessible sur `http://localhost:3000`

## 📋 Prérequis

- Node.js (version 20.19 ou supérieure recommandée)
- MongoDB (local ou distant, optionnel pour le développement initial)
- Git

## 🛠️ Installation complète

1. Clonez le projet
2. Installez les dépendances du frontend et du backend
3. Configurez les variables d'environnement
4. Démarrez MongoDB
5. Lancez les deux applications

## 📁 Structure du projet

```
schoman/
├── frontend/          # Application Vue.js
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
├── backend/           # API Node.js
│   ├── src/
│   │   └── index.ts
│   ├── package.json
│   ├── .env.example
│   └── ...
└── README.md
```

## 🔧 Scripts disponibles

### Frontend
- `npm run dev` - Mode développement (Vite)
- `npm run build` - Build de production
- `npm run preview` - Prévisualisation du build
- `npm run type-check` - Vérification des types TypeScript
- `npm run lint` - Vérification du code avec ESLint
- `npm run format` - Formatage du code avec Prettier

### Backend
- `npm run dev` - Mode développement avec nodemon et hot reload
- `npm run build` - Compilation TypeScript vers dist/
- `npm start` - Démarrage en production (nécessite `npm run build` au préalable)

## 🌐 Endpoints API

- `GET /` - Message de bienvenue
- `GET /health` - Vérification de l'état de l'API et de la base de données

D'autres endpoints seront ajoutés selon les besoins de l'application.

## 🎯 Vision du projet

Schoman est une application web complète pour la gestion d'établissements scolaires. Le projet vise à inclure les modules suivants :

- **Module Scolarité** : Gestion des élèves, enseignants, classes, emplois du temps, notes et absences
- **Module Comptabilité** : Gestion des recettes, dépenses et rapports financiers
- **Module Facturation** : Génération de factures, suivi des paiements et relances
- **Module Dépenses** : Enregistrement et suivi des dépenses par catégorie
- **Dashboard** : Tableau de bord interactif avec statistiques en temps réel
- **Module Utilisateurs** : Authentification sécurisée par rôle et gestion des permissions
- **Module Bibliothèque** : Gestion des livres et emprunts
- **Module Événements** : Organisation de réunions et événements scolaires
- **Module Communication** : Messagerie interne et notifications

Voir le fichier `Project.md` pour plus de détails sur les fonctionnalités prévues.

## 📝 État actuel

✅ Infrastructure de base mise en place
- Frontend Vue.js 3 + Tailwind CSS v4 fonctionnel
- Backend Node.js + Express 5.x + TypeScript configuré
- Système de build et développement opérationnel
- Configuration ES modules complète

⏳ À venir
- Implémentation des modules de gestion
- Intégration des composants Shadcn-vue
- Développement des API REST
- Connexion à MongoDB
- Système d'authentification JWT

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou à soumettre une pull request.

## 📄 Licence

Ce projet est sous licence ISC.
