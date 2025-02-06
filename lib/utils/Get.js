const fetch = require('node-fetch');
const { format } = require('util');

function Get(text) {
  return new Promise(async (resolve, reject) => {
    if (!/^https?:\/\//.test(text)) {
      reject(`✳️ Invalid URL, please use http:// or https://`);
    }

    // Parse the URL from the input text
    let _url = new URL(text);

    // Get the full API URL using global.API (for this example, use global.API or replace with a method)
    let apiKey = 'APIKEY'; // Replace this with the actual API key logic
    let url = global.API(_url.origin, _url.pathname, Object.fromEntries(_url.searchParams.entries()), apiKey);

    // Log the API URL and API key used
    console.log("API URL:", url);
    console.log("API Key:", apiKey); // Log the API key (replace 'APIKEY' with the actual key if needed)

    try {
      // Fetch the response from the API
      let res = await fetch(url);

      // Check content-length to prevent large files from being processed
      if (res.headers.get('content-length') > 100 * 1024 * 1024 * 1024) {
        reject(`Content-Length: ${res.headers.get('content-length')}`);
        return;
      }

      // If the response is not text or json, return the file directly
      if (!/text|json/.test(res.headers.get('content-type'))) {
        resolve({ file: url, message: text });
        return;
      }

      // Get the response buffer and try to parse it
      let txt = await res.buffer();

      try {
        // Attempt to parse as JSON
        txt = format(JSON.parse(txt + ''));
      } catch (e) {
        // If parsing fails, treat it as text
        txt = txt + '';
      } finally {
        // Resolve with the text, truncated to 65536 characters
        resolve(txt.slice(0, 65536) + '');
      }
    } catch (error) {
      reject('Error fetching the URL: ' + error.message);
    }
  });
}

// Exporting the function so it can be used elsewhere
module.exports = Get;
