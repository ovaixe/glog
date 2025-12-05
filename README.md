# 💪 GLog - Gym Workout Tracker

GLog is a modern, beautiful, and offline-capable gym workout tracker built with Next.js. It helps you track your weekly workout plans, log your progress, and visualize your history.

![GLog App Icon](/public/icon-512x512.png)

## ✨ Features

- **📋 Weekly Workout Planning**: Create and manage workout plans for each day of the week.
- **🏋️ Exercise Tracking**: Log sets, reps, and weights for each exercise.
- **📱 Progressive Web App (PWA)**: Installable on mobile and desktop, works offline!
- **🔐 Secure Authentication**: Simple, secret-key based protection for your data.
- **🎨 Beautiful UI**: Glassmorphism design, smooth animations, and dark mode.
- **🔔 Smart Notifications**: Toast notifications for actions and errors.
- **⚠️ Safety First**: Confirmation dialogs for critical actions like deleting workouts.
- **📊 History Tracking**: View your past workouts and see your progress over time.
- **🖱️ Drag & Drop**: Reorder exercises easily with drag and drop support.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/ovaixe/glog.git
   cd glog
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up Environment Variables**
   Create a `.env` file in the root directory:

   ```bash
   # Set your secret access key (Required)
   GLOG_SECRET_KEY=your-secure-password-here

   # Database URL (Defaults to local file)
   TURSO_DATABASE_URL=file:workout.db
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open the app**
   Visit [http://localhost:3000](http://localhost:3000) and enter your secret key to unlock.

## 📱 PWA & Offline Support

GLog is a fully functional PWA. You can install it on your device for a native app-like experience.

- **Mobile**: Tap "Share" (iOS) or "Menu" (Android) -> "Add to Home Screen"
- **Desktop**: Click the install icon in the address bar

For more details, check the [PWA Guide](PWA_GUIDE.md).

## 🔐 Authentication

GLog uses a simple but secure secret-key authentication system.

- No user accounts or database setup required for auth.
- Session-based access control.
- All routes are protected.

For more details, check the [Auth Guide](AUTH_GUIDE.md).

## 🗄️ Database Migrations

GLog uses a production-ready migration system to manage database schema changes.

- **Automatic**: Migrations run automatically on server startup.
- **Tracked**: Each migration runs only once, tracked in the database.
- **Safe**: Server exits if migration fails, preventing schema mismatches.

### Quick Commands

```bash
npm run migrate          # Run all pending migrations
npm run migrate:status   # Check migration status
npm run migrate:rollback # Rollback last migration (dev only)
```

For detailed information on creating and managing migrations, check the [Migrations Guide](MIGRATIONS_GUIDE.md).

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Custom CSS Variables
- **Database**: SQLite / LibSQL (via Turso client)
- **PWA**: @ducanh2912/next-pwa
- **Drag & Drop**: @dnd-kit
- **Icons**: Custom generated assets
