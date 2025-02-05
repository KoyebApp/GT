const axios = require('axios');

// Helper function to clean the URL
const makeurl = (url) => {
  const match = url.match(/(https:\/\/x\.com\/[^\/]+\/status\/\d+)(\/photo\/\d+)?(\/\d+)?/i);
  return match ? match[1] : url;
};

// The xdown function
const xdown = async (url, options = {}) => {
  try {
    const input = 'object' === typeof url ? url.url ? url : { found: false, error: 'No URL provided' } : { url: url },
          { buffer, text } = options;
    (buffer || text) && ((input.buffer = buffer), (input.text = text));
    
    const cleanedURL = makeurl(input.url);
    if (!/\/\/x.com/.test(cleanedURL))
      return { found: false, error: `Invalid URL: ${cleanedURL}` };
    
    const apiURL = cleanedURL.replace('//x.com', '//api.vxtwitter.com'),
          result = await axios
            .get(apiURL)
            .then((res) => res.data)
            .catch(() => ({ found: false, error: 'An issue occurred. Make sure the x link is valid.' }));
    
    if (!result.media_extended) return { found: false, error: 'No media found' };
    
    const output = {
      creator: 'Qasim Ali',
      found: true,
      media: result.media_extended.map(({ url, type }) => ({ url, type })),
      date: result.date,
      likes: result.likes,
      replies: result.replies,
      retweets: result.retweets,
      authorName: result.user_name,
      authorUsername: result.user_screen_name,
      ...(input.text && { text: result.text })
    };

    if (input.buffer)
      for (const media of output.media)
        media.buffer = await axios
          .get(media.url, { responseType: 'arraybuffer' })
          .then((res) => Buffer.from(res.data, 'binary'))
          .catch(() => {});
      
    return output;
  } catch (error) {
    console.error('Error in xdown:', error.message);
    throw new Error('Failed to get x media');
  }
};

// Export the xdown function
module.exports = xdown;
          
