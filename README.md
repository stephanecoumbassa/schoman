# Schoman

Full-stack application with Vue.js frontend and Node.js backend.

## 📁 Project Structure

This monorepo contains two main projects:

- **`frontend/`** - Vue.js 3 application with TypeScript, Tailwind CSS, and Shadcn/ui
- **`backend/`** - Node.js API with TypeScript, Express, and MongoDB

## ✅ Frontend Project

### Technologies
- **Vue.js 3** - Progressive JavaScript framework
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui Components** - High-quality UI components (Radix-vue, Lucide icons)
- **Vue Router** - Official router for Vue.js
- **Pinia** - State management
- **Vite** - Next generation frontend tooling

### Getting Started

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at **http://localhost:5173**

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Lint and fix code
- `npm run format` - Format code with Prettier

### Documentation

See [frontend/README.md](frontend/README.md) for detailed frontend documentation.

## ✅ Backend Project

### Technologies
- **Node.js** - JavaScript runtime
- **TypeScript** - Type-safe development
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - JSON Web Tokens for authentication
- **Bcrypt** - Password hashing
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing

### Getting Started

```bash
cd backend
npm install
cp .env.example .env  # Configure your environment variables
npm run dev
```

The backend API will be available at **http://localhost:3000**

### Environment Configuration

Update the `.env` file with your configuration:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/schoman
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
```

### Available Scripts

- `npm run dev` - Start development server with hot reload (nodemon)
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run lint` - Lint TypeScript code

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login

#### User (requires authentication)
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Documentation

See [backend/README.md](backend/README.md) for detailed backend documentation.

## 🚀 Quick Start (Both Projects)

### Prerequisites

- Node.js >= 18.0.0
- MongoDB installed and running

### Installation and Setup

```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
cp .env.example .env
# Edit .env with your configuration

# Start frontend (in one terminal)
cd frontend
npm run dev

# Start backend (in another terminal)
cd backend
npm run dev
```

## 📝 Development Workflow

1. **Frontend**: Make changes in `frontend/src/`, hot reload will update automatically
2. **Backend**: Make changes in `backend/src/`, nodemon will restart the server
3. **Building**: Run `npm run build` in each project to create production builds
4. **Linting**: Run `npm run lint` to check code quality

## 🔐 Security Notes

- Always change the default `JWT_SECRET` in production
- Use strong passwords for database connections
- Keep dependencies up to date
- Never commit `.env` files to version control

## 📄 License

MIT
