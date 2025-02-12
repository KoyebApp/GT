require('dotenv').config(); // Load environment variables from .env
const axios = require('axios'); // For making HTTP requests
const FormData = require('form-data'); // For handling file uploads
const fs = require('fs'); // For reading/writing files

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

/**
 * Searches for GIFs on Giphy.
 * @param {string} query - The search query.
 * @param {number} [limit=10] - The maximum number of results to return.
 * @returns {Promise<{data: object}>} - Object containing the search results.
 */
async function searchGifs(query, limit = 10) {
    try {
        const response = await axios.get('https://api.giphy.com/v1/gifs/search', {
            params: {
                api_key: GIPHY_API_KEY,
                q: query,
                limit: limit,
            },
        });

        console.log('Search results:', response.data.data);
        return {
            data: response.data.data, // Array of GIF objects
        };
    } catch (error) {
        console.error('Error searching for GIFs:', error.response ? error.response.data : error.message);
        throw error;
    }
}

/**
 * Downloads a GIF from Giphy by its ID.
 * @param {string} gifId - The ID of the GIF to download.
 * @param {string} outputPath - The path to save the downloaded GIF.
 * @returns {Promise<{filePath: string}>} - Object containing the path to the downloaded GIF.
 */
async function downloadGif(gifId, outputPath) {
    try {
        // Get the GIF URL by ID
        const response = await axios.get(`https://api.giphy.com/v1/gifs/${gifId}`, {
            params: {
                api_key: GIPHY_API_KEY,
            },
        });

        const gifUrl = response.data.data.images.original.url; // URL of the GIF

        // Download the GIF
        const downloadResponse = await axios({
            method: 'get',
            url: gifUrl,
            responseType: 'stream', // Stream the response for large files
        });

        // Save the GIF to the specified output path
        const writer = fs.createWriteStream(outputPath);
        downloadResponse.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', () => {
                console.log('GIF downloaded successfully:', outputPath);
                resolve({ filePath: outputPath });
            });
            writer.on('error', (err) => {
                console.error('Error writing GIF file:', err);
                reject(err);
            });
        });
    } catch (error) {
        console.error('Error downloading GIF:', error.response ? error.response.data : error.message);
        throw error;
    }
}

// Export the functions
module.exports = {
    uploadGif,
    searchGifs,
    downloadGif,
};
