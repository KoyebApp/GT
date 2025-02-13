const PasteClient = require("pastebin-api").default;

const client = new PasteClient('EMWTMkQAVfJa9kM-MRUrxd5Oku1U7pgL'); // Use your client key directly

// Fetch pastes from a specific user (assuming the user has public pastes)
async function getPastes() {
  try {
    const pastes = await client.getPastesByUser({
      userKey: null, // No userKey needed for public pastes
      limit: 1000,    // Min: 1, Max: 1000
    });

    console.log(pastes); // List of public pastes
  } catch (error) {
    console.error('Error fetching public pastes:', error);
  }
}

module.exports = getPastes;
