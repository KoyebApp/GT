const needle = require('needle');
const axios = require('axios');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

// Custom fbvdl function for Facebook video download
async function fbvdl(url) {
  return new Promise(async (resolve, reject) => {
    try {
      // Send POST request to get download page
      const response = await fetch('https://www.getfvid.com/downloader', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Referer: 'https://www.getfvid.com/',
        },
        body: new URLSearchParams({
          url: url,
        }),
      });

      // Get the page content
      const body = await response.text();

      // Load HTML content using cheerio
      const $ = cheerio.load(body);

      // Extract relevant data
      const title = $('body > div.page-content > div > div > div.col-lg-10.col-md-10.col-centered > div > div:nth-child(3) > div > div.col-md-5.no-padd > div > h5 > a').text().trim();
      const time = $('#time').text().trim();
      const hd = $('body > div.page-content > div > div > div.col-lg-10.col-md-10.col-centered > div > div:nth-child(3) > div > div.col-md-4.btns-download > p:nth-child(1) > a').attr('href');
      const sd = $('body > div.page-content > div > div > div.col-lg-10.col-md-10.col-centered > div > div:nth-child(3) > div > div.col-md-4.btns-download > p:nth-child(2) > a').attr('href');
      const audio = $('body > div.page-content > div > div > div.col-lg-10.col-md-10.col-centered > div > div:nth-child(3) > div > div.col-md-4.btns-download > p:nth-child(3) > a').attr('href');

      // If any of the fields are empty, log them
      if (!title || !time || !hd || !sd || !audio) {
        console.warn('Some fields are missing or not found!');
      }

      // Return the extracted data in a structured JSON
      resolve({
        result: {
          creator: 'Qasim Ali',
          url: url,
          title: title || 'Title not found',
          time: time || 'Time not found',
          hd: hd || 'HD link not found',
          sd: sd || 'SD link not found',
          audio: audio || 'Audio link not found',
        },
      });

    } catch (error) {
      console.error('Error with FB DOWNLOAD', error.message);
      reject(new Error('Error fetching FB download link: ' + error.message));
    }
  });
}

// TikTok download function with error handling
async function tiktokDl(url) {
  return new Promise(async (resolve, reject) => {
    try {
      if (!url || !url.includes('tiktok.com')) {
        return reject(new Error('Invalid TikTok URL'));
      }

      let data = [];

      function formatNumber(integer) {
        return parseInt(integer).toLocaleString().replace(/,/g, '.');
      }

      function formatDate(n, locale = 'en') {
        let d = new Date(n);
        return d.toLocaleDateString(locale, {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric'
        });
      }

      const domain = 'https://www.tikwm.com/api/';
      let response = await axios.post(domain, {}, {
        headers: {
          'Accept': 'application/json, text/javascript, */*; q=0.01',
          'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'Origin': 'https://www.tikwm.com',
          'Referer': 'https://www.tikwm.com/',
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36',
        },
        params: {
          url: url,
          count: 12,
          cursor: 0,
          web: 1,
          hd: 1
        }
      });

      const res = response.data?.data;
      if (!res) {
        return reject(new Error('Invalid response data or no data found'));
      }

      // Processing the response
      if (res.size === undefined) {
        // If no size, handle as image or different content type
        if (res.images && Array.isArray(res.images)) {
          res.images.forEach(image => {
            data.push({ type: 'photo', url: image });
          });
        }
      } else {
        // If size exists, process video data
        data.push({
          type: 'watermark',
          url: 'https://www.tikwm.com' + res.wmplay,
        }, {
          type: 'nowatermark',
          url: 'https://www.tikwm.com' + res.play,
        }, {
          type: 'nowatermark_hd',
          url: 'https://www.tikwm.com' + res.hdplay
        });
      }

      // Structuring the response
      let json = {
        status: true,
        title: res.title,
        taken_at: formatDate(res.create_time).replace('1970', ''),
        region: res.region,
        id: res.id,
        durations: res.duration,
        duration: res.duration + ' Seconds',
        cover: 'https://www.tikwm.com' + res.cover,
        size_wm: res.wm_size,
        size_nowm: res.size,
        size_nowm_hd: res.hd_size,
        data: data,
        music_info: {
          id: res.music_info.id,
          title: res.music_info.title,
          author: res.music_info.author,
          album: res.music_info.album || null,
          url: 'https://www.tikwm.com' + res.music || res.music_info.play
        },
        stats: {
          views: formatNumber(res.play_count),
          likes: formatNumber(res.digg_count),
          comment: formatNumber(res.comment_count),
          share: formatNumber(res.share_count),
          download: formatNumber(res.download_count)
        },
        author: {
          id: res.author.id,
          fullname: res.author.unique_id,
          nickname: res.author.nickname,
          avatar: 'https://www.tikwm.com' + res.author.avatar
        }
      };

      resolve(json);
    } catch (e) {
      console.error('Error in fetching TikTok video:', e.message); // Log error for debugging
      reject(new Error('Error fetching TikTok video: ' + e.message));
    }
  });
}

