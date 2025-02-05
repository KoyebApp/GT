const axios = require('axios');

// Fetch weather data for a given city

// Cuaca function to fetch weather data
const Cuaca = async (kota) => {
    try {
        // Construct URL using the 'kota' variable
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${kota}&units=metric&appid=060a6bcfa19809c2cd4d97a212b19273&language=en`;

        // Fetch the weather data using axios
        const response = await axios.get(url);

        // Access weather data from the response
        const cuaca = response.data;

        // Prepare the result with only necessary details (not the full textw string)
        const result = {
            status: true,
            cuaca
            }
        };

        // Return the result (JSON response)
        return result;
    } catch (err) {
        // Log error and throw a new error to prevent app crash
        console.error('Error fetching weather:', err.message);
        throw new Error('Error fetching weather: ' + err.message);
    }
};
module.exports = { Cuaca };
