const fetch = require('node-fetch');
const FormData = require('form-data');

async function uploadImageToImgBB(imageBuffer) {
  const form = new FormData();
  form.append('image', imageBuffer.toString('base64'));

  const response = await fetch('https://api.imgbb.com/1/upload?key=3a38cf75476cb905f4b69c34cafb3c86', {
    method: 'POST',
    body: form
  });

  const data = await response.json();
  if (data.success) {
    return data.data.url;  // Return the URL of the uploaded image
  } else {
    throw new Error('Failed to upload image');
  }
}
