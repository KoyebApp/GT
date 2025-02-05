const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const ffmpeg = require('fluent-ffmpeg');

// Directory for storing MP3 files
const publicDir = path.join(__dirname, 'public', 'audio');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Function to convert video to MP3
async function V2A(videoUrl, videoTitle) {
  try {
    console.log('Fetching video:', videoUrl);

    // Fetch the video content
    const mediaResponse = await fetch(videoUrl);
    if (!mediaResponse.ok) {
      throw new Error('Failed to fetch the video.');
    }

    const arrayBuffer = await mediaResponse.arrayBuffer();
    const mediaBuffer = Buffer.from(arrayBuffer);

    if (mediaBuffer.length === 0) throw new Error('Downloaded file is empty');

    // Save the video buffer as a temporary file
    const videoPath = path.join(__dirname, 'custom_tmp', 'video.mp4');
    fs.writeFileSync(videoPath, mediaBuffer);

    // Define the MP3 output path
    const audioFilename = `${videoTitle.replace(/\s+/g, '_').toLowerCase()}.mp3`; // Sanitize the filename
    const audioPath = path.join(publicDir, audioFilename);

    console.log('Starting conversion of video to MP3...');
    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .audioCodec('libmp3lame')
        .audioBitrate(128)
        .toFormat('mp3')
        .on('end', () => {
          console.log('Conversion finished, cleaning up...');
          fs.unlinkSync(videoPath); // Clean up video file
          const fileUrl = `/audio/${audioFilename}`; // Relative URL to access the MP3 file
          resolve(fileUrl); // Return the relative URL to access the MP3
        })
        .on('error', (err) => {
          console.error('FFmpeg error:', err);
          reject(`Error during conversion: ${err.message}`);
        })
        .save(audioPath); // Save the converted MP3 file
    });
  } catch (error) {
    console.error('Error in convertVideoToMp3:', error);
    throw error; // Rethrow the error to handle it in the calling function
  }
}

module.exports = { V2A };
