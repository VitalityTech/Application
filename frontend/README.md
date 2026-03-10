# Event Management Application (Frontend)

React + TypeScript + Vite frontend for the Event Management Application.

## Tech Stack
- React 19
- TypeScript
- Tailwind CSS
- React Router
- React Calendar

## Environment
Create `.env` from `.env.example`:

```bash
VITE_API_URL=http://localhost:3000
```

## Run Locally
```bash
npm install
npm run dev
```

## Pages
- Login
- Register
- Events list (public)
- Event details
- Create event
- My events (month + week calendar)

## Features
- JWT session persisted in `localStorage`
- Search in public events list
- Join/Leave directly from list and from details page
- Organizer actions (edit/delete) on details page
- Responsive layout for desktop and mobile
