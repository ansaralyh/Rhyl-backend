#!/usr/bin/env node

/**
 * Cloudinary Setup Verification Script
 * Run this to verify your Cloudinary configuration is correct
 */

require('dotenv').config();
const { cloudinary } = require('./config/cloudinary');

console.log('🔍 Verifying Cloudinary Configuration...\n');

// Check if environment variables are set
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || cloudName === 'your_cloud_name_here') {
    console.error('❌ CLOUDINARY_CLOUD_NAME is not set or is using placeholder value');
    console.log('   Please update your .env file with your actual Cloudinary cloud name\n');
    process.exit(1);
}

if (!apiKey || apiKey === 'your_api_key_here') {
    console.error('❌ CLOUDINARY_API_KEY is not set or is using placeholder value');
    console.log('   Please update your .env file with your actual Cloudinary API key\n');
    process.exit(1);
}

if (!apiSecret || apiSecret === 'your_api_secret_here') {
    console.error('❌ CLOUDINARY_API_SECRET is not set or is using placeholder value');
    console.log('   Please update your .env file with your actual Cloudinary API secret\n');
    process.exit(1);
}

console.log('✅ Environment variables are set');
console.log(`   Cloud Name: ${cloudName}`);
console.log(`   API Key: ${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`);
console.log('   API Secret: ********\n');

// Test Cloudinary connection
console.log('🔌 Testing Cloudinary connection...\n');

cloudinary.api.ping()
    .then(result => {
        console.log('✅ Successfully connected to Cloudinary!');
        console.log(`   Status: ${result.status}\n`);

        // Get account details
        return cloudinary.api.usage();
    })
    .then(usage => {
        console.log('📊 Account Usage:');
        console.log(`   Plan: ${usage.plan || 'Free'}`);
        console.log(`   Credits: ${usage.credits?.usage || 0} / ${usage.credits?.limit || 'Unlimited'}`);
        console.log(`   Storage: ${(usage.storage?.usage / 1024 / 1024).toFixed(2)} MB`);
        console.log(`   Bandwidth: ${(usage.bandwidth?.usage / 1024 / 1024).toFixed(2)} MB\n`);

        console.log('🎉 Cloudinary is configured correctly and ready to use!');
        console.log('   You can now upload images to your Rhyl Store.\n');
    })
    .catch(error => {
        console.error('❌ Failed to connect to Cloudinary');
        console.error(`   Error: ${error.message}\n`);
        console.log('💡 Troubleshooting:');
        console.log('   1. Double-check your credentials in the .env file');
        console.log('   2. Make sure there are no extra spaces or quotes');
        console.log('   3. Verify your Cloudinary account is active');
        console.log('   4. Check your internet connection\n');
        process.exit(1);
    });
