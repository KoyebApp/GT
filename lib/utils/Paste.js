const PastebinAPI = require('pastebin-js');

// Replace with your Pastebin API key
const PASTEBIN_API_KEY = 'EMWTMkQAVfJa9kM-MRUrxd5Oku1U7pgL';

// Initialize the Pastebin API
const pastebin = new PastebinAPI(PASTEBIN_API_KEY);

/**
 * Uploads text to Pastebin
 * @param {string} text - The text to upload
 * @param {string} [title] - Optional title for the paste
 * @param {string} [format] - Optional syntax highlighting format
 * @param {string} [privacy] - Optional privacy setting (0 = public, 1 = unlisted, 2 = private)
 * @returns {Promise<string>} - The URL of the created paste
 */
async function uploadToPastebin(text, title = 'Untitled', format = 'text', privacy = '1') {
    try {
        const url = await pastebin
            .createPaste({
                text: text,
                title: title,
                format: format,
                privacy: privacy,
            });
        console.log('Pastebin URL:', url);
        return url;
    } catch (error) {
        console.error('Error uploading to Pastebin:', error);
        throw error;
    }
}
module.exports = uploadToPastebin;
