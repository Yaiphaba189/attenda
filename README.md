# Attenda - Attendance Management System

A modern attendance management system built with Next.js and Express.js, featuring a beautiful dark glass UI design.

## Features

- 🎨 **Dark Glass UI** - Modern glassmorphism design with green accents
- 👥 **Multi-Role Support** - Admin, Teacher, and Student dashboards
- 📊 **Attendance Tracking** - Mark and view attendance with detailed statistics
- 🔐 **Authentication** - Secure login with password reset functionality
- 📱 **Responsive Design** - Works seamlessly on all devices

## Tech Stack

### Frontend
- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

### Backend
- **Express.js** - Node.js web framework
- **Prisma** - Database ORM
- **JWT** - Authentication
- **PostgreSQL/MySQL** - Database

## Getting Started

### Prerequisites
- Node.js 18+ installed
- Database (PostgreSQL or MySQL)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd attenda
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

4. **Set up environment variables**
   
   Create `.env` in the backend folder:
   ```env
   DATABASE_URL="your-database-connection-string"
   JWT_SECRET="your-jwt-secret"
   PORT=3001
   ```

5. **Run database migrations**
   ```bash
   cd backend
   npx prisma migrate dev
   ```

6. **Start the backend server**
   ```bash
   cd backend
   npm start
   ```
   Backend runs on [http://localhost:3001](http://localhost:3001)

7. **Start the frontend (in a new terminal)**
   ```bash
   npm run dev
   ```
   Frontend runs on [http://localhost:3000](http://localhost:3000)

## Project Structure

```
attenda/
├── src/
│   ├── app/              # Next.js app directory
│   │   ├── admin/        # Admin pages
│   │   ├── teacher-dashboard/
│   │   ├── student-dashboard/
│   │   ├── login/
│   │   └── ...
│   ├── components/       # Reusable components
│   └── lib/             # Utilities
├── backend/
│   ├── index.js         # Express server
│   ├── prisma/          # Database schema
│   └── ...
└── ...
```

## Available Pages

- `/login` - Login page
- `/admin-dashboard` - Admin dashboard
- `/teacher-dashboard` - Teacher dashboard
- `/student-dashboard` - Student dashboard
- `/admin/students` - Manage students
- `/admin/teachers` - Manage teachers
- `/admin/classes` - Manage classes
- `/admin/subjects` - Manage subjects
- `/teacher-dashboard/attendance` - Take attendance
- `/forgot-password` - Password recovery
- `/reset-password` - Reset password


## License

This project is open source and available under the MIT License.
