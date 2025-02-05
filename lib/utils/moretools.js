const axios = require('axios');
const cheerio = require('cheerio');

function pinterest(query) {
  return new Promise((resolve, reject) => {
    axios.get(`https://id.pinterest.com/search/pins/?autologin=true&q=${query}`, {
      headers: {
        "cookie": "_auth=1; _b=AVna7S1p7l1C5I9u0+nR3YzijpvXOPc6d09SyCzO+DcwpersQH36SmGiYfymBKhZcGg=; _pinterest_sess=TWc9PSZHamJOZ0JobUFiSEpSN3Z4a2NsMk9wZ3gxL1NSc2k2NkFLaUw5bVY5cXR5alZHR0gxY2h2MVZDZlNQalNpUUJFRVR5L3NlYy9JZkthekp3bHo5bXFuaFZzVHJFMnkrR3lTbm56U3YvQXBBTW96VUgzVUhuK1Z4VURGKzczUi9hNHdDeTJ5Y2pBTmxhc2owZ2hkSGlDemtUSnYvVXh5dDNkaDN3TjZCTk8ycTdHRHVsOFg2b2NQWCtpOWxqeDNjNkk3cS85MkhhSklSb0hwTnZvZVFyZmJEUllwbG9UVnpCYVNTRzZxOXNJcmduOVc4aURtM3NtRFo3STlmWjJvSjlWTU5ITzg0VUg1NGhOTEZzME9SNFNhVWJRWjRJK3pGMFA4Q3UvcHBnWHdaYXZpa2FUNkx6Z3RNQjEzTFJEOHZoaHRvazc1c1UrYlRuUmdKcDg3ZEY4cjNtZlBLRTRBZjNYK0lPTXZJTzQ5dU8ybDdVS015bWJKT0tjTWYyRlBzclpiamdsNmtpeUZnRjlwVGJXUmdOMXdTUkFHRWloVjBMR0JlTE5YcmhxVHdoNzFHbDZ0YmFHZ1VLQXU1QnpkM1FqUTNMTnhYb3VKeDVGbnhNSkdkNXFSMXQybjRGL3pyZXRLR0ZTc0xHZ0JvbTJCNnAzQzE0cW1WTndIK0trY05HV1gxS09NRktadnFCSDR2YzBoWmRiUGZiWXFQNjcwWmZhaDZQRm1UbzNxc21pV1p5WDlabm1UWGQzanc1SGlrZXB1bDVDWXQvUis3elN2SVFDbm1DSVE5Z0d4YW1sa2hsSkZJb1h0MTFpck5BdDR0d0lZOW1Pa2RDVzNySWpXWmUwOUFhQmFSVUpaOFQ3WlhOQldNMkExeDIvMjZHeXdnNjdMYWdiQUhUSEFBUlhUVTdBMThRRmh1ekJMYWZ2YTJkNlg0cmFCdnU2WEpwcXlPOVZYcGNhNkZDd051S3lGZmo0eHV0ZE42NW8xRm5aRWpoQnNKNnNlSGFad1MzOHNkdWtER0xQTFN5Z3lmRERsZnZWWE5CZEJneVRlMDd2VmNPMjloK0g5eCswZUVJTS9CRkFweHc5RUh6K1JocGN6clc1JmZtL3JhRE1sc0NMTFlpMVErRGtPcllvTGdldz0=",
      },
    }).then(({ data }) => {
      const $ = cheerio.load(data);
      const result = [];
      const hasil = [];

      // Extract image URLs
      $('div > a').get().map(b => {
        const link = $(b).find('img').attr('src');
        if (link) result.push(link);
      });

      // Modify and clean image URLs
      result.forEach(v => {
        if (v) hasil.push(v.replace(/236/g, '736'));
      });

      hasil.shift();  // Remove first element
      resolve(hasil);
    }).catch(reject);
  });
}
// Fetch wallpaper images based on title
function wallpaper(title, page = '1') {
  return new Promise((resolve, reject) => {
    axios.get(`https://www.besthdwallpaper.com/search?CurrentPage=${page}&q=${title}`)
      .then(({ data }) => {
        const $ = cheerio.load(data);
        const hasil = [];

        $('div.grid-item').each(function (a, b) {
          hasil.push({
            title: $(b).find('div.info > a > h3').text(),
            type: $(b).find('div.info > a:nth-child(2)').text(),
            source: 'https://www.besthdwallpaper.com/' + $(b).find('div > a:nth-child(3)').attr('href'),
            image: [
              $(b).find('picture > img').attr('data-src') || $(b).find('picture > img').attr('src'),
              $(b).find('picture > source:nth-child(1)').attr('srcset'),
              $(b).find('picture > source:nth-child(2)').attr('srcset')
            ],
          });
        });
        resolve(hasil);
      }).catch(reject);
  });
}

