const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const cheerio = require('cheerio'); // For parsing HTML

/**
 * Converts a WebP or GIF file to MP4 using EZGif.
 * @param {string} filePath - Path to the WebP or GIF file.
 * @returns {Promise<{status: boolean, message: string, result: string}>} - Conversion result.
 */
async function webp2mp4File(filePath) {
    try {
        const form = new FormData();
        form.append('new-image-url', ''); // Empty URL for file upload
        form.append('new-image', fs.createReadStream(filePath)); // Append WebP or GIF file

        // Step 1: Upload the file to EZGif
        const uploadResponse = await axios.post('https://s6.ezgif.com/webp-to-mp4', form, {
            headers: {
                'Content-Type': `multipart/form-data; boundary=${form._boundary}`,
            },
        });

        // Log the upload response for debugging
        console.log('EZGif Upload Response:', uploadResponse.data);

        // Parse the upload response to get the file token
        const $ = cheerio.load(uploadResponse.data);
        const fileToken = $('input[name="file"]').attr('value');

        if (!fileToken) {
            throw new Error('File token not found in EZGif response');
        }

        // Step 2: Convert the file to MP4
        const convertForm = new FormData();
        convertForm.append('file', fileToken);
        convertForm.append('convert', 'Convert WebP to MP4!');

        const convertResponse = await axios.post('https://ezgif.com/webp-to-mp4/' + fileToken, convertForm, {
            headers: {
                'Content-Type': `multipart/form-data; boundary=${convertForm._boundary}`,
            },
        });

        // Log the conversion response for debugging
        console.log('EZGif Conversion Response:', convertResponse.data);

        // Parse the conversion response to get the MP4 URL
        const $$ = cheerio.load(convertResponse.data);
        const mp4Url = 'https:' + $$('div#output > p.outfile > video > source').attr('src');

        if (!mp4Url) {
            throw new Error('MP4 URL not found in EZGif response');
        }

        return {
            status: true,
            message: 'Created By MRHRTZ',
            result: mp4Url,
        };
    } catch (error) {
        console.error('Error converting file to MP4:', error.response ? error.response.data : error.message);
        throw error;
    }
}

module.exports = webp2mp4File;
