import axios from "axios";
import { google } from "googleapis";
import fs from "fs";
import open from 'open';
import { format } from 'date-fns';
import _ from 'lodash';

import { UArchive, EStatic } from "~/utils";
import { WebServer } from "~/services";
import { file } from "googleapis/build/src/apis/file";

const OAuth2 = google.auth.OAuth2;
const youtube = google.youtube("v3");
const drive = google.drive("v3");

const createOAuthClient = async () => {
  const OAuthClient = new OAuth2(
    process.env.GOOGLE_YT_CLIENT_ID,
    process.env.GOOGLE_YT_CLIENT_SECRET,
    process.env.GOOGLE_YT_REDIRECT_URI
  );

  return OAuthClient;
};

const requestUserConsent = (OAuthClient, scope) => {
  const consentUrl = OAuthClient.generateAuthUrl({
    access_type: "offline",
    scope: scope
  });

  console.log(`> [ROBOT YOUTUBE] Please give your consent: ${consentUrl}`);
  open(consentUrl)
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

const authenticateWithOAuth = async (type) => {
  const webServer = await WebServer.startWebServer();
  const OAuthClient = await createOAuthClient();

  requestUserConsent(OAuthClient, EStatic.scopeGoogle[type]);

  const authorizationToken = await waitForGoogleCallback(webServer);
  await requestGoogleForAccessTokens(OAuthClient, authorizationToken);
  await setGlobalGoogleAuthentication(OAuthClient);

  await WebServer.stopWebServer(webServer);
};

const mountTextByArray = (text, arr) => {
  var tempText = "";
  for (var [key, value] of arr.entries()) {
    tempText += `${text} ${key}:\n` +
      ` EN: ${value.phrase}\n` +
      ` PT: ${value.translate}\n`;
  }
  return tempText
}

const mountDescription = state => {
  var textDesc = "";
  for (var words of state) {
    textDesc += `Word: \nEN: ${words.word} \nTranscript: ${words.transcript}\n` +
      `PT: ${words.word_translate}\n` +
      `${mountTextByArray('Definition', words.definitions)}\n` +
      `${mountTextByArray('Example', words.examples)}\n\n`
  }
  return textDesc;
};

const uploadVideo = async state => {

  const videoFilePath = UArchive.getBaseUrl(
    "/assets/videos/final_render/final_render.mp4"
  );
  const day = format(new Date(), 'DD/MM')
  const videoFileSize = fs.statSync(videoFilePath).size;
  const videoTitle = `[${day}] Ten Words every day`;
  var tags = state.map(words => Object.values(words.keywords).slice(0, 3))
  const videoTags = _.flatten(tags);
  var description = await mountDescription(state)
  const videoDescription = description.length > 5000 ? "" : description;

  console.log("> [ROBOT YOUTUBE] Save description");
  await UArchive.writeFileSync(
    "/assets/text",
    "description.txt",
    description
  );

  const requestParameters = {
    part: "snippet, status",
    requestBody: {
      snippet: {
        title: videoTitle,
        description: videoDescription,
        tags: videoTags
      },
      status: {
        privacyStatus: "public"
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
  if (!source) return;
  const videoId = videoInformation.id;
  const videoThumbnailFilePath = UArchive.getBaseUrl(source);

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
  text = text.replace(/\s{2,}|\\n|\\r|—/g, " ").replace(/\\/g, "");
  var translate = "";
  do {
    try {
      const translations = await axios
        .get(
          `${process.env.GOOGLE_T_URL}/v2?q=${text}&target=pt&key=${
          process.env.GOOGLE_T_API_KEY
          }`
        )
        .then(d => d.data.data.translations);
      translate = translations[0].translatedText;
    } catch (error) {
      console.log("Ops..", error);
    }
  } while (!translate);

  return translate;
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
    return await UArchive.writeFileMP3(source, nameFile, buffer);
  } catch (error) {
    console.log("Ops.. error get " + nameFile);
    return "";
  }
};

const sendZipToDrive = async source => {
  var nameFile = UArchive.getNameFile(source);
  source = UArchive.getBaseUrl(source);

  var folderDrive = {
    "kind": "drive#file",
    "id": "1Hfe4TLhfJhzd__BJBb7QafNQvAQgOeA8",
    "name": "English Every Day",
    "mimeType": "application/vnd.google-apps.folder"
  }

  var fileMetadata = {
    'name': nameFile,
    'parents': [folderDrive.id]
  };

  //application/x-zip-compressed, application/x-7z-compressed
  var media = {
    mimeType: 'application/x-zip-compressed',
    body: fs.createReadStream(source)
  };

  const requestParameters = {
    resource: fileMetadata,
    media: media,
    fields: 'id'
  }

  var files = await drive.files.create(requestParameters)

  console.log('Folder in drive: https://drive.google.com/drive/folders/' + folderDrive.id);
  return files.data.id;
}

const getListByIdDrive = async id => {
  const requestParameters = {
    fields: 'files(id, name)'
  }

  var files = await drive.files.list(requestParameters);

  console.log(JSON.stringify(files.data));
}



module.exports = {
  getTranslateGoogleAPI,
  getAudio,
  authenticateWithOAuth,
  uploadVideo,
  uploadThumbnail,
  sendZipToDrive
};
