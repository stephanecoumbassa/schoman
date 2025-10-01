# Schoman - School Management System 🎓

A comprehensive web application for managing school operations including academics, finance, library, events, and communications.

## Features

### 🎓 Academic Management
- Student and teacher management
- Class and subject organization
- Attendance tracking
- Grading and report cards
- Individual progress tracking

### 💰 Financial Management
- Invoice generation and management
- Payment tracking
- Expense recording by category
- Budget monitoring
- Financial reports

### 📚 Library Management
- Book inventory management
- Loan tracking
- Overdue notifications

### 📆 Event Management
- School events organization
- Meetings and parent-teacher conferences
- Field trips and celebrations

### 📬 Communication
- Internal messaging system
- Notifications and alerts
- Multi-role communication (admin, teacher, student, parent)

### 🏫 Multi-Establishment Support
- Multiple schools/campus management
- Centralized administration

### 📊 Dashboard
- Real-time statistics
- Attendance rates
- Financial overview
- Academic performance metrics

### 👥 User Management
- Role-based access control (admin, teacher, student, parent)
- Secure authentication
- Profile management

## Tech Stack

### Frontend
- **Vue.js 3** - Progressive JavaScript framework
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool
- **Pinia** - State management
- **Vue Router** - Routing

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **TypeScript** - Type-safe development
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## Prerequisites

- Node.js 20.19+ or 22.12+
- MongoDB 6.0+
- npm or yarn

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/stephanecoumbassa/schoman.git
cd schoman
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/schoman
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

## Running the Application

### Start MongoDB

Make sure MongoDB is running on your system:

```bash
# On Linux/Mac
mongod

# On Windows with MongoDB service
net start MongoDB
```

### Start Backend Server

```bash
cd backend
npm run dev
```

The backend API will run on http://localhost:3000

### Start Frontend Development Server

```bash
cd frontend
npm run dev
```

The frontend will run on http://localhost:5173

## Building for Production

### Backend

```bash
cd backend
npm run build
npm start
```

### Frontend

```bash
cd frontend
npm run build
```

The built files will be in the `frontend/dist` directory.

## API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "student",
  "schoolId": "school_id_here"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

### Student Endpoints

#### Get All Students
```http
GET /api/students
Authorization: Bearer <token>
```

#### Get Student by ID
```http
GET /api/students/:id
Authorization: Bearer <token>
```

#### Create Student (Admin only)
```http
POST /api/students
Authorization: Bearer <token>
Content-Type: application/json
```

#### Update Student (Admin only)
```http
PUT /api/students/:id
Authorization: Bearer <token>
```

#### Delete Student (Admin only)
```http
DELETE /api/students/:id
Authorization: Bearer <token>
```

### Dashboard Endpoints

#### Get Dashboard Statistics
```http
GET /api/dashboard/stats
Authorization: Bearer <token>
```

## Database Schema

### Collections

- **users** - All system users (admin, teacher, student, parent)
- **schools** - School/campus information
- **students** - Student profiles
- **teachers** - Teacher profiles
- **classes** - Class/grade information
- **subjects** - Subject definitions
- **grades** - Student grades and assessments
- **attendance** - Attendance records
- **invoices** - Billing and invoices
- **payments** - Payment records
- **expenses** - School expenses
- **books** - Library book inventory
- **bookloans** - Book borrowing records
- **events** - School events
- **messages** - Internal messaging

## User Roles

### Admin
- Full system access
- User management
- Financial management
- System configuration

### Teacher
- Class management
- Grade entry
- Attendance tracking
- Student progress reports

### Student
- View grades and attendance
- Access course materials
- Library book borrowing
- Event participation

### Parent
- View child's information
- Track academic progress
- Communication with teachers
- Payment management

## Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- Role-based access control (RBAC)
- Secure API endpoints
- CORS configuration
- Input validation

## Development

### Code Structure

```
schoman/
├── backend/
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Custom middleware
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Utility functions
│   │   └── server.ts       # Entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── assets/         # Static assets
│   │   ├── components/     # Vue components
│   │   ├── router/         # Vue Router config
│   │   ├── stores/         # Pinia stores
│   │   ├── views/          # Page components
│   │   ├── App.vue         # Root component
│   │   └── main.ts         # Entry point
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

### Available Scripts

#### Backend
- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start production server

#### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run type-check` - Type checking
- `npm run lint` - Lint and fix code
- `npm run format` - Format code with Prettier

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

ISC

## Support

For support, email support@schoman.com or create an issue in the repository.

## Roadmap

- [ ] Mobile application (iOS/Android)
- [ ] Advanced reporting with charts
- [ ] Multi-language support (i18n)
- [ ] Email notifications
- [ ] SMS integration
- [ ] Parent portal enhancements
- [ ] Online examination system
- [ ] Video conferencing integration
- [ ] Document management system
- [ ] Automated backup system
- [ ] Data export (PDF, Excel, CSV)

## Authors

- Development Team

## Acknowledgments

- Vue.js community
- Express.js community
- MongoDB team
