const axios = require('axios'); // For making HTTP requests
const FormData = require('form-data'); // For handling file uploads
const fs = require('fs'); // For reading files

/**
 * Uploads a file to File.io and returns the full response.
 * @param {string} filePath - Path to the file to upload.
 * @returns {Promise<object>} - Full response from File.io.
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

        // Log the full response for debugging
        console.log('File.io Full Response:', response.data);

        // Return the full response
        return response.data;
    } catch (error) {
        console.error('Error uploading to File.io:', error.response ? error.response.data : error.message);
        throw error;
    }
}

// Export the function
module.exports = uploadFileToFileIo;
