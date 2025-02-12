const axios = require('axios'); // For making HTTP requests
const FormData = require('form-data'); // For handling file uploads
const fs = require('fs'); // For reading files

/**
 * Uploads a file to Telegra.ph and returns the URL.
 * @param {string} filePath - Path to the file to upload.
 * @returns {Promise<string>} - URL of the uploaded file.
 */
async function uploadToTelegraPh(filePath) {
    try {
        // Create a form-data object
        const form = new FormData();
        form.append('file', fs.createReadStream(filePath)); // Add the file to the form

        // Upload the file to Telegra.ph
        const response = await axios.post('https://telegra.ph/upload', form, {
            headers: {
                ...form.getHeaders(), // Set form-data headers
            },
        });

        // Extract the URL of the uploaded file
        if (response.data && response.data[0] && response.data[0].src) {
            const fileUrl = `https://telegra.ph${response.data[0].src}`;
            console.log('Telegra.ph URL:', fileUrl);
            return fileUrl;
        } else {
            throw new Error('Invalid response from Telegra.ph');
        }
    } catch (error) {
        console.error('Error uploading to Telegra.ph:', error.response ? error.response.data : error.message);
        throw error;
    }
}

// Export the function
module.exports = uploadToTelegraPh;
