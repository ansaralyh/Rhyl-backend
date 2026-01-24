# MongoDB Installation and Setup Guide for Windows

## Option 1: Install MongoDB Community Edition (Recommended)

### Step 1: Download MongoDB
1. Visit: https://www.mongodb.com/try/download/community
2. Select:
   - Version: Latest (7.0 or higher)
   - Platform: Windows
   - Package: MSI
3. Click "Download"

### Step 2: Install MongoDB
1. Run the downloaded `.msi` file
2. Choose "Complete" installation
3. Install MongoDB as a Service (check the box)
4. Install MongoDB Compass (optional GUI tool)
5. Complete the installation

### Step 3: Verify Installation
Open PowerShell and run:
```powershell
mongod --version
```

You should see the MongoDB version information.

### Step 4: Start MongoDB Service
MongoDB should start automatically as a Windows service. If not:
```powershell
net start MongoDB
```

## Option 2: Use MongoDB Atlas (Cloud Database - Free Tier)

If you prefer not to install MongoDB locally, use MongoDB Atlas (cloud):

### Step 1: Create Account
1. Visit: https://www.mongodb.com/cloud/atlas/register
2. Sign up for a free account

### Step 2: Create Cluster
1. Click "Build a Database"
2. Choose "FREE" tier (M0 Sandbox)
3. Select a cloud provider and region
4. Click "Create Cluster"

### Step 3: Create Database User
1. Go to "Database Access"
2. Click "Add New Database User"
3. Create username and password
4. Set permissions to "Read and write to any database"

### Step 4: Whitelist IP Address
1. Go to "Network Access"
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development)
4. Confirm

### Step 5: Get Connection String
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your database user password

Example connection string:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/rhyl-store?retryWrites=true&w=majority
```

### Step 6: Update .env File
Update your `backend/.env` file:
```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/rhyl-store?retryWrites=true&w=majority
```

## Testing the Connection

After setting up MongoDB (local or cloud), test the connection:

### 1. Seed the Database
```bash
cd backend
node seed.js
```

You should see:
```
MongoDB Connected: ...
Data cleared
Admin user created
Test customer created
Categories created
Sample products created
```

### 2. Start the Server
```bash
npm run dev
```

You should see:
```
Server running in development mode on port 5000
MongoDB Connected: ...
```

### 3. Test the API
Open your browser and visit:
```
http://localhost:5000/api/health
```

You should see:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "..."
}
```

## Troubleshooting

### MongoDB Connection Failed
- **Local MongoDB**: Ensure the MongoDB service is running
  ```powershell
  net start MongoDB
  ```
- **MongoDB Atlas**: Check your connection string, username, password, and IP whitelist

### Port 27017 Already in Use
- Another MongoDB instance is running
- Stop it or use a different port in the connection string

### Authentication Failed (Atlas)
- Verify username and password in connection string
- Check database user permissions in Atlas

## Next Steps

Once MongoDB is set up and the backend is running:

1. **Seed the database**: `node seed.js`
2. **Start the server**: `npm run dev`
3. **Test with frontend**: Open `index.html` in your browser
4. **Login as admin**: Use `admin@rhylstore.com` / `admin123`

## Useful Commands

```bash
# Start MongoDB service (Windows)
net start MongoDB

# Stop MongoDB service (Windows)
net stop MongoDB

# Check MongoDB status
mongosh  # Opens MongoDB shell

# View databases
show dbs

# Use rhyl-store database
use rhyl-store

# View collections
show collections

# View users
db.users.find().pretty()

# View products
db.products.find().pretty()
```

## MongoDB Compass (GUI Tool)

If you installed MongoDB Compass:
1. Open MongoDB Compass
2. Connect to: `mongodb://localhost:27017`
3. Browse your `rhyl-store` database
4. View and edit collections visually

## Resources

- MongoDB Documentation: https://docs.mongodb.com/
- MongoDB Atlas: https://www.mongodb.com/cloud/atlas
- MongoDB Compass: https://www.mongodb.com/products/compass
