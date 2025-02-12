const { ImgurClient } = require('imgur');
const fs = require('fs');
const axios = require('axios'); // Use axios to manually add headers

const client = new ImgurClient({ clientId: 'a0113354926015a' });

async function uploadToImgur(imagePath) {
  try {
    const imageStream = fs.createReadStream(imagePath);

    // Manually set headers in axios request
    const response = await axios.post(
      'https://api.imgur.com/3/upload',
      imageStream, {
        headers: {
          'Authorization': 'Client-ID a0113354926015a',
          'Content-Type': 'application/octet-stream',
        },
        params: {
          type: 'file', // Specify image type if needed
        },
      });

    // Log the response to debug
    console.log('Imgur upload response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error uploading image to Imgur:', error);
    throw error;
  }
}

module.exports = uploadToImgur;
