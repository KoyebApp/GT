// File: timeUtils.js (or any name you prefer)
const cityTimezones = require('city-timezones');
const moment = require('moment-timezone');

// Function to get time by city or country name using multiple methods
function GetTime(name) {
    // First, try to find a match using city name
    let lookup = cityTimezones.lookupViaCity(name);

    if (!lookup || lookup.length === 0) {
        // If no city match, try using country code or country name
        lookup = cityTimezones.lookupViaCountry(name);
    }

    if (lookup.length === 0) {
        // If still no match, try to find partial matches from city, state, or province
        lookup = cityTimezones.findFromCityStateProvince(name);
    }

    if (lookup.length === 0) {
        // If no match found, try to find matches using an ISO code (ISO2/ISO3)
        lookup = cityTimezones.findFromIsoCode(name);
    }

    if (lookup.length === 0) {
        // If no match found, throw error
        throw new Error(`No timezone found for ${name}`);
    }

    // Use the first result's timezone
    const timezone = lookup[0].timezone;

    // Get the current time in that timezone
    return moment().tz(timezone).format('YYYY-MM-DD HH:mm:ss');
}

// Export the GetTime function so it can be used elsewhere
module.exports = { GetTime };
