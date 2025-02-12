const cloudinary = require('cloudinary').v2;
const fs = require('fs'); // For reading binary files (if needed)

// Configure Cloudinary using environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a file to Cloudinary.
 * @param {Buffer|string} file - The file to upload (Buffer, base64 string, or file URL).
 * @param {string} [folder='uploads'] - The folder to upload the file to (optional).
 * @returns {Promise<Object>} - The Cloudinary upload response.
 */
async function uploadFileToCloudinary(file, folder = 'uploads') {
  try {
    let uploadResponse;

    if (Buffer.isBuffer(file)) {
      // Handle binary file (Buffer)
      uploadResponse = await cloudinary.uploader.upload(`data:application/octet-stream;base64,${file.toString('base64')}`, {
        folder: folder,
        resource_type: 'auto', // Automatically detect the file type
      });
    } else if (typeof file === 'string' && file.startsWith('data:')) {
      // Handle base64 data
      uploadResponse = await cloudinary.uploader.upload(file, {
        folder: folder,
        resource_type: 'auto', // Automatically detect the file type
      });
    } else if (typeof file === 'string' && file.startsWith('http')) {
      // Handle file URL
      uploadResponse = await cloudinary.uploader.upload(file, {
        folder: folder,
        resource_type: 'auto', // Automatically detect the file type
      });
    } else {
      throw new Error('Unsupported file type. Please provide a Buffer, base64 string, or file URL.');
    }

    return uploadResponse; // Return the full Cloudinary response
  } catch (error) {
    console.error('Error uploading file to Cloudinary:', error);
    throw new Error('Failed to upload file to Cloudinary');
  }
}

module.exports = uploadFileToCloudinary;
