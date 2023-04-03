const fs = require("fs");
const path = require("path");
const axios = require("axios");

async function downloadVideo(url) {
  // Get the filename from the URL
  const filename = path.basename(url);

  // Create the videos directory if it doesn't exist
  const dir = path.join(__dirname, "..", "remote-videos");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  // Download the video and save it to disk
  const response = await axios.get(url, { responseType: "arraybuffer" });
  const buffer = Buffer.from(response.data);
  const filepath = path.join(dir, filename);
  fs.writeFileSync(filepath, buffer);

  // Return the path of the saved file
  return filepath;
}

const getVideos = () => {
  const videosRaw = fs.readFileSync(
    path.join(__dirname, "..", "config", "videos.js")
  );
  return JSON.parse(videosRaw).videos;
};

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

module.exports.getVideos = getVideos;
module.exports.sleep = sleep;
module.exports.downloadVideo = downloadVideo;
