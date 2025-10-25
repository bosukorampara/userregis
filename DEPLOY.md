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
   - `MYSQL_HOST=your-render-mysql-host`
   - `MYSQL_PORT=3306`
   - `MYSQL_DATABASE=your-database-name`
   - `MYSQL_USER=your-username`
   - `MYSQL_PASSWORD=your-password`
   - `JWT_SECRET=strong random string`
4. Deploy. Copy the service URL (e.g., https://yourapi.onrender.com).

## Database (Render MySQL)
- Create a MySQL database in Render Dashboard
- Copy the connection details (host, database, username, password)
- No additional network configuration needed (internal to Render)
- **Note**: Render provides managed MySQL databases for production use

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
- In production, cookies are `SameSite=None; Secure`. `server/src/index.js` sets `app.set(trust
