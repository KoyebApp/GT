require('dotenv').config(); // Load environment variables from .env
const giphy = require('giphy-api')(process.env.GIPHY_API_KEY); // Use the API key from .env

/**
 * Uploads a GIF to Giphy and returns the full response data along with the URL.
 * @param {string} gifPath - Path to the GIF file.
 * @returns {Promise<{url: string, data: object}>} - Object containing the Giphy URL and full response data.
 */
async function uploadGif(gifPath) {
    try {
        const response = await giphy.upload({ file: gifPath });
        console.log('Giphy URL:', response.data.url);
        return {
            url: response.data.url, // The Giphy URL
            data: response.data,   // The full response data
        };
    } catch (error) {
        console.error('Error uploading to Giphy:', error);
        throw error;
    }
}

// Export the uploadGif function
module.exports = uploadGif;
