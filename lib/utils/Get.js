const fetch = require('node-fetch');
const cheerio = require('cheerio'); // Import Cheerio for HTML parsing

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

      // If response type is not HTML or JSON, resolve with the URL as a file
      if (!/text\/html/.test(res.headers.get('content-type'))) {
        return resolve({ file: url, message: text });
      }

      let txt = await res.text(); // Get the response body as text

      // Parse the HTML using cheerio
      const $ = cheerio.load(txt);

      // Extract the URL or the content you need from the HTML
      // For example, let's assume you need the first link in the body (adjust as necessary)
      const extractedUrl = $('body').text().trim(); // Extract plain text content from body

      if (extractedUrl) {
        resolve(extractedUrl); // Return the extracted plain text (URL)
      } else {
        reject('No URL found in the page content');
      }

    } catch (error) {
      reject('Error fetching the URL: ' + error.message);
    }
  });
}

module.exports = Get;
