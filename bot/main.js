const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

const {
  uploadVideo,
  typeHashTag,
  sendPost,
  typeHead,
} = require("./tiktokActions");

const { sleep } = require("./utils");

puppeteer.use(StealthPlugin());

const TIKTOK_UPLOAD_URL = "https://www.tiktok.com/upload?lang=en";

async function main() {
  const browser = await puppeteer.launch({
    defaultViewport: null,
    ignoreHTTPSErrors: true,
    slowMo: 100,
    headless: false,
    args: [
      "--disable-web-security",
      "--disable-features=IsolateOrigins,site-per-process",
    ],
  });
  try {
    // Launch a new browser instance
    const dir = path.join(__dirname, "..", "config");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    const cookie_path = path.join(dir, "tiktok_cookies.json");
    // Navigate to the TikTok upload page
    const page = await browser.newPage();

    // Check if we have stored cookies from a previous login
    if (fs.existsSync(cookie_path)) {
      const cookies = JSON.parse(fs.readFileSync(cookie_path, "utf-8"));
      await page.setCookie(...cookies);
    } else {
      // Navigate to the TikTok login page and login
      await page.goto("https://www.tiktok.com/login/phone-or-email/email");
      await page.waitForSelector('input[name="username"]');
      await page.type('input[name="username"]', process.env.USERNAME);
      await page.type('input[type="password"]', process.env.PASSWORD);
      const loginButton = await page.$('button[type="submit"]');
      await loginButton.click();
      await page.waitForNavigation({ waitUntil: "networkidle0" });
      const cookies = await page.cookies();
      fs.writeFileSync(cookie_path, JSON.stringify(cookies));
    }
    console.log("going to ", TIKTOK_UPLOAD_URL);
    await page.goto(TIKTOK_UPLOAD_URL, {
      waitUntil: "networkidle0",
      timeout: 60000, // set timeout to 60 seconds
    });

    const iframeElement = await page.$(
      "iframe[src='https://www.tiktok.com/creator#/upload?lang=en']"
    );
    const iframeFrame = await iframeElement.contentFrame();
    // console.log(await iframeFrame.click(".upload"));
    // console.log(await page.content());
    console.log(">>> page loaded");
    const videoPath = path.join(
      __dirname,
      "..",
      "test",
      process.env.VIDEO_NAME
    );
    await uploadVideo(iframeFrame, videoPath);
    await sleep(1000 * 60);
    await typeHead(iframeFrame, process.env.TITLE);
    await typeHashTag(iframeFrame, ["calms", "funny", "works"]);
    await sendPost(iframeFrame);
    await sleep(5000);
  } catch (error) {
    console.log(
      error?.message ?? "something went wrong unable to complete the task"
    );
  } finally {
    await browser.close();
  }
}

main();
