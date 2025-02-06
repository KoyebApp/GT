const fetch = require('node-fetch');

function Get(text) {
  return new Promise(async (resolve, reject) => {
    // Validate the URL format
    if (!/^https?:\/\//.test(text)) {
      return reject('✳️ Invalid URL, please use http:// or https://');
    }

    let _url;
    try {
      _url = new URL(text);
    } catch (err) {
      return reject('✳️ Invalid URL format');
    }

    // API Key and URL construction
    let apiKey = 'APIKEY'; // Replace with actual logic for API key
    let url = global.API ? global.API(_url.origin, _url.pathname, Object.fromEntries(_url.searchParams.entries()), apiKey) : text;

    console.log("API URL:", url);
    console.log("API Key:", apiKey);

    try {
      let res = await fetch(url);

      // Check content-length for large files
      const contentLength = res.headers.get('content-length');
      if (contentLength && parseInt(contentLength) > 100 * 1024 * 1024 * 1024) {
        return reject(`Content-Length: ${contentLength} exceeds limit`);
      }

      // If response type is not text or json, resolve with the URL as a file
      if (!/text|json/.test(res.headers.get('content-type'))) {
        return resolve({ file: url, message: text });
      }

      let txt = await res.buffer();
      
      // Extract the specific result from the response (assuming it’s in plain text)
      try {
        txt = txt.toString(); // Ensuring it's in string format
        resolve(txt); // Directly resolve with the result URL (the response body)
      } catch (e) {
        reject(`Error parsing the response: ${e.message}`);
      }

    } catch (error) {
      reject('Error fetching the URL: ' + error.message);
    }
  });
}

module.exports = Get;
