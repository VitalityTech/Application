# Event Management Application (Backend)

NestJS + Prisma backend for the Event Management Application.

## Tech Stack
- NestJS (TypeScript)
- Prisma ORM
- PostgreSQL
- JWT auth

## Requirements
- Node.js 20+
- PostgreSQL 15+

## Environment
Create `.env` from `.env.example`:

```bash
PORT=3000
DATABASE_URL=postgresql://admin:mysecretpassword@localhost:5432/event_db?schema=public
JWT_SECRET=replace-with-your-random-secret
```

## Run Locally
```bash
npm install
npx prisma migrate deploy
npm run start:dev
```

## API Endpoints
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

## Notes
- Passwords are hashed with `bcrypt`.
- Organizer checks are applied for edit/delete operations.
- `capacity` and `visibility` are supported on events.
