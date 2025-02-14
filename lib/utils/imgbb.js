const FormData = require('form-data'); // For handling multipart/form-data
const axios = require('axios');       // For making HTTP requests
const fs = require('fs');             // For reading binary files (if needed)

async function uploadToImgBB(input, expiration = 1296000) {
  const form = new FormData();

  // Validate expiration (must be between 60 and 15552000 seconds)
  if (expiration < 60 || expiration > 15552000) {
    throw new Error('Expiration must be between 60 and 15552000 seconds.');
  }

  // Determine the type of input and append it to the form
  if (Buffer.isBuffer(input)) {
    // Handle binary file (Buffer)
    form.append('image', input, { filename: 'image.png' });
  } else if (typeof input === 'string' && input.startsWith('data:')) {
    // Handle base64 data
    form.append('image', input);
  } else if (typeof input === 'string' && (input.startsWith('http://') || input.startsWith('https://'))) {
    // Handle image URL
    form.append('image', input);
  } else if (typeof input === 'string' && fs.existsSync(input)) {
    // Handle local file path
    const fileStream = fs.createReadStream(input);
    form.append('image', fileStream);
  } else if (typeof input?.pipe === 'function') {
    // Handle stream
    form.append('image', input);
  } else {
    throw new Error('Unsupported input type. Please provide a Buffer, base64 string, URL, file path, or stream.');
  }

  // Add expiration to the form
  form.append('expiration', expiration.toString());

  try {
    // Make a POST request to ImgBB API
    const response = await axios.post('https://api.imgbb.com/1/upload?key=84425c5a9e72b87e9abc7645b904eb33', form, {
      headers: form.getHeaders(), // Add headers for FormData
    });

    // Check if the upload was successful
    if (response.data.success) {
      return response.data; // Return the full response from ImgBB
    } else {
      console.error('ImgBB API Error:', response.data.error); // Log the error
      throw new Error('Failed to upload image to ImgBB');
    }
  } catch (error) {
    console.error('Upload Error:', error); // Log the error
    throw new Error('Failed to upload image to ImgBB');
  }
}

module.exports = uploadToImgBB;
