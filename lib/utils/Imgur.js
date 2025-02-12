const fs = require('fs');

async function uploadToImgur(imagepath) {
  try {
    // Dynamically import the ImgurClient using await import
    const { ImgurClient } = await import('imgur');

    const client = new ImgurClient({ clientId: 'a0113354926015a' });

    const response = await client.upload({
      image: fs.createReadStream(imagepath),
      type: 'stream',
    });

    let url = response.data.link;
    console.log(url);
    return url;
  } catch (error) {
    console.error('Error uploading image to Imgur:', error);
    throw error;
  }
}

module.exports = uploadToImgur;
