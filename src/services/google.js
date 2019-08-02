import axios from "axios";
import { google } from 'googleapis';


import { UArchive } from "~/utils";
import { WebServer } from "~/services";

const youtube = google.youtube('v3');
const OAuth2 = google.auth.OAuth2

const authenticateWithOAuth = async () => {
  const webServer = await WebServer.startWebServer();

  await WebServer.stopWebServer(webServer);
}
const uploadVideo = async () => { }

const uploadThumbnail = async () => { }

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
