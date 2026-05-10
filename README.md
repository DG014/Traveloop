# Traveloop

Traveloop is a comprehensive travel planning platform built with Node.js, Express, Prisma, PostgreSQL, React, and TailwindCSS.

## Project Structure

- `apps/api` - Backend Express API with Prisma ORM
- `apps/web` - Frontend React application (Vite + Tailwind)

## Prerequisites

- Node.js (v18+)
- PostgreSQL (or use the provided `docker-compose.yml`)

## Getting Started

### 1. Start the Database
You can use Docker to start the required PostgreSQL instance:
```bash
docker-compose up -d
```

### 2. Configure Environment Variables
Copy the `.env.example` files in both `apps/api` and `apps/web`:
```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

### 3. Install Dependencies
This project uses npm workspaces. Run the following command from the root directory:
```bash
npm install
```

### 4. Setup Database
Run the database migrations and seed it with initial data (cities, activities, sample users):
```bash
cd apps/api
npm run db:migrate
npm run db:seed
```

### 5. Start the Development Servers
You can start both the frontend and backend simultaneously from the root directory:
```bash
npm run dev
```

- Backend API: http://localhost:3001
- Frontend App: http://localhost:5173

## Default Accounts
The seed script creates the following default accounts:
- **Admin**: `admin@traveloop.com` / `Admin@1234`
- **Demo User**: `demo@traveloop.com` / `User@1234`

## Tech Stack
- **Backend**: Node.js, Express, TypeScript, Prisma, PostgreSQL, Zod
- **Frontend**: React, Vite, Tailwind CSS, shadcn/ui, Recharts
