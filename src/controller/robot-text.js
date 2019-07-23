import dotenv from "dotenv";
import _ from "lodash";

import { UArchive } from "~/utils";
import { Oxford } from "~/services";
import { Watson } from "~/services";
import { Google } from "~/services";
import { Fraze } from "~/services";

dotenv.config();

const getWords = async arr => {
  var arrWordsTemp = [];
  var arrValuesTemp = [];
  var length = arr.length;
  for (var i = 0; i < process.env.WORDS_FOR_DAY; i++) {
    do {
      var value = Math.floor(Math.random() * length);
    } while (arrValuesTemp.includes(value));
    arrValuesTemp.push(value);
    arrWordsTemp.push(arr[value]);
    arr.splice(value, 1);
  }
  return await {
    arrWithoutUsed: arr,
    arrWords: arrWordsTemp
  };
};

const mountObjectData = async arrWords => {
  var MData = [];


  for (var word of arrWords) {
    var temp = {};
    temp.word = word;
    console.log("Buscando Transcrição");
    temp.transcript = await Watson.getTranscription(word);

    console.log("Buscando no dicionário de Oxford");
    var oxfordData = await Oxford.getFromAPIOxford(
      "/api/v2/entries/en-us/" + word
    );
    if (!oxfordData)
      return;

    temp =
      oxfordData.data &&
      Object.assign(
        {},
        temp,
        oxfordData[_.random(0, oxfordData.data.length)] || oxfordData.data[0]
      );

    console.log("Traduzindo definições, exemplos");

    var tempTDefinitions = [];
    if (!temp.definitions) {
      var frazeDefinitions = await Fraze.getAPIFraze('/dico', word, '/en')
      temp.definitions = frazeDefinitions.map(p => p.phrase)
    }

    for (var phrase of temp.definitions) {
      tempTDefinitions.push(await Google.getTranslateGoogleAPI(phrase));
    }


    var tempTExamples = [];
    if (!temp.examples){
      var frazeDefinitions = await Fraze.getAPIFraze('/phrase', word, '/en/1/no')
      temp.definitions = frazeDefinitions.map(p => p.phrase)
    }

      for (var phrase of temp.examples) {
        tempTExamples.push(await Google.getTranslateGoogleAPI(phrase));
      }

    temp.translate = {
      word: await Watson.getTranslate(word),
      lexicalCategory: await Watson.getTranslate(temp.lexicalCategory),
      definitions: tempTDefinitions,
      examples: tempTExamples
    };

    console.log("Buscando as keywords");
    MData.keywords = Object.assign(
      {},
      await Watson.getKeyWords(temp.definitions.join(", "))
    );

    console.log(temp);
    MData.push(temp);
  }

  return MData;
};

const saveData = async (arrWithoutUsed, arrWords) => {
  console.log("Save Data");
  if (arrWithoutUsed) {
    //console.log("Rewrite arquive without words used");
    UArchive.writeFile("assets/wordsNotUsed.txt", arrWithoutUsed.join("\n"));
  }

  if (arrWords) {
    //console.log("Save words used in file");
    UArchive.appendFile("/assets", "wordsUsed.txt", arrWords.join("\n"));
  }
};

const RobotText = async () => {
  try {
    console.log("Load file");
    const arr = UArchive.loadFile("/assets", "wordsNotUsed.txt");
    const { arrWithoutUsed, arrWords } = await getWords(arr);

    const MData = await mountObjectData(arrWords);
    console.log("MData ", JSON.stringify(MData));
    UArchive.writeFileJson("/assets/state", "text.json", MData);

    if (MData)
      await saveData(arrWithoutUsed, arrWords);
  } catch (error) {
    console.log("Ops...", error);
  }
};

RobotText();
