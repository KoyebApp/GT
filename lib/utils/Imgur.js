const { ImgurClient } = require('imgur');
const fs = require('fs');

const client = new ImgurClient({ clientId: 'a0113354926015a' });

// Function to upload image to Imgur
async function uploadToImgur(buffer) {
  try {
    // Convert buffer to base64
    const base64Image = buffer.toString('base64');
    
    // Make sure the base64 string is passed to the Imgur API
    const response = await client.upload({
      image: base64Image,  // Pass the base64 string
      type: 'base64'       // Specify that it's base64-encoded data
    });

    // Check if the response is successful
    if (response.success) {
      const imageUrl = response.data.link;  // Extract the URL if the upload is successful
      console.log('Image uploaded successfully:', imageUrl);
      return imageUrl;
    } else {
      console.error('Imgur upload failed:', response.data);
      return null;
    }
  } catch (error) {
    console.error('Error uploading image to Imgur:', error);
    throw error;
  }
}

module.exports = uploadToImgur;
