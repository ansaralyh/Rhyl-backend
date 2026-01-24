# Cloudinary Integration Architecture

## Before (Local Storage)

```
┌─────────────┐         ┌─────────────┐         ┌──────────────┐
│   Admin     │         │   Backend   │         │    Local     │
│   Panel     │────────▶│   Server    │────────▶│   uploads/   │
└─────────────┘         └─────────────┘         └──────────────┘
                              │
                              ▼
                        ┌──────────────┐
                        │   MongoDB    │
                        │ (stores path)│
                        └──────────────┘

Problems:
❌ Files stored on server disk
❌ Doesn't work on Heroku/Vercel (ephemeral filesystem)
❌ No CDN (slow loading)
❌ Manual backup needed
```

## After (Cloudinary)

```
┌─────────────┐         ┌─────────────┐         ┌──────────────┐
│   Admin     │         │   Backend   │         │  Cloudinary  │
│   Panel     │────────▶│   Server    │────────▶│    Cloud     │
└─────────────┘         └─────────────┘         └──────────────┘
                              │                        │
                              ▼                        │
                        ┌──────────────┐               │
                        │   MongoDB    │               │
                        │ (stores URL) │               │
                        └──────────────┘               │
                                                       │
┌─────────────┐                                        │
│   Customer  │                                        │
│   Website   │◀───────────────────────────────────────┘
└─────────────┘         (CDN - Fast Delivery)

Benefits:
✅ Files stored in cloud
✅ Works on any hosting platform
✅ Global CDN (fast worldwide)
✅ Automatic backups
✅ Image transformations available
```

## Upload Flow

```
1. Admin selects image
   │
   ▼
2. Frontend sends to /api/upload/product
   │
   ▼
3. Multer processes file
   │
   ▼
4. multer-storage-cloudinary uploads to Cloudinary
   │
   ▼
5. Cloudinary returns URL
   │
   ▼
6. Backend returns URL to frontend
   │
   ▼
7. Frontend saves product with Cloudinary URL
   │
   ▼
8. MongoDB stores product with image URL
```

## File Structure

```
backend/
├── config/
│   └── cloudinary.js          ← NEW: Cloudinary config
├── middleware/
│   └── upload.js               ← UPDATED: Uses Cloudinary
├── routes/
│   └── upload.js               ← UPDATED: Returns Cloudinary URLs
├── scripts/
│   └── verify-cloudinary.js    ← NEW: Test script
├── .env                        ← UPDATED: Added credentials
├── server.js                   ← UPDATED: Removed static serving
├── CLOUDINARY_SETUP.md         ← NEW: Detailed guide
└── CLOUDINARY_QUICKSTART.md    ← NEW: Quick reference
```

## Environment Variables

```env
# Required Cloudinary Variables
CLOUDINARY_CLOUD_NAME=your_cloud_name    ← Get from dashboard
CLOUDINARY_API_KEY=your_api_key          ← Get from dashboard
CLOUDINARY_API_SECRET=your_api_secret    ← Get from dashboard
```

## API Response Changes

### Before (Local Storage):
```json
{
  "success": true,
  "data": {
    "filename": "product-1234567890-123456789.jpg",
    "path": "/uploads/product-1234567890-123456789.jpg",
    "size": 123456
  }
}
```

### After (Cloudinary):
```json
{
  "success": true,
  "data": {
    "filename": "rhyl-store/products/product-1234567890-123456789",
    "path": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/rhyl-store/products/product-1234567890-123456789.jpg",
    "url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/rhyl-store/products/product-1234567890-123456789.jpg",
    "publicId": "rhyl-store/products/product-1234567890-123456789",
    "size": 123456
  }
}
```

## Cloudinary Dashboard Structure

```
Your Cloudinary Account
└── Media Library
    └── rhyl-store/
        └── products/
            ├── product-1234567890-123456789.jpg
            ├── product-9876543210-987654321.jpg
            └── ...
```

## Testing Checklist

- [ ] Add Cloudinary credentials to `.env`
- [ ] Run `npm run verify-cloudinary`
- [ ] Start server with `npm run dev`
- [ ] Go to admin panel
- [ ] Add a new product with an image
- [ ] Check Cloudinary dashboard for uploaded image
- [ ] Verify image displays on website
- [ ] Test image delete functionality

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Invalid credentials" | Check `.env` for typos, no spaces |
| Upload fails | Check file size (<5MB), format (jpg/png/gif/webp) |
| Image not showing | Check browser console, verify URL is valid |
| Slow uploads | Normal for first time, Cloudinary optimizes |

## Free Tier Limits

| Resource | Limit |
|----------|-------|
| Storage | 25 GB |
| Bandwidth | 25 GB/month |
| Transformations | 25,000/month |
| Images | Unlimited |

## Next Steps

1. **Get Credentials**: Sign up at cloudinary.com
2. **Update .env**: Add your credentials
3. **Verify**: Run `npm run verify-cloudinary`
4. **Test**: Upload an image in admin panel
5. **Deploy**: Your app is now deployment-ready!

---

**Need Help?** Check `CLOUDINARY_SETUP.md` for detailed instructions.
