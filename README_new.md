# Lumière Studio

A modern clothing e-commerce web app built with React, TypeScript, Vite, Express, and MongoDB.

## Features
- Product browsing and detail pages
- Cart and wishlist flows
- Authentication and protected owner/admin areas
- Contact form integration support
- Responsive UI for mobile and desktop

## Tech Stack
- Frontend: React + TypeScript + Vite
- Backend: Express + TypeScript
- Database: MongoDB / Mongoose
- Styling: Tailwind CSS

## Local Development

### Prerequisites
- Node.js 18+
- npm
- MongoDB (optional for local auth fallback)

### Install dependencies
```bash
npm install
```

### Start the backend
```bash
npx tsx server/index.ts
```

### Start the frontend
```bash
npm run dev -- --host 0.0.0.0
```

Open:
- Frontend: http://localhost:3000/
- Backend health: http://localhost:5000/api/health

## Environment Variables
Create a `.env.local` file with values such as:
```env
VITE_API_URL=http://localhost:5000
VITE_ADMIN_EMAIL=your@email.com
VITE_OWNER_NAME=Ashwini
VITE_OWNER_EMAIL=your@email.com
VITE_OWNER_PASSWORD=owner1234
JWT_SECRET=your-secret
MONGO_URI=mongodb://localhost:27017/lumiere-studio
CORS_ORIGIN=http://localhost:3000
```

## Build
```bash
npm run build
```

## Deployment
This app is split into frontend and backend services.

Recommended deployment:
- Frontend: Netlify or Vercel
- Backend: Render
- Database: MongoDB Atlas

## License
MIT
