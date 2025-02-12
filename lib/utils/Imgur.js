const { ImgurClient } = require('imgur');
const fs = require('fs');
const axios = require('axios');

const client = new ImgurClient({ clientId: 'a0113354926015a' });

async function uploadToImgur(imagePath) {
  try {
    const imageStream = fs.createReadStream(imagePath);

    const response = await axios.post(
      'https://api.imgur.com/3/upload',
      imageStream, {
        headers: {
          'Authorization': 'Client-ID a0113354926015a',
          'Content-Type': 'application/octet-stream',
        },
        params: {
          type: 'file',
        },
      });

    // Extract and return only the relevant information from the response
    const data = response.data.data;

    const uploadInfo = {
      status: true,
      message: "Image uploaded successfully!",
      date: new Date(data.datetime * 1000).toISOString().split('T')[0], // Convert timestamp to date (YYYY-MM-DD)
      time: new Date(data.datetime * 1000).toISOString().split('T')[1].split('.')[0], // Extract time
      link: data.link,
      type: data.type,
      width: data.width,
      height: data.height,
      has_sound: data.has_sound,
      views: data.views,
      tags: data.tags,
    };

    console.log(uploadInfo); // For debugging purposes
    return uploadInfo;

  } catch (error) {
    console.error('Error uploading image to Imgur:', error);
    throw error;
  }
}

module.exports = uploadToImgur;
