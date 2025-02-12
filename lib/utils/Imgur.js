// utils/Imgur.js
const { ImgurClient } = require('imgur');
const fs = require('fs');

const client = new ImgurClient({ clientId: 'a0113354926015a' })

async function uploadToImgur(imagePath) {
  try {
    const response = await client.upload({
      image: fs.createReadStream(imagePath),
      type: 'stream',
    });

    const url = response.data.link; // URL of the uploaded image
    console.log(url);
    return url;
  } catch (error) {
    console.error('Error uploading image to Imgur:', error);
    throw error;
  }
}

module.exports = uploadToImgur;
