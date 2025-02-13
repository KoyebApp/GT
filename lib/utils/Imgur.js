const { ImgurClient } = require('imgur');
const fs = require('fs');
const axios = require('axios');

const client = new ImgurClient({ clientId: 'a0113354926015a' });
const MAX_SIZE_MB = 10; // Max file size in MB

async function uploadToImgur(input, type = 'auto') {
  try {
    let payload;

    // Determine the type of input if 'auto' is specified
    if (type === 'auto') {
      if (typeof input === 'string') {
        if (input.startsWith('http://') || input.startsWith('https://')) {
          type = 'url';
        } else if (input.startsWith('data:')) {
          type = 'base64';
        } else if (fs.existsSync(input)) {
          type = 'file';
        } else {
          throw new Error('Unable to determine input type.');
        }
      } else if (Buffer.isBuffer(input)) {
        type = 'buffer';
      } else if (typeof input.pipe === 'function') {
        type = 'stream';
      } else {
        throw new Error('Invalid input type.');
      }
    }

    // Prepare the payload based on the input type
    switch (type) {
      case 'file': {
        // Handle local file path
        const stats = fs.statSync(input);
        const fileSizeInMB = stats.size / (1024 * 1024); // Convert to MB

        if (fileSizeInMB > MAX_SIZE_MB) {
          throw new Error(`File size exceeds the ${MAX_SIZE_MB} MB limit!`);
        }

        const fileBuffer = fs.readFileSync(input);
        payload = {
          image: fileBuffer.toString('base64'),
          type: 'base64',
        };
        break;
      }

      case 'url': {
        // Handle URL
        payload = {
          image: input,
          type: 'url',
        };
        break;
      }

      case 'base64': {
        // Handle base64 string
        payload = {
          image: input,
          type: 'base64',
        };
        break;
      }

      case 'buffer': {
        // Handle buffer
        payload = {
          image: input.toString('base64'),
          type: 'base64',
        };
        break;
      }

      case 'stream': {
        // Handle stream
        const chunks = [];
        for await (const chunk of input) {
          chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);
        payload = {
          image: buffer.toString('base64'),
          type: 'base64',
        };
        break;
      }

      default:
        throw new Error('Invalid upload type specified!');
    }

    // Upload the media to Imgur
    const response = await axios.post(
      'https://api.imgur.com/3/upload',
      payload,
      {
        headers: {
          'Authorization': `Client-ID ${client.clientId}`,
          'Content-Type': 'application/json',
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
