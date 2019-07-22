import fs from 'fs'
import TextToSpeechV1 from 'ibm-watson/text-to-speech/v1';
import dotenv from "dotenv";

import UArchive from "./uarquives";

dotenv.config();

const voice = {
  allison: 'en-US_AllisonV3Voice',
  michael: 'en-US_MichaelV3Voice',
}

const textToSpeech = new TextToSpeechV1({
  iam_apikey: process.env.IBM_API_KEY,
  url: process.env.IBM_URL
});

const getPronunciations = text => {
  const getPronunciationParams = {
    text: text,
    format: 'ipa',
    voice: voice.michael,
  };

  textToSpeech.getPronunciation(getPronunciationParams)
    .then(pronunciation => {
      console.log(pronunciation.pronunciation);
    })
    .catch(err => {
      console.log('error:', err);
    });
}

const getAudio = (text, nameFile) => {
  const synthesizeParams = {
    text: text,
    accept: 'audio/mp3',
    voice: voice.allison,
  };

  textToSpeech.synthesize(synthesizeParams)
    .then(audio => {
      console.log(audio.statusCode);
      audio.pipe(fs.createWriteStream(__base + "/assets/download/phrases/" + nameFile));
    })
    .catch(err => {
      console.log('error:', err);
    });
}

module.exports = {
  getPronunciations,
  getAudio
}