// Joox music search function
async function getJooxMusic(query) {
  try {
    // Validate the query before proceeding
    if (!query || typeof query !== 'string' || query.trim() === '') {
      throw new Error('Invalid search query');
    }

    const time = Math.floor(new Date() / 1000);

    // Search for songs on Joox using the API
    const { data } = await axios.get(`http://api.joox.com/web-fcgi-bin//web_search?lang=id&country=id&type=0&search_input=${query}&pn=1&sin=0&ein=29&_=${time}`);

    // Validate if the search returned any items
    if (!data || !data.itemlist || data.itemlist.length === 0) {
      throw new Error('No search results found');
    }

    let result = [];
    let promises = [];
    let ids = [];

    // Extract song IDs
    data.itemlist.forEach(item => {
      ids.push(item.songid);
    });

    // Get detailed song info for each ID
    for (let i = 0; i < data.itemlist.length; i++) {
      const songId = ids[i];
      const songInfoUrl = `http://api.joox.com/web-fcgi-bin/web_get_songinfo?songid=${songId}`;
      
      promises.push(
        axios.get(songInfoUrl, {
          headers: {
            Cookie: 'wmid=142420656; user_type=1; country=id; session_key=2a5d97d05dc8fe238150184eaf3519ad;'
          }
        })
        .then(({ data }) => {
          try {
            const res = JSON.parse(data.replace('MusicInfoCallback(', '').replace('\n)', ''));
            result.push({
              song: res.msong,
              album: res.malbum,
              artist: res.msinger,
              publishDate: res.public_time,
              image: res.imgSrc,
              mp3Url: res.mp3Url
            });
          } catch (error) {
            console.error('Error parsing song info for song ID:', songId, error);
          }
        })
        .catch(error => {
          console.error('Error fetching song info:', error);
        })
      );
    }

    // Fetch lyrics for each song
    for (let i = 0; i < data.itemlist.length; i++) {
      const songId = ids[i];
      const lyricsUrl = `http://api.joox.com/web-fcgi-bin/web_lyric?musicid=${songId}&lang=id&country=id&_=${time}`;

      promises.push(
        axios.get(lyricsUrl)
          .then(({ data }) => {
            try {
              const lyricsData = JSON.parse(data.replace('MusicJsonCallback(', '').replace('\n)', ''));
              const lyrics = lyricsData.lyric;
              if (lyrics) {
                const buff = Buffer.from(lyrics, 'base64');
                const decodedLyrics = buff.toString('utf-8');
                result[i].lyrics = decodedLyrics;
              }
            } catch (error) {
              console.error('Error parsing lyrics for song ID:', songId, error);
            }
          })
          .catch(error => {
            console.error('Error fetching lyrics:', error);
          })
      );
    }

    // Wait for all requests to complete and return result
    await Promise.allSettled(promises); // Using Promise.allSettled to handle all promises

    // Check if any results were found before returning
    if (result.length === 0) {
      throw new Error('No valid song data found');
    }

    return {
      status: true,
      code: 200,
      creator: 'Qasim Ali',
      results: result
    };

  } catch (error) {
    console.error('Error with Joox search:', error.message); // Log the error
    return {
      status: false,
      code: 500,
      message: 'Joox search failed: ' + error.message // Gracefully return the error message
    };
  }
}

module.exports = {
  Joox: getJooxMusic,
  FB: fbvdl,
  Tiktok: tiktokDl
};
        
