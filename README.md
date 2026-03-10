# Application

Event Management Application built for Radency NodeJS + React internship Stage #1.

## What Is Implemented

- Authentication: register/login with hashed passwords and JWT session
- Public events list with search, participant counters, and Join/Leave/Full states
- Event details page with participants list and organizer controls (edit/delete)
- Event creation with validation and visibility option (public/private)
- My Events calendar page with month and week views
- PostgreSQL schema with users/events/many-to-many participants relation

## Monorepo Structure

- `backend/` NestJS + Prisma API
- `frontend/` React + Vite app
- `docker-compose.yml` full local environment

## Quick Start (Docker)

```bash
docker-compose up --build
```

After start:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`
- PostgreSQL: `localhost:5432`

## Quick Start (Without Docker)

### 1. Database

Start PostgreSQL and create database `event_db`.

### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate deploy
npm run start:dev
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Required Environment Files

- `backend/.env.example`
- `frontend/.env.example`

## Example API Endpoints

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/events`
- `GET /auth/events/:id`
- `POST /auth/events`
- `PATCH /auth/events/:id`
- `DELETE /auth/events/:id?userId=<organizerId>`
- `POST /auth/events/:id/join`
- `POST /auth/events/:id/leave`
- `GET /auth/users/me/events?userId=<userId>`

## Notes for Review

- Use branch `develop` for implementation and open PR into `master`.
- Migration `20260309160000_add_capacity_visibility` adds `capacity` and `visibility`.
