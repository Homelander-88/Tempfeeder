# Deployment Checklist

## Backend (Render) Setup

### 1. Database Setup
- [ ] Create PostgreSQL database (Render, Supabase, or other provider)
- [ ] Run `backend/src/db/schema.sql` to create tables
- [ ] Run `backend/src/db/seed.sql` to populate initial data

### 2. Supabase Setup
- [ ] Create Supabase project
- [ ] Get project URL and service role key
- [ ] Configure authentication settings

### 3. Render Deployment
- [ ] Connect GitHub repository to Render
- [ ] Select Node.js runtime
- [ ] Set build command: `npm run build`
- [ ] Set start command: `npm start`
- [ ] Configure environment variables:
  ```
  DB_HOST=your_db_host
  DB_PORT=5432
  DB_NAME=your_db_name
  DB_USER=your_db_user
  DB_PASSWORD=your_db_password
  SUPABASE_URL=your_supabase_url
  SUPABASE_SERVICE_ROLE_KEY=your_service_key
  PORT=5000
  ```

## Frontend (Vercel) Setup

### 1. Build Configuration
- [ ] Frontend is ready with Vite + TypeScript
- [ ] `vercel.json` configured for SPA routing

### 2. Vercel Deployment
- [ ] Connect GitHub repository to Vercel
- [ ] Vercel will auto-detect as Vite project
- [ ] Set environment variable:
  ```
  VITE_API_BASE=https://your-render-app.onrender.com/api
  ```

## Testing

- [ ] Test user registration/login
- [ ] Test course/topic navigation
- [ ] Test video content loading
- [ ] Test resource downloads
- [ ] Test admin functionality
- [ ] Verify mobile responsiveness

## Production URLs

- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-app.onrender.com`

## Common Issues

1. **CORS errors**: Ensure backend allows frontend domain
2. **Database connection**: Verify all DB environment variables
3. **Supabase auth**: Check service role key permissions
4. **Build failures**: Ensure all dependencies are in package.json
