# Deploying the User Registration App

## Backend (Render)
1. Push repo to GitHub.
2. In Render, create a Web Service:
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `node src/index.js`
   - Node: 18+
3. Environment Variables:
   - `NODE_ENV=production`
   - `PORT=4000`
   - `CLIENT_URL=https://your-frontend.example.com`
   - `DATABASE_URL=postgresql://username:password@host:5432/database_name` (recommended)
   - OR use individual PostgreSQL variables:
     - `POSTGRES_HOST=your-render-postgres-host`
     - `POSTGRES_PORT=5432`
     - `POSTGRES_DATABASE=your-database-name`
     - `POSTGRES_USER=your-username`
     - `POSTGRES_PASSWORD=your-password`
   - `JWT_SECRET=strong random string`
4. Deploy. Copy the service URL (e.g., https://yourapi.onrender.com).

## Database (Render PostgreSQL)
- Create a PostgreSQL database in Render Dashboard
- Copy the connection details (host, database, username, password)
- Use the `DATABASE_URL` format for easiest setup
- No additional network configuration needed (internal to Render)
- **Note**: Render provides managed PostgreSQL databases for production use

## Frontend (Render)
1. In Render Dashboard, create a Static Site:
   - Root Directory: `client`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
2. Environment Variables:
   - `VITE_API_URL=https://userregis-api.onrender.com`
3. Deploy. Copy the domain (e.g., https://userregis-frontend.onrender.com).

## Custom Domains (optional)
- Frontend: point `www.yourdomain.com` to Vercel (CNAME). Set root to redirect to `www`.
- Backend: point `api.yourdomain.com` to Render (CNAME).
- Update envs:
  - Render `CLIENT_URL=https://www.yourdomain.com`
  - Vercel `VITE_API_URL=https://api.yourdomain.com`

## Notes
- In production, cookies are `SameSite=None; Secure`. `server/src/index.js` sets `app.set('trust proxy', 1)` for proper cookie handling behind Render's proxy.
- The application uses PostgreSQL as the primary database with SQLite available for local development.
- SSL is automatically configured for production PostgreSQL connections.
