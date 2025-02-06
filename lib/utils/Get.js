const fetch = require('node-fetch');
const { format } = require('util');

// Refined Get function with enhanced error handling and efficiency
function Get(text) {
  return new Promise(async (resolve, reject) => {
    // Validate the input URL format
    if (!/^https?:\/\//.test(text)) {
      return reject('✳️ Invalid URL, please use http:// or https://');
    }

    // Parse the URL from the input text
    let _url;
    try {
      _url = new URL(text);
    } catch (err) {
      return reject('✳️ Invalid URL format');
    }

    // Get the API key, this can be dynamically managed
    let apiKey = 'APIKEY'; // Replace with actual logic for API key if needed

    // Construct the API URL
    let url = global.API ? global.API(_url.origin, _url.pathname, Object.fromEntries(_url.searchParams.entries()), apiKey) : text;

    console.log("API URL:", url);
    console.log("API Key:", apiKey); // Log the API key for debugging

    try {
      // Fetch the response from the API
      let res = await fetch(url);

      // Check content-length to prevent processing large files
      const contentLength = res.headers.get('content-length');
      if (contentLength && parseInt(contentLength) > 100 * 1024 * 1024 * 1024) {
        return reject(`Content-Length: ${contentLength} exceeds limit`);
      }

      // If response type is not text or json, resolve with the URL as a file
      if (!/text|json/.test(res.headers.get('content-type'))) {
        return resolve({ file: url, message: text });
      }

      // Get the response buffer and try to parse it
      let txt = await res.buffer();

      try {
        // Attempt to parse as JSON
        txt = format(JSON.parse(txt.toString()));
      } catch (e) {
        // If parsing fails, treat it as raw text
        txt = txt.toString();
      }

      // Resolve with the text (up to 65536 characters for safety)
      resolve(txt.slice(0, 65536));
    } catch (error) {
      // Catch any errors in the fetch process
      reject('Error fetching the URL: ' + error.message);
    }
  });
}

module.exports = Get;
