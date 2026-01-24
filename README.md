# Rhyl-Store Backend API

Backend server for the Rhyl-Store e-commerce platform built with Node.js, Express, and MongoDB.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Product Management**: Full CRUD operations for products with search and filtering
- **Shopping Cart**: Persistent cart functionality for logged-in users
- **Order Processing**: Complete order management system
- **Admin Dashboard**: Statistics, analytics, and management tools
- **Security**: Password hashing, rate limiting, CORS, and secure headers

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Update the values in `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/rhyl-store
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=development
```

4. Make sure MongoDB is running on your system

## Database Setup

Seed the database with initial data (admin user, categories, and sample products):

```bash
node seed.js
```

This will create:
- **Admin User**: 
  - Email: `admin@rhylstore.com`
  - Password: `admin123`
- **Test Customer**:
  - Email: `customer@test.com`
  - Password: `customer123`
- **15 Categories** (Fresh Produce, Grocery, Dairy, etc.)
- **10 Sample Products**

## Running the Server

### Development Mode (with auto-reload):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

The server will run on `http://localhost:5000`

## API Endpoints

### Authentication (`/api/auth`)
- `POST /signup` - Register new user
- `POST /login` - User login
- `GET /me` - Get current user (Protected)
- `PUT /profile` - Update profile (Protected)

### Products (`/api/products`)
- `GET /` - Get all products (supports pagination, search, filtering)
- `GET /:id` - Get single product
- `POST /` - Create product (Admin only)
- `PUT /:id` - Update product (Admin only)
- `DELETE /:id` - Delete product (Admin only)

### Cart (`/api/cart`)
- `GET /` - Get user cart (Protected)
- `POST /add` - Add item to cart (Protected)
- `PUT /update/:productId` - Update cart item (Protected)
- `DELETE /remove/:productId` - Remove item (Protected)
- `DELETE /clear` - Clear cart (Protected)

### Orders (`/api/orders`)
- `GET /` - Get user orders (Protected)
- `GET /:id` - Get single order (Protected)
- `POST /` - Create order (Protected)
- `GET /admin/all` - Get all orders (Admin only)
- `PUT /:id/status` - Update order status (Admin only)

### Admin (`/api/admin`)
- `GET /dashboard` - Dashboard statistics (Admin only)
- `GET /users` - Get all users (Admin only)
- `PUT /users/:id/role` - Update user role (Admin only)
- `GET /analytics` - Sales analytics (Admin only)

## API Response Format

### Success Response:
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response:
```json
{
  "success": false,
  "message": "Error message"
}
```

### Paginated Response:
```json
{
  "success": true,
  "count": 10,
  "total": 50,
  "page": 1,
  "pages": 5,
  "data": [ ... ]
}
```

## Authentication

Protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

After login/signup, the token is returned in the response and should be stored on the client side.

## Database Models

### User
- name, email, password (hashed)
- role (customer/admin)
- phone, address
- timestamps

### Product
- name, description, price
- category (reference)
- image, stock, rating
- brand, featured flag
- timestamps

### Category
- name, slug (auto-generated)
- description, icon, color
- timestamps

### Order
- user (reference)
- items (array of products with quantity and price)
- totalAmount, status, paymentStatus
- shippingAddress, paymentMethod
- timestamps

### Cart
- user (reference)
- items (array of products with quantity)
- timestamps

## Security Features

- **Password Hashing**: bcrypt with 10 salt rounds
- **JWT Authentication**: Secure token-based auth
- **Rate Limiting**: 100 requests per 10 minutes per IP
- **CORS**: Configured for frontend access
- **Helmet**: Security headers
- **Input Validation**: Mongoose schema validation

## Project Structure

```
backend/
├── config/
│   └── db.js              # Database connection
├── models/
│   ├── User.js
│   ├── Product.js
│   ├── Category.js
│   ├── Order.js
│   ├── Cart.js
│   └── Wishlist.js
├── controllers/
│   ├── authController.js
│   ├── productController.js
│   ├── cartController.js
│   ├── orderController.js
│   └── adminController.js
├── routes/
│   ├── auth.js
│   ├── products.js
│   ├── cart.js
│   ├── orders.js
│   └── admin.js
├── middleware/
│   ├── auth.js            # JWT verification
│   └── admin.js           # Admin role check
├── .env                   # Environment variables
├── .env.example           # Environment template
├── server.js              # Main server file
├── seed.js                # Database seeder
└── package.json
```

## Development

The server uses nodemon in development mode for automatic restarts on file changes.

## Testing

You can test the API endpoints using:
- Postman
- Thunder Client (VS Code extension)
- curl
- Or the frontend application

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod` or check your MongoDB service
- Verify the connection string in `.env`

### Port Already in Use
- Change the PORT in `.env` to an available port
- Or kill the process using port 5000

### JWT Token Errors
- Ensure JWT_SECRET is set in `.env`
- Check token expiration (default: 7 days)

## License

ISC
