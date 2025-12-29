#!/bin/bash

echo "Setting up Spoon Edu Platform Backend..."

# Create .env file if it doesn't exist
if [ ! -f "backend/.env" ]; then
    echo "Creating backend/.env file..."
    cat > backend/.env << EOL
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=spoon_edu
DB_USER=postgres
DB_PASSWORD=password

# Supabase Configuration (optional - for file storage)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT Secret (generate a secure random key)
JWT_SECRET=$(openssl rand -base64 32)

# Email Configuration (for password reset - optional)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Server Port
PORT=5000
EOL
    echo "✅ Created backend/.env file"
else
    echo "✅ backend/.env file already exists"
fi

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
npm install

# Check if PostgreSQL is running
echo "Checking PostgreSQL connection..."
if command -v psql &> /dev/null; then
    # Create database if it doesn't exist
    psql -U postgres -c "CREATE DATABASE spoon_edu;" 2>/dev/null || echo "Database spoon_edu already exists or creation failed"
else
    echo "⚠️  PostgreSQL not found. Please ensure PostgreSQL is installed and running."
    echo "   On Ubuntu/Debian: sudo apt install postgresql postgresql-contrib"
    echo "   On macOS: brew install postgresql"
    echo "   On Windows: Download from https://www.postgresql.org/download/windows/"
fi

# Run database schema
echo "Setting up database schema..."
if command -v psql &> /dev/null; then
    psql -U postgres -d spoon_edu -f src/db/schema.sql
    echo "✅ Database schema initialized"

    # Seed with sample data
    echo "Seeding database with sample data..."
    psql -U postgres -d spoon_edu -f src/db/seed.sql
    echo "✅ Database seeded with sample data"
else
    echo "⚠️  Skipping database setup - PostgreSQL not available"
fi

cd ..
echo ""
echo "🎉 Backend setup complete!"
echo ""
echo "Next steps:"
echo "1. Update backend/.env with your actual database credentials"
echo "2. Update backend/.env with your Supabase credentials (if using)"
echo "3. Run 'npm run dev:backend' to start the backend server"
echo "4. Run 'npm run dev:frontend' to start the frontend (in another terminal)"
echo "5. Or run 'npm run dev' to start both frontend and backend together"
