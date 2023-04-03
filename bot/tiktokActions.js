const { sleep } = require("./utils");

const typeHead = async (iframe, head) => {
  try {
    console.log(">>> try type head");
    const nameInputSelector = ".public-DraftEditor-content";
    await iframe.waitForSelector(nameInputSelector);
    await iframe.hover(nameInputSelector);
    await iframe.focus(nameInputSelector);
    console.log("keyboard", iframe.keyboard);
    await iframe.type(nameInputSelector, `${head} `);
    console.log(">>> head success");
  } catch (error) {
    console.log("error: ", error);
    await sleep(2000);
    await typeHead(iframe, head);
  }
};

const typeHashTag = async (iframe, tags) => {
  try {
    console.log(">>> try type hashtags");
    const nameInputSelector = ".public-DraftEditor-content";
    await iframe.waitForSelector(nameInputSelector);
    await iframe.hover(nameInputSelector);
    await iframe.focus(nameInputSelector);
    for (const hashtag of tags) {
      await iframe.type(nameInputSelector, "#" + hashtag);
      await sleep(2500);
      await (await iframe.$(nameInputSelector)).press("Enter");
    }
    console.log(`>>> hashtags success`);
  } catch (error) {
    console.log("error: ", error);
    await sleep(2000);
    await typeHashTag(iframe, tags);
  }
};

const uploadVideo = async (iframe, videoPath) => {
  try {
    console.log(">>> try load video");
    const fileInputSelector = '.upload > input[type="file"]';
    await iframe.waitForSelector(fileInputSelector);
    const fileInput = await iframe.$(fileInputSelector);
    await fileInput.uploadFile(videoPath);
    console.log(">>> load video in progress");
  } catch (error) {
    console.log("error: ", error);
    await sleep(1000);
    await uploadVideo(iframe, videoPath);
  }
};

const sendPost = async (iframe, tryCount = 1) => {
  try {
    const sendPostSelector = ".btn-post > button:not([disabled])";
    await iframe.waitForSelector(sendPostSelector);
    console.log(">>> load video success");
    console.log(">>> try send post: ", tryCount);
    await iframe.hover(sendPostSelector);
    await (await iframe.$(sendPostSelector)).click();
  } catch (error) {
    console.log("error: ", error);
    if (tryCount === 4) {
      return;
    }
    await sleep(1000);
    tryCount += 1;
    await sendPost(iframe, tryCount);
  }
};

module.exports.typeHead = typeHead;
module.exports.typeHashTag = typeHashTag;
module.exports.uploadVideo = uploadVideo;
module.exports.sendPost = sendPost;
