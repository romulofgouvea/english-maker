import fs from "fs";
import path from "path";
import TextToSpeechV1 from "ibm-watson/text-to-speech/v1";
import LanguageTranslatorV3 from "ibm-watson/language-translator/v3";
import NaturalLanguageUnderstandingV1 from "ibm-watson/natural-language-understanding/v1.js";
import dotenv from "dotenv";

import { constants } from "../../config";

const BASE_URL = constants.BASE_URL;
dotenv.config();

const voice = {
  allison: "en-US_AllisonV3Voice",
  michael: "en-US_MichaelV3Voice"
};

const textToSpeech = new TextToSpeechV1({
  iam_apikey: process.env.IBM_TTS_API_KEY,
  url: process.env.IBM_TTS_URL
});

const languageTranslator = new LanguageTranslatorV3({
  version: "2019-04-02",
  iam_apikey: process.env.IBM_LT_API_KEY,
  url: process.env.IBM_LT_URL
});

const naturalLanguageUnderstanding = new NaturalLanguageUnderstandingV1({
  version: "2019-07-12",
  iam_apikey: process.env.IBM_NLU_API_KEY,
  url: process.env.IBM_NLU_URL
});

const getTranscription = async text => {
  const getPronunciationParams = {
    text: text,
    format: "ipa",
    voice: voice.michael
  };

  return await textToSpeech
    .getPronunciation(getPronunciationParams)
    .then(pronunciation => {
      return pronunciation.pronunciation;
    })
    .catch(err => {
      //console.log('error:', err);
      return "";
    });
};

const getAudio = async (source, nameFile, text) => {
  const synthesizeParams = {
    text: text,
    accept: "audio/mp3",
    voice: voice.allison
  };
  var caminho = path.join(BASE_URL, source);
  nameFile = nameFile.replace("\r", "");

  return await textToSpeech
    .synthesize(synthesizeParams)
    .then(audio => {
      caminho = caminho + "\\" + nameFile;
      if (audio.statusCode === 200) {
        audio.pipe(fs.createWriteStream(caminho));
        return caminho;
      }
    })
    .catch(err => {
      console.log(err.code, err.name);
      return "";
    });
};

const getTranslate = async text => {
  const translateParams = {
    text: text,
    model_id: "en-pt"
  };

  return await languageTranslator
    .translate(translateParams)
    .then(translationResult => {
      return translationResult.translations.map(t => t.translation).join(" ");
    })
    .catch(err => {
      //console.log('error:', err);
      return "";
    });
};

const getKeyWords = async text => {
  const analyzeParams = {
    text: text,
    features: {
      keywords: {
        limit: 5
      }
    }
  };

  return await naturalLanguageUnderstanding
    .analyze(analyzeParams)
    .then(analysisResults => {
      return analysisResults.keywords.map(k => k.text);
    })
    .catch(err => {
      //console.log('error:', err);
    });
};

module.exports = {
  getTranscription,
  getAudio,
  getTranslate,
  getKeyWords
};
