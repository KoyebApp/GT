const axios = require('axios'); // For making HTTP requests
const FormData = require('form-data'); // For handling file uploads
const fs = require('fs'); // For reading files

/**
 * Uploads a file to File.io and returns the download URL.
 * @param {string} filePath - Path to the file to upload.
 * @returns {Promise<{url: string, expires: string}>} - Object containing the download URL and expiration time.
 */
async function uploadFileToFileIo(filePath) {
    try {
        // Create a form-data object
        const form = new FormData();
        form.append('file', fs.createReadStream(filePath)); // Add the file to the form

        // Upload the file to File.io
        const response = await axios.post('https://file.io/', form, {
            headers: {
                ...form.getHeaders(), // Set form-data headers
            },
        });

        // Extract the download URL and expiration time
        const { link, expires } = response.data;
        console.log('File.io URL:', link);
        console.log('Expires:', expires);

        return {
            url: link, // Download URL
            expires: expires, // Expiration time (e.g., "14d")
        };
    } catch (error) {
        console.error('Error uploading to File.io:', error.response ? error.response.data : error.message);
        throw error;
    }
}

// Export the function
module.exports = uploadFileToFileIo;
