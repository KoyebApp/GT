const FormData = require('form-data'); // For handling multipart/form-data
const fetch = require('node-fetch');  // For making HTTP requests
const fs = require('fs');            // For reading binary files (if needed)

async function uploadToImgBB(image) {
  const form = new FormData();

  // Determine the type of input and append it to the form
  if (Buffer.isBuffer(image)) {
    // Handle binary file (Buffer)
    form.append('image', image, { filename: 'image.png' });
  } else if (typeof image === 'string' && image.startsWith('data:')) {
    // Handle base64 data
    form.append('image', image);
  } else if (typeof image === 'string' && image.startsWith('http')) {
    // Handle image URL
    form.append('image', image);
  } else {
    throw new Error('Unsupported image type. Please provide a Buffer, base64 string, or image URL.');
  }

  try {
    // Make a POST request to ImgBB API
    const response = await fetch('https://api.imgbb.com/1/upload?key=84425c5a9e72b87e9abc7645b904eb33', {
      method: 'POST',
      body: form,
      headers: form.getHeaders(), // Add headers for FormData
    });

    // Parse the JSON response
    const data = await response.json();

    // Check if the upload was successful
    if (data.success) {
      return data; // Return the full response from ImgBB
    } else {
      console.error('ImgBB API Error:', data.error); // Log the error
      throw new Error('Failed to upload image to ImgBB');
    }
  } catch (error) {
    console.error('Upload Error:', error); // Log the error
    throw new Error('Failed to upload image to ImgBB');
  }
}
module.exports = uploadToImgBB;
