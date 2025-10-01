# Schoman Backend API

Backend API built with Node.js, TypeScript, Express, and MongoDB.

## Features

- **Authentication**: JWT-based authentication with bcrypt password hashing
- **Express.js**: Fast and minimalist web framework
- **TypeScript**: Type-safe development
- **MongoDB**: Database with Mongoose ODM
- **Security**: Helmet for HTTP headers, CORS enabled
- **Validation**: Express-validator for request validation

## Prerequisites

- Node.js >= 18.0.0
- MongoDB installed and running

## Installation

```bash
npm install
```

## Configuration

Copy the `.env.example` file to `.env` and update the values:

```bash
cp .env.example .env
```

Update the following variables in `.env`:
- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: A secure secret key for JWT tokens
- `PORT`: Server port (default: 3000)

## Development

Start the development server with hot reload:

```bash
npm run dev
```

## Build

Build the TypeScript code:

```bash
npm run build
```

## Production

Start the production server:

```bash
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
  }
  ```

- `POST /api/auth/login` - Login
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

### User

- `GET /api/users/profile` - Get user profile (requires authentication)
- `PUT /api/users/profile` - Update user profile (requires authentication)
  ```json
  {
    "name": "Jane Doe"
  }
  ```

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Express middleware
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   └── index.ts         # Application entry point
├── .env.example         # Environment variables template
├── package.json         # Dependencies
└── tsconfig.json        # TypeScript configuration
```

## License

MIT
