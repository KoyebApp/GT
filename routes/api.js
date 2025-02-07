__path = process.cwd();

// Required modules
const express = require('express');
const favicon = require('serve-favicon');
const faker = require('faker'); // Import the Faker package
const Photo360 = require('ephoto-api-faris');
const validator = require('validator');
const { search } = require('aptoide-scraper');
const cityTimezones = require('city-timezones');
const moment = require('moment-timezone');
const cors = require('cors');
const QRCode = require('qrcode');
const fetch = require('node-fetch');
const axios = require('axios');
const cheerio = require('cheerio');
const request = require('request');
const { translate } = require('@vitalets/google-translate-api');
const { Anime } = require('@shineiichijo/marika');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const mime = require('mime-types');
const mega = require('megajs');
const path = require('path');
const Qasim = require('api-qasim');
const FormData = require('form-data');
const dotenv = require('dotenv').config();
const { color, bgcolor } = require(__path + '/lib/color.js');
const { fetchJson } = require(__path + '/lib/fetcher.js');
const options = require(__path + '/lib/options.js');
const { Searchnabi, Gempa } = require('./../lib');
const { ndown, instagram, tikdown, twitterdown, ytdown, pintarest, fbdown, fbdown2, threads, likee, capcut, GDLink } = require("nayan-videos-downloader");

var router  = express.Router();

const { downloadInstagram, downloadFacebook, downloadTikTok } = require('./../lib/utils/snapsave');

// In-memory storage for tracking requests for qasim key (can be replaced with a database or Redis)
const requestCounts = {};
const dailyLimit = 10000; // Set the daily limit for `qasim`

// Function to reset daily limit after 24 hours (you can use a cron job to reset every 24 hours)
const resetDailyLimit = (apikey) => {
  const now = new Date();
  if (!requestCounts[apikey]) {
    requestCounts[apikey] = { count: 0, lastReset: now };
  }
  const lastResetTime = requestCounts[apikey].lastReset;
  
  // Reset limit after 24 hours from the first request
  if ((now - lastResetTime) >= 24 * 60 * 60 * 1000) { // 24 hours in milliseconds
    requestCounts[apikey].count = 0;  // Reset request count after 24 hours
    requestCounts[apikey].lastReset = now;  // Set the new reset time to the current time
  }
};

// Middleware for rate-limiting
const rateLimitMiddleware = (req, res, next) => {
  const apikey = req.query.apikey;

  if (!apikey) return res.json(loghandler.notparam);

  // Allow unlimited access for APIKEY and MEGA-AI
  if (apikey === "qasim" || apikey === "MEGA-AI") {
    return next(); // Skip rate limiting for these keys
  }

  // Apply rate limiting for the 'qasim' API key
  if (apikey === "APIKEY") {
    // Initialize request count for 'qasim' if not already present
    if (!requestCounts[apikey]) {
      requestCounts[apikey] = { count: 0, lastReset: new Date() };
    }

    // Reset daily limit after 24 hours
    resetDailyLimit(apikey);

    // Check if the daily limit is exceeded for 'qasim'
    if (requestCounts[apikey].count >= dailyLimit) {
      return res.json({ status: false, message: "Free API KEY has exceeded the daily limit of 4000 requests.\n\ncontact Owner for help or custom api key" });
    }

    // Increment the request count for 'qasim'
    requestCounts[apikey].count++;

    // Continue to the next middleware/route handler
    return next();
  }

  // If the key is not `qasim`, allow the request to go through
  return next();
};

router.use(rateLimitMiddleware);


var { Base, WPUser } = require('./../lib/utils/tools');
var { Tiktok, FB, Joox } = require('./../lib/utils/downloader');
var tebakGambar = require('./../lib/utils/tebakGambar');
const uploadToImgur = require('./../lib/utils/Imgur');
const { GetTime } = require('./../lib/utils/Time');  // Import the GetTime function
const Get = require('./../lib/utils/Get');

const creator = 'Qasim Ali 🦋';

const createErrorMessage = (message) => ({
    status: false,
    creator: `${creator}`,
    code: 406,
    message: message
});

loghandler = {
    notparam: createErrorMessage('Please provide the apikey'),
    noturl: createErrorMessage('Please provide the url'),
    notquery: createErrorMessage('Please provide the query'),
    notkata: createErrorMessage('Please provide the kata'),
    nottext: createErrorMessage('Please provide the text'),
    nottext2: createErrorMessage('Please provide the text2'),
    notnabi: createErrorMessage('Please provide the nabi name'),
    nottext3: createErrorMessage('Please provide the text3'),
    nottheme: createErrorMessage('Please provide the theme'),
    notname: createErrorMessage('Please provide the name'),
    notusername: createErrorMessage('Please provide the username'),
    notvalue: createErrorMessage('Please provide the value'),
    invalidKey: createErrorMessage('Invalid apikey'),
    invalidlink: {
        status: false,
        creator: `${creator}`,
        message: 'Error, the link might be invalid.'
    },
    invalidkata: {
        status: false,
        creator: `${creator}`,
        message: 'Error, the word might not exist in the API.'
    },
    error: {
        status: false,
        creator: `${creator}`,
        message: 'An error occurred.'
    }
}


/*
Akhir Pesan Error
*/
router.use(favicon(__path + "/views/favicon.ico"));

const listkey = ["Suhail", "GURU", "APIKEY"];

router.post("/apikey", async (req, res, next) => {
  const key = req.query.key;
  if (!key) {
    return res.json(loghandler.notparam);
  }
  
  if(listkey.includes(key)) {
    res.json({
      message: 'API key already registered'
    });
  } else {
    listkey.push(key);
    res.json({
      message: `Successfully registered ${key} in the API key database`
    });
  }
});

// delete apikey

router.delete("/apikey", async (req, res, next) => {
  const key = req.query.delete;
  
  if (!key) {
    return res.json(loghandler.notparam);
  }

  const index = listkey.indexOf(key);

  if (index === -1) {
    return res.json({
      message: 'API key does not exist'
    });
  }

  listkey.splice(index, 1);
  res.json({
    message: 'API key successfully deleted'
  });
});

const Spotify = require('./../lib/utils/Spotify');

const fetchWithRetry = async (url, retries = 3, delay = 1000) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response;
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying request... Attempts remaining: ${retries}`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(url, retries - 1, delay);  // Retry the request
    }
    throw error;  // If no retries left, throw the error
  }
};

router.get('/img/lexica', async (req, res) => {
  const prompt = req.query.prompt;
  const apikey = req.query.apikey;

  if (!apikey) {
    return res.json({ status: false, message: "API key is missing." });
  }

  if (!prompt) {
    return res.json({ status: false, message: "Please provide a prompt." });
  }

  if (!listkey.includes(apikey)) {
    return res.json({ status: false, message: 'Invalid API key' });
  }

  try {
    // Use the retry function for making the request
    const response = await fetchWithRetry('https://lexica.art/api/v1/search?q=' + encodeURIComponent(prompt));
    const data = await response.json();

    if (!data.images || data.images.length === 0) {
      return res.json({
        status: false,
        message: "No images found for the given prompt."
      });
    }

    const result = {
      status: true,
      creator: "Qasim Ali 🦋",
      result: data,
      additionalInfo: "Generated by Lexica",
      link: "https://whatsapp.com/channel/0029VagJIAr3bbVBCpEkAM07"
    };

    res.json(result);

  } catch (e) {
    console.error('Error fetching from Lexica:', e);

    res.json({
      status: false,
      message: "An error occurred while fetching the data.",
      error: e.message
    });
  }
});

// Route to fetch a random pickup line from Popcat API
router.get('/web/pickuplines', async (req, res) => {
  try {
    // Fetch the pickup line from the Popcat API
    const response = await axios.get('https://api.popcat.xyz/pickuplines');

    // Check if the response contains the expected data
    if (response.data && response.data.pickupline) {
      // Send the pickup line and contributor as the response
      return res.json({
        status: true,
        pickupline: response.data.pickupline, // The pickup line
        contributor: response.data.contributor, // The contributor's link
      });
    } else {
      throw new Error('Invalid response format from Popcat API');
    }

  } catch (error) {
    console.error('Error fetching pickup line:', error.message);
    return res.json({
      status: false,
      message: 'Error fetching pickup line',
      error: error.message,
    });
  }
});


// Route to fetch "Would You Rather" question from Popcat API
router.get('/web/wyr', async (req, res) => {
  try {
    // Fetch the WYR question from the Popcat API
    const response = await axios.get('https://api.popcat.xyz/wyr');

    // Check if the response contains the expected data
    if (response.data && response.data.ops1 && response.data.ops2) {
      // Send the WYR question options as the response
      return res.json({
        status: true,
        question: {
          option1: response.data.ops1, // First option
          option2: response.data.ops2, // Second option
        },
      });
    } else {
      throw new Error('Invalid response format from Popcat API');
    }

  } catch (error) {
    console.error('Error fetching WYR question:', error.message);
    return res.json({
      status: false,
      message: 'Error fetching "Would You Rather" question',
      error: error.message,
    });
  }
});

// Route to fetch a word's definition from the dictionary API
router.get('/web/dictionary', async (req, res) => {
  const word = req.query.word;

  // Validate input parameter
  if (!word) {
    return res.json({
      status: false,
      message: 'Please provide a word to define.',
    });
  }

  try {
    // Fetch the word definition from the dictionary API
    const response = await axios.get(`https://some-random-api.com/others/dictionary?word=${word}`);

    // Check if the response contains the expected data
    if (response.data && response.data.word && response.data.definition) {
      // Return the word and its definition
      return res.json({
        status: true,
        word: response.data.word,
        definition: response.data.definition,
      });
    } else {
      throw new Error('Invalid response format from dictionary API');
    }

  } catch (error) {
    console.error('Error fetching word definition:', error.message);
    return res.json({
      status: false,
      message: 'Error fetching word definition',
      error: error.message,
    });
  }
});




// Route to fetch a screenshot with custom overlay color and hex
router.get('/web/info', async (req, res) => {
  const url = req.query.url;
  const hex = req.query.hex || '#30CFD0'; // Default hex color if not provided
  const color = req.query.color || 'white'; // Default background color if not provided
  const apikey = req.query.apikey;

  if (!apikey) {
    return res.json({ status: false, message: "API key is missing." });
  }
  
  // Validate URL parameter
  if (!url) {
    return res.json({
      status: false,
      message: 'URL is required',
    });
  }

  try {
    // Fetch the screenshot image from Microlink API
    const response = await axios.get(
      `https://api.microlink.io/?url=${url}&overlay.browser=${hex}&overlay.background=${color}&screenshot=true&embed=screenshot.url`, { responseType: 'arraybuffer' });
    // Set the appropriate content-type for the image (likely PNG)
      const contentType = response.headers['content-type'];
      res.set('Content-Type', contentType);

      // Send the image buffer in the response
      return res.send(response.data);
  } catch (error) {
    console.error('Error fetching screenshot:', error.message);
    return res.json({
      status: false,
      message: 'Error fetching screenshot image',
      error: error.message,
    });
  }
});


router.get('/web/meta', async (req, res) => {
  const url = req.query.url; // Get the URL from the query parameter
  const apikey = req.query.apikey;

  if (!apikey) {
    return res.json({ status: false, message: "API key is missing." });
  }
  
  if (!url) {
    return res.status(400).json({ status: false, message: 'URL is required' });
  }

  try {
    // Step 1: Fetch metadata from the Microlink API
    const apiUrl = `https://api.microlink.io/?url=${encodeURIComponent(url)}`;
    const apiResponse = await axios.get(apiUrl);

    // Step 2: Extract the metadata from the API response
    const metadata = apiResponse.data.data;

    // Step 3: Return the metadata
    return res.json({
      status: true,
      message: 'Metadata fetched successfully',
      data: metadata,
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      message: 'Error fetching metadata',
      error: error.message,
    });
  }
});

router.get('/web/logo', async (req, res, next) => {
  const apikey = req.query.apikey;
  const url = req.query.url;

  // Validate input parameters
  if (!url) return res.json(loghandler.noturl);
  if (!apikey) return res.json(loghandler.notparam);

  // Check if the API key is valid
  if (listkey.includes(apikey)) {
    try {
      // Fetch the image directly from Microlink API
      const response = await axios.get(`https://api.microlink.io/?url=${url}&palette=true&embed=logo.url`, { responseType: 'arraybuffer' });

      // Set the appropriate content-type for the image (likely PNG)
      const contentType = response.headers['content-type'];
      res.set('Content-Type', contentType);

      // Send the image buffer in the response
      return res.send(response.data);

    } catch (err) {
      console.error("Error fetching logo image:", err);
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});


router.get('/self/ip', async (req, res) => {
  const apikey = req.query.apikey;

  if (!apikey) {
    return res.json({ status: false, message: "API key is missing." });
  }
  
  try {
    // Step 1: Construct the URL with the IP address
    const url = `https://ipfind.io/ip-address-lookup`;

    // Step 2: Fetch the HTML content of the page
    const response = await axios.get(url);

    // Step 3: Load the HTML response into Cheerio
    const $ = cheerio.load(response.data);

    // Step 4: Extract the data from the HTML
    const data = {};
    $('tbody tr').each((index, row) => {
      const th = $(row).find('th').text().trim();
      const td = $(row).find('td').text().trim();
      data[th] = td;
    });

    // Step 5: Return the extracted data
    return res.json({
      status: true,
      message: 'Data fetched successfully',
      data: data,
    });

  } catch (error) {
    return res.json({
      status: false,
      message: 'Error fetching data from ipfind.io',
      error: error.message,
    });
  }
});


router.get('/info/ip', async (req, res) => {
  const ipAddress = req.query.ip; // Get the IP address from the query parameter

  const apikey = req.query.apikey;

  if (!apikey) {
    return res.json({ status: false, message: "API key is missing." });
  }
  
  if (!ipAddress) {
    return res.json({ status: false, message: 'IP address is required' });
  }

  try {
    // Step 1: Construct the URL with the IP address
    const url = `https://ipfind.io/ip-address-lookup/${ipAddress}`;

    // Step 2: Fetch the HTML content of the page
    const response = await axios.get(url);

    // Step 3: Load the HTML response into Cheerio
    const $ = cheerio.load(response.data);

    // Step 4: Extract the data from the HTML
    const data = {};
    $('tbody tr').each((index, row) => {
      const th = $(row).find('th').text().trim();
      const td = $(row).find('td').text().trim();
      data[th] = td;
    });

    // Step 5: Return the extracted data
    return res.json({
      status: true,
      message: 'Data fetched successfully',
      data: data,
    });

  } catch (error) {
    return res.json({
      status: false,
      message: 'Error fetching data from ipfind.io',
      error: error.message,
    });
  }
});



router.get('/web/ulvis', async (req, res) => {
  const url = req.query.url;  // Get the URL from query parameter

  const apikey = req.query.apikey;

  if (!apikey) {
    return res.json({ status: false, message: "API key is missing." });
  }
  
  if (!url) {
    return res.json({ status: false, message: 'URL is required' });
  }

  try {
    // Construct the API URL
    const apiUrl = `https://ulvis.net/api.php?url=${url}`;

    // Fetch the response from the Ulvis API
    const apiResponse = await fetch(apiUrl);

    if (!apiResponse.ok) {
      throw new Error('Failed to fetch data from Ulvis');
    }

    // Check if the response is HTML (instead of JSON)
    const contentType = apiResponse.headers.get('Content-Type');
    if (!contentType || !contentType.includes('application/json')) {
      const errorDetails = await apiResponse.text(); // Get the raw response text
      // Load the HTML response into Cheerio
      const $ = cheerio.load(errorDetails);
      const extractedUrl = $('body').text(); // Extract the URL from the <body> tag

      // Return the extracted URL in the response
      return res.json({
        status: true,
        message: 'URL extracted from HTML body',
        url: extractedUrl, // The extracted URL from the body
      });
    }

    // If the response is JSON (normal case)
    const jsonData = await apiResponse.json();

    return res.json({
      status: true,
      message: 'Data fetched successfully',
      data: jsonData, // The actual JSON response from Ulvis
    });

  } catch (error) {
    return res.json({
      status: false,
      message: 'Error fetching data from Ulvis',
      error: error.message,
    });
  }
});




router.get('/download/mega', async (req, res, next) => {
  const Apikey = req.query.apikey;
  const url = req.query.url;
  const fileSizeLimit = 200 * 1024 * 1024; // 200 MB in bytes, you can modify this inside the route

  // Validate API key
  if (!Apikey) return res.json(loghandler.notparam);
  if (!listkey.includes(Apikey)) return res.json(loghandler.invalidKey);

  // Check if URL is provided
  if (!url) return res.json({ status: false, creator: `${creator}`, message: "Please provide the MEGA URL" });

  try {
    // Decode the URL to ensure special characters are properly handled
    const decodedUrl = decodeURIComponent(url);

    // Parse the file from the provided MEGA URL
    const file = mega.File.fromURL(decodedUrl);
    await file.loadAttributes();
    
    // Log file information
    console.log(`File Name: ${file.name}, File Size: ${file.size} bytes`);

    // Check if the file size exceeds the defined limit for this route
    if (file.size > fileSizeLimit) {
      return res.json({
        status: false,
        creator: `${creator}`,
        message: `File size exceeds the ${fileSizeLimit / (1024 * 1024)} MB limit. Please try with a smaller file.`
      });
    }

    // Download the file as a buffer
    const fileBuffer = await file.downloadBuffer();

    // Set the response header for file download (e.g., as a downloadable file)
    res.setHeader('Content-Disposition', `attachment; filename="${file.name}"`);
    res.setHeader('Content-Type', 'application/octet-stream');

    // Send the file buffer as the response
    res.end(fileBuffer);

  } catch (error) {
    // Handle any errors gracefully
    console.error("Error with MEGA URL:", error.message);
    res.json({
      status: false,
      creator: `${creator}`,
      message: `Error: ${error.message}`
    });
  }
});




// Initialize Spotify class
const spotify = new Spotify();

// Define the search route
router.get('/download/spotify', async (req, res, next) => {
  const Apikey = req.query.apikey;
  const query = req.query.query;  // This is the search query, e.g., a song or artist name
  const type = req.query.type || 'track';  // Type of search, default to 'track'
  const limit = req.query.limit || 20;  // Number of results to fetch, default to 20

  // Check if the API key is valid
  if (!Apikey) return res.json(loghandler.notparam);
  if (!listkey.includes(Apikey)) return res.json(loghandler.invalidKey);

  // Check if the query is provided
  if (!query) return res.json({ status: false, creator: 'Qasim Ali', message: 'Please provide a search query' });

  try {
    // Perform the search via Spotify's API
    const data = await spotify.func4(query, type, limit);

    // If no data or search results are found
    if (!data || !data.status || !data.data || data.data.length < 1) {
      return res.json({
        status: false,
        creator: 'Qasim Ali 🦋',
        message: 'No results found for the search query',
      });
    }

    // Return the search results in JSON format
    res.json({
      status: true,
      code: 200,
      creator: 'Qasim Ali🦋',
      data: data.data,
    });

  } catch (err) {
    console.error('Error during Spotify search:', err); // Log any errors
    res.json(loghandler.error);
  }
});

const BASE_ALPHABETS = {
  base2: '01',
  base8: '01234567',
  base11: '0123456789a',
  base16: '0123456789abcdef',
  base32: '0123456789ABCDEFGHJKMNPQRSTVWXYZ',
  zbase32: 'ybndrfg8ejkmcpqxot1uwisza345h769',
  base36: '0123456789abcdefghijklmnopqrstuvwxyz',
  base58: '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz',
  base62: '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
  base64: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
  base67: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.!',
};

// Dynamic route for encoding and decoding using any Base
router.get('/base/:base', async (req, res) => {
  const apikey = req.query.apikey; // API key
  const action = req.query.action; // Action (encode or decode)
  const data = req.query.data; // Data to be encoded or decoded
  const base = req.params.base; // Base from URL parameter

  // Validate input parameters
  if (!apikey) return res.json({ status: false, code: 400, message: 'API key is required.' });
  if (!data) return res.json({ status: false, code: 400, message: 'Data is required.' });
  if (!action) return res.json({ status: false, code: 400, message: 'Action (encode/decode) is required.' });

  // Check if the API key is valid
  if (!listkey.includes(apikey)) {
    return res.json({ status: false, code: 401, message: 'Invalid API key.' });
  }

  // Check if the requested base is valid
  if (!BASE_ALPHABETS[base]) {
    return res.json({ status: false, code: 400, message: `Invalid base. Supported bases: ${Object.keys(BASE_ALPHABETS).join(', ')}` });
  }

  try {
    // Dynamically import base-x module
    const { default: basex } = await import('base-x');

    // Create the base encoder/decoder using the correct alphabet
    const baseEncoder = basex(BASE_ALPHABETS[base]);

    let result;

    // Perform the encoding or decoding based on the action
    if (action === 'encode') {
      // Base encoding
      const buffer = Buffer.from(data, 'utf-8');
      result = baseEncoder.encode(buffer).toString();
    } else if (action === 'decode') {
      // Base decoding
      const decoded = baseEncoder.decode(data);
      result = decoded.toString('utf-8');
    } else {
      return res.json({ status: false, code: 400, message: 'Invalid action. Use "encode" or "decode".' });
    }

    // Return the result
    res.json({
      status: true,
      code: 200,
      creator: 'Qasim Ali 🦋',
      result: {
        base: base,
        action: action,
        originalData: data,
        processedData: result,
      },
    });
  } catch (err) {
    console.error(`Error with Base${base} operation:`, err);
    res.json({
      status: false,
      code: 500,
      message: `Error with Base${base} encoding/decoding.`,
    });
  }
});

// Route to generate an image based on dynamic text in the URL
router.get('/make/ogimage', async (req, res, next) => {
  const apikey = req.query.apikey;
  const text = req.query.text;  // The text to be included in the image URL
  
  // Validate input parameters
  if (!text) return res.json({ status: false, message: "Text parameter is required." });
  if (!apikey) return res.json({ status: false, message: "API key is required." });

  // Validate API key
  if (!listkey.includes(apikey)) {
    return res.json({ status: false, message: "Invalid API key." });
  }

  try {
    // Construct the URL for the dynamic image
    const imageUrl = `https://cdn.statically.io/og/${encodeURIComponent(text)}.jpg`;

    // Fetch the image from the constructed URL
    const imageResponse = await fetch(imageUrl);
    
    // If the URL is invalid or the image cannot be fetched, return an error message
    if (!imageResponse.ok) {
      return res.json({ status: false, message: "Failed to fetch the image." });
    }

    // Get the content type of the image (e.g., image/jpeg, image/png)
    const contentType = imageResponse.headers.get("content-type");

    // Get the image buffer (raw image data)
    const buffer = await imageResponse.buffer();

    // Set the appropriate response content type
    res.setHeader('Content-Type', contentType);
    
    // Send the image buffer in the response
    res.send(buffer);
    
  } catch (err) {
    console.error("Error downloading the image:", err);
    res.json({ status: false, message: "An error occurred while downloading the image." });
  }
});


// Route to get the current time based on city or country name
router.get('/time/check', async (req, res, next) => {
  const apikey = req.query.apikey;
  const location = req.query.location;  // Location (city or country) to get the time for

  // Validate input parameters
  if (!location) return res.json(loghandler.nottext);  // Ensure 'location' parameter is provided
  if (!apikey) return res.json(loghandler.notparam);  // Ensure API key is provided

  // Check if the API key is valid
  if (listkey.includes(apikey)) {
    try {
      let lookup = [];

      // Step 1: Try to find the city by city name (lookupViaCity)
      lookup = cityTimezones.lookupViaCity(location);
      
      // Step 2: If no match, try cityMapping (search for city in the mapping)
      if (!lookup || lookup.length === 0) {
        lookup = cityTimezones.cityMapping.filter(city => city.city.toLowerCase().includes(location.toLowerCase()));
      }

      // Step 3: If still no match, try searching by city, state, or province (findFromCityStateProvince)
      if (lookup.length === 0) {
        lookup = cityTimezones.findFromCityStateProvince(location);
      }

      // Step 4: If no match, try searching by ISO code (iso2/iso3)
      if (lookup.length === 0) {
        lookup = cityTimezones.findFromIsoCode(location);
      }

      // Step 5: If no match, return 404 response
      if (lookup.length === 0) {
        return res.status(404).json({
          status: false,
          code: 404,
          message: `No timezone found for ${location}`,
          creator: `${creator}`
        });
      }

      // Step 6: Process multiple city results if available (return all of them under "result")
      const timeData = lookup.map(cityData => {
        const time = GetTime(cityData.city);  // Get time using the city's name
        return { 
          ...cityData, // Return the full city data
          time: time   // Attach time for each city
        };
      });

      // Return the full data under "result", including all available data (not predefined)
      res.json({
        status: true,
        code: 200,
        creator: `${creator}`,
        result: timeData  // Return the entire data for each city, including time
      });

    } catch (err) {
      console.error("Error fetching time:", err);
      res.json({
        status: false,
        code: 500,
        message: "Error fetching data",
        creator: `${creator}`
      });
    }
  } else {
    res.json({
      status: false,
      code: 401,
      message: "Invalid API key",
      creator: `${creator}`
    });
  }
});

router.get('/ipone/screenshot', async (req, res) => {
  const url = req.query.url;  // Get the URL from query parameter
  const apikey = req.query.apikey;  // Retrieve the API key

  if (!url) {
    return res.json({ status: false, message: 'Url is Required, Provide a URL' });
  }

  if (!apikey) {
    return res.json({ status: false, message: 'API key is missing' });
  }

  if (!listkey.includes(apikey)) {
    return res.json({ status: false, message: 'Invalid API key' });
  }

  try {
    // Log URL for debugging
    console.log('Received URL:', url);

    // Create a screenshot URL using the device type (iphone14promax as an example)
    const screenshotUrl = `https://image.thum.io/get/iphone14promax/${url}`;

    // Fetch screenshot directly from thum.io
    let screenshotResponse = await fetch(screenshotUrl);

    if (!screenshotResponse.ok) {
      const errorDetails = await screenshotResponse.text();
      throw new Error(`Failed to fetch the screenshot. Status: ${screenshotResponse.status}, Error: ${errorDetails}`);
    }

    // Get the content type and image buffer
    const contentType = screenshotResponse.headers.get('Content-Type');
    let screenshotBuffer = await screenshotResponse.buffer();

    // Set appropriate response headers
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Content-Type', contentType);  // Use dynamic content type

    return res.send(screenshotBuffer);

  } catch (error) {
    return res.json({ status: false, message: 'Error fetching screenshot', error: error.message });
  }
});


router.get('/web/screenshot', async (req, res) => {
  const url = req.query.url;  // Get the URL from query parameter
  const apikey = req.query.apikey;  // Retrieve the API key

  if (!url) {
    return res.json({ status: false, message: 'Url is Required, Give URL' });
  }

  if (!apikey) {
    return res.json({ status: false, message: 'API key is missing' });
  }

  if (!listkey.includes(apikey)) {
    return res.json({ status: false, message: 'Invalid API key' });
  }

  try {
    // Log URL for debugging
    console.log('Received URL:', url);

    // Fetch screenshot directly (no encoding needed)
    let screenshotResponse = await fetch(`https://image.thum.io/get/fullpage/${url}`);

    if (!screenshotResponse.ok) {
      const errorDetails = await screenshotResponse.text();
      throw new Error(`Failed to fetch the screenshot. Status: ${screenshotResponse.status}, Error: ${errorDetails}`);
    }

    // Get the content type and image buffer
    const contentType = screenshotResponse.headers.get('Content-Type');
    let screenshotBuffer = await screenshotResponse.buffer();

    // Set appropriate response headers
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Content-Type', contentType);  // Use dynamic content type

    return res.send(screenshotBuffer);

  } catch (error) {
    return res.json({ status: false, message: 'Error fetching screenshot', error: error.message });
  }
});

// Route to fetch a random quote or line from the Why.txt file
router.get('/quotes/why', async (req, res) => {
    const Apikey = req.query.apikey;

    if (!Apikey) return res.json(loghandler.notparam);
    if (!listkey.includes(Apikey)) return res.json(loghandler.invalidKey);

    try {
        // Fetch data from the raw URL of the Why.txt file
        const response = await axios.get('https://raw.githubusercontent.com/GlobalTechInfo/Islamic-Database/main/TXT-DATA/Why.txt');
        const data = response.data;

        // Split data into lines and filter out empty lines
        const whyQuotes = data.split('\n').filter(line => line.trim() !== '');

        // Select a random quote/line from the "Why.txt" file
        const randomWhyQuote = whyQuotes[Math.floor(Math.random() * whyQuotes.length)];

        // Send the response with the creator, status, and random quote
        res.json({
            creator: `${creator}`,
            status: true,
            result: randomWhyQuote
        });

    } catch (error) {
        // Log the error for debugging purposes
        console.error("Error fetching Why.txt:", error);

        // Send the error response
        res.json({
            creator: `${creator}`,
            status: false,
            message: `Error fetching the data: ${error.message}`
        });
    }
});


// Route to validate data
router.get('/validate/data', (req, res) => {
  const apikey = req.query.apikey; // API key
  const type = req.query.type; // Type of validation (email, phone, etc.)
  const data = req.query.data; // Data to be validated

  // Validate input parameters
  if (!apikey) return res.json({ status: false, code: 400, message: 'API key is required.' });
  if (!data) return res.json({ status: false, code: 400, message: 'Data is required for validation.' });

  // Check if the API key is valid
  if (!listkey.includes(apikey)) {
    return res.json({ status: false, code: 401, message: 'Invalid API key.' });
  }

  let validationResult;

  try {
    switch (type.toLowerCase()) {
      case 'email':
        validationResult = validator.isEmail(data);
        break;
      case 'url':
        validationResult = validator.isURL(data);
        break;
      case 'phone':
        validationResult = validator.isMobilePhone(data);
        break;
      case 'alpha':
        validationResult = validator.isAlpha(data); // checks if only letters are present
        break;
      case 'alphanumeric':
        validationResult = validator.isAlphanumeric(data); // checks if only letters and numbers are present
        break;
      case 'numeric':
        validationResult = validator.isNumeric(data); // checks if the string is numeric
        break;
      case 'uuid':
        validationResult = validator.isUUID(data); // checks if the string is a valid UUID
        break;
      default:
        return res.json({ status: false, code: 400, message: 'Invalid validation type requested.' });
    }

    // Return the validation result
    res.json({
      status: true,
      code: 200,
      creator: 'Qasim Ali 🦋',
      result: {
        type: type,
        data: data,
        isValid: validationResult,
      },
    });
  } catch (err) {
    console.error('Error validating data:', err);
    res.json({
      status: false,
      code: 500,
      message: 'Error validating data.',
    });
  }
});




// Route for generating QR code
router.get('/custom/qrcode', async (req, res, next) => {
  const apikey = req.query.apikey;
  const data = req.query.data;  // Data to encode in QR code
  const size = req.query.size;  // Default size if not provided
  const color = req.query.color;  // Default color (green) if not provided

  // Validate input parameters
  if (!data) return res.json({ status: false, message: "Data parameter is required." });
  if (!apikey) return res.json({ status: false, message: "API key is required." });

  // Validate API key
  if (!listkey.includes(apikey)) {
    return res.json({ status: false, message: "Invalid API key." });
  }

  try {
    let qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(data)}&size=${size}&color=${color}`;

    // Handle cases for different input scenarios
    if (size && color) {
      qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(data)}&size=${size}&color=${color}`;
    } else if (size) {
      qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(data)}&size=${size}`;
    } else if (color) {
      qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(data)}&color=${color}`;
    }

    // Fetch the image from the QR code API
    const imageResponse = await fetch(qrCodeUrl);
    const buffer = await imageResponse.buffer();

    // Return the image in the response
    res.setHeader('Content-Type', 'image/png');
    res.send(buffer);
    
  } catch (err) {
    console.error("Error generating QR code:", err);
    res.json({ status: false, message: "An error occurred while generating QR code." });
  }
});



