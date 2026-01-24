/**
 * Migration Script: Upload Existing Local Images to Cloudinary
 * 
 * This script will:
 * 1. Find all images in the uploads/ folder
 * 2. Upload them to Cloudinary
 * 3. Update product records in MongoDB with new Cloudinary URLs
 * 
 * Run this ONCE after setting up Cloudinary to migrate existing images
 */

require('dotenv').config();
const { cloudinary } = require('./config/cloudinary');
const mongoose = require('mongoose');
const Product = require('./models/Product');
const fs = require('fs');
const path = require('path');

const uploadsDir = path.join(__dirname, 'uploads');

async function migrateImages() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Check if uploads directory exists
        if (!fs.existsSync(uploadsDir)) {
            console.log('ℹ️  No uploads folder found. Nothing to migrate.');
            process.exit(0);
        }

        // Get all image files from uploads folder
        const files = fs.readdirSync(uploadsDir).filter(file => {
            const ext = path.extname(file).toLowerCase();
            return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
        });

        if (files.length === 0) {
            console.log('ℹ️  No images found in uploads folder.');
            process.exit(0);
        }

        console.log(`📁 Found ${files.length} images to migrate\n`);

        let successCount = 0;
        let errorCount = 0;

        // Upload each file to Cloudinary
        for (const file of files) {
            try {
                const filePath = path.join(uploadsDir, file);

                console.log(`⬆️  Uploading: ${file}...`);

                // Upload to Cloudinary
                const result = await cloudinary.uploader.upload(filePath, {
                    folder: 'rhyl-store/products',
                    public_id: path.parse(file).name,
                    overwrite: false
                });

                console.log(`   ✅ Uploaded to: ${result.secure_url}`);

                // Find products using this image
                const localPath = `/uploads/${file}`;
                const products = await Product.find({ image: localPath });

                if (products.length > 0) {
                    // Update all products with new Cloudinary URL
                    await Product.updateMany(
                        { image: localPath },
                        { $set: { image: result.secure_url } }
                    );
                    console.log(`   📝 Updated ${products.length} product(s) in database`);
                }

                successCount++;
                console.log('');

            } catch (error) {
                console.error(`   ❌ Error uploading ${file}:`, error.message);
                errorCount++;
                console.log('');
            }
        }

        // Summary
        console.log('═══════════════════════════════════════');
        console.log('Migration Summary:');
        console.log(`✅ Successfully migrated: ${successCount} images`);
        if (errorCount > 0) {
            console.log(`❌ Failed: ${errorCount} images`);
        }
        console.log('═══════════════════════════════════════\n');

        // Optional: Ask if user wants to delete local files
        console.log('ℹ️  Local images are still in the uploads/ folder.');
        console.log('   You can safely delete them after verifying the migration.');
        console.log('   To delete: Delete the uploads/ folder manually\n');

    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');
    }
}

// Run migration
console.log('🚀 Starting Image Migration to Cloudinary...\n');
migrateImages();
