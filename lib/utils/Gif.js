require('dotenv').config(); // Load environment variables from .env
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const GIPHY_API_KEY = process.env.GIPHY_API_KEY; // Load Giphy API key from .env

/**
 * Uploads a GIF to Giphy and returns the full response data along with the URL.
 * @param {string} gifPath - Path to the GIF file.
 * @returns {Promise<{url: string, data: object}>} - Object containing the Giphy URL and full response data.
 */
async function uploadGif(gifPath) {
    try {
        // Create a form-data object
        const form = new FormData();
        form.append('file', fs.createReadStream(gifPath)); // Add the GIF file
        form.append('api_key', GIPHY_API_KEY); // Add the Giphy API key

        // Upload the GIF to Giphy
        const response = await axios.post('https://upload.giphy.com/v1/gifs', form, {
            headers: {
                ...form.getHeaders(), // Set form-data headers
            },
        });

        // Extract the Giphy URL and full response data
        const giphyUrl = `https://giphy.com/gifs/${response.data.data.id}`;
        console.log('Giphy URL:', giphyUrl);
        return {
            url: giphyUrl,
            data: response.data, // Full response data
        };
    } catch (error) {
        console.error('Error uploading to Giphy:', error.response ? error.response.data : error.message);
        throw error;
    }
}

// Export the uploadGif function
module.exports = uploadGif;