// Fetch images from Wikimedia Commons
function wikimedia(title, retries = 3) {
  return new Promise((resolve, reject) => {
    axios.get(`https://commons.wikimedia.org/w/index.php?search=${title}&title=Special:MediaSearch&go=Go&type=image`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
      }
    })
    .then(({ data }) => {
      const $ = cheerio.load(data);
      const hasil = [];

      $('.sdms-search-results__list-wrapper > div > a').each(function (a, b) {
        hasil.push({
          title: $(b).find('img').attr('alt'),
          source: $(b).attr('href'),
          image: $(b).find('img').attr('data-src') || $(b).find('img').attr('src'),
        });
      });
      resolve(hasil);
    })
    .catch((error) => {
      if (retries > 0 && error.code === 'ECONNRESET') {
        console.log(`Connection reset, retrying... (${retries} retries left)`);
        setTimeout(() => {
          wikimedia(title, retries - 1).then(resolve).catch(reject);
        }, 5000); // Retry after 5 seconds
      } else {
        console.error('Request failed:', error.message);
        reject(error);
      }
    });
  });
}


// Fetch anime quotes
function quotesAnime() {
  return new Promise((resolve, reject) => {
    const page = Math.floor(Math.random() * 184);
    axios.get(`https://otakotaku.com/quote/feed/${page}`)
      .then(({ data }) => {
        const $ = cheerio.load(data);
        const hasil = [];

        $('div.kotodama-list').each(function (l, h) {
          hasil.push({
            link: $(h).find('a').attr('href'),
            gambar: $(h).find('img').attr('data-src'),
            karakter: $(h).find('div.char-name').text().trim(),
            anime: $(h).find('div.anime-title').text().trim(),
            episode: $(h).find('div.meta').text(),
            up_at: $(h).find('small.meta').text(),
            quotes: $(h).find('div.quote').text().trim(),
          });
        });
        resolve(hasil);
      }).catch(reject);
  });
}

// Fetch HappyMod APKs based on search query
function happymod(query) {
  return new Promise((resolve, reject) => {
    axios.get(`https://www.happymod.com/search.html?q=${query}`)
      .then(({ data }) => {
        const $ = cheerio.load(data);
        const hasil = [];

        $("div.pdt-app-box").each(function (c, d) {
          const title = $(d).find("a").text().trim();
          const icon = $(d).find("img.lazy").attr('data-original');
          const rating = $(d).find("span").text();
          const link = 'https://www.happymod.com/' + $(d).find("a").attr('href');
          hasil.push({
            title,
            icon,
            link,
            rating,
          });
        });
        resolve(hasil);
      }).catch(reject);
  });
}

// Fetch media from Umma website
function umma(url) {
  return new Promise((resolve, reject) => {
    axios.get(url)
      .then(({ data }) => {
        const $ = cheerio.load(data);
        const image = [];

        // Collect all image sources
        $('#article-content > div').find('img').each(function (a, b) {
          image.push($(b).attr('src'));
        });

        const hasil = {
          title: $('#wrap > div.content-container.font-6-16 > h1').text().trim(),
          author: {
            name: $('#wrap > div.content-container.font-6-16 > div.content-top > div > div.user-ame.font-6-16.fw').text().trim(),
            profilePic: $('#wrap > div.content-container.font-6-16 > div.content-top > div > div.profile-photo > img.photo').attr('src'),
          },
          caption: $('#article-content > div > p').text().trim(),
          media: $('#article-content > div > iframe').attr('src') ? [$('#article-content > div > iframe').attr('src')] : image,
          type: $('#article-content > div > iframe').attr('src') ? 'video' : 'image',
          like: $('#wrap > div.bottom-btns > div > button:nth-child(1) > div.text.font-6-12').text(),
        };
        resolve(hasil);
      }).catch(reject);
  });
}

// Fetch ringtones based on title
function ringtone(title) {
  return new Promise((resolve, reject) => {
    axios.get(`https://meloboom.com/en/search/${title}`)
      .then(({ data }) => {
        const $ = cheerio.load(data);
        const hasil = [];

        $('#__next > main > section > div.jsx-2244708474.container > div > div > div > div:nth-child(4) > div > div > div > ul > li').each(function (a, b) {
          hasil.push({
            title: $(b).find('h4').text(),
            source: 'https://meloboom.com/' + $(b).find('a').attr('href'),
            audio: $(b).find('audio').attr('src'),
          });
        });
        resolve(hasil);
      }).catch(reject);
  });
}

// Convert text to styled versions
function styletext(teks) {
  return new Promise((resolve, reject) => {
    axios.get(`http://qaz.wtf/u/convert.cgi?text=${teks}`)
      .then(({ data }) => {
        const $ = cheerio.load(data);
        const hasil = [];

        $('table > tbody > tr').each(function (a, b) {
          hasil.push({
            name: $(b).find('td:nth-child(1) > span').text(),
            result: $(b).find('td:nth-child(2)').text().trim(),
          });
        });
        resolve(hasil);
      }).catch(reject);
  });
}

module.exports = {
  pinterest,
  wallpaper,
  wikimedia,
  quotesAnime,
  happymod,
  umma,
  ringtone,
  styletext,
};
