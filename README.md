# Schoman - Application Full Stack

Ce projet contient deux applications :

## 🖥️ Frontend (Vue.js + Tailwind CSS + Shadcn/ui)

Le frontend se trouve dans le dossier `frontend/` et utilise :
- **Vue.js 3** avec TypeScript
- **Tailwind CSS** pour le styling
- **Shadcn/ui** pour les composants UI
- **Vue Router** pour la navigation
- **Pinia** pour la gestion d'état

### Démarrage du frontend
```bash
cd frontend
npm install
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

## 🚀 Backend (Node.js + TypeScript + MongoDB)

Le backend se trouve dans le dossier `backend/` et utilise :
- **Node.js** avec TypeScript
- **Express.js** pour l'API REST
- **MongoDB** avec Mongoose
- **JWT** pour l'authentification
- **bcryptjs** pour le hachage des mots de passe

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

- Node.js (version 18 ou supérieure)
- MongoDB (local ou distant)
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
- `npm run dev` - Mode développement
- `npm run build` - Build de production
- `npm run preview` - Prévisualisation du build

### Backend
- `npm run dev` - Mode développement avec nodemon
- `npm run build` - Compilation TypeScript
- `npm start` - Démarrage en production

## 🌐 Endpoints API

- `GET /` - Message de bienvenue
- `GET /health` - Vérification de l'état de l'API et de la base de données

D'autres endpoints seront ajoutés selon les besoins de l'application.
