// Function to download from Instagram
async function downloadInstagram(url) {
    try {
        const { snapsave } = await import("snapsave-media-downloader"); // Dynamic import
        const download = await snapsave(url);
        console.log("Instagram Download:", download);

        // Check if download is successful and has media
        if (download.success && download.data && download.data.media && download.data.media[0]) {
            const mediaUrl = download.data.media[0].url; // Assuming first media is what we need
            const preview = download.data.preview || download.data.thumbnail || "No preview available"; // Fallback
            const description = download.data.description || "No description available"; // Fallback
            const type = download.data.media[0].type || "unknown"; // Fallback
            return {
                success: true,
                mediaUrl: mediaUrl,
                preview: preview,
                description: description,
                type: type
            };
        } else {
            return { success: false, error: "No media found for the Instagram URL." };
        }
    } catch (error) {
        console.error("Error downloading from Instagram:", error);
        return { success: false, error: `Error downloading from Instagram: ${error.message}` };
    }
}

// Function to download from Facebook
async function downloadFacebook(url) {
    try {
        const { snapsave } = await import("snapsave-media-downloader"); // Dynamic import
        const download = await snapsave(url);
        console.log("Facebook Download:", download);

        // Check if download is successful and has media
        if (download.success && download.data && download.data.media && download.data.media[0]) {
            const mediaUrl = download.data.media[0].url; // Assuming first media is the best
            const preview = download.data.preview || download.data.thumbnail || "No preview available"; // Fallback
            const description = download.data.description || "No description available"; // Fallback
            const type = download.data.media[0].type || "unknown"; // Fallback
            return {
                success: true,
                mediaUrl: mediaUrl,
                preview: preview,
                description: description,
                type: type
            };
        } else {
            return { success: false, error: "No media found for the Facebook URL." };
        }
    } catch (error) {
        console.error("Error downloading from Facebook:", error);
        return { success: false, error: `Error downloading from Facebook: ${error.message}` };
    }
}

// Function to download from TikTok
async function downloadTikTok(url) {
    try {
        const { snapsave } = await import("snapsave-media-downloader"); // Dynamic import
        const download = await snapsave(url);
        console.log("TikTok Download:", download);

        // Check if download is successful and has media
        if (download.success && download.data && download.data.media && download.data.media[0]) {
            const mediaUrl = download.data.media[0].url; // Assuming first media is the best
            const preview = download.data.preview || download.data.thumbnail || "No preview available"; // Fallback
            const description = download.data.description || "No description available"; // Fallback
            const type = download.data.media[0].type || "unknown"; // Fallback
            return {
                success: true,
                mediaUrl: mediaUrl,
                preview: preview,
                description: description,
                type: type
            };
        } else {
            return { success: false, error: "No media found for the TikTok URL." };
        }
    } catch (error) {
        console.error("Error downloading from TikTok:", error);
        return { success: false, error: `Error downloading from TikTok: ${error.message}` };
    }
}

module.exports = {
    downloadInstagram,
    downloadFacebook,
    downloadTikTok
};
