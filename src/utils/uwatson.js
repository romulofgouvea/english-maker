import fs from 'fs'
import TextToSpeechV1 from 'ibm-watson/text-to-speech/v1';
import LanguageTranslatorV3 from 'ibm-watson/language-translator/v3';
import dotenv from "dotenv";

import UArchive from "./uarquives";

dotenv.config();

const voice = {
  allison: 'en-US_AllisonV3Voice',
  michael: 'en-US_MichaelV3Voice',
}

const textToSpeech = new TextToSpeechV1({
  iam_apikey: process.env.IBM_TTS_API_KEY,
  url: process.env.IBM_TTS_URL
});

const languageTranslator = new LanguageTranslatorV3({
  version: '2019-04-02',
  iam_apikey: process.env.IBM_LT_API_KEY,
  url: process.env.IBM_LT_URL
});

const getPronunciations = async text => {
  const getPronunciationParams = {
    text: text,
    format: 'ipa',
    voice: voice.michael,
  };

  return await textToSpeech.getPronunciation(getPronunciationParams)
    .then(pronunciation => {
      return pronunciation.pronunciation;
    })
    .catch(err => {
      console.log('error:', err);
      return "";
    });
}

const getAudio = async (text, nameFile) => {
  const synthesizeParams = {
    text: text,
    accept: 'audio/mp3',
    voice: voice.allison,
  };

  await textToSpeech.synthesize(synthesizeParams)
    .then(audio => {
      if (audio.statusCode == 200) {
        audio.pipe(fs.createWriteStream(__base + "/assets/download/phrases/" + nameFile));
        console.log(`Audio ${nameFile} baixado!`);
      }
    })
    .catch(err => {
      console.log('error:', err);
    });
}

const getTranslate = async text => {
  const translateParams = {
    text: text,
    model_id: 'en-pt',
  };

  return await languageTranslator.translate(translateParams)
    .then(translationResult => {
      return translationResult.translations.map(t => t.translation).join(' ');
    })
    .catch(err => {
      console.log('error:', err);
      return "";
    });
}

module.exports = {
  getPronunciations,
  getAudio,
  getTranslate
}