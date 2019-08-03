import axios from "axios";
import { google } from "googleapis";
import fs from "fs";

import { UArchive } from "~/utils";
import { WebServer } from "~/services";

const OAuth2 = google.auth.OAuth2;
const youtube = google.youtube("v3");

const createOAuthClient = async () => {
  const OAuthClient = new OAuth2(
    process.env.GOOGLE_YT_CLIENT_ID,
    process.env.GOOGLE_YT_CLIENT_SECRET,
    process.env.GOOGLE_YT_REDIRECT_URI
  );

  return OAuthClient;
};

const requestUserConsent = OAuthClient => {
  const consentUrl = OAuthClient.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/youtube"]
  });

  console.log(`> [ROBOT YOUTUBE] Please give your consent: ${consentUrl}`);
};

const waitForGoogleCallback = async webServer => {
  return new Promise((resolve, reject) => {
    console.log("> [ROBOT YOUTUBE] Waiting for user consent...");

    webServer.app.get("/oauth2callback", (req, res) => {
      const authCode = req.query.code;
      console.log(`> [ROBOT YOUTUBE] Consent given: ${authCode}`);

      res.send("<h1>Thank you!</h1><p>Now close this tab.</p>");
      resolve(authCode);
    });
  });
};

const requestGoogleForAccessTokens = async (
  OAuthClient,
  authorizationToken
) => {
  return new Promise((resolve, reject) => {
    OAuthClient.getToken(authorizationToken, (error, tokens) => {
      if (error) {
        return reject(error);
      }

      console.log("> [ROBOT YOUTUBE] Access tokens received!");

      OAuthClient.setCredentials(tokens);
      resolve();
    });
  });
};

const setGlobalGoogleAuthentication = OAuthClient => {
  google.options({
    auth: OAuthClient
  });
};

const authenticateWithOAuth = async () => {
  const webServer = await WebServer.startWebServer();
  const OAuthClient = await createOAuthClient();
  requestUserConsent(OAuthClient);
  const authorizationToken = await waitForGoogleCallback(webServer);
  await requestGoogleForAccessTokens(OAuthClient, authorizationToken);
  await setGlobalGoogleAuthentication(OAuthClient);

  await WebServer.stopWebServer(webServer);
};

const mountDescription = state => {
  var arrDesc = [];
  for (var words of state) {
    arrDesc.push(
      `Word (EN/PT): ${words.word} / ${words.translate.word}
      Transcript: ${words.transcript}
      Example:
      EN: ${words.examples[0]}
      PT: ${words.translate.examples[0]}
      `
    );
  }
  return arrDesc;
};

const uploadVideo = async state => {
  const videoFilePath =
    "D:/workspace/video-maker/src/assets/videos/render/final/final_render.mp4";
  const videoFileSize = fs.statSync(videoFilePath).size;
  const videoTitle = `Ten Words every day [02/08]`;
  const videoTags = "Tags";
  const videoDescription = await mountDescription(state);

  const requestParameters = {
    part: "snippet, status",
    requestBody: {
      snippet: {
        title: videoTitle,
        description: videoDescription,
        tags: videoTags
      },
      status: {
        privacyStatus: "unlisted"
      }
    },
    media: {
      body: fs.createReadStream(videoFilePath)
    }
  };

  console.log("> [ROBOT YOUTUBE] Starting to upload the video to YouTube");
  const youtubeResponse = await youtube.videos.insert(requestParameters, {
    onUploadProgress: onUploadProgress
  });

  console.log(
    `> [ROBOT YOUTUBE] Video available at: https://youtu.be/${
      youtubeResponse.data.id
    }`
  );
  return youtubeResponse.data;

  function onUploadProgress(event) {
    const progress = Math.round((event.bytesRead / videoFileSize) * 100);
    console.log(`> [ROBOT YOUTUBE] ${progress}% completed`);
  }
};

const uploadThumbnail = async (source, videoInformation) => {
  const videoId = videoInformation.id;
  const videoThumbnailFilePath = source;

  const requestParameters = {
    videoId: videoId,
    media: {
      mimeType: "image/jpeg",
      body: fs.createReadStream(videoThumbnailFilePath)
    }
  };

  await youtube.thumbnails.set(requestParameters);
  console.log(`> [ROBOT YOUTUBE] Thumbnail uploaded!`);
};

const getTranslateGoogleAPI = async text => {
  try {
    const translations = await axios
      .get(
        `${process.env.GOOGLE_T_URL}/v2?q=${text}&target=pt&key=${
          process.env.GOOGLE_T_API_KEY
        }`
      )
      .then(d => d.data.data.translations);
    return await translations[0].translatedText;
  } catch (error) {
    return "";
  }
};

const getAudio = async (source, nameFile, text) => {
  nameFile = nameFile.replace("\r", "");
  const synthesizeParams = {
    audioConfig: {
      audioEncoding: "mp3"
    },
    input: {
      text: text
    },
    voice: {
      languageCode: "en-US",
      name: "en-US-Wavenet-A"
    }
  };
  try {
    var audioBase64 = await axios
      .post(
        `${
          process.env.GOOGLE_TTS_URL
        }/v1/text:synthesize?fields=audioContent&key=${
          process.env.GOOGLE_TTS_API_KEY
        }`,
        synthesizeParams
      )
      .then(d => d.data.audioContent);

    const buffer = Buffer.from(audioBase64, "base64");
    return await UArchive.writeFileMP3(source, `${nameFile}.mp3`, buffer);
  } catch (error) {
    console.log("Ops..", error);
    return "";
  }
};

module.exports = {
  getTranslateGoogleAPI,
  getAudio,
  authenticateWithOAuth,
  uploadVideo,
  uploadThumbnail
};
