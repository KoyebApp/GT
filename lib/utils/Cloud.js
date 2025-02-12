const axios = require('axios');
const fs = require('fs');
const crypto = require('crypto');
const FormData = require('form-data');

const CLOUDINARY_API_URL = 'https://api.cloudinary.com/v1_1/@dpgr0xrbz/image/upload';
const API_KEY = '335869263729271'; // Replace with your Cloudinary API key
const API_SECRET = 'YOUR_CLOUDINARY_API_SECRET'; // Replace with your Cloudinary API secret

async function uploadToCloudinary(imagePath) {
  try {
    const timestamp = Math.floor(Date.now() / 1000); // Get the current timestamp
    const file = fs.createReadStream(imagePath); // Create a read stream for the image file

    // Generate the signature using the API secret and required parameters
    const signature = generateSignature(timestamp);

    // Create a new FormData object to handle multipart form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('timestamp', timestamp);
    formData.append('api_key', API_KEY);
    formData.append('signature', signature);

    // Make the POST request to Cloudinary
    const response = await axios.post(CLOUDINARY_API_URL, formData, {
      headers: formData.getHeaders(), // This sets the correct 'Content-Type' for the form data
    });

    // The full response data from Cloudinary
    const cloudinaryData = response.data;

    // Return the full response data as is
    return {
      status: true,
      message: 'Image uploaded successfully!',
      data: cloudinaryData, // Return the complete Cloudinary response data
    };

  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error.message);
    throw error;
  }
}

// Generate the signature for the Cloudinary request
function generateSignature(timestamp) {
  const stringToSign = `timestamp=${timestamp}${API_SECRET}`;
  const signature = crypto
    .createHash('sha1')
    .update(stringToSign)
    .digest('hex');

  return signature;
}

module.exports = uploadToCloudinary;
      