// Route to generate random data
router.get('/random/data', (req, res) => {
  const apikey = req.query.apikey; // API key
  const dataType = req.query.type || 'user'; // Type of data to generate (default: 'user')

  // Validate input parameters
  if (!apikey) return res.json({ status: false, code: 400, message: 'API key is required.' });

  // Check if the API key is valid
  if (!listkey.includes(apikey)) {
    return res.json({ status: false, code: 401, message: 'Invalid API key.' });
  }

  // Generate different types of random data
  let randomData;
  try {
    switch (dataType.toLowerCase()) {
      case 'user':
        randomData = {
          name: faker.name.findName(),
          email: faker.internet.email(),
          address: faker.address.streetAddress(),
          phone: faker.phone.phoneNumber(),
          company: faker.company.companyName(),
        };
        break;
      case 'image':
        randomData = {
          image: faker.image.image(),
          avatar: faker.image.avatar(),
          imageUrl: faker.image.imageUrl(),
          abstract: faker.image.abstract(),
          animals: faker.image.animals(),
          business: faker.image.business(),
          cats: faker.image.cats(),
          city: faker.image.city(),
          food: faker.image.food(),
          nightlife: faker.image.nightlife(),
          fashion: faker.image.fashion(),
          people: faker.image.people(),
          nature: faker.image.nature(),
          sports: faker.image.sports(),
          technics: faker.image.technics(),
          transport: faker.image.transport(),
          dataUri: faker.image.dataUri(),
        };
        break;
      case 'internet':
        randomData = {
          avatar: faker.internet.avatar(),
          email: faker.internet.email(),
          exampleEmail: faker.internet.exampleEmail(),
          userName: faker.internet.userName(),
          protocol: faker.internet.protocol(),
          httpMethod: faker.internet.httpMethod(),
          url: faker.internet.url(),
          domainName: faker.internet.domainName(),
          domainSuffix: faker.internet.domainSuffix(),
          domainWord: faker.internet.domainWord(),
          ip: faker.internet.ip(),
          ipv6: faker.internet.ipv6(),
          port: faker.internet.port(),
          userAgent: faker.internet.userAgent(),
          color: faker.internet.color(),
          mac: faker.internet.mac(),
          password: faker.internet.password(),
        };
        break;
      case 'system':
        randomData = {
          fileName: faker.system.fileName(),
          commonFileName: faker.system.commonFileName(),
          mimeType: faker.system.mimeType(),
          commonFileType: faker.system.commonFileType(),
          commonFileExt: faker.system.commonFileExt(),
          fileType: faker.system.fileType(),
          fileExt: faker.system.fileExt(),
          directoryPath: faker.system.directoryPath(),
          filePath: faker.system.filePath(),
          semver: faker.system.semver(),
        };
        break;
        case 'finance':
        randomData = {
          account: faker.finance.account(),
          accountName: faker.finance.accountName(),
          routingNumber: faker.finance.routingNumber(),
          mask: faker.finance.mask(),
          amount: faker.finance.amount(),
          transactionType: faker.finance.transactionType(),
          currencyCode: faker.finance.currencyCode(),
          currencyName: faker.finance.currencyName(),
          currencySymbol: faker.finance.currencySymbol(),
          bitcoinAddress: faker.finance.bitcoinAddress(),
          litecoinAddress: faker.finance.litecoinAddress(),
          creditCardNumber: faker.finance.creditCardNumber(),
          creditCardCVV: faker.finance.creditCardCVV(),
          ethereumAddress: faker.finance.ethereumAddress(),
          iban: faker.finance.iban(),
          bic: faker.finance.bic(),
          transactionDescription: faker.finance.transactionDescription(),
        };
        break;
        case 'name':
        randomData = {
          name: faker.name.findName(),
          firstName: faker.name.firstName(),
          lastName: faker.name.lastName(),
          middleName: faker.name.middleName(),
          jobTitle: faker.name.jobTitle(),
          gender: faker.name.gender(),
          prefix: faker.name.prefix(),
          suffix: faker.name.suffix(),
          title: faker.name.title(),
          jobDescriptor: faker.name.jobDescriptor(),
          jobArea: faker.name.jobArea(),
          jobType: faker.name.jobType(),
        };
        break;
        case 'vehicle':
        randomData = {
          vehicle: faker.vehicle.vehicle(),
          vehicleManufacturer: faker.vehicle.manufacturer(),
          vehicleModel: faker.vehicle.model(),
          vehicleType: faker.vehicle.type(),
          vehicleFuel: faker.vehicle.fuel(),
          vehicleVin: faker.vehicle.vin(),
          vehicleColor: faker.vehicle.color(),
          vehicleVrm: faker.vehicle.vrm(),
          vehicleBicycle: faker.vehicle.bicycle(),
        };
        break;
        case 'git':
        randomData = {
          gitBranch: faker.git.branch(),
          gitCommitEntry: faker.git.commitEntry(),
          gitCommitMessage: faker.git.commitMessage(),
          gitCommitSha: faker.git.commitSha(),
          gitShortSha: faker.git.shortSha(),
        };
        break;
        case 'datatype':
  randomData = {
    number: faker.datatype.number(),
    float: faker.datatype.float(),
    datetime: faker.datatype.datetime(),
    string: faker.datatype.string(),
    uuid: faker.datatype.uuid(),
    boolean: faker.datatype.boolean(),
    hexaDecimal: faker.datatype.hexaDecimal(),
    json: faker.datatype.json(),
    array: faker.datatype.array(),
  };
  break;
        case 'company':
  randomData = {
    suffixes: faker.company.suffixes(),
    companyName: faker.company.companyName(),
    companySuffix: faker.company.companySuffix(),
    catchPhrase: faker.company.catchPhrase(),
    bs: faker.company.bs(),
    catchPhraseAdjective: faker.company.catchPhraseAdjective(),
    catchPhraseDescriptor: faker.company.catchPhraseDescriptor(),
    catchPhraseNoun: faker.company.catchPhraseNoun(),
    bsAdjective: faker.company.bsAdjective(),
    bsBuzz: faker.company.bsBuzz(),
    bsNoun: faker.company.bsNoun(),
  };
  break;
case 'commerce':
  randomData = {
    color: faker.commerce.color(),
    department: faker.commerce.department(),
    productName: faker.commerce.productName(),
    price: faker.commerce.price(),
    productAdjective: faker.commerce.productAdjective(),
    productMaterial: faker.commerce.productMaterial(),
    product: faker.commerce.product(),
    productDescription: faker.commerce.productDescription(),
  };
  break;
        case 'helpers':
  randomData = {
    randomize: faker.helpers.randomize(),
    slugify: faker.helpers.slugify(),
    replaceSymbolWithNumber: faker.helpers.replaceSymbolWithNumber(),
    replaceSymbols: faker.helpers.replaceSymbols(),
    replaceCreditCardSymbols: faker.helpers.replaceCreditCardSymbols(),
    repeatString: faker.helpers.repeatString(),
    regexpStyleStringParse: faker.helpers.regexpStyleStringParse(),
    shuffle: faker.helpers.shuffle(),
    mustache: faker.helpers.mustache(),
    createCard: faker.helpers.createCard(),
    contextualCard: faker.helpers.contextualCard(),
    userCard: faker.helpers.userCard(),
    createTransaction: faker.helpers.createTransaction(),
  };
  break;

case 'lorem':
  randomData = {
    word: faker.lorem.word(),
    words: faker.lorem.words(),
    sentence: faker.lorem.sentence(),
    slug: faker.lorem.slug(),
    sentences: faker.lorem.sentences(),
    paragraph: faker.lorem.paragraph(),
    paragraphs: faker.lorem.paragraphs(),
    text: faker.lorem.text(),
    lines: faker.lorem.lines(),
  };
  break;
case 'date':
  randomData = {
    past: faker.date.past(),
    future: faker.date.future(),
    between: faker.date.between(),
    betweens: faker.date.betweens(),
    recent: faker.date.recent(),
    soon: faker.date.soon(),
    month: faker.date.month(),
    weekday: faker.date.weekday(),
  };
  break;
        case 'address':
        randomData = {
          address: faker.address.streetAddress(),
          zipCode: faker.address.zipCode(),
          zipCodeByState: faker.address.zipCodeByState(),
          city: faker.address.city(),
          cityPrefix: faker.address.cityPrefix(),
          citySuffix: faker.address.citySuffix(),
          cityName: faker.address.cityName(),
          streetName: faker.address.streetName(),
          streetSuffix: faker.address.streetSuffix(),
          streetPrefix: faker.address.streetPrefix(),
          secondaryAddress: faker.address.secondaryAddress(),
          county: faker.address.county(),
          country: faker.address.country(),
          countryCode: faker.address.countryCode(),
          state: faker.address.state(),
          stateAbbr: faker.address.stateAbbr(),
          latitude: faker.address.latitude(),
          longitude: faker.address.longitude(),
          direction: faker.address.direction(),
          cardinalDirection: faker.address.cardinalDirection(),
          ordinalDirection: faker.address.ordinalDirection(),
          nearbyGPSCoordinate: faker.address.nearbyGPSCoordinate(),
          timeZone: faker.address.timeZone(),
        };
        break;
      default:
        return res.json({ status: false, code: 400, message: 'Invalid data type requested.' });
    }

    // Send back the generated data as a response
    res.json({
      status: true,
      code: 200,
      creator: 'Qasim Ali🦋',
      result: randomData,
    });
  } catch (err) {
    console.error('Error generating random data:', err);
    res.json({
      status: false,
      code: 500,
      message: 'Error generating random data.',
    });
  }
});



