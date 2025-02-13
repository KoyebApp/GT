const { ImgurClient } = require('imgur');
const fs = require('fs');
const axios = require('axios');

const client = new ImgurClient({ clientId: 'a0113354926015a' });
const MAX_SIZE_MB = 10; // Max file size in MB

async function uploadToImgur(input, type = 'file') {
  try {
    let payload;

    // Check the input type and prepare the payload accordingly
    if (type === 'file') {
      // Handle file path input
      const stats = fs.statSync(input);
      const fileSizeInMB = stats.size / (1024 * 1024); // Convert to MB

      if (fileSizeInMB > MAX_SIZE_MB) {
        throw new Error(`File size exceeds the ${MAX_SIZE_MB} MB limit!`);
      }

      // Read the file and encode it as base64
      const fileBuffer = fs.readFileSync(input);
      payload = {
        image: fileBuffer.toString('base64'),
        type: 'base64',
      };
    } else if (type === 'stream') {
      // Handle streaming input
      const imageStream = fs.createReadStream(input);
      payload = imageStream;
    } else if (type === 'url') {
      // Handle URL input
      payload = {
        image: input,
        type: 'url',
      };
    } else if (type === 'binary') {
      // Handle raw binary input
      payload = {
        image: input,
        type: 'binary',
      };
    } else {
      throw new Error('Invalid upload type specified!');
    }

    // Upload the media to Imgur
    const response = await axios.post(
      'https://api.imgur.com/3/upload',
      payload,
      {
        headers: {
          'Authorization': `Client-ID ${client.clientId}`,
          'Content-Type': type === 'stream' ? 'application/octet-stream' : 'application/json',
        },
      }
    );

    // Extract and return only the relevant information from the response
    const data = response.data.data;

    const uploadInfo = {
      date: new Date(data.datetime * 1000).toISOString().split('T')[0], // Convert timestamp to date (YYYY-MM-DD)
      time: new Date(data.datetime * 1000).toISOString().split('T')[1].split('.')[0], // Extract time
      link: data.link,
      type: data.type,
      width: data.width,
      height: data.height,
      has_sound: data.has_sound,
      views: data.views,
      mp4: data.mp4,
      tags: data.tags,
    };

    console.log(uploadInfo); // For debugging purposes
    return uploadInfo;

  } catch (error) {
    console.error('Error uploading media to Imgur:', error.message);
    throw error;
  }
}

module.exports = uploadToImgur;
