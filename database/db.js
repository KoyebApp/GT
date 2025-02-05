const { Sequelize, DataTypes } = require('sequelize');
const dotenv = require('dotenv');
const path = require('path');

// Dynamically resolve the path (equivalent to __path in your original code)
const __path = process.cwd();

// Assuming 'color.js' is in the 'lib' folder inside the root directory
const { color } = require(path.join(__path, 'lib/color.js'));

// Load environment variables from .env file
dotenv.config();

// Get the database URL from .env, or fallback to the hardcoded URL
const databaseUrl = process.env.DATABASE_URL || 'postgresql://globaltechinfo:vWNdmGJGfztlkw0d1wvnrw@dissed-buck-5725.7s5.aws-ap-south-1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full';

// Log if we are using the fallback URL
if (!process.env.DATABASE_URL) {
  console.log(color('Using hardcoded DATABASE_URL because .env does not have it', 'yellow'));
}

// Create Sequelize instance using DATABASE_URL (either from .env or hardcoded)
const db = new Sequelize(databaseUrl, {
  dialect: 'postgres',  // Specify PostgreSQL
  protocol: 'postgres', // Define protocol as PostgreSQL
  logging: false,       // Disable logging of SQL queries
  dialectOptions: {
    ssl: {
      require: true,            // Ensure SSL connection
      rejectUnauthorized: false,  // Depending on the database, might need this
    },
  },
});

// Log connection attempt with color
async function syncDatabase() {
  try {
    // Try syncing the database models
    await db.sync({ force: false });  // 'force: false' means don't drop/recreate tables
    console.log(color('Connected correctly to server, ZhirrrGanss', 'green'));
  } catch (err) {
    console.error(color(`Error: ${err}\n\nFailed to connect to the database. Check if the connection URL is correct.`, 'red'));
  }
}

// Call the function to sync the database
syncDatabase();

// Export the Sequelize instance (db) for use in other files
module.exports = db;
