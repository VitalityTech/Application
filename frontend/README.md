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
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
```

## Deploy Notes (Vercel)

- Always set `VITE_API_URL` in Vercel Project Settings -> Environment Variables.
- `VITE_API_URL` must point to your deployed backend API base URL (not frontend domain).
- If this variable is missing, auth endpoints can return HTML/404 instead of JSON.

Google OAuth setup:

- Set `VITE_GOOGLE_CLIENT_ID` in Vercel with your real OAuth Web Client ID.
- In Google Cloud Console -> OAuth 2.0 Client -> Authorized JavaScript origins,
  add your frontend domains (for example `http://localhost:5173` and your `https://<project>.vercel.app`).
- Google sign-in can fail in Telegram in-app browser because embedded webviews/popup flows are restricted. Ask users to open the same link in an external browser (Chrome/Safari) for Google auth.
- The auth pages include a Telegram fallback button that attempts to open Chrome directly on Android via `intent://` and provides a copy-link backup action.

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
