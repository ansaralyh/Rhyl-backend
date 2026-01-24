# Cloudinary Integration Guide

## Overview
This project now uses **Cloudinary** for image uploads instead of local file storage. This is ideal for deployed applications as images are stored in the cloud and accessible via CDN URLs.

## Setup Instructions

### 1. Create a Cloudinary Account
1. Go to [Cloudinary](https://cloudinary.com/)
2. Sign up for a free account
3. After signing in, go to your Dashboard

### 2. Get Your Cloudinary Credentials
From your Cloudinary Dashboard, you'll find:
- **Cloud Name**
- **API Key**
- **API Secret**

### 3. Update Your .env File
Add your Cloudinary credentials to the `.env` file:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

Replace the placeholder values with your actual Cloudinary credentials.

## How It Works

### Upload Flow
1. Admin uploads an image through the frontend
2. Image is sent to `/api/upload/product` endpoint
3. Multer processes the file with Cloudinary storage
4. Image is uploaded to Cloudinary in the `rhyl-store/products` folder
5. Cloudinary returns a secure URL
6. The URL is saved in the database and used to display the image

### Image Storage
- **Folder**: `rhyl-store/products`
- **Allowed Formats**: JPG, JPEG, PNG, GIF, WEBP
- **Max File Size**: 5MB
- **Auto Transformation**: Images are resized to max 1000x1000px (maintains aspect ratio)

### Delete Flow
1. When deleting a product, call `/api/upload/:publicId` with DELETE method
2. The image is removed from Cloudinary
3. This prevents orphaned images and saves storage space

## API Endpoints

### Upload Image
```
POST /api/upload/product
Headers: Authorization: Bearer <token>
Body: FormData with 'image' field
```

**Response:**
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "filename": "product-1234567890-123456789",
    "path": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/rhyl-store/products/product-1234567890-123456789.jpg",
    "url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/rhyl-store/products/product-1234567890-123456789.jpg",
    "publicId": "product-1234567890-123456789",
    "size": 123456
  }
}
```

### Delete Image
```
DELETE /api/upload/:publicId
Headers: Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Image deleted successfully"
}
```

## Benefits of Cloudinary

✅ **Cloud Storage**: No need to store images on your server
✅ **CDN Delivery**: Fast image loading worldwide
✅ **Auto Optimization**: Images are automatically optimized
✅ **Transformations**: Resize, crop, and format images on-the-fly
✅ **Scalability**: Handle unlimited uploads without server storage issues
✅ **Backup**: Images are safely stored in the cloud

## Migration Notes

### What Changed
- ❌ Removed local file storage (`uploads/` folder)
- ✅ Added Cloudinary cloud storage
- ✅ Images now return Cloudinary URLs instead of local paths
- ✅ Delete endpoint now removes images from Cloudinary

### Frontend Updates Needed
If your frontend was using local image paths like `/uploads/image.jpg`, you'll need to update it to use the full Cloudinary URLs returned from the API.

**Before:**
```javascript
const imageUrl = `http://localhost:5000${product.image}`;
```

**After:**
```javascript
const imageUrl = product.image; // Already a full Cloudinary URL
```

## Free Tier Limits
Cloudinary's free tier includes:
- 25 GB storage
- 25 GB bandwidth per month
- 25,000 transformations per month

This is more than enough for most small to medium projects!

## Troubleshooting

### "Invalid credentials" error
- Double-check your Cloud Name, API Key, and API Secret in `.env`
- Make sure there are no extra spaces or quotes

### Images not uploading
- Verify your Cloudinary account is active
- Check that the file size is under 5MB
- Ensure the file format is supported (jpg, png, gif, webp)

### Images not deleting
- Make sure you're passing the correct `publicId`
- The publicId should NOT include the folder path or file extension

## Support
For more information, visit the [Cloudinary Documentation](https://cloudinary.com/documentation)
