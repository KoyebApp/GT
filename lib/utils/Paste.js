// src/main.js
const PASTEBIN_API_KEY = 'EMWTMkQAVfJa9kM-MRUrxd5Oku1U7pgL'; // Replace with your Pastebin API key

/**
 * Uploads text to Pastebin using the `pastebin-api` library
 * @param {string} text - The text to upload
 * @param {string} [title] - Optional title for the paste
 * @param {string} [format] - Optional syntax highlighting format
 * @param {string} [privacy] - Optional privacy setting (0 = public, 1 = unlisted, 2 = private)
 * @returns {Promise<string>} - The URL of the created paste
 */
async function uploadToPastebin(text, title = 'Untitled', format = 'text', privacy = '1') {
    try {
        // Dynamically import the `pastebin-api` ES module
        const { PasteClient, Publicity } = await import('pastebin-api');

        // Initialize the Pastebin client
        const client = new PasteClient(PASTEBIN_API_KEY);

        // Map privacy settings to `pastebin-api`'s Publicity enum
        const publicityMap = {
            '0': Publicity.Public,
            '1': Publicity.Unlisted,
            '2': Publicity.Private,
        };

        // Upload the paste
        const pasteUrl = await client.createPaste({
            code: text,
            expireDate: 'N', // Never expire
            format: format, // Syntax highlighting format
            name: title, // Title of the paste
            publicity: publicityMap[privacy], // Privacy setting
        });

        console.log('Pastebin URL:', pasteUrl);
        return pasteUrl;
    } catch (error) {
        console.error('Error uploading to Pastebin:', error);
        throw error;
    }
}

module.exports = uploadToPastebin;
