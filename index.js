require('dotenv').config();

__path = process.cwd();

var favicon = require('serve-favicon');
var express = require('express'),
    cors = require('cors'),
    secure = require('ssl-express-www');

const PORT = process.env.PORT || 8080 || 5000 || 3000;

var { color } = require('./lib/color.js');

var mainrouter = require('./routes/main'),
    apirouter = require('./routes/api');

var app = express();

app.enable('trust proxy');
app.set("json spaces", 2);
app.use(cors());
app.use(secure);
app.use(favicon(__path + '/views/favicon.ico'));
app.use(express.static("public"));

app.use('/', mainrouter);
app.use('/api', apirouter);

// KeepAlive function
function keepAlive() {
  const url = process.env.APP_URL;  // Fetch URL from environment variable
  if (!url) {
    console.log('No APP_URL provided, skipping keepAlive...');
    return;  // Skip if the URL is not provided
  }
  
  if (/(\/\/|\.)undefined\./.test(url)) {
    console.log('Invalid APP_URL format, skipping keepAlive...');
    return;  // Skip if URL is invalid
  }

  // Periodically ping the URL every 5 minutes
  setInterval(() => {
    fetch(url).catch(console.error);
  }, 5 * 1000 * 60);  // 5 minutes
}

// Start the server
app.listen(PORT, () => {
    console.log(color("Server running on port " + PORT, 'green'));

    // Invoke keepAlive to periodically ping the URL if provided
    keepAlive();
});

module.exports = app;