// Route to search for an app using aptoide-scraper
router.get('/aptoide/search', async (req, res, next) => {
  const apikey = req.query.apikey;
  const query = req.query.query;

  // Validate input parameters
  if (!query) return res.json(loghandler.notquery);
  if (!apikey) return res.json(loghandler.notparam);

  // Check if the API key is valid
  if (listkey.includes(apikey)) {
    try {
      // Perform the search with the provided query
      const searchResults = await search(query);

      // Return the results as a JSON response
      res.json({
        status: true,
        code: 200,
        creator: `${creator}`,
        result: searchResults, // Send the actual search results
      });
    } catch (err) {
      console.error("Error searching app:", err);
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});

// Route for downloading from Instagram
router.get('/dl/instagram', async (req, res, next) => {
  const apikey = req.query.apikey;
  const url = req.query.url; // Expecting a URL as query parameter

  // Validate input parameters
  if (!url) return res.json({ status: false, message: "URL parameter is required." });
  if (!apikey) return res.json({ status: false, message: "API key is required." });

  // Validate API key
  if (!listkey.includes(apikey)) {
    return res.json({ status: false, message: "Invalid API key." });
  }

  try {
    const download = await downloadInstagram(url); // Call the download function
    if (download.success) {
      res.json({
        status: true,
        code: 200,
        creator: `${creator}`,
        result: {
          mediaUrl: download.mediaUrl,
          preview: download.preview,
          description: download.description,
          type: download.type,
        },
      });
    } else {
      res.json({ status: false, message: "Failed to download from Instagram." });
    }
  } catch (err) {
    console.error("Error downloading from Instagram:", err);
    res.json({ status: false, message: "An error occurred while downloading." });
  }
});

// Route for downloading from Facebook
router.get('/dl/facebook', async (req, res, next) => {
  const apikey = req.query.apikey;
  const url = req.query.url;

  // Validate input parameters
  if (!url) return res.json({ status: false, message: "URL parameter is required." });
  if (!apikey) return res.json({ status: false, message: "API key is required." });

  // Validate API key
  if (!listkey.includes(apikey)) {
    return res.json({ status: false, message: "Invalid API key." });
  }

  try {
    const download = await downloadFacebook(url); // Call the download function
    if (download.success) {
      res.json({
        status: true,
        code: 200,
        creator: `${creator}`,
        result: {
          mediaUrl: download.mediaUrl,
          preview: download.preview,
          description: download.description,
          type: download.type,
        },
      });
    } else {
      res.json({ status: false, message: "Failed to download from Facebook." });
    }
  } catch (err) {
    console.error("Error downloading from Facebook:", err);
    res.json({ status: false, message: "An error occurred while downloading." });
  }
});

// Route for downloading from TikTok
router.get('/dl/tiktok', async (req, res, next) => {
  const apikey = req.query.apikey;
  const url = req.query.url;

  // Validate input parameters
  if (!url) return res.json({ status: false, message: "URL parameter is required." });
  if (!apikey) return res.json({ status: false, message: "API key is required." });

  // Validate API key
  if (!listkey.includes(apikey)) {
    return res.json({ status: false, message: "Invalid API key." });
  }

  try {
    const download = await downloadTikTok(url); // Call the download function
    if (download.success) {
      res.json({
        status: true,
        code: 200,
        creator: `${creator}`,
        result: {
          mediaUrl: download.mediaUrl,
          preview: download.preview,
          description: download.description,
          type: download.type,
        },
      });
    } else {
      res.json({ status: false, message: "Failed to download from TikTok." });
    }
  } catch (err) {
    console.error("Error downloading from TikTok:", err);
    res.json({ status: false, message: "An error occurred while downloading." });
  }
});


// Route to translate text using Google Translate API
router.get('/translate', async (req, res, next) => {
  const apikey = req.query.apikey;
  const text = req.query.text;
  const targetLang = req.query.lang || 'en'; // Default target language is English

  // Validate input parameters
  if (!text) return res.json(loghandler.nottext);
  if (!apikey) return res.json(loghandler.notparam);

  // Check if the API key is valid
  if (listkey.includes(apikey)) {
    try {
      // Perform the translation
      const translatedText = await translate(text, { to: targetLang });

      // Return the translation result
      res.json({
        status: true,
        code: 200,
        creator: `${creator}`,
        result: translatedText.text, // Return translated text
      });
    } catch (err) {
      console.error("Error translating text:", err);
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});

// Route to generate a welcome card using popcat.xyz API
router.get('/welcomecard', async (req, res, next) => {
  const apikey = req.query.apikey;
  const background = req.query.background;  // Background image URL
  const text1 = req.query.text1;  // First text
  const text2 = req.query.text2;  // Second text
  const text3 = req.query.text3;  // Third text

  // Validate input parameters
  if (!background || !text1 || !text2 || !text3) {
    return res.json(loghandler.notquery);  // Ensure all required parameters are provided
  }
  if (!apikey) return res.json(loghandler.notparam);  // Ensure API key is provided

  // Check if the API key is valid
  if (listkey.includes(apikey)) {
    try {
      // Generate the welcome card from popcat.xyz API
      const response = await fetch(`https://api.popcat.xyz/welcomecard?background=${encodeURIComponent(background)}&text1=${encodeURIComponent(text1)}&text2=${encodeURIComponent(text2)}&text3=${encodeURIComponent(text3)}`);
      
      // Check if the response contains the image URL
      const welcomeCardResult = await response.json();

      if (welcomeCardResult && welcomeCardResult.image) {
        // Fetch the image as a buffer
        const imageBuffer = await (await fetch(welcomeCardResult.image)).buffer();

        // Set the appropriate headers for image content
        res.set('Content-Type', 'image/png');  // or whatever the content type of the image is

        // Send the image buffer directly in the response
        return res.send(imageBuffer);

      } else {
        return res.json({
          status: false,
          code: 404,
          message: 'Welcome card not found.',
        });
      }
    } catch (err) {
      console.error("Error generating welcome card:", err);
      return res.json(loghandler.error);
    }
  } else {
    return res.json(loghandler.invalidKey);
  }
});


// Route to generate a Drake meme using popcat.xyz API
router.get('/image/drake', async (req, res, next) => {
  const apikey = req.query.apikey;
  const text1 = req.query.text1;  // First text to generate the Drake meme (e.g., 'amongus')
  const text2 = req.query.text2;  // Second text to generate the Drake meme (e.g., 'amogus')

  // Validate input parameters
  if (!text1 || !text2) return res.json(loghandler.nottext);  // Ensure both 'text1' and 'text2' parameters are provided
  if (!apikey) return res.json(loghandler.notparam);  // Ensure API key is provided

  // Check if the API key is valid
  if (listkey.includes(apikey)) {
    try {
      // Fetch the Drake meme image from popcat.xyz API
      const response = await fetch(`https://api.popcat.xyz/drake?text1=${encodeURIComponent(text1)}&text2=${encodeURIComponent(text2)}`);

      // Ensure the response is OK (status 200)
      if (!response.ok) {
        return res.json({
          status: false,
          code: 500,
          message: 'Error fetching Drake meme from Popcat API.',
        });
      }

      // Get the image buffer (no need to parse as JSON since it's an image)
      const imageBuffer = await response.buffer();

      // Set the appropriate headers for image content
      res.set('Content-Type', 'image/png');  // or whatever the content type of the image is

      // Send the image buffer directly in the response
      return res.send(imageBuffer);

    } catch (err) {
      console.error("Error fetching Drake meme:", err);
      return res.json(loghandler.error);
    }
  } else {
    return res.json(loghandler.invalidKey);
  }
});


// Route to capture a screenshot of a URL using popcat.xyz API
router.get('/pc/screenshot', async (req, res, next) => {
  const apikey = req.query.apikey;
  const url = req.query.url;  // URL to capture a screenshot (e.g., 'https://google.com')

  // Validate input parameters
  if (!url) return res.json(loghandler.noturl);  // Ensure 'url' parameter is provided
  if (!apikey) return res.json(loghandler.notparam);  // Ensure API key is provided

  // Check if the API key is valid
  if (listkey.includes(apikey)) {
    try {
      // Fetch the screenshot image from popcat.xyz API
      const response = await fetch(`https://api.popcat.xyz/screenshot?url=${encodeURIComponent(url)}`);
      
      // Ensure the response is OK (status 200)
      if (!response.ok) {
        return res.json({
          status: false,
          code: 500,
          message: 'Error fetching screenshot from Popcat API.',
        });
      }

      // Get the image buffer (no need to parse as JSON since it's an image)
      const imageBuffer = await response.buffer();

      // Set the appropriate headers for image content
      res.set('Content-Type', 'image/png');  // or whatever the content type of the image is

      // Send the image buffer directly in the response
      return res.send(imageBuffer);
    } catch (err) {
      console.error("Error fetching screenshot:", err);
      return res.json(loghandler.error);
    }
  } else {
    return res.json(loghandler.invalidKey);
  }
});




// Route to fetch color details using popcat.xyz API
router.get('/hex/color', async (req, res, next) => {
  const apikey = req.query.apikey;
  const colorCode = req.query.color;  // Color code (e.g., 'ffcc99')

  // Validate input parameters
  if (!colorCode) return res.json(loghandler.notquery);  // Ensure 'color' parameter is provided
  if (!apikey) return res.json(loghandler.notparam);  // Ensure API key is provided

  // Check if the API key is valid
  if (listkey.includes(apikey)) {
    try {
      // Fetch the color details from popcat.xyz API
      const response = await fetch(`https://api.popcat.xyz/color/${encodeURIComponent(colorCode)}`);
      const colorResult = await response.json();

      // Check if the result contains the color details
      if (colorResult && colorResult.hex) {
        res.json({
          status: true,
          code: 200,
          creator: `${creator}`,
          result: colorResult,  // Return the entire color details object
        });
      } else {
        res.json({
          status: false,
          code: 404,
          message: 'Color not found.',
        });
      }
    } catch (err) {
      console.error("Error fetching color details:", err);
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});

// Route to fetch Steam game data using popcat.xyz API
router.get('/apk/steam', async (req, res, next) => {
  const apikey = req.query.apikey;
  const game = req.query.q;  // Game name to search for (e.g., 'minecraft')

  // Validate input parameters
  if (!game) return res.json(loghandler.notquery);  // Ensure 'q' parameter (game) is provided
  if (!apikey) return res.json(loghandler.notparam);  // Ensure API key is provided

  // Check if the API key is valid
  if (listkey.includes(apikey)) {
    try {
      // Fetch the Steam game data from popcat.xyz API
      const response = await fetch(`https://api.popcat.xyz/steam?q=${encodeURIComponent(game)}`);
      
      // Check the content type of the response
      const contentType = response.headers.get('content-type');

      // If the response is JSON, parse it
      if (contentType && contentType.includes('application/json')) {
        const steamResult = await response.json();

        // Check if the result contains Steam game data of type 'game'
        if (steamResult && steamResult.type === 'game') {
          return res.json({
            status: true,
            code: 200,
            creator: `${creator}`,
            result: steamResult, // Send the game data object
          });
        } else {
          return res.json({
            status: false,
            code: 404,
            message: 'Steam game not found.',
          });
        }
      }
      
      // If the response is HTML (such as an error page), send it directly
      else if (contentType && contentType.includes('text/html')) {
        const html = await response.text();
        return res.send(html);  // Send the raw HTML response

      } 
      
      // If the response is an image, process it as a buffer and upload to ImgBB
      else if (contentType && contentType.includes('image')) {
        const imageBuffer = await response.buffer();
        
        // Upload the image to ImgBB (assumes uploadImageToImgBB function is available)
        const imageUrl = await uploadToImgur(imageBuffer);
        return res.json({
          status: true,
          code: 200,
          creator: `${creator}`,
          data: { imageUrl },  // Send the ImgBB image URL
        });
      }
      
      // Handle unsupported response types
      else {
        return res.json({
          status: false,
          code: 415,
          message: 'Unsupported media type received.',
        });
      }
    } catch (err) {
      console.error("Error fetching Steam game data:", err);
      return res.json(loghandler.error);
    }
  } else {
    return res.json(loghandler.invalidKey);
  }
});

// Route to fetch GitHub user data using popcat.xyz API
router.get('/info/github', async (req, res, next) => {
  const apikey = req.query.apikey;
  const username = req.query.username;  // GitHub username (e.g., 'GlobalTechInfo')

  // Validate input parameters
  if (!username) return res.json(loghandler.notusername);  // Ensure 'username' parameter is provided
  if (!apikey) return res.json(loghandler.notparam);  // Ensure API key is provided

  // Check if the API key is valid
  if (listkey.includes(apikey)) {
    try {
      // Fetch GitHub user data from popcat.xyz API
      const response = await fetch(`https://api.popcat.xyz/github/$(username)`);
      
      // Check the content type of the response
      const contentType = response.headers.get('content-type');

      // If the response is JSON, parse it
      if (contentType && contentType.includes('application/json')) {
        const githubResult = await response.json();

        // Check if the result contains GitHub data
        if (githubResult && githubResult.login) {
          res.json({
            status: true,
            code: 200,
            creator: `${creator}`,
            result: githubResult, // Send the GitHub user data
          });
        } else {
          res.json({
            status: false,
            code: 404,
            message: 'GitHub user not found.',
          });
        }
      }
      // If the response is HTML (e.g., error page from GitHub), send a 404 or error response
      else if (contentType && contentType.includes('text/html')) {
        const htmlResponse = await response.text();

        // If the HTML response contains "Not Found", assume the user doesn't exist
        if (htmlResponse.includes('Not Found')) {
          res.json({
            status: false,
            code: 404,
            message: 'GitHub user not found (HTML response).',
          });
        } else {
          res.json({
            status: false,
            code: 415,
            message: 'Unsupported HTML response received.',
          });
        }
      }
      // If the response is neither JSON nor HTML, return unsupported media type
      else {
        res.json({
          status: false,
          code: 415,
          message: 'Unsupported media type received.',
        });
      }

    } catch (err) {
      console.error("Error fetching GitHub user data:", err);
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});


// Route to generate a Biden meme using popcat.xyz API
router.get('/image/biden', async (req, res, next) => {
  const apikey = req.query.apikey;
  const text = req.query.text;  // Text to generate the Biden meme

  // Validate input parameters
  if (!text) return res.json(loghandler.nottext);  // Ensure 'text' parameter is provided
  if (!apikey) return res.json(loghandler.notparam);  // Ensure API key is provided

  // Check if the API key is valid
  if (listkey.includes(apikey)) {
    try {
      // Fetch the Biden meme image from popcat.xyz API
      const response = await fetch(`https://api.popcat.xyz/biden?text=${encodeURIComponent(text)}`);
      
      // Ensure the response is OK (status 200)
      if (!response.ok) {
        return res.json({
          status: false,
          code: 500,
          message: 'Error fetching Biden meme from Popcat API.',
        });
      }

      // Get the image buffer (no need to parse as JSON since it's an image)
      const imageBuffer = await response.buffer();

      // Set the appropriate headers for image content
      res.set('Content-Type', 'image/png');  // or whatever the content type of the image is

      // Send the image buffer directly in the response
      return res.send(imageBuffer);

    } catch (err) {
      console.error("Error fetching Biden meme:", err);
      return res.json(loghandler.error);
    }
  } else {
    return res.json(loghandler.invalidKey);
  }
});

// Route to add alert label to text using popcat.xyz API
router.get('/image/alert', async (req, res, next) => {
  const apikey = req.query.apikey;
  const text = req.query.text;  // Text to add alert label to

  // Validate input parameters
  if (!text) return res.json(loghandler.nottext);  // Ensure 'text' parameter is provided
  if (!apikey) return res.json(loghandler.notparam);  // Ensure API key is provided

  // Check if the API key is valid
  if (listkey.includes(apikey)) {
    try {
      // Fetch the alert label image from popcat.xyz API
      const response = await fetch(`https://api.popcat.xyz/alert?text=${encodeURIComponent(text)}`);
      
      // Ensure the response is OK (status 200)
      if (!response.ok) {
        return res.json({
          status: false,
          code: 500,
          message: 'Error fetching alert label from Popcat API.',
        });
      }

      // Get the image buffer (no need to parse as JSON since it's an image)
      const imageBuffer = await response.buffer();

      // Set the appropriate headers for image content
      res.set('Content-Type', 'image/png');  // or change this based on the actual image format

      // Send the image buffer directly in the response
      return res.send(imageBuffer);

    } catch (err) {
      console.error("Error fetching alert label:", err);
      return res.json(loghandler.error);
    }
  } else {
    return res.json(loghandler.invalidKey);
  }
});


// Route to add caution label to text using popcat.xyz API
router.get('/image/caution', async (req, res, next) => {
  const apikey = req.query.apikey;
  const text = req.query.text;  // Text to add caution label to

  // Validate input parameters
  if (!text) return res.json(loghandler.nottext);  // Ensure 'text' parameter is provided
  if (!apikey) return res.json(loghandler.notparam);  // Ensure API key is provided

  // Check if the API key is valid
  if (listkey.includes(apikey)) {
    try {
      // Fetch the caution label image from popcat.xyz API
      const response = await fetch(`https://api.popcat.xyz/caution?text=${encodeURIComponent(text)}`);
      
      // Ensure the response is OK (status 200)
      if (!response.ok) {
        return res.json({
          status: false,
          code: 500,
          message: 'Error fetching caution label from Popcat API.',
        });
      }

      // Get the image buffer (no need to parse as JSON since it's an image)
      const imageBuffer = await response.buffer();

      // Set the appropriate headers for image content
      res.set('Content-Type', 'image/png');  // or change this based on the actual image format

      // Send the image buffer directly in the response
      return res.send(imageBuffer);

    } catch (err) {
      console.error("Error fetching caution label:", err);
      return res.json(loghandler.error);
    }
  } else {
    return res.json(loghandler.invalidKey);
  }
});


// Route to convert text to Morse code using popcat.xyz API
router.get('/text/morse', async (req, res, next) => {
  const apikey = req.query.apikey;
  const text = req.query.text;  // Text to convert to Morse code

  // Validate input parameters
  if (!text) return res.json(loghandler.nottext);  // Ensure 'text' parameter is provided
  if (!apikey) return res.json(loghandler.notparam);  // Ensure API key is provided

  // Check if the API key is valid
  if (listkey.includes(apikey)) {
    try {
      // Fetch the Morse code from popcat.xyz API
      const response = await fetch(`https://api.popcat.xyz/texttomorse?text=${encodeURIComponent(text)}`);
      const morseResult = await response.json();

      // Check if the Morse code result is returned
      if (morseResult && morseResult.morse) {
        res.json({
          status: true,
          code: 200,
          creator: `${creator}`,
          result: morseResult.morse, // Send the Morse code
        });
      } else {
        res.json({
          status: false,
          code: 404,
          message: 'Morse code not found.',
        });
      }
    } catch (err) {
      console.error("Error fetching Morse code:", err);
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});


// Route to reverse text using popcat.xyz API
router.get('/text/reverse', async (req, res, next) => {
  const apikey = req.query.apikey;
  const text = req.query.text;  // Text to reverse

  // Validate input parameters
  if (!text) return res.json(loghandler.nottext);  // Ensure 'text' parameter is provided
  if (!apikey) return res.json(loghandler.notparam);  // Ensure API key is provided

  // Check if the API key is valid
  if (listkey.includes(apikey)) {
    try {
      // Fetch reversed text from popcat.xyz API
      const response = await fetch(`https://api.popcat.xyz/reverse?text=${encodeURIComponent(text)}`);
      const reversedResult = await response.json();

      // Check if the reversed text is returned
      if (reversedResult && reversedResult.text) {
        res.json({
          status: true,
          code: 200,
          creator: `${creator}`,
          result: reversedResult.text, // Send the reversed text
        });
      } else {
        res.json({
          status: false,
          code: 404,
          message: 'No reversed text found.',
        });
      }
    } catch (err) {
      console.error("Error fetching reversed text:", err);
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});

    

// Route to search for a word using some-random-api
router.get('/dictionary', async (req, res, next) => {
  const apikey = req.query.apikey;
  const word = req.query.word;

  // Validate input parameters
  if (!word) return res.json(loghandler.nottext);  // Ensure 'word' parameter is provided
  if (!apikey) return res.json(loghandler.notparam);  // Ensure API key is provided

  // Check if the API key is valid
  if (listkey.includes(apikey)) {
    try {
      // Perform the dictionary search with the provided word
      const response = await fetch(`https://some-random-api.com/others/dictionary?word=${encodeURIComponent(word)}`);

      // Check the content type of the response
      const contentType = response.headers.get('content-type');

      // If the response is JSON, parse it
      if (contentType && contentType.includes('application/json')) {
        const dictionaryResult = await response.json();

        // Check if the response contains a valid dictionary entry
        if (dictionaryResult && dictionaryResult.length > 0) {
          res.json({
            status: true,
            code: 200,
            creator: `${creator}`,
            result: dictionaryResult,  // Send the dictionary result
          });
        } else {
          res.json({
            status: false,
            code: 404,
            message: 'Word not found.',
          });
        }
      }
      // If the response is plain text (possibly a single word definition or a message)
      else if (contentType && contentType.includes('text/plain')) {
        const dictionaryResult = await response.text();

        // Check if the response contains the definition
        if (dictionaryResult) {
          res.json({
            status: true,
            code: 200,
            creator: `${creator}`,
            result: dictionaryResult,  // Send the plain text result
          });
        } else {
          res.json({
            status: false,
            code: 404,
            message: 'Word not found.',
          });
        }
      }
      // If the response is of unsupported type
      else {
        res.json({
          status: false,
          code: 415,
          message: 'Unsupported media type received.',
        });
      }

    } catch (err) {
      console.error("Error fetching dictionary data:", err);
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});





// Route to generate image using ephoto-api-faris
router.get('/ephoto/golden', async (req, res, next) => {
  const apikey = req.query.apikey;
  const name = req.query.text;

  // Validate input parameters
  if (!name) return res.json(loghandler.nottext);
  if (!apikey) return res.json(loghandler.notparam);

  // Check if the API key is valid
  if (listkey.includes(apikey)) {
    try {
      // Instantiate the Photo360 object with a URL template
      const photo360 = new Photo360("https://en.ephoto360.com/write-gold-letters-online-285.html");

      // Set the name that will appear in the generated image
      photo360.setName(name);

      // Execute and get the image URL
      const imgUrl = await photo360.execute();

      // Return the image URL as a response
      res.json({
        status: true,
        code: 200,
        creator: `${creator}`,
        result: {
          imageUrl: imgUrl.imageUrl,
        },
      });
    } catch (err) {
      console.error("Error generating image:", err);
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});

// Route to generate image using ephoto-api-faris
router.get('/ephoto/wgalaxy', async (req, res, next) => {
  const apikey = req.query.apikey;
  const name = req.query.text;

  // Validate input parameters
  if (!name) return res.json(loghandler.nottext);
  if (!apikey) return res.json(loghandler.notparam);

  // Check if the API key is valid
  if (listkey.includes(apikey)) {
    try {
      // Instantiate the Photo360 object with a URL template
      const photo360 = new Photo360("https://en.ephoto360.com/write-galaxy-online-18.html");

      // Set the name that will appear in the generated image
      photo360.setName(name);

      // Execute and get the image URL
      const imgUrl = await photo360.execute();

      // Return the image URL as a response
      res.json({
        status: true,
        code: 200,
        creator: `${creator}`,
        result: {
          imageUrl: imgUrl.imageUrl,
        },
      });
    } catch (err) {
      console.error("Error generating image:", err);
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});

// Route to generate image using ephoto-api-faris
router.get('/ephoto/mettalic', async (req, res, next) => {
  const apikey = req.query.apikey;
  const name = req.query.text;

  // Validate input parameters
  if (!name) return res.json(loghandler.nottext);
  if (!apikey) return res.json(loghandler.notparam);

  // Check if the API key is valid
  if (listkey.includes(apikey)) {
    try {
      // Instantiate the Photo360 object with a URL template
      const photo360 = new Photo360("https://en.ephoto360.com/metallic-text-effect-with-impressive-font-307.html");

      // Set the name that will appear in the generated image
      photo360.setName(name);

      // Execute and get the image URL
      const imgUrl = await photo360.execute();

      // Return the image URL as a response
      res.json({
        status: true,
        code: 200,
        creator: `${creator}`,
        result: {
          imageUrl: imgUrl.imageUrl,
        },
      });
    } catch (err) {
      console.error("Error generating image:", err);
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});

// Route to generate image using ephoto-api-faris
router.get('/ephoto/gradient', async (req, res, next) => {
  const apikey = req.query.apikey;
  const name = req.query.text;

  // Validate input parameters
  if (!name) return res.json(loghandler.nottext);
  if (!apikey) return res.json(loghandler.notparam);

  // Check if the API key is valid
  if (listkey.includes(apikey)) {
    try {
      // Instantiate the Photo360 object with a URL template
      const photo360 = new Photo360("https://en.ephoto360.com/create-3d-gradient-text-effect-online-600.html");

      // Set the name that will appear in the generated image
      photo360.setName(name);

      // Execute and get the image URL
      const imgUrl = await photo360.execute();

      // Return the image URL as a response
      res.json({
        status: true,
        code: 200,
        creator: `${creator}`,
        result: {
          imageUrl: imgUrl.imageUrl,
        },
      });
    } catch (err) {
      console.error("Error generating image:", err);
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});

// Route to generate image using ephoto-api-faris
router.get('/ephoto/snake', async (req, res, next) => {
  const apikey = req.query.apikey;
  const name = req.query.text;

  // Validate input parameters
  if (!name) return res.json(loghandler.nottext);
  if (!apikey) return res.json(loghandler.notparam);

  // Check if the API key is valid
  if (listkey.includes(apikey)) {
    try {
      // Instantiate the Photo360 object with a URL template
      const photo360 = new Photo360("https://en.ephoto360.com/snake-text-effect-276.html");

      // Set the name that will appear in the generated image
      photo360.setName(name);

      // Execute and get the image URL
      const imgUrl = await photo360.execute();

      // Return the image URL as a response
      res.json({
        status: true,
        code: 200,
        creator: `${creator}`,
        result: {
          imageUrl: imgUrl.imageUrl,
        },
      });
    } catch (err) {
      console.error("Error generating image:", err);
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});

// Route to generate image using ephoto-api-faris
router.get('/ephoto/metal', async (req, res, next) => {
  const apikey = req.query.apikey;
  const name = req.query.text;

  // Validate input parameters
  if (!name) return res.json(loghandler.nottext);
  if (!apikey) return res.json(loghandler.notparam);

  // Check if the API key is valid
  if (listkey.includes(apikey)) {
    try {
      // Instantiate the Photo360 object with a URL template
      const photo360 = new Photo360("https://en.ephoto360.com/metal-text-effect-online-110.html");

      // Set the name that will appear in the generated image
      photo360.setName(name);

      // Execute and get the image URL
      const imgUrl = await photo360.execute();

      // Return the image URL as a response
      res.json({
        status: true,
        code: 200,
        creator: `${creator}`,
        result: {
          imageUrl: imgUrl.imageUrl,
        },
      });
    } catch (err) {
      console.error("Error generating image:", err);
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});

// Route to generate image using ephoto-api-faris
router.get('/ephoto/3dsilver', async (req, res, next) => {
  const apikey = req.query.apikey;
  const name = req.query.text;

  // Validate input parameters
  if (!name) return res.json(loghandler.nottext);
  if (!apikey) return res.json(loghandler.notparam);

  // Check if the API key is valid
  if (listkey.includes(apikey)) {
    try {
      // Instantiate the Photo360 object with a URL template
      const photo360 = new Photo360("https://en.ephoto360.com/3d-silver-text-effect-273.html");

      // Set the name that will appear in the generated image
      photo360.setName(name);

      // Execute and get the image URL
      const imgUrl = await photo360.execute();

      // Return the image URL as a response
      res.json({
        status: true,
        code: 200,
        creator: `${creator}`,
        result: {
          imageUrl: imgUrl.imageUrl,
        },
      });
    } catch (err) {
      console.error("Error generating image:", err);
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});

// Route to generate image using ephoto-api-faris
router.get('/ephoto/jewel', async (req, res, next) => {
  const apikey = req.query.apikey;
  const name = req.query.text;

  // Validate input parameters
  if (!name) return res.json(loghandler.nottext);
  if (!apikey) return res.json(loghandler.notparam);

  // Check if the API key is valid
  if (listkey.includes(apikey)) {
    try {
      // Instantiate the Photo360 object with a URL template
      const photo360 = new Photo360("https://en.ephoto360.com/jewel-text-effect-275.html");

      // Set the name that will appear in the generated image
      photo360.setName(name);

      // Execute and get the image URL
      const imgUrl = await photo360.execute();

      // Return the image URL as a response
      res.json({
        status: true,
        code: 200,
        creator: `${creator}`,
        result: {
          imageUrl: imgUrl.imageUrl,
        },
      });
    } catch (err) {
      console.error("Error generating image:", err);
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});

// Route to generate image using ephoto-api-faris
router.get('/ephoto/blackpink', async (req, res, next) => {
  const apikey = req.query.apikey;
  const name = req.query.text;

  // Validate input parameters
  if (!name) return res.json(loghandler.nottext);
  if (!apikey) return res.json(loghandler.notparam);

  // Check if the API key is valid
  if (listkey.includes(apikey)) {
    try {
      // Instantiate the Photo360 object with a URL template
      const photo360 = new Photo360("https://en.ephoto360.com/online-blackpink-style-logo-maker-effect-711.html");

      // Set the name that will appear in the generated image
      photo360.setName(name);

      // Execute and get the image URL
      const imgUrl = await photo360.execute();

      // Return the image URL as a response
      res.json({
        status: true,
        code: 200,
        creator: `${creator}`,
        result: {
          imageUrl: imgUrl.imageUrl,
        },
      });
    } catch (err) {
      console.error("Error generating image:", err);
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});

// Route to generate image using ephoto-api-faris
router.get('/ephoto/cubic', async (req, res, next) => {
  const apikey = req.query.apikey;
  const name = req.query.text;

  // Validate input parameters
  if (!name) return res.json(loghandler.nottext);
  if (!apikey) return res.json(loghandler.notparam);

  // Check if the API key is valid
  if (listkey.includes(apikey)) {
    try {
      // Instantiate the Photo360 object with a URL template
      const photo360 = new Photo360("https://en.ephoto360.com/3d-cubic-text-effect-online-88.html");

      // Set the name that will appear in the generated image
      photo360.setName(name);

      // Execute and get the image URL
      const imgUrl = await photo360.execute();

      // Return the image URL as a response
      res.json({
        status: true,
        code: 200,
        creator: `${creator}`,
        result: {
          imageUrl: imgUrl.imageUrl,
        },
      });
    } catch (err) {
      console.error("Error generating image:", err);
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});

// Route to generate image using ephoto-api-faris
router.get('/ephoto/sand', async (req, res, next) => {
  const apikey = req.query.apikey;
  const name = req.query.text;

  // Validate input parameters
  if (!name) return res.json(loghandler.nottext);
  if (!apikey) return res.json(loghandler.notparam);

  // Check if the API key is valid
  if (listkey.includes(apikey)) {
    try {
      // Instantiate the Photo360 object with a URL template
      const photo360 = new Photo360("https://en.ephoto360.com/write-names-and-messages-on-the-sand-online-582.html");

      // Set the name that will appear in the generated image
      photo360.setName(name);

      // Execute and get the image URL
      const imgUrl = await photo360.execute();

      // Return the image URL as a response
      res.json({
        status: true,
        code: 200,
        creator: `${creator}`,
        result: {
          imageUrl: imgUrl.imageUrl,
        },
      });
    } catch (err) {
      console.error("Error generating image:", err);
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});

// Route to generate image using ephoto-api-faris
router.get('/ephoto/nigeria', async (req, res, next) => {
  const apikey = req.query.apikey;
  const name = req.query.text;

  // Validate input parameters
  if (!name) return res.json(loghandler.nottext);
  if (!apikey) return res.json(loghandler.notparam);

  // Check if the API key is valid
  if (listkey.includes(apikey)) {
    try {
      // Instantiate the Photo360 object with a URL template
      const photo360 = new Photo360("https://en.ephoto360.com/nigeria-3d-flag-text-effect-online-free-753.html");

      // Set the name that will appear in the generated image
      photo360.setName(name);

      // Execute and get the image URL
      const imgUrl = await photo360.execute();

      // Return the image URL as a response
      res.json({
        status: true,
        code: 200,
        creator: `${creator}`,
        result: {
          imageUrl: imgUrl.imageUrl,
        },
      });
    } catch (err) {
      console.error("Error generating image:", err);
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});

// Route to generate image using ephoto-api-faris
router.get('/ephoto/gaming', async (req, res, next) => {
  const apikey = req.query.apikey;
  const name = req.query.text;

  // Validate input parameters
  if (!name) return res.json(loghandler.nottext);
  if (!apikey) return res.json(loghandler.notparam);

  // Check if the API key is valid
  if (listkey.includes(apikey)) {
    try {
      // Instantiate the Photo360 object with a URL template
      const photo360 = new Photo360("https://en.ephoto360.com/free-gaming-logo-maker-for-fps-game-team-546.html");

      // Set the name that will appear in the generated image
      photo360.setName(name);

      // Execute and get the image URL
      const imgUrl = await photo360.execute();

      // Return the image URL as a response
      res.json({
        status: true,
        code: 200,
        creator: `${creator}`,
        result: {
          imageUrl: imgUrl.imageUrl,
        },
      });
    } catch (err) {
      console.error("Error generating image:", err);
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});

// Route to generate image using ephoto-api-faris
router.get('/ephoto/gold', async (req, res, next) => {
  const apikey = req.query.apikey;
  const name = req.query.text;

  // Validate input parameters
  if (!name) return res.json(loghandler.nottext);
  if (!apikey) return res.json(loghandler.notparam);

  // Check if the API key is valid
  if (listkey.includes(apikey)) {
    try {
      // Instantiate the Photo360 object with a URL template
      const photo360 = new Photo360("https://en.ephoto360.com/gold-text-effect-pro-271.html");

      // Set the name that will appear in the generated image
      photo360.setName(name);

      // Execute and get the image URL
      const imgUrl = await photo360.execute();

      // Return the image URL as a response
      res.json({
        status: true,
        code: 200,
        creator: `${creator}`,
        result: {
          imageUrl: imgUrl.imageUrl,
        },
      });
    } catch (err) {
      console.error("Error generating image:", err);
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});

// Route to generate image using ephoto-api-faris
router.get('/ephoto/paintsplat', async (req, res, next) => {
  const apikey = req.query.apikey;
  const name = req.query.text;

  // Validate input parameters
  if (!name) return res.json(loghandler.nottext);
  if (!apikey) return res.json(loghandler.notparam);

  // Check if the API key is valid
  if (listkey.includes(apikey)) {
    try {
      // Instantiate the Photo360 object with a URL template
      const photo360 = new Photo360("https://en.ephoto360.com/paint-splatter-text-effect-72.html");

      // Set the name that will appear in the generated image
      photo360.setName(name);

      // Execute and get the image URL
      const imgUrl = await photo360.execute();

      // Return the image URL as a response
      res.json({
        status: true,
        code: 200,
        creator: `${creator}`,
        result: {
          imageUrl: imgUrl.imageUrl,
        },
      });
    } catch (err) {
      console.error("Error generating image:", err);
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});

// Route to generate image using ephoto-api-faris
router.get('/ephoto/colorful', async (req, res, next) => {
  const apikey = req.query.apikey;
  const name = req.query.text;

  // Validate input parameters
  if (!name) return res.json(loghandler.nottext);
  if (!apikey) return res.json(loghandler.notparam);

  // Check if the API key is valid
  if (listkey.includes(apikey)) {
    try {
      // Instantiate the Photo360 object with a URL template
      const photo360 = new Photo360("https://en.ephoto360.com/create-3d-colorful-paint-text-effect-online-801.html");

      // Set the name that will appear in the generated image
      photo360.setName(name);

      // Execute and get the image URL
      const imgUrl = await photo360.execute();

      // Return the image URL as a response
      res.json({
        status: true,
        code: 200,
        creator: `${creator}`,
        result: {
          imageUrl: imgUrl.imageUrl,
        },
      });
    } catch (err) {
      console.error("Error generating image:", err);
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});

// Route to generate image using ephoto-api-faris
router.get('/ephoto/matrix', async (req, res, next) => {
  const apikey = req.query.apikey;
  const name = req.query.text;

  // Validate input parameters
  if (!name) return res.json(loghandler.nottext);
  if (!apikey) return res.json(loghandler.notparam);

  // Check if the API key is valid
  if (listkey.includes(apikey)) {
    try {
      // Instantiate the Photo360 object with a URL template
      const photo360 = new Photo360("https://en.ephoto360.com/matrix-text-effect-154.html");

      // Set the name that will appear in the generated image
      photo360.setName(name);

      // Execute and get the image URL
      const imgUrl = await photo360.execute();

      // Return the image URL as a response
      res.json({
        status: true,
        code: 200,
        creator: `${creator}`,
        result: {
          imageUrl: imgUrl.imageUrl,
        },
      });
    } catch (err) {
      console.error("Error generating image:", err);
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});

// Route to generate image using ephoto-api-faris
router.get('/ephoto/angelwing', async (req, res, next) => {
  const apikey = req.query.apikey;
  const name = req.query.text;

  // Validate input parameters
  if (!name) return res.json(loghandler.nottext);
  if (!apikey) return res.json(loghandler.notparam);

  // Check if the API key is valid
  if (listkey.includes(apikey)) {
    try {
      // Instantiate the Photo360 object with a URL template
      const photo360 = new Photo360("https://en.ephoto360.com/create-colorful-angel-wing-avatars-731.html");

      // Set the name that will appear in the generated image
      photo360.setName(name);

      // Execute and get the image URL
      const imgUrl = await photo360.execute();

      // Return the image URL as a response
      res.json({
        status: true,
        code: 200,
        creator: `${creator}`,
        result: {
          imageUrl: imgUrl.imageUrl,
        },
      });
    } catch (err) {
      console.error("Error generating image:", err);
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});

// Route to generate image using ephoto-api-faris
router.get('/ephoto/papercut', async (req, res, next) => {
  const apikey = req.query.apikey;
  const name = req.query.text;

  // Validate input parameters
  if (!name) return res.json(loghandler.nottext);
  if (!apikey) return res.json(loghandler.notparam);

  // Check if the API key is valid
  if (listkey.includes(apikey)) {
    try {
      // Instantiate the Photo360 object with a URL template
      const photo360 = new Photo360("https://en.ephoto360.com/multicolor-3d-paper-cut-style-text-effect-658.html");

      // Set the name that will appear in the generated image
      photo360.setName(name);

      // Execute and get the image URL
      const imgUrl = await photo360.execute();

      // Return the image URL as a response
      res.json({
        status: true,
        code: 200,
        creator: `${creator}`,
        result: {
          imageUrl: imgUrl.imageUrl,
        },
      });
    } catch (err) {
      console.error("Error generating image:", err);
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});

// Route to generate image using ephoto-api-faris
router.get('/ephoto/hacker', async (req, res, next) => {
  const apikey = req.query.apikey;
  const name = req.query.text;

  // Validate input parameters
  if (!name) return res.json(loghandler.nottext);
  if (!apikey) return res.json(loghandler.notparam);

  // Check if the API key is valid
  if (listkey.includes(apikey)) {
    try {
      // Instantiate the Photo360 object with a URL template
      const photo360 = new Photo360("https://en.ephoto360.com/create-anonymous-hacker-avatars-cyan-neon-677.html");

      // Set the name that will appear in the generated image
      photo360.setName(name);

      // Execute and get the image URL
      const imgUrl = await photo360.execute();

      // Return the image URL as a response
      res.json({
        status: true,
        code: 200,
        creator: `${creator}`,
        result: {
          imageUrl: imgUrl.imageUrl,
        },
      });
    } catch (err) {
      console.error("Error generating image:", err);
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});

// Route to generate image using ephoto-api-faris
router.get('/ephoto/ballon', async (req, res, next) => {
  const apikey = req.query.apikey;
  const name = req.query.text;

  // Validate input parameters
  if (!name) return res.json(loghandler.nottext);
  if (!apikey) return res.json(loghandler.notparam);

  // Check if the API key is valid
  if (listkey.includes(apikey)) {
    try {
      // Instantiate the Photo360 object with a URL template
      const photo360 = new Photo360("https://en.ephoto360.com/beautiful-3d-foil-balloon-effects-for-holidays-and-birthday-803.html");

      // Set the name that will appear in the generated image
      photo360.setName(name);

      // Execute and get the image URL
      const imgUrl = await photo360.execute();

      // Return the image URL as a response
      res.json({
        status: true,
        code: 200,
        creator: `${creator}`,
        result: {
          imageUrl: imgUrl.imageUrl,
        },
      });
    } catch (err) {
      console.error("Error generating image:", err);
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});

// Route to generate image using ephoto-api-faris
router.get('/ephoto/gsilver', async (req, res, next) => {
  const apikey = req.query.apikey;
  const name = req.query.text;

  // Validate input parameters
  if (!name) return res.json(loghandler.nottext);
  if (!apikey) return res.json(loghandler.notparam);

  // Check if the API key is valid
  if (listkey.includes(apikey)) {
    try {
      // Instantiate the Photo360 object with a URL template
      const photo360 = new Photo360("https://en.ephoto360.com/create-glossy-silver-3d-text-effect-online-802.html");

      // Set the name that will appear in the generated image
      photo360.setName(name);

      // Execute and get the image URL
      const imgUrl = await photo360.execute();

      // Return the image URL as a response
      res.json({
        status: true,
        code: 200,
        creator: `${creator}`,
        result: {
          imageUrl: imgUrl.imageUrl,
        },
      });
    } catch (err) {
      console.error("Error generating image:", err);
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});

// Route to generate image using ephoto-api-faris
router.get('/ephoto/galaxy2', async (req, res, next) => {
  const apikey = req.query.apikey;
  const name = req.query.text;

  // Validate input parameters
  if (!name) return res.json(loghandler.nottext);
  if (!apikey) return res.json(loghandler.notparam);

  // Check if the API key is valid
  if (listkey.includes(apikey)) {
    try {
      // Instantiate the Photo360 object with a URL template
      const photo360 = new Photo360("https://en.ephoto360.com/galaxy-text-effect-116.html");

      // Set the name that will appear in the generated image
      photo360.setName(name);

      // Execute and get the image URL
      const imgUrl = await photo360.execute();

      // Return the image URL as a response
      res.json({
        status: true,
        code: 200,
        creator: `${creator}`,
        result: {
          imageUrl: imgUrl.imageUrl,
        },
      });
    } catch (err) {
      console.error("Error generating image:", err);
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});

// Route to generate image using ephoto-api-faris
router.get('/ephoto/circlemascot', async (req, res, next) => {
  const apikey = req.query.apikey;
  const name = req.query.text;

  // Validate input parameters
  if (!name) return res.json(loghandler.nottext);
  if (!apikey) return res.json(loghandler.notparam);

  // Check if the API key is valid
  if (listkey.includes(apikey)) {
    try {
      // Instantiate the Photo360 object with a URL template
      const photo360 = new Photo360("https://en.ephoto360.com/create-a-circle-mascot-team-logo-483.html");

      // Set the name that will appear in the generated image
      photo360.setName(name);

      // Execute and get the image URL
      const imgUrl = await photo360.execute();

      // Return the image URL as a response
      res.json({
        status: true,
        code: 200,
        creator: `${creator}`,
        result: {
          imageUrl: imgUrl.imageUrl,
        },
      });
    } catch (err) {
      console.error("Error generating image:", err);
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});


// Route to generate image using ephoto-api-faris
router.get('/ephoto/typography', async (req, res, next) => {
  const apikey = req.query.apikey;
  const name = req.query.text;

  // Validate input parameters
  if (!name) return res.json(loghandler.nottext);
  if (!apikey) return res.json(loghandler.notparam);

  // Check if the API key is valid
  if (listkey.includes(apikey)) {
    try {
      // Instantiate the Photo360 object with a URL template
      const photo360 = new Photo360("https://en.ephoto360.com/create-online-typography-art-effects-with-multiple-layers-811.html");

      // Set the name that will appear in the generated image
      photo360.setName(name);

      // Execute and get the image URL
      const imgUrl = await photo360.execute();

      // Return the image URL as a response
      res.json({
        status: true,
        code: 200,
        creator: `${creator}`,
        result: {
          imageUrl: imgUrl.imageUrl,
        },
      });
    } catch (err) {
      console.error("Error generating image:", err);
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});


// Route to generate image using ephoto-api-faris
router.get('/ephoto/star', async (req, res, next) => {
  const apikey = req.query.apikey;
  const name = req.query.text;

  // Validate input parameters
  if (!name) return res.json(loghandler.nottext);
  if (!apikey) return res.json(loghandler.notparam);

  // Check if the API key is valid
  if (listkey.includes(apikey)) {
    try {
      // Instantiate the Photo360 object with a URL template
      const photo360 = new Photo360("https://en.ephoto360.com/metal-star-text-online-109.html");

      // Set the name that will appear in the generated image
      photo360.setName(name);

      // Execute and get the image URL
      const imgUrl = await photo360.execute();

      // Return the image URL as a response
      res.json({
        status: true,
        code: 200,
        creator: `${creator}`,
        result: {
          imageUrl: imgUrl.imageUrl,
        },
      });
    } catch (err) {
      console.error("Error generating image:", err);
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});



// Route to generate image using ephoto-api-faris
router.get('/ephoto/mascot', async (req, res, next) => {
  const apikey = req.query.apikey;
  const name = req.query.text;

  // Validate input parameters
  if (!name) return res.json(loghandler.nottext);
  if (!apikey) return res.json(loghandler.notparam);

  // Check if the API key is valid
  if (listkey.includes(apikey)) {
    try {
      // Instantiate the Photo360 object with a URL template
      const photo360 = new Photo360("https://en.ephoto360.com/metal-mascots-logo-maker-486.html");

      // Set the name that will appear in the generated image
      photo360.setName(name);

      // Execute and get the image URL
      const imgUrl = await photo360.execute();

      // Return the image URL as a response
      res.json({
        status: true,
        code: 200,
        creator: `${creator}`,
        result: {
          imageUrl: imgUrl.imageUrl,
        },
      });
    } catch (err) {
      console.error("Error generating image:", err);
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});

// Route to generate image using ephoto-api-faris
router.get('/ephoto/foggy', async (req, res, next) => {
  const apikey = req.query.apikey;
  const name = req.query.text;

  // Validate input parameters
  if (!name) return res.json(loghandler.nottext);
  if (!apikey) return res.json(loghandler.notparam);

  // Check if the API key is valid
  if (listkey.includes(apikey)) {
    try {
      // Instantiate the Photo360 object with a URL template
      const photo360 = new Photo360("https://en.ephoto360.com/handwritten-text-on-foggy-glass-online-680.html");

      // Set the name that will appear in the generated image
      photo360.setName(name);

      // Execute and get the image URL
      const imgUrl = await photo360.execute();

      // Return the image URL as a response
      res.json({
        status: true,
        code: 200,
        creator: `${creator}`,
        result: {
          imageUrl: imgUrl.imageUrl,
        },
      });
    } catch (err) {
      console.error("Error generating image:", err);
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});

// Route to generate image using ephoto-api-faris
router.get('/ephoto/galaxy', async (req, res, next) => {
  const apikey = req.query.apikey;
  const name = req.query.text;

  // Validate input parameters
  if (!name) return res.json(loghandler.nottext);
  if (!apikey) return res.json(loghandler.notparam);

  // Check if the API key is valid
  if (listkey.includes(apikey)) {
    try {
      // Instantiate the Photo360 object with a URL template
      const photo360 = new Photo360("https://en.ephoto360.com/galaxy-text-effect-new-258.html");

      // Set the name that will appear in the generated image
      photo360.setName(name);

      // Execute and get the image URL
      const imgUrl = await photo360.execute();

      // Return the image URL as a response
      res.json({
        status: true,
        code: 200,
        creator: `${creator}`,
        result: {
          imageUrl: imgUrl.imageUrl,
        },
      });
    } catch (err) {
      console.error("Error generating image:", err);
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});

// Route to fetch a random joke
router.get('/quotes/joke', async (req, res) => {
    const Apikey = req.query.apikey;

    if (!Apikey) return res.json(loghandler.notparam);
    if (!listkey.includes(Apikey)) return res.json(loghandler.invalidKey);

    try {
        // Fetching the joke from the API
        const response = await axios.get('https://some-random-api.com/others/joke');
        const jokeData = response.data;

        // Check if the API returned a joke
        if (jokeData && jokeData.joke) {
            res.json({
                creator: `${creator}`,
                status: true,
                joke: jokeData.joke
            });
        } else {
            res.json({
                creator: `${creator}`,
                status: false,
                message: 'Unable to fetch a joke at this time.'
            });
        }
    } catch (error) {
        console.error('Error fetching joke:', error);

        res.json({
            creator: `${creator}`,
            status: false,
            message: `Error fetching the joke: ${error.message}`
        });
    }
});


// Route to get binary encoding of text
router.get('/encode/binary', async (req, res) => {
    const Apikey = req.query.apikey;
    const text = req.query.text; // Text to be encoded in binary

    if (!Apikey) return res.json(loghandler.notparam);
    if (!listkey.includes(Apikey)) return res.json(loghandler.invalidKey);
    if (!text) return res.json({ status: false, message: "Please provide text to encode." });

    try {
        // Construct the URL for the binary encoding API
        const apiUrl = `https://some-random-api.com/others/binary?encoding&text=${encodeURIComponent(text)}`;

        // Fetch binary encoded data from the API
        const response = await axios.get(apiUrl);
        const data = response.data;

        // Check if the response contains the binary encoding data
        if (data && data.binary) {
            res.json({
                creator: `${creator}`,
                status: true,
                result: {
                    text: text,
                    binary: data.binary
                }
            });
        } else {
            res.json({
                creator: `${creator}`,
                status: false,
                message: 'Unable to fetch binary encoding data.'
            });
        }
    } catch (error) {
        console.error('Error fetching binary encoding data:', error);

        res.json({
            creator: `${creator}`,
            status: false,
            message: `Error fetching the data: ${error.message}`
        });
    }
});

// Route to decode binary into text


// Route to fetch a random Islamic quote from the provided URL
router.get('/quotes/islamic', async (req, res) => {
    const Apikey = req.query.apikey;

    if (!Apikey) return res.json(loghandler.notparam);
    if (!listkey.includes(Apikey)) return res.json(loghandler.invalidKey);

    try {
        // Fetch data from the raw URL of the IslamicQuotes.txt file
        const response = await axios.get('https://raw.githubusercontent.com/GlobalTechInfo/Islamic-Database/main/IslamicQuotes.txt');
        const data = response.data;

        // Split data into lines and filter out empty lines
        const quotes = data.split('\n').filter(line => line.trim() !== '');

        // Select a random quote
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

        // Send the response with the creator, status, and random quote
        res.json({
            creator: `${creator}`,
            status: true,
            quote: randomQuote
        });

    } catch (error) {
        // Log the error for debugging purposes
        console.error("Error fetching Islamic quotes:", error);

        // Send the error response
        res.json({
            creator: `${creator}`,
            status: false,
            message: `Error fetching the data: ${error.message}`
        });
    }
});

// Route to fetch weather data using popcat.xyz API
router.get('/weather', async (req, res, next) => {
  const apikey = req.query.apikey;
  const city = req.query.q;  // City name for weather data (e.g., 'toronto')

  // Validate input parameters
  if (!city) return res.json(loghandler.notquery);  // Ensure 'q' parameter (city) is provided
  if (!apikey) return res.json(loghandler.notparam);  // Ensure API key is provided

  // Check if the API key is valid
  if (listkey.includes(apikey)) {
    try {
      // Fetch the weather data from popcat.xyz API
      const response = await fetch(`https://api.popcat.xyz/weather?q=${encodeURIComponent(city)}`);
      const weatherResult = await response.json();

      // Check if the result contains weather data
      if (weatherResult && weatherResult.main) {
        res.json({
          status: true,
          code: 200,
          creator: `${creator}`,
          result: weatherResult, // Send the weather data
        });
      } else {
        res.json({
          status: false,
          code: 404,
          message: 'Weather data not found.',
        });
      }
    } catch (err) {
      console.error("Error fetching weather data:", err);
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});



// Route to fetch a random tech tip from the provided URL
router.get('/quotes/techtips', async (req, res) => {
    const Apikey = req.query.apikey;

    if (!Apikey) return res.json(loghandler.notparam);
    if (!listkey.includes(Apikey)) return res.json(loghandler.invalidKey);

    try {
        // Fetch data from the raw URL of the TechTips.txt file
        const response = await axios.get('https://raw.githubusercontent.com/GlobalTechInfo/Islamic-Database/main/TXT-DATA/TechTips.txt');
        const data = response.data;

        // Split data into lines and filter out empty lines
        const techTips = data.split('\n').filter(line => line.trim() !== '');

        // Select a random tech tip
        const randomTechTip = techTips[Math.floor(Math.random() * techTips.length)];

        // Send the response with the creator, status, and random tech tip
        res.json({
            creator: `${creator}`,
            status: true,
            tech_tip: randomTechTip
        });

    } catch (error) {
        // Log the error for debugging purposes
        console.error("Error fetching tech tips:", error);

        // Send the error response
        res.json({
            creator: `${creator}`,
            status: false,
            message: `Error fetching the data: ${error.message}`
        });
    }
});

router.get('/decode/binary', async (req, res) => {
    const Apikey = req.query.apikey;
    const text = req.query.text; // Binary text to be decoded

    if (!Apikey) return res.json(loghandler.notparam);
    if (!listkey.includes(Apikey)) return res.json(loghandler.invalidKey);
    if (!text) return res.json({ status: false, message: "Please provide binary text to decode." });

    try {
        // Construct the URL for the binary decoding API
        const apiUrl = `https://api.popcat.xyz/decode?binary=${encodeURIComponent(text)}`;

        // Fetch decoded data from the API
        const response = await axios.get(apiUrl);
        const data = response.data;

        // Check if the response contains the decoded text
        if (data && data.text) {
            res.json({
                creator: `${creator}`,
                status: true,
                result: {
                    binary: text,
                    decodedText: data.text
                }
            });
        } else {
            res.json({
                creator: `${creator}`,
                status: false,
                message: 'Unable to decode the binary text.'
            });
        }
    } catch (error) {
        console.error('Error decoding binary text:', error);

        res.json({
            creator: `${creator}`,
            status: false,
            message: `Error fetching the data: ${error.message}`
        });
    }
});


// Route to fetch a random programming tip from the provided URL
router.get('/quotes/programming', async (req, res) => {
    const Apikey = req.query.apikey;

    if (!Apikey) return res.json(loghandler.notparam);
    if (!listkey.includes(Apikey)) return res.json(loghandler.invalidKey);

    try {
        // Fetch data from the raw URL of the ProgrammingTips.txt file
        const response = await axios.get('https://raw.githubusercontent.com/GlobalTechInfo/Islamic-Database/main/TXT-DATA/ProgrammingTips.txt');
        const data = response.data;

        // Split data into lines and filter out empty lines
        const programmingTips = data.split('\n').filter(line => line.trim() !== '');

        // Select a random programming tip
        const randomProgrammingTip = programmingTips[Math.floor(Math.random() * programmingTips.length)];

        // Send the response with the creator, status, and random programming tip
        res.json({
            creator: `${creator}`,
            status: true,
            programming_tip: randomProgrammingTip
        });

    } catch (error) {
        // Log the error for debugging purposes
        console.error("Error fetching programming tips:", error);

        // Send the error response
        res.json({
            creator: `${creator}`,
            status: false,
            message: `Error fetching the data: ${error.message}`
        });
    }
});


// Route to fetch a random motivational quote from the provided URL
router.get('/quotes/motivational', async (req, res) => {
    const Apikey = req.query.apikey;

    if (!Apikey) return res.json(loghandler.notparam);
    if (!listkey.includes(Apikey)) return res.json(loghandler.invalidKey);

    try {
        // Fetch data from the raw URL of the Motivational.txt file
        const response = await axios.get('https://raw.githubusercontent.com/GlobalTechInfo/Islamic-Database/main/TXT-DATA/Motivational.txt');
        const data = response.data;

        // Split data into lines and filter empty lines
        const motivationalQuotes = data.split('\n').filter(line => line.trim() !== '');

        // Select a random motivational quote
        const randomMotivationalQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

        // Send the response with the creator, status, and random motivational quote
        res.json({
            creator: `${creator}`,
            status: true,
            motivational: randomMotivationalQuote
        });

    } catch (error) {
        // Log the error for debugging purposes
        console.error("Error fetching motivational quotes:", error);

        // Send the error response
        res.json({
            creator: `${creator}`,
            status: false,
            message: `Error fetching the data: ${error.message}`
        });
    }
});


// Route to fetch a random life hack from the provided URL
router.get('/quotes/lifehacks', async (req, res) => {
    const Apikey = req.query.apikey;

    if (!Apikey) return res.json(loghandler.notparam);
    if (!listkey.includes(Apikey)) return res.json(loghandler.invalidKey);

    try {
        // Fetch data from the raw URL of the LifeHacks.txt file
        const response = await axios.get('https://raw.githubusercontent.com/GlobalTechInfo/Islamic-Database/main/TXT-DATA/LifeHacks.txt');
        const data = response.data;

        // Split data into lines and filter empty lines
        const lifeHacks = data.split('\n').filter(line => line.trim() !== '');

        // Select a random life hack
        const randomLifeHack = lifeHacks[Math.floor(Math.random() * lifeHacks.length)];

        // Send the response with the creator, status, and random life hack
        res.json({
            creator: `${creator}`,
            status: true,
            lifehack: randomLifeHack
        });

    } catch (error) {
        // Log the error for debugging purposes
        console.error("Error fetching life hacks:", error);

        // Send the error response
        res.json({
            creator: `${creator}`,
            status: false,
            message: `Error fetching the data: ${error.message}`
        });
    }
});


// Route to fetch a random fun fact from the provided URL
router.get('/quotes/funfacts', async (req, res) => {
    const Apikey = req.query.apikey;

    if (!Apikey) return res.json(loghandler.notparam);
    if (!listkey.includes(Apikey)) return res.json(loghandler.invalidKey);

    try {
        // Fetch data from the raw URL of the TXT file
        const response = await axios.get('https://raw.githubusercontent.com/GlobalTechInfo/Islamic-Database/main/TXT-DATA/FunFacts.txt');
        const data = response.data;

        // Split data into lines and filter empty lines
        const facts = data.split('\n').filter(line => line.trim() !== '');
        
        // Select a random fun fact
        const randomFact = facts[Math.floor(Math.random() * facts.length)];

        // Send the response with the creator, status, and random fact
        res.json({
            creator: `${creator}`,
            status: true,
            fact: randomFact
        });

    } catch (error) {
        // Log the error for debugging purposes
        console.error("Error fetching fun facts:", error);

        // Send the error response
        res.json({
            creator: `${creator}`,
            status: false,
            message: `Error fetching the data: ${error.message}`
        });
    }
});


// Route to get TikTok video download data
router.get('/video/yt', async (req, res) => {
    const Apikey = req.query.apikey;
    const link = req.query.url; // The TikTok video link

    if (!Apikey) return res.json(loghandler.notparam);
    if (!listkey.includes(Apikey)) return res.json(loghandler.invalidKey);
    if (!link) return res.json({ status: false, message: "Please provide a YouTube short video link." });

    try {
        // Fetching TikTok video download data using tiktokdown function (assuming it's imported and used in your setup)
        const data = await ytdown(link);

        // Check if the response contains the necessary data
        if (!data || !data.status || !data.data) {
            return res.json({
                status: false,
                message: 'Unable to fetch YouTube video data. Please check the link or try again later.'
            });
        }

        // Respond with the structured data, including all available fields
        res.json({
            status: true,
            code: 200,
            creator: 'Qasim Ali 🦋', // Developer name
            result: {
                media: {
                    title: data.data.title || 'No title available', // Video title
                    thumbnail: data.data.thumb || 'https://via.placeholder.com/150?text=No+Image', // Fallback if missing
                    video_url: data.data.video || 'No video URL available', // Fallback if missing
                    video_url_hd: data.data.video_hd || 'No HD video URL available', // Fallback if missing
                    video_url_sd: data.data.video_sd || 'No SD video URL available', // Fallback if missing
                    audio_url: data.data.audio || 'No audio URL available', // Fallback if missing
                    quality: data.data.quality || 'Quality not available', // Fallback if missing
                    channel: data.data.channel || 'Channel not available', // Fallback if missing
                    description: data.data.desc || 'No description available', // Fallback if missing
                    platform: 'Youtube',
                    type: 'video'
                }
            }
        });
    } catch (e) {
        console.error('Error fetching YouTube video data:', e);
        res.json(loghandler.error);
    }
});


// Route to get TikTok video download data
router.get('/audio/yt', async (req, res) => {
    const Apikey = req.query.apikey;
    const link = req.query.url; // The TikTok video link

    if (!Apikey) return res.json(loghandler.notparam);
    if (!listkey.includes(Apikey)) return res.json(loghandler.invalidKey);
    if (!link) return res.json({ status: false, message: "Please provide a YouTube short video link." });

    try {
        // Fetching TikTok video download data using tiktokdown function (assuming it's imported and used in your setup)
        const data = await ytdown(link);

        // Check if the response contains the necessary data
        if (!data || !data.status || !data.data) {
            return res.json({
                status: false,
                message: 'Unable to fetch YouTube short data. Please check the link or try again later.'
            });
        }

        // Respond with the structured data, including all available fields
        res.json({
            status: true,
            code: 200,
            creator: 'Qasim Ali 🦋', // Developer name
            result: {
                media: {
                    title: data.data.title || 'No title available', // Video title
                    thumbnail: data.data.thumb || 'https://via.placeholder.com/150?text=No+Image', // Fallback if missing
                    audio_url: data.data.audio || 'No audio URL available', // Fallback if missing
                    channel: data.data.channel || 'Channel not available', // Fallback if missing
                    description: data.data.desc || 'No description available', // Fallback if missing
                    platform: 'Youtube',
                    type: 'video'
                }
            }
        });
    } catch (e) {
        console.error('Error fetching YouTube short data:', e);
        res.json(loghandler.error);
    }
});



// Route to get Twitter video download data
router.get('/video/twitter', async (req, res) => {
    const Apikey = req.query.apikey;
    const link = req.query.url; // The Twitter video link

    if (!Apikey) return res.json(loghandler.notparam);
    if (!listkey.includes(Apikey)) return res.json(loghandler.invalidKey);
    if (!link) return res.json({ status: false, message: "Please provide a Twitter video link." });

    try {
        // Fetching Twitter video download data using twitterdown function
        const data = await twitterdown(link);

        // Check if the response contains the necessary data (e.g., video URLs)
        if (!data || !data.status || !data.data || !data.data.HD) {
            return res.json({
                status: false,
                message: 'Unable to fetch Twitter video data. Please check the link or try again later.'
            });
        }

        // Respond with the structured data
        res.json({
            status: true,
            code: 200,
            creator: 'Qasim Ali 🦋', // Developer name
            result: {
                media: {
                    title: 'Twitter Video', // You can include the title if available in the data
                    thumbnail: data.data.thumbnail || 'https://via.placeholder.com/150?text=No+Image', // Fallback thumbnail if missing
                    video_url_hd: data.data.HD || 'No HD video URL available', // HD video URL
                    video_url_sd: data.data.SD || 'No SD video URL available', // SD video URL
                    platform: 'Twitter',
                    type: 'video'
                }
            }
        });
    } catch (e) {
        console.error('Error fetching Twitter video data:', e);
        res.json(loghandler.error);
    }
});



// Route to get TikTok post data from a TikTok URL
router.get('/video/tiktok', async (req, res) => {
    const Apikey = req.query.apikey;
    const url = req.query.url; // The TikTok post URL

    if (!Apikey) return res.json(loghandler.notparam);
    if (!listkey.includes(Apikey)) return res.json(loghandler.invalidKey);
    if (!url) return res.json({ status: false, message: "Please provide a TikTok URL." });

    try {
        // Fetching TikTok post data using the tikdown function
        const data = await tikdown(url);

        // Check if the response is valid
        if (!data || !data.data || !data.data.video) {
            return res.json({
                status: false,
                message: 'Unable to fetch TikTok post data. Please check the TikTok URL or try again later.'
            });
        }

        // Extract relevant data from the response
        const videoData = data.data;

        // Respond with the structured data
        res.json({
            status: true,
            code: 200,
            creator: `${creator}`,
            result: {
                media: {
                    title: videoData.title || 'No title available', // Title might be empty
                    thumbnail: videoData.thumbnail || 'No Image', // Fallback for thumbnail
                    video_with_watermark: videoData.video || 'No video available', // URL for the video with watermark
                    video_without_watermark: videoData.video || 'No video available', // You can check if there's a version without watermark in the response if available
                    platform: 'TikTok',
                    type: 'video',
                    author: {
                        nickname: videoData.author.nickname || 'Unknown Author',
                        avatar: videoData.author.avatar || 'No Image'
                    },
                    view_count: videoData.view || 0,
                    comment_count: videoData.comment || 0,
                    share_count: videoData.share || 0,
                    play_count: videoData.play || 0,
                    download_count: videoData.download || 0,
                    duration: videoData.duration || 0
                }
            }
        });
    } catch (e) {
        console.error('Error fetching TikTok post data:', e);

        res.json(loghandler.error);
    }
});

router.get('/audio/tiktok', async (req, res) => {
    const Apikey = req.query.apikey;
    const url = req.query.url; // The TikTok post URL

    if (!Apikey) return res.json(loghandler.notparam);
    if (!listkey.includes(Apikey)) return res.json(loghandler.invalidKey);
    if (!url) return res.json({ status: false, message: "Please provide a TikTok URL." });

    try {
        // Log the URL for debugging
        console.log('Fetching TikTok data for URL:', url);

        // Fetching TikTok post data using the tikdown function
        const data = await tikdown(url);

        // Check if the response is valid
        if (!data || !data.data || !data.data.video) {
            return res.json({
                status: false,
                message: 'Unable to fetch TikTok post data. Please check the TikTok URL or try again later.'
            });
        }

        // Extract relevant data from the response
        const videoData = data.data;

        // Respond with the structured data
        res.json({
            status: true,
            code: 200,
            creator: `${creator}`,
            result: {
                media: {
                    title: videoData.title || 'No title available', // Title might be empty
                    thumbnail: videoData.thumbnail || 'No Image', // Fallback for thumbnail
                    audio: videoData.audio || 'No audio available', // Audio download link
                    platform: 'TikTok',
                    author: {
                        nickname: videoData.author.nickname || 'Unknown Author',
                        avatar: videoData.author.avatar || 'No Image'
                    },
                    play_count: videoData.play || 0,
                    download_count: videoData.download || 0,
                    duration: videoData.duration || 0
                }
            }
        });
    } catch (e) {
        console.error('Error fetching TikTok post data:', e);

        res.json(loghandler.error);
    }
});



// Route to get Facebook video download data
router.get('/video/fb', async (req, res) => {
    const Apikey = req.query.apikey;
    const link = req.query.url; // The Facebook video link

    if (!Apikey) return res.json(loghandler.notparam);
    if (!listkey.includes(Apikey)) return res.json(loghandler.invalidKey);
    if (!link) return res.json({ status: false, message: "Please provide a Facebook video link." });

    try {
        const key = "Nayan"; // The key to use with fbdown2 function
        // Fetching Facebook video download data using fbdown2 function
        const data = await fbdown2(link, key);

        // Check if the response contains the necessary data
        if (!data.status || data.status !== true) {
            return res.json({
                status: false,
                message: 'Unable to fetch Facebook video data. Please check the link or try again later.'
            });
        }

        // Respond with the structured data with fallbacks
        res.json({
            status: true,
            code: 200,
            creator: `${creator}`,
            result: {
                media: {
                    title: data.media.title || 'No title available',
                    thumbnail: data.media.thumbnail || 'https://via.placeholder.com/150?text=No+Image', // Fallback thumbnail if missing
                    video_url_hd: data.media.hd || 'No HD video URL available', // Fallback HD video URL if missing
                    video_url_sd: data.media.sd || 'No SD video URL available', // Fallback SD video URL if missing
                    platform: 'Facebook',
                    type: 'video'
                }
            }
        });
    } catch (e) {
        console.error('Error fetching Facebook video data:', e);
        res.json(loghandler.error);
    }
});

// Route to get Instagram video download data
router.get('/video/ig', async (req, res) => {
    const Apikey = req.query.apikey;
    const link = req.query.url; // The Instagram video link

    if (!Apikey) return res.json(loghandler.notparam);
    if (!listkey.includes(Apikey)) return res.json(loghandler.invalidKey);
    if (!link) return res.json({ status: false, message: "Please provide an Instagram video link." });

    try {
        // Fetching Instagram video download data using instagram function
        const data = await instagram(link);

        // Check if the response contains the necessary data
        if (!data || !data.status || !data.data || !data.data.video || !data.data.video[0]) {
            return res.json({
                status: false,
                message: 'Unable to fetch Instagram video data. Please check the link or try again later.'
            });
        }

        // Respond with the structured data with fallbacks
        res.json({
            status: true,
            code: 200,
            creator: 'Qasim Ali 🦋', // Developer name
            result: {
                media: {
                    title: data.data.title || 'No title available',
                    thumbnail: data.data.thumb && data.data.thumb[0] || 'https://via.placeholder.com/150?text=No+Image', // Fallback thumbnail if missing
                    video_url_hd: data.data.video[0] || 'No HD video URL available', // Video URL (HD)
                    platform: 'Instagram',
                    type: 'video',
                    images: data.data.images || [] // Including images field (empty array if not available)
                }
            }
        });
    } catch (e) {
        console.error('Error fetching Instagram video data:', e);
        res.json(loghandler.error);
    }
});




router.get('/post/capcut', async (req, res) => {
    const Apikey = req.query.apikey;
    const url = req.query.url; // The CapCut post URL

    if (!Apikey) return res.json(loghandler.notparam);
    if (!listkey.includes(Apikey)) return res.json(loghandler.invalidKey);
    if (!url) return res.json({ status: false, message: "Please provide a CapCut URL." });

    try {
        // Log the URL for debugging
        console.log('Fetching CapCut data for URL:', url);

        // Fetching CapCut post data using the capcut function
        const data = await capcut(url);

        // Log the API response to console for debugging
        console.log('API Response from CapCut:', data);

        // Respond with the structured data, ensuring fallbacks for missing fields
        res.json({
            status: true,
            code: 200,
            creator: `${creator}`,
            result: {
                media: {
                    title: data.data.title || 'No title available',
                    description: data.data.description || 'No description available',
                    usage: data.data.usage || 'No usage information available',
                    thumbnail: data.data.thumbnail || 'https://via.placeholder.com/150?text=No+Image',
                    video_url: data.data.video || 'No video URL available',
                    authorPic: data.data.authorPic || 'https://via.placeholder.com/150?text=No+Image',
                    platform: data.platform || 'CapCut',
                    type: 'video'
                }
            }
        });
    } catch (e) {
        console.error('Error fetching CapCut post data:', e);

        res.json(loghandler.error);
    }
});




// Route to get Likee post data from a Likee URL
router.get('/video/likee', async (req, res) => {
    const Apikey = req.query.apikey;
    const url = req.query.url; // The Likee URL

    if (!Apikey) return res.json(loghandler.notparam);
    if (!listkey.includes(Apikey)) return res.json(loghandler.invalidKey);
    if (!url) return res.json({ status: false, message: "Please provide a Likee URL." });

    try {
        // Fetching Likee post data using the likee function
        const data = await likee(url);

        // Check if the status is successful (status 200 or any other code you want to check)
        if (data.status !== 200) {
            return res.json({
                status: false,
                message: 'Unable to fetch Likee post data. Please check the Likee URL or try again later.'
            });
        }

        // Respond with the structured data with fallbacks
        res.json({
            status: true,
            code: 200,
            creator: `${creator}`,
            result: {
                media: {
                    title: data.data.title || 'No title available',
                    thumbnail: data.data.thumbnail || 'No Image', // Fallback image if thumbnail is missing
                    with_watermark: data.data.withWatermark || 'No video with watermark available', // Fallback link if video with watermark is missing
                    without_watermark: data.data.withoutwatermark || 'No video without watermark available', // Fallback link if video without watermark is missing
                    platform: data.platform || 'Likee',
                    type: 'video'
                }
            }
        });
    } catch (e) {
        console.error('Error fetching Likee post data:', e);
        res.json(loghandler.error);
    }
});


// Route to get Threads post data from a Threads URL
router.get('/video/threads', async (req, res) => {
    const Apikey = req.query.apikey;
    const url = req.query.url; // The Threads URL

    if (!Apikey) return res.json(loghandler.notparam);
    if (!listkey.includes(Apikey)) return res.json(loghandler.invalidKey);
    if (!url) return res.json({ status: false, message: "Please provide a Threads URL." });

    try {
        // Fetching Threads post data using the threads function
        const data = await threads(url);
        
        // Check if the status is 200 (successful)
        if (data.status !== 200) {
            return res.json({
                status: false,
                message: 'Unable to fetch Threads post data. Please check the Threads URL or try again later.'
            });
        }

        // Respond with the structured data with fallbacks
        res.json({
            status: true,
            code: 200,
            creator: `${creator}`,
            result: {
                media: {
                    title: data.data.title || 'No title available',
                    video_url: data.data.video || 'No video URL available',
                    platform: data.platform || 'Threads',
                    type: 'video'
                }
            }
        });
    } catch (e) {
        console.error('Error fetching Threads post data:', e);
        res.json(loghandler.error);
    }
});


// Route to get Pinterest post data from a Pinterest URL
router.get('/video/pinterest', async (req, res) => {
    const Apikey = req.query.apikey;
    const url = req.query.url; // The Pinterest post URL

    if (!Apikey) return res.json(loghandler.notparam);
    if (!listkey.includes(Apikey)) return res.json(loghandler.invalidKey);
    if (!url) return res.json({ status: false, message: "Please provide a Pinterest URL." });

    try {
        // Fetching Pinterest post data using the pintarest function
        const data = await pintarest(url);

        // Check if the data is successfully fetched
        if (!data.status) {
            return res.json({
                status: false,
                message: 'Unable to fetch Pinterest post data. Please check the Pinterest URL.'
            });
        }

        // Respond with the structured data with fallbacks
        res.json({
            status: true,
            code: 200,
            creator: `${creator}`,
            result: {
                media: {
                    title: data.title || 'No title available',
                    url: data.url || 'No video URL available',
                    thumbnail: data.thumbnail || 'https://via.placeholder.com/150?text=No+Image', // Fallback image
                    platform: data.platform || 'Unknown Platform',
                    type: data.type || 'Unknown Type'
                }
            }
        });
    } catch (e) {
        console.error('Error fetching Pinterest post data:', e);
        res.json(loghandler.error);
    }
});



// Route to get video data from a public Google Drive URL
router.get('/video/gdrive', async (req, res) => {
    const Apikey = req.query.apikey;
    const url = req.query.url; // The Google Drive URL

    if (!Apikey) return res.json(loghandler.notparam);
    if (!listkey.includes(Apikey)) return res.json(loghandler.invalidKey);
    if (!url) return res.json({ status: false, message: "Please provide a Google Drive URL." });

    try {
        // Fetching video data from Google Drive using the nayan-videos-downloader package
        const data = await GDLink(url);

        // Check if the data is successfully fetched
        if (!data.status) {
            return res.json({
                status: false,
                message: 'Unable to fetch video data. Please check the Google Drive link.'
            });
        }

        // Respond with the structured data with fallbacks
        res.json({
            status: true,
            code: 200,
            creator: `${creator}`,
            result: {
               data: data.data
            }
        });
    } catch (e) {
        console.error('Error fetching Google Drive video data:', e);
        res.json(loghandler.error);
    }
});


router.get('/search/courses', async (req, res) => {
  const apikey = req.query.apikey;  // Retrieve the API key from the query string

  if (!apikey) {
    return res.json({ status: false, message: 'API key is missing' });
  }

  // Example API key validation (replace `listkey` with your actual list of valid keys)
  if (!listkey.includes(apikey)) {
    return res.json({ status: false, message: 'Invalid API key' });
  }

  try {
    // Fetch courses from the EduScout API
    let response = await fetch('https://eduscout.vercel.app/api/courses');
    
    if (!response.ok) {
      throw new Error('Failed to fetch courses');
    }

    let json = await response.json();

    // Return the selected courses as JSON response
    return res.json({
      status: true,
      creator: 'Qasim Ali🦋',
      json
    });

  } catch (error) {
    console.error('Error:', error);
    return res.json({ status: false, message: 'Error fetching courses' });
  }
});

router.get('/short/bitly', async (req, res) => {
  const url = req.query.url;
  const apikey = req.query.apikey;
  
  if (!url) {
    return res.json({ status: false, message: 'URL is required' });
  }

  if (!apikey) {
    return res.json({ status: false, message: 'API key is missing' });
  }

  // Example API key validation (replace `listkey` with your actual list of valid keys)
  if (!listkey.includes(apikey)) {
    return res.json({ status: false, message: 'Invalid API key' });
  }

  try {
    const response = await fetch('https://api-ssl.bitly.com/v4/shorten', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer 7e22401ef9e6777813e43a52dfef0ade98c6d3f9', // Replace with your actual token
      },
      body: JSON.stringify({
        long_url: url,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      return res.json({
        status: true,
        creator: 'Qasim Ali🦋',
        shortened_url: data.link,
      });
    } else {
      return res.json({
        status: false,
        message: 'Error shortening the URL',
      });
    }
  } catch (error) {
    console.error('Error:', error);
    return res.json({
      status: false,
      message: 'An error occurred while shortening the URL',
    });
  }
});


router.get('/search/reddit', async (req, res) => {
  const subreddit = req.query.name;  // Retrieve the subreddit name from the query string
  const apikey = req.query.apikey;  // Retrieve the API key from the query string
  
  if (!subreddit) {
    return res.json({ status: false, message: 'Please provide a subreddit name.' });
  }

  if (!apikey) {
    return res.json({ status: false, message: 'API key is missing.' });
  }

  // Example API key validation (replace `listkey` with your actual list of valid keys)
  if (!listkey.includes(apikey)) {
    return res.json({ status: false, message: 'Invalid API key' });
  }

  try {
    // Fetch subreddit information from the API
    let res = await fetch(`https://api.popcat.xyz/subreddit/${encodeURIComponent(subreddit)}`);

    if (!res.ok) {
      throw new Error(`API request failed with status ${res.status}`);
    }

    let json = await res.json();
    console.log('JSON response:', json);

    let subredditInfo = {
      name: json.name,
      title: json.title,
      active_users: json.active_users,
      members: json.members,
      description: json.description,
      allow_videos: json.allow_videos ? 'Yes' : 'No',
      allow_images: json.allow_images ? 'Yes' : 'No',
      over_18: json.over_18 ? 'Yes' : 'No',
      url: json.url
    };

    // If there's an icon, return it along with the info
    if (json.icon) {
      return res.json({
        status: true,
        creator: 'Qasim Ali🦋',
        data: {
          subredditInfo,
          icon: json.icon
        }
      });
    } else {
      return res.json({
        status: true,
        message: 'Subreddit information fetched successfully',
        data: { subredditInfo }
      });
    }

  } catch (error) {
    console.error(error);
    return res.json({ status: false, message: 'Error fetching subreddit information', error: error.message });
  }
});

router.get('/image/quote', async (req, res) => {
  const text = req.query.text || ''; // Retrieve the text from the query string
  const text2 = req.query.text2 || '';
  const apikey = req.query.apikey;  // Retrieve the API key from the query string
  
  if (!text) {
    return res.json({ status: false, message: 'Please provide text for the quote.' });
  }

  if (!apikey) {
    return res.json({ status: false, message: 'API key is missing' });
  }

  // Example API key validation (replace `listkey` with your actual list of valid keys)
  if (!listkey.includes(apikey)) {
    return res.json({ status: false, message: 'Invalid API key' });
  }

  try {
    // Create the quote image using the provided text
    let quoteImageUrl = await createQuote(text2, text);

    // Fetch the image from the generated quote image URL
    let response = await fetch(quoteImageUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch the quote image.');
    }

    let imageBuffer = await response.buffer();

    // Set the appropriate headers for image content
    res.set('Content-Type', 'image/png');  // or change this based on the actual image format

    // Send the image buffer directly in the response
    return res.send(imageBuffer);

  } catch (error) {
    console.error('Error creating quote:', error);
    return res.json({ status: false, message: 'An error occurred while creating the quote.', error: error.message });
  }
});

// Helper function to create the quote image
async function createQuote(author, message) {
  const host = 'https://quozio.com/';
  let path = '';

  try {
    // Submit the quote
    path = 'api/v1/quotes';
    const body = JSON.stringify({
      author: author,
      quote: message,
    });

    const quote = await fetch(host + path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
    }).then((val) => val.json());

    console.log('Created quote at: ' + quote['url'], 'quote');
    const quoteId = quote['quoteId'];

    // Fetch the templates
    path = 'api/v1/templates';
    const templates = await fetch(host + path)
      .then((val) => val.json())
      .then((val) => val['data']);

    const index = Math.floor(Math.random() * templates.length);
    console.log('Chose template from: ' + templates[index]['url'], 'quote');
    const templateId = templates[index]['templateId'];

    // Apply the template to the quote
    path = `api/v1/quotes/${quoteId}/imageUrls?templateId=${templateId}`;
    const imageUrl = await fetch(host + path)
      .then((val) => val.json())
      .then((val) => val['medium']);
    console.log('Created quote image at: ' + imageUrl, 'quote');

    // Return the generated image URL
    return imageUrl;

  } catch (error) {
    console.error('Error in creating quote:', error);
    throw 'There was an issue with creating the quote.';
  }
}



router.get('/tech/news', async (req, res) => {
  const apikey = req.query.apikey;  // Retrieve the API key from the query string

  if (!apikey) {
    return res.json({ status: false, message: 'API key is missing' });
  }

  // Example API key validation (replace `listkey` with your actual list of valid keys)
  if (!listkey.includes(apikey)) {
    return res.json({ status: false, message: 'Invalid API key' });
  }

  try {
    // Fetch tech news from the API
    let response = await fetch('https://fantox001-scrappy-api.vercel.app/technews/random');
    
    if (!response.ok) throw await response.text();

    let json = await response.json();

    if (!json.news) throw new Error('No news available.');

    let techNews = `
    creator: 'Qasim Ali🦋',
    News: ${json.news}
    `;

    // Check if there is a thumbnail and return the news along with it
    if (json.thumbnail) {
      return res.json({
        status: true,
        message: techNews,
        thumbnailUrl: json.thumbnail
      });
    } else {
      return res.json({
        status: true,
        message: techNews
      });
    }

  } catch (error) {
    console.error('Error:', error);
    return res.json({ status: false, message: 'Error fetching tech news' });
  }
});


router.get('/image/code', async (req, res) => {
  const codeText = req.query.code;  // Retrieve the code from the query string
  const apikey = req.query.apikey;  // Retrieve the API key from the query string
  
  if (!codeText) {
    return res.json({ status: false, message: 'Please provide some text to generate the code image.' });
  }

  if (!apikey) {
    return res.json({ status: false, message: 'API key is missing' });
  }

  // Example API key validation (replace `listkey` with your actual list of valid keys)
  if (!listkey.includes(apikey)) {
    return res.json({ status: false, message: 'Invalid API key' });
  }

  try {
    // Generate the code image using the Carbonara API
    let response = await fetch('https://carbonara.solopov.dev/api/cook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: codeText,
        backgroundColor: '#1F816D',  // You can customize the background color here
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate the code image.');
    }

    // Get the image buffer from the response
    let imageBuffer = await response.buffer();

    // Set the appropriate headers for image content
    res.set('Content-Type', 'image/png');  // or change this based on the actual image format

    // Send the image buffer directly in the response
    return res.send(imageBuffer);

  } catch (error) {
    console.error(error);
    return res.json({ status: false, message: 'An error occurred while generating the code image.', error: error.message });
  }
});



router.get('/tools/define', async (req, res) => {
  const word = req.query.word;  // Retrieve the word from the query string
  const apikey = req.query.apikey;  // Retrieve the API key from the query string
  
  if (!word) {
    return res.json({ status: false, message: 'Please provide a word to search for.' });
  }

  if (!apikey) {
    return res.json({ status: false, message: 'API key is missing' });
  }

  // Example API key validation (replace `listkey` with your actual list of valid keys)
  if (!listkey.includes(apikey)) {
    return res.json({ status: false, message: 'Invalid API key' });
  }

  try {
    const url = `https://api.urbandictionary.com/v0/define?term=${encodeURIComponent(word)}`;
    const response = await fetch(url);
    const json = await response.json();

    if (!response.ok) {
      throw new Error(`An error occurred: ${json.message}`);
    }

    if (!json.list.length) {
      return res.json({ status: false, message: 'Word not found in the dictionary.' });
    }

    const firstEntry = json.list[0];
    const definition = firstEntry.definition;
    const example = firstEntry.example ? `Example: ${firstEntry.example}` : '';

    const result = {
      word: word,
      definition: definition,
      example: example
    };

    // Send the JSON response with word definition
    return res.json({
      status: true,
      creator: 'Qasim Ali🦋',
      data: result
    });

  } catch (error) {
    return res.json({ status: false, message: 'Error fetching word definition', error: error.message });
  }
});


router.get('/search/itunes', async (req, res) => {
  const song = req.query.name;  // Retrieve the song name from the query string
  const apikey = req.query.apikey;  // Retrieve the API key from the query string
  
  if (!song) {
    return res.json({ status: false, message: 'Please provide a song name' });
  }

  if (!apikey) {
    return res.json({ status: false, message: 'API key is missing' });
  }

  // Example API key validation (replace `listkey` with your actual list of valid keys)
  if (!listkey.includes(apikey)) {
    return res.json({ status: false, message: 'Invalid API key' });
  }

  try {
    // Fetch song data from the Popcat API
    let response = await fetch(`https://api.popcat.xyz/itunes?q=${encodeURIComponent(song)}`);

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    let json = await response.json();

    // Structure the song information
    let songInfo = {
      name: json.name,
      artist: json.artist,
      album: json.album,
      releaseDate: json.release_date,
      price: json.price,
      length: json.length,
      genre: json.genre,
      url: json.url
    };

    // Check if thumbnail is present, and include it in the response if available
    if (json.thumbnail) {
      songInfo.thumbnail = json.thumbnail;
    }

    // Send the JSON response with song details
    return res.json({
      status: true,
      creator: "Qasim Ali 🦋",  // Creator name
      data: songInfo
    });

  } catch (error) {
    return res.json({ status: false, message: 'Error fetching song data', error: error.message });
  }
});


router.get('/info/movie', async (req, res) => {
  const title = req.query.title;  // Retrieve the movie title from the query string
  const Apikey = req.query.apikey;

  // Check if the API key is valid
  if (!Apikey) return res.json(loghandler.notparam);
  if (!listkey.includes(Apikey)) return res.json(loghandler.invalidKey);
  
  
  if (!title) {
    return res.json({ status: false, message: 'Please provide a movie title' });
  }

  try {
    // Fetch movie data from the Popcat API
    let response = await fetch(`https://api.popcat.xyz/imdb?q=${encodeURIComponent(title)}`);

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    let json = await response.json();

    // Handle the ratings if available
    let ratings = json.ratings ? json.ratings.map(rating => `• *${rating.source}:* ${rating.value}`).join('\n') : 'No ratings available';

    // Structure the movie information
    let movieInfo = {
      title: json.title,
      year: json.year,
      seasons: json.totalseasons,
      rated: json.rated,
      released: json.released,
      runtime: json.runtime,
      genres: json.genres,
      director: json.director,
      writer: json.writer,
      actors: json.actors,
      plot: json.plot,
      languages: json.languages,
      country: json.country,
      awards: json.awards,
      metascore: json.metascore,
      rating: json.rating,
      votes: json.votes,
      imdbid: json.imdbid,
      type: json.type,
      dvd: json.dvd,
      boxoffice: json.boxoffice,
      production: json.production,
      website: json.website,
      ratings: ratings
    };

    // Send the JSON response with movie details
    return res.json({
      status: true,
      creator: "Qasim Ali 🦋",  // Creator name
      data: movieInfo
    });

  } catch (error) {
    return res.json({ status: false, message: 'Error fetching movie data', error: error.message });
  }
});


// Your route
router.get('/generate/qr', async (req, res) => {
  const text = req.query.text;  // Get the text parameter from the query string
  const apikey = req.query.apikey;  // Get the API key from the query string

  if (!text) {
    return res.json({ status: false, message: "Text parameter is required" });
  }

  if (!apikey) {
    return res.json({ status: false, message: "API key is missing" });
  }

  // Example API key validation (replace `listkey` with your actual list of valid keys)
  if (!listkey.includes(apikey)) {
    return res.json({ status: false, message: "Invalid API key" });
  }

  try {
    // Generate QR code image as a buffer
    QRCode.toBuffer(text, async (err, buffer) => {
      if (err) {
        return res.json({ status: false, message: "Error generating QR code", error: err });
      }

      // Set the appropriate headers for image content (QR code is usually a PNG)
      res.set('Content-Type', 'image/png');  // or adjust if it's a different format

      // Send the QR code image buffer directly in the response
      return res.send(buffer);
    });
  } catch (error) {
    return res.json({ status: false, message: "Error occurred", error: error.message });
  }
});




const client = new Anime();  // Initialize the Anime client

// Define the route
router.get('/anime/info', async (req, res) => {
  const query = req.query.query;  // Get the text parameter from the query string
  const apikey = req.query.apikey;  // Get the API key from the query string
  
  if (!query) return res.json({ status: false, message: "Please enter the name of an anime to search for." });
  if (!apikey) return res.json({ status: false, message: "API key is missing." });

  if (listkey.includes(apikey)) {  // Check if the provided API key is valid
    try {
      // Search for the anime using the client
      const anime = await client.searchAnime(query);
      const result = anime.data[0];  // Assuming the first result is what you want

      // Translate background and synopsis
      const translatedBackground = await translate(result.background, { to: 'en', autoCorrect: true });
      const translatedSynopsis = await translate(result.synopsis, { to: 'hi', autoCorrect: true });

      // Format the anime info
      const animeInfo = {
        status: true,
        creator: "Qasim Ali 🦋",  // You can set your fixed creator here
        result: {
          title: result.title,
          format: result.type,
          status: result.status.toUpperCase().replace(/\_/g, ' '),
          episodes: result.episodes,
          duration: result.duration,
          source: result.source.toUpperCase(),
          aired: result.aired,
          popularity: result.popularity,
          favorites: result.favorites,
          rating: result.rating,
          rank: result.rank,
          trailer: result.trailer.url,
          url: result.url,
          background: translatedBackground.text,
          image_url: result.images.jpg.image_url,  // Return the image URL
        },
      };

      // Send the response
      res.json(animeInfo);
    } catch (error) {
      console.error('Error fetching anime info:', error);
      res.json({ status: false, message: "Error fetching data, please try again." });
    }
  } else {
    res.json({ status: false, message: "Invalid API key." });
  }
});



// Import the functions you exported earlier
const { pinterest, wallpaper, wikimedia, quotesAnime, happymod, umma, ringtone, styletext } = require('./../lib/utils/moretools');

// Pinterest route
router.get('/image/pinterest', async (req, res) => {
  const query = req.query.query;
  const apikey = req.query.apikey;

  if (!query) return res.json(loghandler.notquery);
  if (!apikey) return res.json(loghandler.notparam);

  if (listkey.includes(apikey)) {
    try {
      const images = await pinterest(query);
      res.json({ status: true, creator: 'Qasim Ali 🦋', result: images });
    } catch (error) {
      console.error('Error fetching Pinterest images:', error);
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});

// Wallpaper route
router.get('/download/wallpaper', async (req, res) => {
  const title = req.query.title;
  const apikey = req.query.apikey;

  if (!title) return res.json(loghandler.notquery);
  if (!apikey) return res.json(loghandler.notparam);

  if (listkey.includes(apikey)) {
    try {
      const wallpapers = await wallpaper(title);
      res.json({ status: true, creator: 'Qasim Ali 🦋', result: wallpapers });
    } catch (error) {
      console.error('Error fetching wallpapers:', error);
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});

// Wikimedia route
router.get('/image/wikimedia', async (req, res) => {
  const title = req.query.title;
  const apikey = req.query.apikey;

  if (!title) return res.json(loghandler.notquery);
  if (!apikey) return res.json(loghandler.notparam);

  if (listkey.includes(apikey)) {
    try {
      const images = await wikimedia(title);
      res.json({ status: true, creator: 'Qasim Ali 🦋', result: images });
    } catch (error) {
      console.error('Error fetching Wikimedia images:', error);
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});

// Anime quotes route
router.get('/quotes/anime', async (req, res) => {
  const apikey = req.query.apikey;

  if (!apikey) return res.json(loghandler.notparam);

  if (listkey.includes(apikey)) {
    try {
      const quotes = await quotesAnime();
      res.json({ status: true, creator: 'Qasim Ali 🦋', result: quotes });
    } catch (error) {
      console.error('Error fetching anime quotes:', error);
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});

// HappyMod route
router.get('/apk/happymod', async (req, res) => {
  const query = req.query.query;
  const apikey = req.query.apikey;

  if (!query) return res.json(loghandler.notquery);
  if (!apikey) return res.json(loghandler.notparam);

  if (listkey.includes(apikey)) {
    try {
      const mods = await happymod(query);
      res.json({ status: true, creator: 'Qasim Ali 🦋', result: mods });
    } catch (error) {
      console.error('Error fetching HappyMod APKs:', error);
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});

// Umma route
router.get('/media/umma', async (req, res) => {
  const url = req.query.url;
  const apikey = req.query.apikey;

  if (!url) return res.json(loghandler.noturl);
  if (!apikey) return res.json(loghandler.notparam);

  if (listkey.includes(apikey)) {
    try {
      const media = await umma(url);
      res.json({ status: true, creator: 'Qasim Ali 🦋', result: media });
    } catch (error) {
      console.error('Error fetching media from Umma:', error);
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});

// Ringtone route
router.get('/download/ringtone', async (req, res) => {
  const title = req.query.title;
  const apikey = req.query.apikey;

  if (!title) return res.json(loghandler.notquery);
  if (!apikey) return res.json(loghandler.notparam);

  if (listkey.includes(apikey)) {
    try {
      const ringtones = await ringtone(title);
      res.json({ status: true, creator: 'Qasim Ali 🦋', result: ringtones });
    } catch (error) {
      console.error('Error fetching ringtones:', error);
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});

// Styletext route
router.get('/text/style', async (req, res) => {
  const teks = req.query.teks;
  const apikey = req.query.apikey;

  if (!teks) return res.json(loghandler.notquery);
  if (!apikey) return res.json(loghandler.notparam);

  if (listkey.includes(apikey)) {
    try {
      const styledText = await styletext(teks);
      res.json({ status: true, creator: 'Qasim Ali 🦋', result: styledText });
    } catch (error) {
      console.error('Error styling text:', error);
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});

router.get('/music/joox', async (req, res, next) => {
  const query = req.query.query;
  const apikey = req.query.apikey;

  if (!query) return res.json(loghandler.notquery);
  if (!apikey) return res.json(loghandler.notparam);

  if (listkey.includes(apikey)) {
    try {
      const result = await Joox(query);
      res.json(result);
    } catch (error) {
      console.error('Error fetching Joox data:', error);
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});

router.get('/music/spotify', async (req, res, next) => {
  const apikey = req.query.apikey;
  const query = req.query.query;
  
  if (!apikey) return res.json(loghandler.notparam);
  if (!query) return res.json(loghandler.notquery);
  
  if (listkey.includes(apikey)) {
    try {
      const response = await fetch(encodeURI(`https://global-tech-api.vercel.app/spotifysearch?query=${query}`));
      const hasil = await response.json();
      res.json({
        status: true,
        creator: `${creator}`,
        result: hasil.data
      });
    } catch (e) {
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});

router.get('/civit/models', async (req, res) => {
  const text = req.query.text;  // Retrieve the 'text' parameter from the query string
  const apikey = req.query.apikey;  // Retrieve the 'apikey' from the query string

  // Check if the API key is provided
  if (!apikey) {
    return res.json({
      status: false,
      message: "API key is missing."
    });
  }

  // Check if the 'text' parameter (prompt) is provided
  if (!text) {
    return res.json({
      status: false,
      message: "Please provide a search query (text) to filter models."
    });
  }
  // Example API key validation (replace `listkey` with your actual list of valid keys)
  if (!listkey.includes(apikey)) {
    return res.json({ status: false, message: 'Invalid API key' });
  }

  try {
    // Construct the URL with query parameters
    const url = `https://civitai.com/api/v1/models?query=${encodeURIComponent(text)}`;

    // Fetch data from CivitAI API
    const response = await fetch(url);

    // Check if the response is a valid JSON
    const contentType = response.headers.get("content-type");
    
    if (!contentType || !contentType.includes("application/json")) {
      const textResponse = await response.text();  // If it's not JSON, get the raw text
      return res.json({
        status: false,
        message: "Invalid JSON response from API, received HTML instead.",
        error: textResponse
      });
    }

    // Parse the JSON response
    const data = await response.json();

    // If there's an error or message field in the response, handle it
    if (data.message && data.error) {
      return res.json({
        status: false,
        message: data.message,
        error: data.error
      });
    }

    // Remove metadata and return only the relevant data
    const result = {
      status: true,
      creator: "Qasim Ali 🦋",  // You can use your own name here
      result: data.items,  // Only the models data from CivitAI API
      link: "https://whatsapp.com/channel/0029VagJIAr3bbVBCpEkAM07"  // Example link
    };

    // Send the cleaned response data as JSON
    res.json(result);

  } catch (e) {
    // Handle any errors that occur during the fetch or response handling
    console.error(e);
    res.json({
      status: false,
      message: "An error occurred while fetching the data.",
      error: e.message
    });
  }
});


router.get('/civit/creators', async (req, res) => {
  const text = req.query.text;  // Retrieve the 'text' parameter from the query string
  const apikey = req.query.apikey;  // Retrieve the 'apikey' from the query string

  // Check if the API key is provided
  if (!apikey) {
    return res.json({
      status: false,
      message: "API key is missing."
    });
  }

  // Check if the 'text' parameter (prompt) is provided
  if (!text) {
    return res.json({
      status: false,
      message: "Please provide a search query (text) to filter models."
    });
  }
  // Example API key validation (replace `listkey` with your actual list of valid keys)
  if (!listkey.includes(apikey)) {
    return res.json({ status: false, message: 'Invalid API key' });
  }

  try {
    // Construct the URL with query parameters
    const url = `https://civitai.com/api/v1/creators?query=${encodeURIComponent(text)}`;

    // Fetch data from CivitAI API
    const response = await fetch(url);

    // Check if the response is a valid JSON
    const contentType = response.headers.get("content-type");
    
    if (!contentType || !contentType.includes("application/json")) {
      const textResponse = await response.text();  // If it's not JSON, get the raw text
      return res.json({
        status: false,
        message: "Invalid JSON response from API, received HTML instead.",
        error: textResponse
      });
    }

    // Parse the JSON response
    const data = await response.json();

    // If there's an error or message field in the response, handle it
    if (data.message && data.error) {
      return res.json({
        status: false,
        message: data.message,
        error: data.error
      });
    }

    // Remove metadata and return only the relevant data
    const result = {
      status: true,
      creator: "Qasim Ali 🦋",  // You can use your own name here
      result: data.items,  // Only the models data from CivitAI API
      link: "https://whatsapp.com/channel/0029VagJIAr3bbVBCpEkAM07"  // Example link
    };

    // Send the cleaned response data as JSON
    res.json(result);

  } catch (e) {
    // Handle any errors that occur during the fetch or response handling
    console.error(e);
    res.json({
      status: false,
      message: "An error occurred while fetching the data.",
      error: e.message
    });
  }
});

router.get('/civit/images', async (req, res) => {
  const text = req.query.text;  // Retrieve the 'text' parameter from the query string
  const apikey = req.query.apikey;  // Retrieve the 'apikey' from the query string

  // Check if the API key is provided
  if (!apikey) {
    return res.json({
      status: false,
      message: "API key is missing."
    });
  }

  // Check if the 'text' parameter (prompt) is provided
  if (!text) {
    return res.json({
      status: false,
      message: "Please provide a search query (text) to filter models."
    });
  }
  // Example API key validation (replace `listkey` with your actual list of valid keys)
  if (!listkey.includes(apikey)) {
    return res.json({ status: false, message: 'Invalid API key' });
  }

  try {
    // Construct the URL with query parameters
    const url = `https://civitai.com/api/v1/images?query=${encodeURIComponent(text)}`;

    // Fetch data from CivitAI API
    const response = await fetch(url);

    // Check if the response is a valid JSON
    const contentType = response.headers.get("content-type");
    
    if (!contentType || !contentType.includes("application/json")) {
      const textResponse = await response.text();  // If it's not JSON, get the raw text
      return res.json({
        status: false,
        message: "Invalid JSON response from API, received HTML instead.",
        error: textResponse
      });
    }

    // Parse the JSON response
    const data = await response.json();

    // If there's an error or message field in the response, handle it
    if (data.message && data.error) {
      return res.json({
        status: false,
        message: data.message,
        error: data.error
      });
    }

    // Remove metadata and return only the relevant data
    const result = {
      status: true,
      creator: "Qasim Ali 🦋",  // You can use your own name here
      result: data.items,  // Only the models data from CivitAI API
      link: "https://whatsapp.com/channel/0029VagJIAr3bbVBCpEkAM07"  // Example link
    };

    // Send the cleaned response data as JSON
    res.json(result);

  } catch (e) {
    // Handle any errors that occur during the fetch or response handling
    console.error(e);
    res.json({
      status: false,
      message: "An error occurred while fetching the data.",
      error: e.message
    });
  }
});

router.get('/civit/tags', async (req, res) => {
  const text = req.query.text;  // Retrieve the 'text' parameter from the query string
  const apikey = req.query.apikey;  // Retrieve the 'apikey' from the query string

  // Check if the API key is provided
  if (!apikey) {
    return res.json({
      status: false,
      message: "API key is missing."
    });
  }

  // Check if the 'text' parameter (prompt) is provided
  if (!text) {
    return res.json({
      status: false,
      message: "Please provide a search query (text) to filter models."
    });
  }
  // Example API key validation (replace `listkey` with your actual list of valid keys)
  if (!listkey.includes(apikey)) {
    return res.json({ status: false, message: 'Invalid API key' });
  }

  try {
    // Construct the URL with query parameters
    const url = `https://civitai.com/api/v1/tags?query=${encodeURIComponent(text)}`;

    // Fetch data from CivitAI API
    const response = await fetch(url);

    // Check if the response is a valid JSON
    const contentType = response.headers.get("content-type");
    
    if (!contentType || !contentType.includes("application/json")) {
      const textResponse = await response.text();  // If it's not JSON, get the raw text
      return res.json({
        status: false,
        message: "Invalid JSON response from API, received HTML instead.",
        error: textResponse
      });
    }

    // Parse the JSON response
    const data = await response.json();

    // If there's an error or message field in the response, handle it
    if (data.message && data.error) {
      return res.json({
        status: false,
        message: data.message,
        error: data.error
      });
    }

    // Remove metadata and return only the relevant data
    const result = {
      status: true,
      creator: "Qasim Ali 🦋",  // You can use your own name here
      result: data.items,  // Only the models data from CivitAI API
      link: "https://whatsapp.com/channel/0029VagJIAr3bbVBCpEkAM07"  // Example link
    };

    // Send the cleaned response data as JSON
    res.json(result);

  } catch (e) {
    // Handle any errors that occur during the fetch or response handling
    console.error(e);
    res.json({
      status: false,
      message: "An error occurred while fetching the data.",
      error: e.message
    });
  }
});


router.get('/lexica', async (req, res) => {
  const prompt = req.query.prompt;  // Retrieve the 'prompt' parameter from the query string
  const apikey = req.query.apikey;  // Retrieve the 'apikey' from the query string

  // Check if the API key is provided
  if (!apikey) {
    return res.json({
      status: false,
      message: "API key is missing."
    });
  }

  // Check if the 'prompt' parameter is provided
  if (!prompt) {
    return res.json({
      status: false,
      message: "Please provide a prompt."
    });
  }

  // Example API key validation (replace `listkey` with your actual list of valid keys)
  if (!listkey.includes(apikey)) {
    return res.json({ status: false, message: 'Invalid API key' });
  }

  try {
    // Fetch data from Lexica API
    const response = await fetch('https://lexica.art/api/v1/search?q=' + encodeURIComponent(prompt));

    // Log the response status and headers for debugging
    console.log('Lexica API response status:', response.status);
    console.log('Lexica API response headers:', response.headers);

    // Check if the response status is OK (status code 200)
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Check if the content-type is application/json
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("Expected JSON response, but got " + contentType);
    }

    // Parse the JSON response
    const data = await response.json();

    // Log the raw response data for debugging
    console.log('Lexica API response data:', data);

    // Check if there are images in the response
    if (!data.images || data.images.length === 0) {
      return res.json({
        status: false,
        message: "No images found for the given prompt."
      });
    }

    // Prepare the response with additional fields like status and creator
    const result = {
      status: true,
      creator: "Qasim Ali 🦋",  // You can use your own name here
      result: data,  // Full response from Lexica API
      additionalInfo: "Generated by Lexica",
      link: "https://whatsapp.com/channel/0029VagJIAr3bbVBCpEkAM07"
    };

    // Send the full response data as JSON
    res.json(result);

  } catch (e) {
    // Log the error for debugging
    console.error('Error fetching from Lexica:', e);

    // Send an error response with the error message
    res.json({
      status: false,
      message: "An error occurred while fetching the data.",
      error: e.message
    });
  }
});



router.get('/llama', async (req, res, next) => {
  const apikey = req.query.apikey;
  const question = req.query.question;
  
  // Validate API key and prompt
  if (!apikey) return res.json(loghandler.notparam);
  if (!question) return res.json(loghandler.notquery);
  
  // Check if API key is valid
  if (listkey.includes(apikey)) {
    try {
      // Fetch data from the API
      const response = await fetch(encodeURI(`https://api.gurusensei.workers.dev/llama?prompt=${question}`));

      // Check if the response is okay (status code 200)
      if (!response.ok) {
        return res.json({ status: false, message: "Failed to fetch from the API." });
      }

      // Check the Content-Type of the response
      const contentType = response.headers.get('Content-Type');

      let result;
      if (contentType && contentType.includes('application/json')) {
        // If the response is JSON, parse it
        result = await response.json();

        // Recursively remove the creator field from the result object and nested objects
        function removeCreator(obj) {
          // If the object is an array, iterate over each element
          if (Array.isArray(obj)) {
            obj.forEach(removeCreator);
          } else if (obj && typeof obj === 'object') {
            // If the object is a valid object, delete the 'creator' field
            delete obj.creator;

            // Recursively check nested objects
            Object.keys(obj).forEach(key => {
              removeCreator(obj[key]);
            });
          }
        }

        // Remove 'creator' from the result
        removeCreator(result);
      } else if (contentType && contentType.includes('text/html')) {
        // If the response is HTML, just return it as text
        result = await response.text();
      } else {
        // If it's another format, return it as text by default
        result = await response.text();
      }

      // Return the cleaned result in JSON format
      res.json({
        status: true,
        creator: "Qasim Ali 🦋",  // You can use your own name here
        result: result,  // The actual data received from the API, now without 'creator' field
      });

    } catch (e) {
      // Handle any errors that occur during the fetch or response handling
      console.error(e);  // Log the error for debugging
      res.json(loghandler.error);  // Send a generic error response
    }
  } else {
    // If the API key is invalid
    res.json(loghandler.invalidKey);
  }
});
router.get('/gpt', async (req, res, next) => {
  const apikey = req.query.apikey;  // Retrieve the API key from the query string
  const text = req.query.text;  // Retrieve the text parameter

  // Validate API key and text
  if (!apikey) return res.json({ status: false, message: "API key is missing" });
  if (!text) return res.json({ status: false, message: "Text is missing" });
  // Example API key validation (replace `listkey` with your actual list of valid keys)
  if (!listkey.includes(apikey)) {
    return res.json({ status: false, message: 'Invalid API key' });
  }

  const encodedText = encodeURIComponent(text);  // Safely encode the text
  const guru1 = `https://api.gurusensei.workers.dev/mistral?text=${encodedText}`;

  try {
    // Fetch data from the API
    let response = await fetch(guru1);

    // Check if the response is okay (status code 200)
    if (!response.ok) {
      return res.json({ status: false, message: "Failed to fetch from the API." });
    }

    // Check the Content-Type of the response
    const contentType = response.headers.get('Content-Type');

    let result;
    if (contentType && contentType.includes('application/json')) {
      // If the response is JSON, parse it
      result = await response.json();

      // Recursively remove the 'creator' field from the response object
      removeCreatorField(result);
    } else if (contentType && contentType.includes('text/html')) {
      // If the response is HTML, just return it as text
      result = await response.text();
    } else {
      // If it's another format, return it as text by default
      result = await response.text();
    }

    // Return the result as a JSON response, always with a removed creator field
    res.json({
      status: true,
      creator: "Qasim Ali 🦋",  // You can set this to whatever creator you want to show
      result: result,
    });

  } catch (error) {
    // Handle any errors that occur during the fetch or JSON parsing
    res.json({
      status: false,
      message: "An error occurred while fetching the data.",
      error: error.message,
    });
  }
});

// Recursive function to remove the 'creator' field from the result
function removeCreatorField(obj) {
  if (Array.isArray(obj)) {
    // If it's an array, loop through each item and call the function recursively
    obj.forEach(item => removeCreatorField(item));
  } else if (obj !== null && typeof obj === 'object') {
    // If it's an object, loop through the keys and check for 'creator'
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (key === 'creator') {
          // Delete the 'creator' field if it exists
          delete obj[key];
        } else {
          // Otherwise, call the function recursively for nested objects
          removeCreatorField(obj[key]);
        }
      }
    }
  }
}
  



// Function to upload image to ImgBB
async function uploadImageToImgBB(buffer) {
  const form = new FormData();
  form.append('image', buffer.toString('base64'));  // Convert buffer to base64

  const response = await fetch('https://api.imgbb.com/1/upload?key=84425c5a9e72b87e9abc7645b904eb33', {
    method: 'POST',
    body: form
  });

  const data = await response.json();
  if (data.success) {
    return data.data.url;  // Return the image URL from ImgBB
  } else {
    throw new Error('Failed to upload image to ImgBB');
  }
}


// TikTok stalk route
router.get('/stalk/github', async (req, res, next) => {
  const Apikey = req.query.apikey;
  const user = req.query.user;

  if (!Apikey) return res.json(loghandler.notparam);
  if (!listkey.includes(Apikey)) return res.json(loghandler.invalidKey);
  if (!user) return res.json(loghandler.notusername);

  try {
    const data = await Qasim.githubStalk(user);
    res.json({
      status: true,
      result: data
    });
  } catch (e) {
    res.json({
      status: false,
      creator: creator,
      message: "Error, username might be invalid"
    });
  }
});

router.get('/dalle', async (req, res, next) => {
  const apikey = req.query.apikey;
  const prompt = req.query.prompt;

  // Validate the API key and prompt
  if (!apikey) return res.json(loghandler.notparam);
  if (!prompt) return res.json(loghandler.notquery);

  // Check if API key is valid
  if (listkey.includes(apikey)) {
    try {
      // Send 'prompt' parameter in the API request
      const response = await fetch(encodeURI(`https://api.gurusensei.workers.dev/dream?prompt=${prompt}`));

      // Check if the response is okay (status code 200)
      if (!response.ok) {
        return res.json({ status: false, message: "Failed to fetch from the API." });
      }

      // Check the Content-Type of the response
      const contentType = response.headers.get('Content-Type');

      // If the response is an image (image/png)
      if (contentType && contentType.includes('image/png')) {
        const buffer = await response.buffer();  // Get image data as a buffer
        res.set('Content-Type', 'image/png');  // Set the correct content type
        return res.send(buffer);  // Send the image buffer directly in the response
      } else {
        // Handle non-image responses (e.g., JSON or HTML)
        const result = await response.text();
        return res.json({
          status: true,
          creator: `${creator}`,
          result: result,  // Return the raw response (likely text or JSON)
        });
      }

    } catch (e) {
      // Handle any errors that occur during the fetch or response handling
      console.error(e);  // Log the error for debugging
      res.json(loghandler.error);  // Send a generic error response
    }
  } else {
    // If the API key is invalid
    res.json(loghandler.invalidKey);
  }
});


// TikTok stalk route
router.get('/stalk/tiktok', async (req, res, next) => {
  const Apikey = req.query.apikey;
  const user = req.query.user;

  if (!Apikey) return res.json(loghandler.notparam);
  if (!listkey.includes(Apikey)) return res.json(loghandler.invalidKey);
  if (!user) return res.json(loghandler.notusername);

  try {
    const data = await Qasim.tiktokStalk(user);
    console.log('Tiktok Stalk:', data);
    res.json({
      status: true,
      result: data,
    });
  } catch (e) {
    res.json({
      status: false,
      creator: creator,
      message: "Error, username might be invalid"
    });
  }
});

// Pinterest Search Route
router.get('/search/pinterest', async (req, res, next) => {
  const Apikey = req.query.apikey;
  const query = req.query.query;

  // Validate API key and query
  if (!Apikey) return res.json({ status: false, message: 'Enter the API Key' });
  if (!listkey.includes(Apikey)) return res.json({ status: false, message: 'Invalid API Key' });
  if (!query) return res.json({ status: false, message: 'Enter the Pinterest search term' });

  try {
    const data= await Qasim.Pinterest2(query);
    res.json({
      status: true,
      data
    });
  } catch (error) {
    res.json({ status: false, message: error });
  }
});

// Wallpaper Search Route
router.get('/wallpaper', async (req, res, next) => {
  const Apikey = req.query.apikey;
  const query = req.query.query;

  // Validate API key and query
  if (!Apikey) return res.json({ status: false, message: 'Enter the API Key' });
  if (!listkey.includes(Apikey)) return res.json({ status: false, message: 'Invalid API Key' });
  if (!query) return res.json({ status: false, message: 'Enter the wallpaper search term' });

  try {
  const data = await Qasim.wallpapercraft(query);
    res.json({
      status: true,
      data
    });
  } catch (error) {
    res.json({ status: false, message: error });
  }
});

// Sticker Search Route
router.get('/search/sticker', async (req, res, next) => {
  const Apikey = req.query.apikey;
  const query = req.query.query;

  // Validate API key and query
  if (!Apikey) return res.json({ status: false, message: 'Enter the API Key' });
  if (!listkey.includes(Apikey)) return res.json({ status: false, message: 'Invalid API Key' });
  if (!query) return res.json({ status: false, message: 'Enter the sticker search term' });

  try {
   const data = await Qasim.stickersearch(query);
    res.json({
      status: true,
      data
    });
  } catch (error) {
    res.json({ status: false, message: error });
  }
});

// npm Search Route
router.get('/stalk/npm', async (req, res, next) => {
  const Apikey = req.query.apikey;
  const query = req.query.query;

  // Validate API key and query
  if (!Apikey) return res.json({ status: false, message: 'Enter the API Key' });
  if (!listkey.includes(Apikey)) return res.json({ status: false, message: 'Invalid API Key' });
  if (!query) return res.json({ status: false, message: 'Enter the npm package name' });

  try {
   const result = await Qasim.npmStalk(query);
    res.json({
        status: true,
        result
      });
  } catch (error) {
    res.json({ status: false, message: error });
  }
});


router.get('/download/igdl', async (req, res, next) => {
  const Apikey = req.query.apikey;
  const url = req.query.url;

  // Validate API key and URL
  if (!Apikey) return res.json({ status: false, message: 'Enter the API Key' });
  if (!listkey.includes(Apikey)) return res.json({ status: false, message: 'Invalid API Key' });
  if (!url) return res.json({ status: false, message: 'Enter the Facebook video URL' });

  try {
   const result = await Qasim.igdl(url);
    res.json({
        status: true,
        code: 200,
        creator: `${creator}`,
        result
      });
  } catch (error) {
    res.json({ status: false, message: error });
  }
});


// Twitter Download Route
router.get('/download/twitter', async (req, res, next) => {
  const Apikey = req.query.apikey;
  const url = req.query.url;

  // Validate API key and URL
  if (!Apikey) return res.json({ status: false, message: 'Enter the API Key' });
  if (!listkey.includes(Apikey)) return res.json({ status: false, message: 'Invalid API Key' });
  if (!url) return res.json({ status: false, message: 'Enter the Twitter video URL' });

  try {
  const result = await Qasim.xdown(url);
    res.json({
        status: true,
        result
      });
  } catch (error) {
    res.json({ status: false, message: error });
  }
});

router.get('/download/ytmp3', async (req, res, next) => {
  const url = req.query.url;
  const apikey = req.query.apikey;

  if (!url) return res.json(loghandler.noturl);
  if (!apikey) return res.json(loghandler.notparam);
  
  if (listkey.includes(apikey)) {
    try {
      const result = await Qasim.ytmp3(url);
      res.json({
        status: true,
        code: 200,
        creator: `${creator}`,
        result
      });
    } catch (error) {
      console.error(error);
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});

router.get('/download/ytmp4', async (req, res, next) => {
  const url = req.query.url;
  const apikey = req.query.apikey;

  if (!url) return res.json(loghandler.noturl);
  if (!apikey) return res.json(loghandler.notparam);
  
  if (listkey.includes(apikey)) {
    try {
      const result = await Qasim.ytmp4(url);
      res.json({
        status: true,
        code: 200,
        creator: `${creator}`,
        result
      });
    } catch (error) {
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});


router.get('/search/yt', async (req, res, next) => {
  const query = req.query.query;
  const apikey = req.query.apikey;

  if (!query) return res.json(loghandler.notquery);
  if (!apikey) return res.json(loghandler.notparam);

  if (listkey.includes(apikey)) {
    try {
      const result = await Qasim.ytsearch(query);
      res.json({
        status: true,
        code: 200,
        creator: `${creator}`,
        result
      });
    } catch (error) {
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});

router.get('/download/gimage', async (req, res, next) => {
  const query = req.query.query;
  const apikey = req.query.apikey;

  if (!query) return res.json(loghandler.noturl);
  if (!apikey) return res.json(loghandler.notparam);
  
  if (listkey.includes(apikey)) {
    try {
      const result = await Qasim.googleImage(query);
      res.json({
        status: true,
        result
      });
    } catch (error) {
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});

router.get('/download/git', async (req, res, next) => {
  const url = req.query.url;
  const apikey = req.query.apikey;

  if (!url) return res.json(loghandler.noturl);
  if (!apikey) return res.json(loghandler.notparam);
  
  if (listkey.includes(apikey)) {
    try {
      const result = await Qasim.gitclone(url);
      res.json({
        status: true,
        result
      });
    } catch (error) {
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});

router.get('/download/mediafire', async (req, res, next) => {
  const url = req.query.url;
  const apikey = req.query.apikey;

  if (!url) return res.json(loghandler.noturl);
  if (!apikey) return res.json(loghandler.notparam);
  
  if (listkey.includes(apikey)) {
    try {
      const result = await Qasim.mediafire(url);
      res.json({
        status: true,
        result
      });
    } catch (error) {
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});

router.get('/download/webtoons', async (req, res, next) => {
  const query = req.query.query;
  const apikey = req.query.apikey;

  if (!query) return res.json(loghandler.notquery);
  if (!apikey) return res.json(loghandler.notparam);
  
  if (listkey.includes(apikey)) {
    try {
      const result = await Qasim.webtoons(query);
      res.json({
        status: true,
        creator: 'Qasim Ali🦋',
        result
      });
    } catch (error) {
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});

router.get('/twitter/trends', async (req, res, next) => {
  const country = req.query.country;
  const apikey = req.query.apikey;

  if (!country) return res.json(loghandler.notquery);
  if (!apikey) return res.json(loghandler.notparam);
  
  if (listkey.includes(apikey)) {
    try {
      const result = await Qasim.trendtwit(country);
      res.json({
        status: true,
        creator: 'Qasim Ali🦋',
        result
      });
    } catch (error) {
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});

router.get('/playstore', async (req, res, next) => {
  const search = req.query.query;
  const apikey = req.query.apikey;

  if (!search) return res.json(loghandler.notquery);
  if (!apikey) return res.json(loghandler.notparam);
  
  if (listkey.includes(apikey)) {
    try {
      const result = await Qasim.playstore(search);
      res.json({
        status: true,
        result
      });
    } catch (error) {
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});

router.get('/apkmirror', async (req, res, next) => {
  const query = req.query.query;
  const apikey = req.query.apikey;

  if (!query) return res.json(loghandler.notquery);
  if (!apikey) return res.json(loghandler.notparam);
  
  if (listkey.includes(apikey)) {
    try {
      const result = await Qasim.apkmirror(query);
      res.json({
        status: true,
        creator: 'Qasim Ali🦋',
        result
      });
    } catch (error) {
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});

router.get('/androidapk', async (req, res, next) => {
  const query = req.query.query;
  const apikey = req.query.apikey;

  if (!query) return res.json(loghandler.notquery);
  if (!apikey) return res.json(loghandler.notparam);
  
  if (listkey.includes(apikey)) {
    try {
      const result = await Qasim.apksearch(query);
      res.json({
        status: true,
        result
      });
    } catch (error) {
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});

router.get('/meaning/name', async (req, res, next) => {
  const query = req.query.name;
  const apikey = req.query.apikey;

  if (!query) return res.json(loghandler.notname);
  if (!apikey) return res.json(loghandler.notparam);

  if (listkey.includes(apikey)) {
    try {
      const result = await Qasim.artinama(query);

      // Translate the result to English
      try {
        const { text } = await translate(result, {
          to: 'en'
        });
        // Send the response with the translated result
        res.json({
          status: true,
          creator: 'Qasim Ali🦋',
          result: text  // Returning the translated result
        });
      } catch (translationError) {
        res.json({
          status: false,
          message: "Error in translation"
        });
      }
    } catch (error) {
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});

router.get('/search/wattpad', async (req, res, next) => {
  const query = req.query.query;
  const apikey = req.query.apikey;

  if (!query) return res.json(loghandler.notquery);
  if (!apikey) return res.json(loghandler.notparam);
  
  if (listkey.includes(apikey)) {
    try {
      const result = await Qasim.wattpad(query);
      res.json({
        status: true,
        creator: 'Qasim Ali🦋',
        result
      });
    } catch (error) {
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});

router.get('/search/wiki', async (req, res, next) => {
  const query = req.query.query;
  const apikey = req.query.apikey;

  if (!query) return res.json(loghandler.notquery);
  if (!apikey) return res.json(loghandler.notparam);
  
  if (listkey.includes(apikey)) {
    try {
      const result = await Qasim.wikisearch(query);
      res.json({
        status: true,
        creator: 'Qasim Ali🦋',
        result
      });
    } catch (error) {
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});

router.get('/image/game', async (req, res, next) => {
  const apikey = req.query.apikey;

  if (!apikey) return res.json(loghandler.notparam);

  if (listkey.includes(apikey)) {
    try {
      const result = await Qasim.Game();
      res.json({
        status: true,
        result
      });
    } catch (error) {
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});

router.get('/mangatoon', async (req, res, next) => {
  const search = req.query.name;
  const apikey = req.query.apikey;

  if (!search) return res.json(loghandler.notname);
  if (!apikey) return res.json(loghandler.notparam);
  
  if (listkey.includes(apikey)) {
    try {
      const result = await Qasim.mangatoon(search);
      res.json({
        status: true,
        result
      });
    } catch (error) {
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});


// TikTok download route
router.get('/download/tiktok', async (req, res, next) => {
  const Apikey = req.query.apikey;
  const url = req.query.url;

  if (!Apikey) return res.json(loghandler.notparam);
  if (!listkey.includes(Apikey)) return res.json(loghandler.invalidKey);
  if (!url) return res.json(loghandler.noturl);

  try {
    const data = await Qasim.tiktokDl(url);
    res.json({
        status: true,
        data
      });
  } catch (err) {
    res.json(loghandler.error);
  }
});

// Facebook download route

router.get('/download/fb', async (req, res, next) => {
  const Apikey = req.query.apikey;
  const url = req.query.url;

  // Validate API key
  if (!Apikey) return res.json(loghandler.notparam);
  if (!listkey.includes(Apikey)) return res.json(loghandler.invalidKey);

  // Check if URL is provided
  if (!url) return res.json({ status: false, creator: `${creator}`, message: "Please provide the URL" });

  try {
    // Fetch data from FB function
    const data = await Qasim.fbdl(url);

    // Return data in the expected format
    res.json({
      status: true,
      code: 200,
      creator: `${creator}`,
      data
    }
    );

  } catch (err) {
    // Handle errors
    res.json(loghandler.error);
  }
});


// Instagram Stalking Route
router.get('/stalk/ig', async (req, res, next) => {
  const username = req.query.username;
  const apikey = req.query.apikey;

  if (!username) return res.json(loghandler.notusername);
  if (!apikey) return res.json(loghandler.notparam);
  
  if (listkey.includes(apikey)) {
    try {
      const result = await Qasim.igStalk(username);
      res.json({
        status: true,
        result
      });
    } catch (err) {
      res.json({
        status: false,
        creator: `${creator}`,
        message: "Error fetching Instagram user data"
      });
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});

// NPM Package Info Route
router.get('/stalk/npm2', async (req, res, next) => {
  const Apikey = req.query.apikey;
  const query = req.query.query;

  if (!Apikey) return res.json(loghandler.notparam);
  if (!query) return res.json({ status: false, creator: `${creator}`, message: "Please provide a package name (query)" });

  if (listkey.includes(Apikey)) {
    try {
      const response = await fetch(encodeURI(`https://registry.npmjs.org/${query}`));
      const data = await response.json();
      
      res.json({
        status: true,
        creator: `${creator}`,
        result: data
      });
    } catch (e) {
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});

// NPM Package Info Route
router.get('/info/npm', async (req, res, next) => {
  const Apikey = req.query.apikey;
  const query = req.query.query;

  if (!Apikey) return res.json(loghandler.notparam);
  if (!query) return res.json({ status: false, creator: `${creator}`, message: "Please provide a package name (query)" });

  if (listkey.includes(Apikey)) {
    try {
      const response = await fetch(encodeURI(`https://registry.npmjs.org/${query}`));
      const data = await response.json();
      
      res.json({
        status: true,
        creator: `${creator}`,
        result: data
      });
    } catch (e) {
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});

// Jadwal Bioskop (Cinema Schedule) Route
router.get('/jadwal-bioskop', async (req, res, next) => {
  const Apikey = req.query.apikey;

  if (!Apikey) return res.json(loghandler.notparam);

  if (listkey.includes(Apikey)) {
    try {
      const { default: Axios } = require('axios');
      const cheerio = require('cheerio');

      const { data } = await Axios.get('https://jadwalnonton.com/now-playing');
      const $ = cheerio.load(data);

      let title = [];
      let url = [];
      let img = [];

      $('div.row > div.item > div.clearfix > div.rowl > div.col-xs-6 > a').each((i, el) => {
        url.push($(el).attr('href'));
      });
      
      $('div.row > div.item > div.clearfix > div.rowl > div.col-xs-6 > a > img').each((i, el) => {
        title.push($(el).attr('alt'));
        img.push($(el).attr('src'));
      });

      let result = title.map((item, i) => ({
        url: url[i],
        title: item,
        img: img[i]
      }));

      res.json({
        creator: `${creator}`,
        status: true,
        result: result
      });
    } catch (error) {
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});

// Shorten URL using TinyURL
router.get('/short/tinyurl', async (req, res, next) => {
  const Apikey = req.query.apikey;
  const url = req.query.url;

  if (!Apikey) return res.json(loghandler.notparam);
  if (!listkey.includes(Apikey)) return res.json(loghandler.invalidKey);
  if (!url) return res.json(loghandler.noturl);

  request(`https://tinyurl.com/api-create.php?url=${url}`, function (error, response, body) {
    if (error) {
      console.log('Error:', color(error, 'red'));
      return res.json(loghandler.invalidlink);
    }

    try {
      res.json({
        status: true,
        creator: `${creator}`,
        result: body
      });
    } catch (e) {
      console.log('Error:', color(e, 'red'));
      res.json(loghandler.invalidlink);
    }
  });
});

// Base encoding/decoding (Base64/Base32)
router.get('/base', async (req, res, next) => {
  const { type, encode, decode, apikey } = req.query;

  if (!apikey) return res.json(loghandler.notparam);
  if (!listkey.includes(apikey)) return res.json(loghandler.invalidKey);

  if (!type) {
    return res.json({
      status: false,
      creator,
      code: 404,
      message: 'Please provide the type parameter. Available types: base64, base32'
    });
  }

  try {
    if (type === 'base64') {
      if (encode) {
        const result = await Base('b64enc', encode);
        return res.json({
          status: true,
          creator: `${creator}`,
          result
        });
      }
      if (decode) {
        const result = await Base('b64dec', decode);
        return res.json({
          status: true,
          creator: `${creator}`,
          result
        });
      }
    } else if (type === 'base32') {
      if (encode) {
        const result = await Base('b32enc', encode);
        return res.json({
          status: true,
          creator: `${creator}`,
          result
        });
      }
      if (decode) {
        const result = await Base('b32dec', decode);
        return res.json({
          status: true,
          creator: `${creator}`,
          result
        });
      }
    } else {
      return res.json({
        status: false,
        creator: `${creator}`,
        message: "Invalid type. Available types: base64, base32."
      });
    }

    if (!(encode || decode)) {
      return res.json({
        status: false,
        creator: `${creator}`,
        message: "Please provide either 'encode' or 'decode' parameter."
      });
    }
  } catch (e) {
    console.log('Error:', color(e, 'red'));
    res.json(loghandler.error);
  }
});

// Weather Information (Cuaca)
router.get('/info/weather', async (req, res, next) => {
  const apikey = req.query.apikey;
  const kota = req.query.city;

  if (!apikey) return res.json(loghandler.notparam);
  if (!kota) return res.json({ status: false, code: 406, message: 'Please provide the city parameter.' });

  if (listkey.includes(apikey)) {
    try {
      const data = await Qasim.weather(kota);
      res.json({
        status: true,
        data
      });
    } catch (e) {
      console.log('Error:', color(e, 'red'));
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});

// Earthquake Information (Gempa)
router.get('/info/earthquake', async (req, res, next) => {
  const apikey = req.query.apikey;

  if (!apikey) return res.json(loghandler.notparam);

  if (listkey.includes(apikey)) {
    try {
      const result = await Gempa();
      res.json({
        creator: creator,
        result
      });
    } catch (e) {
      console.log('Error:', color(e, 'red'));
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});

// Hadith retrieval
router.get('/muslim/hadits', async (req, res, next) => {
  const apikey = req.query.apikey;
  const kitab = req.query.kitab;
  const nomor = req.query.nomor;

  if (!apikey) return res.json(loghandler.notparam);
  if (listkey.includes(apikey)) {
    if (!kitab) return res.json({ status: false, creator: creator, message: "Please provide the 'kitab' parameter." });
    if (!nomor) return res.json({ status: false, creator: creator, message: "Please provide the 'nomor' parameter." });

    try {
      const response = await fetch(encodeURI(`https://hadits-api-zhirrr.vercel.app/books/${kitab}/${nomor}`));
      const data = await response.json();
      res.json({
        status: true,
        code: 200,
        creator: `${creator}`,
        data
      });
    } catch (e) {
      console.log('Error:', color(e, 'red'));
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});

// Quranic verse retrieval
router.get('/muslim/quran', async (req, res, next) => {
  const apikey = req.query.apikey;
  const surah = req.query.surah;
  const ayat = req.query.ayat;

  if (!apikey) return res.json(loghandler.notparam);
  if (listkey.includes(apikey)) {
    if (!surah) return res.json({ status: false, creator: creator, message: "Please provide the 'surah' parameter." });
    if (!ayat) return res.json({ status: false, creator: creator, message: "Please provide the 'ayat' parameter." });

    try {
      const response = await fetch(encodeURI(`https://alquran-apiii.vercel.app/surah/${surah}/${ayat}`));
      const data = await response.json();
      res.json({
        status: true,
        code: 200,
        creator: `${creator}`,
        data
      });
    } catch (e) {
      console.log('Error:', color(e, 'red'));
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});

// Tahlil Data
router.get('/muslim/tahlil', async (req, res, next) => {
  const Apikey = req.query.apikey;

  if (!Apikey) return res.json(loghandler.notparam);
  if (listkey.includes(Apikey)) {
    try {
      const response = await fetch(encodeURI('https://raw.githubusercontent.com/GlobalTechInfo/Islamic-Database/main/data/dataTahlil.json'));
      const data = await response.json();
      res.json({ result: data });
    } catch (e) {
      console.log('Error:', color(e, 'red'));
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});

// Wirid Data
router.get('/muslim/wirid', async (req, res, next) => {
  const Apikey = req.query.apikey;

  if (!Apikey) return res.json(loghandler.notparam);
  if (listkey.includes(Apikey)) {
    try {
      const response = await fetch(encodeURI('https://raw.githubusercontent.com/GlobalTechInfo/Islamic-Database/main/data/dataWirid.json'));
      const data = await response.json();
      res.json({ result: data });
    } catch (e) {
      console.log('Error:', color(e, 'red'));
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});

// Ayat Kursi Data
router.get('/muslim/ayatkursi', async (req, res, next) => {
  const Apikey = req.query.apikey;

  if (!Apikey) return res.json(loghandler.notparam);
  if (listkey.includes(Apikey)) {
    try {
      const response = await fetch(encodeURI('https://raw.githubusercontent.com/GlobalTechInfo/Islamic-Database/main/data/dataAyatKursi.json'));
      const data = await response.json();
      res.json({ result: data });
    } catch (e) {
      console.log('Error:', color(e, 'red'));
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});

// Daily Prayers Data
router.get('/muslim/doaharian', async (req, res, next) => {
  const Apikey = req.query.apikey;

  if (!Apikey) return res.json(loghandler.notparam);
  if (listkey.includes(Apikey)) {
    try {
      const response = await fetch(encodeURI('https://raw.githubusercontent.com/GlobalTechInfo/Islamic-Database/main/data/dataDoaHarian.json'));
      const data = await response.json();
      res.json({ result: data });
    } catch (e) {
      console.log('Error:', color(e, 'red'));
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});

// Bacaan Shalat Data
router.get('/muslim/bacaanshalat', async (req, res, next) => {
  const Apikey = req.query.apikey;

  if (!Apikey) return res.json(loghandler.notparam);
  if (listkey.includes(Apikey)) {
    try {
      const response = await fetch(encodeURI('https://raw.githubusercontent.com/GlobalTechInfo/Islamic-Database/main/data/dataBacaanShalat.json'));
      const data = await response.json();
      res.json({ result: data });
    } catch (e) {
      console.log('Error:', color(e, 'red'));
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});

// Niat Shalat Data
router.get('/muslim/niatshalat', async (req, res, next) => {
  const Apikey = req.query.apikey;

  if (!Apikey) return res.json(loghandler.notparam);
  if (listkey.includes(Apikey)) {
    try {
      const response = await fetch(encodeURI('https://raw.githubusercontent.com/GlobalTechInfo/Islamic-Database/main/data/dataNiatShalat.json'));
      const data = await response.json();
      res.json({ result: data });
    } catch (e) {
      console.log('Error:', color(e, 'red'));
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});

// Kisah Nabi Data
router.get('/muslim/kisahnabi', async (req, res, next) => {
  const Apikey = req.query.apikey;

  if (!Apikey) return res.json(loghandler.notparam);
  if (listkey.includes(Apikey)) {
    try {
      const response = await fetch(encodeURI('https://raw.githubusercontent.com/GlobalTechInfo/Islamic-Database/main/data/dataKisahNabi.json'));
      const data = await response.json();
      res.json({ result: data });
    } catch (e) {
      console.log('Error:', color(e, 'red'));
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});

// Asmaul Husna Data
router.get('/muslim/asmaulhusna', async (req, res, next) => {
  const Apikey = req.query.apikey;

  if (!Apikey) return res.json(loghandler.notparam);
  if (listkey.includes(Apikey)) {
    try {
      // Ensure the file path is correct
      const asmaul = JSON.parse(fs.readFileSync(__path + '/data/AsmaulHusna.json'));
      res.json(asmaul);
    } catch (e) {
      console.log('Error:', color(e, 'red'));
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});

// Niat Shubuh
router.get('/muslim/niatshubuh', async (req, res) => {
  const Apikey = req.query.apikey;

  if (!Apikey) return res.json(loghandler.notparam);
  if (listkey.includes(Apikey)) {
    try {
      const response = await fetch(encodeURI('https://raw.githubusercontent.com/GlobalTechInfo/Islamic-Database/main/data/NiatShubuh.json'));
      const data = await response.json();
      res.json({ result: data });
    } catch (e) {
      console.log('Error:', color(e, 'red'));
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});

// Niat Dzuhur
router.get('/muslim/niatdzuhur', async (req, res) => {
  const Apikey = req.query.apikey;

  if (!Apikey) return res.json(loghandler.notparam);
  if (listkey.includes(Apikey)) {
    try {
      const response = await fetch(encodeURI('https://raw.githubusercontent.com/GlobalTechInfo/Islamic-Database/main/data/NiatDzuhur.json'));
      const data = await response.json();
      res.json({ result: data });
    } catch (e) {
      console.log('Error:', color(e, 'red'));
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});

// Niat Maghrib
router.get('/muslim/niatmaghrib', async (req, res) => {
  const Apikey = req.query.apikey;

  if (!Apikey) return res.json(loghandler.notparam);
  if (listkey.includes(Apikey)) {
    try {
      const response = await fetch(encodeURI('https://raw.githubusercontent.com/GlobalTechInfo/Islamic-Database/main/data/NiatMaghrib.json'));
      const data = await response.json();
      res.json({ result: data });
    } catch (e) {
      console.log('Error:', color(e, 'red'));
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});

// Niat Isya
router.get('/muslim/niatisha', async (req, res) => {
  const Apikey = req.query.apikey;

  if (!Apikey) return res.json(loghandler.notparam);
  if (listkey.includes(Apikey)) {
    try {
      const response = await fetch(encodeURI('https://raw.githubusercontent.com/GlobalTechInfo/Islamic-Database/main/data/NiatIsya.json'));
      const data = await response.json();
      res.json({ result: data });
    } catch (e) {
      console.log('Error:', color(e, 'red'));
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});

// Niat Ashar Route
router.get('/muslim/niatashar', async (req, res) => {
  const Apikey = req.query.apikey;

  if (!Apikey) return res.json(loghandler.notparam);
  if (listkey.includes(Apikey)) {
    try {
      const response = await fetch(encodeURI('https://raw.githubusercontent.com/GlobalTechInfo/Islamic-Database/main/data/NiatAshar.json'));
      const data = await response.json();
      res.json({ result: data });
    } catch (e) {
      console.log('Error:', color(e, 'red'));
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});

// Search Image Route
router.get('/image/messi', async (req, res) => {
    const Apikey = req.query.apikey;

    // Check if API key is provided
    if (!Apikey) return res.json(loghandler.notparam);
    if (!listkey.includes(Apikey)) return res.json(loghandler.invalidKey);

    try {
        // Fetch the raw JSON data from GitHub
        const response = await fetch('https://raw.githubusercontent.com/GlobalTechInfo/Anime-API/Guru/BOT-JSON/Messi.json');
        const data = await response.json();

        // If no data is found, return an error
        if (data.length === 0) {
            return res.json({ status: false, message: "No items found." });
        }

        // Select a random item from the array
        const randomItem = data[Math.floor(Math.random() * data.length)];

        const responseData = {
        status: true,
        code: 200,
        creator: `${creator}`,
        url: randomItem
      };

      res.json(responseData);
    } catch (e) {
        console.error('Error fetching data:', e);
        res.json(loghandler.error);
    }
});

router.get('/image/cr7', async (req, res) => {
    const Apikey = req.query.apikey;

    // Check if API key is provided
    if (!Apikey) return res.json(loghandler.notparam);
    if (!listkey.includes(Apikey)) return res.json(loghandler.invalidKey);

    try {
        // Fetch the raw JSON data from GitHub
        const response = await fetch('https://raw.githubusercontent.com/GlobalTechInfo/Anime-API/Guru/BOT-JSON/CristianoRonaldo.json');
        const data = await response.json();

        // If no data is found, return an error
        if (data.length === 0) {
            return res.json({ status: false, message: "No items found." });
        }

        // Select a random item from the array
        const randomItem = data[Math.floor(Math.random() * data.length)];

        const responseData = {
        status: true,
        code: 200,
        creator: `${creator}`,
        url: randomItem
      };

      res.json(responseData);
    } catch (e) {
        console.error('Error fetching data:', e);
        res.json(loghandler.error);
    }
});


router.get('/search/image', async (req, res) => {
  const apikey = req.query.apikey;
  const query = req.query.query;

  if (!query) return res.json(loghandler.notquery);
  if (!apikey) return res.json(loghandler.notparam);

  if (listkey.includes(apikey)) {
    try {
      const options = {
        url: `http://results.dogpile.com/serp?qc=images&q=${query}`,
        method: "GET",
        headers: {
          "Accept": "text/html",
          "User-Agent": "Chrome",
        },
      };

      request(options, (error, response, body) => {
        if (error) {
          console.log('Request error:', error);
          return res.json(loghandler.error);
        }

        const $ = cheerio.load(body);
        const links = $(".image a.link");
        const imageLinks = new Array(links.length).fill(0).map((v, i) => links.eq(i).attr("href"));

        if (!imageLinks.length) {
          return res.json({
            status: false,
            message: "No images found for the query.",
          });
        }

        const randomImageLink = imageLinks[Math.floor(Math.random() * imageLinks.length)];
        res.json({
          status: true,
          code: 200,
          creator: `${creator}`,
          result: randomImageLink,
        });
      });
    } catch (e) {
      console.log('Error:', e);
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});

// Wallpaper CyberSpace Route
router.get('/wallpaper/cyberspace', async (req, res) => {
  const apikey = req.query.apikey;

  if (!apikey) return res.json(loghandler.notparam);
  if (listkey.includes(apikey)) {
    try {
      const cyberspaceData = JSON.parse(fs.readFileSync(__path + '/data/CyberSpace.json'));
      const randomCyberSpaceUrl = cyberspaceData[Math.floor(Math.random() * cyberspaceData.length)];

      // Prepare the response data with the random URL and status
      const responseData = {
        status: true,
        code: 200,
        creator: `${creator}`,
        url: randomCyberSpaceUrl
      };

      res.json(responseData);
    } catch (e) {
      console.log('Error:', e);
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});

// Wallpaper Teknologi Route
router.get('/wallpaper/teknologi', async (req, res) => {
  const apikey = req.query.apikey;

  if (!apikey) return res.json(loghandler.notparam);
  if (listkey.includes(apikey)) {
    try {
      const technologyData = JSON.parse(fs.readFileSync(__path + '/data/Technology.json'));
      const randomTechWallpaperUrl = technologyData[Math.floor(Math.random() * technologyData.length)];

      // Prepare the response data with the random URL and status
      const responseData = {
        status: true,
        code: 200,
        creator: `${creator}`,
        url: randomTechWallpaperUrl
      };

      res.json(responseData);
    } catch (e) {
      console.log('Error:', e);
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});

// Wallpaper Muslim Route
router.get('/wallpaper/muslim', async (req, res) => {
  const Apikey = req.query.apikey;

  if (!Apikey) return res.json(loghandler.notparam);
  if (listkey.includes(Apikey)) {
    try {
      const MuslimWallpapers = JSON.parse(fs.readFileSync(__path + '/data/Islamic.json'));
      const MuslimUrl = MuslimWallpapers[Math.floor(Math.random() * MuslimWallpapers.length)];

      // Prepare the response data with the random URL and status
      const responseData = {
        status: true,
        code: 200,
        creator: `${creator}`,
        url: MuslimUrl
      };

      res.json(responseData);
    } catch (error) {
      console.log('Error fetching Muslim wallpaper:', error);
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});

// Wallpaper Programming Route
router.get('/wallpaper/programming', async (req, res) => {
  const Apikey = req.query.apikey;

  if (!Apikey) return res.json(loghandler.notparam);
  if (listkey.includes(Apikey)) {
    try {
      const ProgrammingWallpapers = JSON.parse(fs.readFileSync(__path + '/data/Programming.json'));
      const randProgrammingUrl = ProgrammingWallpapers[Math.floor(Math.random() * ProgrammingWallpapers.length)];

      // Prepare the response data with the random URL and status
      const responseData = {
        status: true,
        code: 200,
        creator: `${creator}`,
        url: randProgrammingUrl
      };

      res.json(responseData);
    } catch (error) {
      console.log('Error fetching Programming wallpaper:', error);
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});

// Wallpaper Pegunungan Route
router.get('/wallpaper/mountain', async (req, res) => {
  const Apikey = req.query.apikey;

  if (!Apikey) return res.json(loghandler.notparam);
  if (listkey.includes(Apikey)) {
    try {
      const MountainWallpapers = JSON.parse(fs.readFileSync(__path + '/data/Mountain.json'));
      const randMountainUrl = MountainWallpapers[Math.floor(Math.random() * MountainWallpapers.length)];

      // Prepare the response data with the random URL and status
      const responseData = {
        status: true,
        code: 200,
        creator: `${creator}`,
        url: randMountainUrl
      };

      res.json(responseData);
    } catch (error) {
      console.log('Error fetching Mountain wallpaper:', error);
      res.json(loghandler.error);
    }
  } else {
    res.json(loghandler.invalidKey);
  }
});

// Route to get lyrics of a song
router.get('/music/lyrics', async (req, res) => {
    const Apikey = req.query.apikey;
    const title = req.query.query;

    if (!Apikey) return res.json(loghandler.notparam);
    if (!listkey.includes(Apikey)) return res.json(loghandler.invalidKey);
    if (!title) return res.json(loghandler.notquery);

    try {
        // Fetching lyrics from the external API
        const response = await fetch(`https://some-random-api.com/others/lyrics?title=${encodeURIComponent(title)}`);
        
        // Check if the API call was successful
        if (!response.ok) {
            return res.json({ status: false, code: 500, message: 'Error fetching lyrics' });
        }

        // Parse the JSON response from the API
        const data = await response.json();

        // If the API has no lyrics data, handle that case
        if (!data.lyrics) {
            return res.json({
                status: false,
                creator: `${creator}`,
                code: 404,
                message: 'Lyrics not found'
            });
        }

        // Respond with the structured and professional JSON format
        res.json({
            status: true,
            code: 200,
            creator: `${creator}`,
            result: {
                title: data.title || 'Unknown Title',
                author: data.author || 'Unknown Author',
                lyrics: data.lyrics || 'No lyrics available',
                thumbnail: data.thumbnail || { genius: 'No thumbnail available' },
                links: data.links || { genius: 'No external links available' },
                disclaimer: data.disclaimer || 'No disclaimer available'
            }
        });
    } catch (e) {
        console.error('Error fetching lyrics:', e);
        res.json(loghandler.error);
    }
});
                      


// Route to get global COVID-19 data
router.get('/info/covidworld', async (req, res) => {
    const Apikey = req.query.apikey;

    if (!Apikey) return res.json(loghandler.notparam);
    if (!listkey.includes(Apikey)) return res.json(loghandler.invalidKey);

    try {
        const response = await fetch(encodeURI(`https://covid19-api-zhirrr.vercel.app/api/world`));
        const data = await response.json();
        res.json({
            status: true,
            code: 200,
            creator: `${creator}`,
            result: data
        });
    } catch (e) {
        console.error('Error fetching global COVID-19 data:', e);
        res.json(loghandler.error);
    }
});

// Route to search Kusonime anime
router.get('/anime/akira', async (req, res) => {
    const Apikey = req.query.apikey;

    // Check if API key is provided
    if (!Apikey) return res.json(loghandler.notparam);
    if (!listkey.includes(Apikey)) return res.json(loghandler.invalidKey);

    try {
        // Fetch the raw JSON data from GitHub
        const response = await fetch('https://raw.githubusercontent.com/GlobalTechInfo/api/Guru/BOT-JSON/anime-akira.json');
        const data = await response.json();

        // If no images are found, return an error
        if (data.length === 0) {
            return res.json({ status: false, message: "No images found." });
        }

        // Select a random image URL from the array
        const randomImage = data[Math.floor(Math.random() * data.length)];

        // Return the result with the random image URL
        res.json({ result: randomImage });

    } catch (e) {
        console.error('Error fetching data:', e);
        res.json(loghandler.error);
    }
});

router.get('/anime/akiyama', async (req, res) => {
    const Apikey = req.query.apikey;

    // Check if API key is provided
    if (!Apikey) return res.json(loghandler.notparam);
    if (!listkey.includes(Apikey)) return res.json(loghandler.invalidKey);

    try {
        // Fetch the raw JSON data from GitHub
        const response = await fetch('https://raw.githubusercontent.com/GlobalTechInfo/api/Guru/BOT-JSON/anime-akiyama.json');
        const data = await response.json();

        // If no data is found, return an error
        if (data.length === 0) {
            return res.json({ status: false, message: "No items found." });
        }

        // Select a random item from the array
        const randomItem = data[Math.floor(Math.random() * data.length)];

        // Return the result with the random item
        res.json({ result: randomItem });

    } catch (e) {
        console.error('Error fetching data:', e);
        res.json(loghandler.error);
    }
});

router.get('/anime/anna', async (req, res) => {
    const Apikey = req.query.apikey;

    // Check if API key is provided
    if (!Apikey) return res.json(loghandler.notparam);
    if (!listkey.includes(Apikey)) return res.json(loghandler.invalidKey);

    try {
        // Fetch the raw JSON data from GitHub
        const response = await fetch('https://raw.githubusercontent.com/GlobalTechInfo/api/Guru/BOT-JSON/anime-anna.json');
        const data = await response.json();

        // If no data is found, return an error
        if (data.length === 0) {
            return res.json({ status: false, message: "No items found." });
        }

        // Select a random item from the array
        const randomItem = data[Math.floor(Math.random() * data.length)];

        // Return the result with the random item
        res.json({ result: randomItem });

    } catch (e) {
        console.error('Error fetching data:', e);
        res.json(loghandler.error);
    }
});

router.get('/anime/cosplay', async (req, res) => {
    const Apikey = req.query.apikey;

    // Check if API key is provided
    if (!Apikey) return res.json(loghandler.notparam);
    if (!listkey.includes(Apikey)) return res.json(loghandler.invalidKey);

    try {
        // Fetch the raw JSON data from GitHub
        const response = await fetch('https://raw.githubusercontent.com/GlobalTechInfo/api/Guru/BOT-JSON/anime-cosplay.json');
        const data = await response.json();

        // If no data is found, return an error
        if (data.length === 0) {
            return res.json({ status: false, message: "No items found." });
        }

        // Select a random item from the array
        const randomItem = data[Math.floor(Math.random() * data.length)];

        // Return the result with the random item
        res.json({ result: randomItem });

    } catch (e) {
        console.error('Error fetching data:', e);
        res.json(loghandler.error);
    }
});

router.get('/anime/eba', async (req, res) => {
    const Apikey = req.query.apikey;

    // Check if API key is provided
    if (!Apikey) return res.json(loghandler.notparam);
    if (!listkey.includes(Apikey)) return res.json(loghandler.invalidKey);

    try {
        // Fetch the raw JSON data from GitHub
        const response = await fetch('https://raw.githubusercontent.com/GlobalTechInfo/api/Guru/BOT-JSON/anime-eba.json');
        const data = await response.json();

        // If no data is found, return an error
        if (data.length === 0) {
            return res.json({ status: false, message: "No items found." });
        }

        // Select a random item from the array
        const randomItem = data[Math.floor(Math.random() * data.length)];

        // Return the result with the random item
        res.json({ result: randomItem });

    } catch (e) {
        console.error('Error fetching data:', e);
        res.json(loghandler.error);
    }
});

router.get('/anime/elaina', async (req, res) => {
    const Apikey = req.query.apikey;

    // Check if API key is provided
    if (!Apikey) return res.json(loghandler.notparam);
    if (!listkey.includes(Apikey)) return res.json(loghandler.invalidKey);

    try {
        // Fetch the raw JSON data from GitHub
        const response = await fetch('https://raw.githubusercontent.com/GlobalTechInfo/api/Guru/BOT-JSON/anime-elaina.json');
        const data = await response.json();

        // If no data is found, return an error
        if (data.length === 0) {
            return res.json({ status: false, message: "No items found." });
        }

        // Select a random item from the array
        const randomItem = data[Math.floor(Math.random() * data.length)];

        // Return the result with the random item
        res.json({ result: randomItem });

    } catch (e) {
        console.error('Error fetching data:', e);
        res.json(loghandler.error);
    }
});

router.get('/anime/erza', async (req, res) => {
    const Apikey = req.query.apikey;

    // Check if API key is provided
    if (!Apikey) return res.json(loghandler.notparam);
    if (!listkey.includes(Apikey)) return res.json(loghandler.invalidKey);

    try {
        // Fetch the raw JSON data from GitHub
        const response = await fetch('https://raw.githubusercontent.com/GlobalTechInfo/api/Guru/BOT-JSON/anime-erza.json');
        const data = await response.json();

        // If no data is found, return an error
        if (data.length === 0) {
            return res.json({ status: false, message: "No items found." });
        }

        // Select a random item from the array
        const randomItem = data[Math.floor(Math.random() * data.length)];

        // Return the result with the random item
        res.json({ result: randomItem });

    } catch (e) {
        console.error('Error fetching data:', e);
        res.json(loghandler.error);
    }
});

router.get('/anime/emilia', async (req, res) => {
    const Apikey = req.query.apikey;

    // Check if API key is provided
    if (!Apikey) return res.json(loghandler.notparam);
    if (!listkey.includes(Apikey)) return res.json(loghandler.invalidKey);

    try {
        // Fetch the raw JSON data from GitHub
        const response = await fetch('https://raw.githubusercontent.com/GlobalTechInfo/api/Guru/BOT-JSON/anime-emilia.json');
        const data = await response.json();

        // If no data is found, return an error
        if (data.length === 0) {
            return res.json({ status: false, message: "No items found." });
        }

        // Select a random item from the array
        const randomItem = data[Math.floor(Math.random() * data.length)];

        // Return the result with the random item
        res.json({ result: randomItem });

    } catch (e) {
        console.error('Error fetching data:', e);
        res.json(loghandler.error);
    }
});

router.get('/anime/chiho', async (req, res) => {
    const Apikey = req.query.apikey;

    // Check if API key is provided
    if (!Apikey) return res.json(loghandler.notparam);
    if (!listkey.includes(Apikey)) return res.json(loghandler.invalidKey);

    try {
        // Fetch the raw JSON data from GitHub
        const response = await fetch('https://raw.githubusercontent.com/GlobalTechInfo/api/Guru/BOT-JSON/anime-chiho.json');
        const data = await response.json();

        // If no data is found, return an error
        if (data.length === 0) {
            return res.json({ status: false, message: "No items found." });
        }

        // Select a random item from the array
        const randomItem = data[Math.floor(Math.random() * data.length)];

        // Return the result with the random item
        res.json({ result: randomItem });

    } catch (e) {
        console.error('Error fetching data:', e);
        res.json(loghandler.error);
    }
});

router.get('/anime/itachi', async (req, res) => {
    const Apikey = req.query.apikey;

    // Check if API key is provided
    if (!Apikey) return res.json(loghandler.notparam);
    if (!listkey.includes(Apikey)) return res.json(loghandler.invalidKey);

    try {
        // Fetch the raw JSON data from GitHub
        const response = await fetch('https://raw.githubusercontent.com/GlobalTechInfo/api/Guru/BOT-JSON/anime-itachi.json');
        const data = await response.json();

        // If no data is found, return an error
        if (data.length === 0) {
            return res.json({ status: false, message: "No items found." });
        }

        // Select a random item from the array
        const randomItem = data[Math.floor(Math.random() * data.length)];

        // Return the result with the random item
        res.json({ result: randomItem });

    } catch (e) {
        console.error('Error fetching data:', e);
        res.json(loghandler.error);
    }
});

router.get('/anime/miku', async (req, res) => {
    const Apikey = req.query.apikey;

    // Check if API key is provided
    if (!Apikey) return res.json(loghandler.notparam);
    if (!listkey.includes(Apikey)) return res.json(loghandler.invalidKey);

    try {
        // Fetch the raw JSON data from GitHub
        const response = await fetch('https://raw.githubusercontent.com/GlobalTechInfo/api/Guru/BOT-JSON/anime-miku.json');
        const data = await response.json();

        // If no data is found, return an error
        if (data.length === 0) {
            return res.json({ status: false, message: "No items found." });
        }

        // Select a random item from the array
        const randomItem = data[Math.floor(Math.random() * data.length)];

        // Return the result with the random item
        res.json({ result: randomItem });

    } catch (e) {
        console.error('Error fetching data:', e);
        res.json(loghandler.error);
    }
});

router.get('/anime/nezuko', async (req, res) => {
    const Apikey = req.query.apikey;

    // Check if API key is provided
    if (!Apikey) return res.json(loghandler.notparam);
    if (!listkey.includes(Apikey)) return res.json(loghandler.invalidKey);

    try {
        // Fetch the raw JSON data from GitHub
        const response = await fetch('https://raw.githubusercontent.com/GlobalTechInfo/api/Guru/BOT-JSON/anime-nezoku.json');
        const data = await response.json();

        // If no data is found, return an error
        if (data.length === 0) {
            return res.json({ status: false, message: "No items found." });
        }

        // Select a random item from the array
        const randomItem = data[Math.floor(Math.random() * data.length)];

        // Return the result with the random item
        res.json({ result: randomItem });

    } catch (e) {
        console.error('Error fetching data:', e);
        res.json(loghandler.error);
    }
});

router.get('/anime/hentai', async (req, res) => {
    const Apikey = req.query.apikey;

    // Check if API key is provided
    if (!Apikey) return res.json(loghandler.notparam);
    if (!listkey.includes(Apikey)) return res.json(loghandler.invalidKey);

    try {
        // Fetch the raw JSON data from GitHub
        const response = await fetch('https://raw.githubusercontent.com/GlobalTechInfo/api/Guru/BOT-JSON/hentai.json');
        const data = await response.json();

        // If no data is found, return an error
        if (data.length === 0) {
            return res.json({ status: false, message: "No items found." });
        }

        // Select a random item from the array
        const randomItem = data[Math.floor(Math.random() * data.length)];

        // Return the result with the random item
        res.json({ result: randomItem });

    } catch (e) {
        console.error('Error fetching data:', e);
        res.json(loghandler.error);
    }
});

router.get('/anime/sagiri', async (req, res) => {
    const Apikey = req.query.apikey;

    // Check if API key is provided
    if (!Apikey) return res.json(loghandler.notparam);
    if (!listkey.includes(Apikey)) return res.json(loghandler.invalidKey);

    try {
        // Fetch the raw JSON data from GitHub
        const response = await fetch('https://raw.githubusercontent.com/GlobalTechInfo/api/Guru/BOT-JSON/anime-sagiri.json');
        const data = await response.json();

        // If no data is found, return an error
        if (data.length === 0) {
            return res.json({ status: false, message: "No items found." });
        }

        // Select a random item from the array
        const randomItem = data[Math.floor(Math.random() * data.length)];

        // Return the result with the random item
        res.json({ result: randomItem });

    } catch (e) {
        console.error('Error fetching data:', e);
        res.json(loghandler.error);
    }
});

router.get('/anime/mikasa', async (req, res) => {
    const Apikey = req.query.apikey;

    // Check if API key is provided
    if (!Apikey) return res.json(loghandler.notparam);
    if (!listkey.includes(Apikey)) return res.json(loghandler.invalidKey);

    try {
        // Fetch the raw JSON data from GitHub
        const response = await fetch('https://raw.githubusercontent.com/GlobalTechInfo/api/Guru/BOT-JSON/anime-mikasa.json');
        const data = await response.json();

        // If no data is found, return an error
        if (data.length === 0) {
            return res.json({ status: false, message: "No items found." });
        }

        // Select a random item from the array
        const randomItem = data[Math.floor(Math.random() * data.length)];

        // Return the result with the random item
        res.json({ result: randomItem });

    } catch (e) {
        console.error('Error fetching data:', e);
        res.json(loghandler.error);
    }
});

router.get('/anime/sasuke', async (req, res) => {
    const Apikey = req.query.apikey;

    // Check if API key is provided
    if (!Apikey) return res.json(loghandler.notparam);
    if (!listkey.includes(Apikey)) return res.json(loghandler.invalidKey);

    try {
        // Fetch the raw JSON data from GitHub
        const response = await fetch('https://raw.githubusercontent.com/GlobalTechInfo/api/Guru/BOT-JSON/anime-sasuke.json');
        const data = await response.json();

        // If no data is found, return an error
        if (data.length === 0) {
            return res.json({ status: false, message: "No items found." });
        }

        // Select a random item from the array
        const randomItem = data[Math.floor(Math.random() * data.length)];

        // Return the result with the random item
        res.json({ result: randomItem });

    } catch (e) {
        console.error('Error fetching data:', e);
        res.json(loghandler.error);
    }
});


// Route to get Tebak Gambar quiz questions
router.get('/kuis/quiz', async (req, res) => {
    const apikey = req.query.apikey;

    if (!apikey) return res.json(loghandler.notparam);
    if (!listkey.includes(apikey)) return res.json(loghandler.invalidKey);

    try {
        const result = await tebakGambar();  // Assuming `tebakGambar` is a function that returns the image, answer, and clue
        
        if (result) {
            const hasil = {
                status: true,
                code: 200,
                creator: `${creator}`,
                image: result.img,
                answer: result.jawaban,
                clue: result.petunjuk
            };
            return res.json(hasil);
        } else {
            return res.status(408).json({
                status: 408,
                error: 'Error fetching Tebak Gambar data'
            });
        }
    } catch (e) {
        console.error('Error fetching Tebak Gambar data:', e);
        res.status(500).json({
            status: 500,
            error: 'Internal Server Error'
        });
    }
});


// Route to generate dice roll image
router.get('/maker/dadu', async (req, res, next) => {
  const Apikey = req.query.apikey;

  // Validate the API key
  if (!Apikey) return res.json(loghandler.notparam);
  if (!listkey.includes(Apikey)) return res.json(loghandler.invalidKey);

  try {
    // Generate a random number between 1 and 6
    const random = Math.floor(Math.random() * 6) + 1;
    const diceImageUrl = `https://www.random.org/dice/dice${random}.png`;

    // Fetch the dice image
    const data = await fetch(diceImageUrl).then(v => v.buffer());

    // Save the image to the server
    await fs.writeFileSync(__path + '/tmp/dadu.png', data);

    // Send the generated image as a response
    res.sendFile(__path + '/tmp/dadu.png');
  } catch (err) {
    console.error("Error generating dice roll:", err);
    res.json(loghandler.error); // Handle any errors that occur
  }
});

// Route to serve a random video from asupan.json
router.get('/asupan', async (req, res, next) => {
  const Apikey = req.query.apikey;

  // Validate the API key
  if (!Apikey) return res.json(loghandler.notparam);
  if (!listkey.includes(Apikey)) return res.json(loghandler.invalidKey);

  try {
    // Load the asupan data from a JSON file
    const asupan = JSON.parse(fs.readFileSync(__path + '/data/asupan.json'));

    // Select a random asupan video URL
    const Asupan = asupan[Math.floor(Math.random() * asupan.length)];
    const videoUrl = Asupan.asupan;

    // Fetch the video
    const data = await fetch(videoUrl).then(v => v.buffer());

    // Save the video file to the server
    await fs.writeFileSync(__path + '/tmp/asupan.mp4', data);

    // Send the video file as a response
    res.sendFile(__path + '/tmp/asupan.mp4');
  } catch (err) {
    console.error("Error fetching asupan:", err);
    res.json(loghandler.error); // Handle any errors that occur
  }
});


// Route to check if an API key is active
router.get('/checkapikey', async (req, res, next) => {
  const apikey = req.query.apikey;

  // Validate if API key is provided
  if (!apikey) return res.json(loghandler.notparam);

  // Check if the API key exists in the list
  if (listkey.includes(apikey)) {
    res.json({
      status: 'active',
      creator: `${creator}`,
      apikey: `${apikey}`,
      message: 'APIKEY ACTIVE'
    });
  } else {
    res.json(loghandler.invalidKey);
  }
});

// 404 Error Handler
router.use(function (req, res) {
  res.status(404)
     .set("Content-Type", "text/html")
     .sendFile(__path + '/views/404.html');  // Make sure 404.html exists in the correct path
});

// Export the router module
module.exports = router;


