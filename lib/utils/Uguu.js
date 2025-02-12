const axios = require('axios');
const FormData = require('form-data');
const { fromBuffer } = require('file-type'); // For detecting file type

/**
 * Uploads a file to Uguu.se.
 * @param {Buffer} buffer - The file buffer to upload.
 * @returns {Promise<string>} - URL of the uploaded file.
 */
async function UguuSe(buffer) {
    try {
        const form = new FormData();
        const { ext } = await fromBuffer(buffer); // Detect file type
        form.append('files[]', buffer, { filename: `data.${ext}` }); // Append file with detected extension

        const response = await axios.post('https://uguu.se/upload.php', form, {
            headers: {
                ...form.getHeaders(), // Set form-data headers
            },
        });

        // Return the URL of the uploaded file
        return response.data.files[0].url;
    } catch (error) {
        console.error('Error uploading to Uguu.se:', error.response ? error.response.data : error.message);
        throw error;
    }
}

module.exports = UguuSe
