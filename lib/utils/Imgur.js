// utils/Imgur.js
const { ImgurClient } = require('imgur');
const fs = require('fs');

const client = new ImgurClient({ clientId: 'a0113354926015a' })



async function uploadToImgur(imagePath) {
  try {
    const response = await client.upload({
      image: fs.createReadStream(imagePath),  // Use stream to upload image
      type: 'stream',  // Specify image type as stream
    });

    // Log the entire response to understand its structure
    console.log('Imgur upload response:', response);

    
      return response;  // Return the image URL to be used in the route
    } else {
      throw new Error('No link found in the Imgur response.');
    }
  } catch (error) {
    console.error('Error uploading image to Imgur:', error);
    throw error;  // Rethrow the error for handling in the route
  }
}

module.exports = uploadToImgur;

