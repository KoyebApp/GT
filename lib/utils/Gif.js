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

async function getTrendingGifs(limit = 10) {
         try {
             const response = await axios.get('https://api.giphy.com/v1/gifs/trending', {
                 params: {
                     api_key: GIPHY_API_KEY,
                     limit: limit,
                 },
             });
             return response.data.data; // Array of trending GIFs
         } catch (error) {
             console.error('Error fetching trending GIFs:', error.response ? error.response.data : error.message);
             throw error;
         }
}

async function getTrendingStickers(limit = 10) {
         try {
             const response = await axios.get('https://api.giphy.com/v1/stickers/trending', {
                 params: {
                     api_key: GIPHY_API_KEY,
                     limit: limit,
                 },
             });
             return response.data.data; // Array of trending stickers
         } catch (error) {
             console.error('Error fetching trending stickers:', error.response ? error.response.data : error.message);
             throw error;
         }
}
async function getRandomGif(tag = '') {
         try {
             const response = await axios.get('https://api.giphy.com/v1/gifs/random', {
                 params: {
                     api_key: GIPHY_API_KEY,
                     tag: tag, // Optional: Specify a tag for the random GIF
                 },
             });
             return response.data.data; // Random GIF object
         } catch (error) {
             console.error('Error fetching random GIF:', error.response ? error.response.data : error.message);
             throw error;
         }
}

async function getRandomSticker(tag = '') {
         try {
             const response = await axios.get('https://api.giphy.com/v1/stickers/random', {
                 params: {
                     api_key: GIPHY_API_KEY,
                     tag: tag, // Optional: Specify a tag for the random sticker
                 },
             });
             return response.data.data; // Random sticker object
         } catch (error) {
             console.error('Error fetching random sticker:', error.response ? error.response.data : error.message);
             throw error;
         }
}

async function translateToGif(phrase) {
         try {
             const response = await axios.get('https://api.giphy.com/v1/gifs/translate', {
                 params: {
                     api_key: GIPHY_API_KEY,
                     s: phrase, // The phrase to translate
                 },
             });
             return response.data.data; // Translated GIF object
         } catch (error) {
             console.error('Error translating to GIF:', error.response ? error.response.data : error.message);
             throw error;
         }
}

async function translateToSticker(phrase) {
         try {
             const response = await axios.get('https://api.giphy.com/v1/stickers/translate', {
                 params: {
                     api_key: GIPHY_API_KEY,
                     s: phrase, // The phrase to translate
                 },
             });
             return response.data.data; // Translated sticker object
         } catch (error) {
             console.error('Error translating to sticker:', error.response ? error.response.data : error.message);
             throw error;
         }
}

async function getGifById(gifId) {
         try {
             const response = await axios.get(`https://api.giphy.com/v1/gifs/${gifId}`, {
                 params: {
                     api_key: GIPHY_API_KEY,
                 },
             });
             return response.data.data; // GIF object
         } catch (error) {
             console.error('Error fetching GIF by ID:', error.response ? error.response.data : error.message);
             throw error;
         }
}

async function getStickerById(stickerId) {
         try {
             const response = await axios.get(`https://api.giphy.com/v1/stickers/${stickerId}`, {
                 params: {
                     api_key: GIPHY_API_KEY,
                 },
             });
             return response.data.data; // Sticker object
         } catch (error) {
             console.error('Error fetching sticker by ID:', error.response ? error.response.data : error.message);
             throw error;
         }
}

async function getGifsByCategory(category, limit = 10) {
         try {
             const response = await axios.get('https://api.giphy.com/v1/gifs/categories', {
                 params: {
                     api_key: GIPHY_API_KEY,
                     category: category,
                     limit: limit,
                 },
             });
             return response.data.data; // Array of GIFs in the category
         } catch (error) {
             console.error('Error fetching GIFs by category:', error.response ? error.response.data : error.message);
             throw error;
         }
}

async function getStickersByCategory(category, limit = 10) {
         try {
             const response = await axios.get('https://api.giphy.com/v1/stickers/categories', {
                 params: {
                     api_key: GIPHY_API_KEY,
                     category: category,
                     limit: limit,
                 },
             });
             return response.data.data; // Array of stickers in the category
         } catch (error) {
             console.error('Error fetching stickers by category:', error.response ? error.response.data : error.message);
             throw error;
         }
}

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

        console.log('GIF search results:', response.data.data);
        return {
            data: response.data.data, // Array of GIF objects
        };
    } catch (error) {
        console.error('Error searching for GIFs:', error.response ? error.response.data : error.message);
        throw error;
    }
}

/**
 * Searches for stickers on Giphy.
 * @param {string} query - The search query.
 * @param {number} [limit=10] - The maximum number of results to return.
 * @returns {Promise<{data: object}>} - Object containing the search results.
 */
async function searchStickers(query, limit = 10) {
    try {
        const response = await axios.get('https://api.giphy.com/v1/stickers/search', {
            params: {
                api_key: GIPHY_API_KEY,
                q: query,
                limit: limit,
            },
        });

        console.log('Sticker search results:', response.data.data);
        return {
            data: response.data.data, // Array of sticker objects
        };
    } catch (error) {
        console.error('Error searching for stickers:', error.response ? error.response.data : error.message);
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
    searchStickers,
    downloadGif,
};
