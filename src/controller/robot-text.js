import dotenv from "dotenv";
import _ from "lodash";

import { UArchive } from "~/utils";
import { Oxford } from "~/services";
import { Watson } from "~/services";
import { Google } from "~/services";
import { Fraze } from "~/services";

dotenv.config();

const getWords = async arr => {
  console.log("> [ROBOT TEXT] Get words");
  var arrWordsTemp = [];
  var arrValuesTemp = [];
  var length = arr.length;
  for (var i = 0; i < process.env.WORDS_FOR_DAY; i++) {
    do {
      var value = Math.floor(Math.random() * length);
    } while (arrValuesTemp.includes(value));
    arrWordsTemp.push(arr[value]);
    value = _.replace(value, /\r/g, "");
    arrValuesTemp.push(value);
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
    console.log("> [ROBOT TEXT] Search transcript");
    temp.transcript = await Watson.getTranscription(word);

    console.log("> [ROBOT TEXT] Search in the dictionary of the Oxford");
    var oxfordData = await Oxford.getFromAPIOxford(
      "/api/v2/entries/en-us/" + word
    );
    if (!oxfordData) return;

    temp =
      oxfordData.data &&
      Object.assign(
        {},
        temp,
        oxfordData[_.random(0, oxfordData.data.length)] || oxfordData.data[0]
      );

    console.log("> [ROBOT TEXT] Translate definitions");
    var tempTDefinitions = [];
    if (!temp.definitions) {
      var frazeDefinitions = await Fraze.getAPIFraze("/dico", word, "/en");
      temp.definitions = frazeDefinitions.map(p => p.phrase);
    }

    for (var phrase of temp.definitions) {
      tempTDefinitions.push(await Google.getTranslateGoogleAPI(phrase));
    }

    console.log("> [ROBOT TEXT] Translate examples");
    var tempTExamples = [];
    if (!temp.examples) {
      var frazeDefinitions = await Fraze.getAPIFraze(
        "/phrase",
        word,
        "/en/1/no"
      );
      temp.definitions = frazeDefinitions.map(p => p.phrase);
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

    console.log("> [ROBOT TEXT] Get keywords");
    MData.keywords = Object.assign(
      {},
      await Watson.getKeyWords(temp.definitions.join(", "))
    );
    MData.push(temp);
  }
  return MData;
};

const saveData = async (arrWithoutUsed, arrWords, MData) => {
  console.log("> [ROBOT TEXT] Save state");
  await UArchive.writeFileJson("/assets/state", "state.json", MData);

  if (arrWithoutUsed) {
    console.log("> [ROBOT TEXT] rewrite database words without words used");
    await UArchive.writeFileSync(
      "assets/wordsDatabase.txt",
      arrWithoutUsed.join("\n")
    );
  }

  if (arrWords) {
    console.log("> [ROBOT TEXT] Save words used");
    await UArchive.appendFile(
      "/assets/text",
      "wordsUsed.txt",
      arrWords.join("\n")
    );
  }
};

const RobotText = async () => {
  try {
    console.log("> [ROBOT TEXT] Load words");
    const arr = UArchive.loadFile("/assets/text", "wordsDatabase.txt");
    const { arrWithoutUsed, arrWords } = await getWords(arr);

    const MData = await mountObjectData(arrWords);

    if (MData) await saveData(arrWithoutUsed, arrWords, MData);
  } catch (error) {
    console.log("Ops...", error);
  }
};

module.exports = { RobotText };
