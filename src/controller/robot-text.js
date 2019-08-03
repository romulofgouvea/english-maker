import dotenv from "dotenv";
import _ from "lodash";

import { UArchive } from "~/utils";
import { Oxford, Watson, Google, Fraze, State } from "~/services";

dotenv.config();

const metrics = {
  oxford: 0,
  watson: {
    lt: { req: 0, char: 0 },
    nlu: { req: 0, char: 0 },
    tts: { req: 0, char: 0 }
  },
  google: {
    lt: { req: 0, char: 0 },
    tts: { req: 0, char: 0 }
  },
  fraze: 0
};

const getWords = async arr => {
  console.log("> [ROBOT TEXT] Get words");

  var arrWordsTemp = _.sampleSize(arr, process.env.WORDS_FOR_DAY || 10);
  arr = _.xor(arr, arrWordsTemp);

  return await {
    arrWithoutUsed: arr,
    arrWords: arrWordsTemp
  };
};

const mountDataOxford = async word => {
  metrics.oxford++;
  var oxfordData = await Oxford.getFromAPIOxford(
    `/api/v2/entries/en-us/${word}`
  );
  if (!oxfordData) return null;
  return oxfordData[_.random(0, oxfordData.data.length)] || oxfordData.data[0];
};

const mountDefinitions = async definitions => {
  var limit = process.env.LIMIT_DEFINITIONS || 5;
  if (definitions && definitions > limit) {
    definitions = _.sampleSize(definitions, process.env.LIMIT_DEFINITIONS || 5);
  } else {
    metrics.fraze++;
    var frazeDefinitions = await Fraze.getAPIFraze("/dico", word, "/en");
    var frazeDefs = frazeDefinitions.map(p => p.phrase);
    frazeDefs = _.sampleSize(frazeDefs, Math.abs(limit - definitions.length));
    definitions = _.concat(definitions, frazeDefs);
  }

  var translate = "";
  var arrTranslate = [];
  for (var phrase of definitions) {
    metrics.google.lt.req++;
    metrics.google.lt.char += phrase.length;
    translate = await Google.getTranslateGoogleAPI(phrase);
    arrTranslate.push({
      phrase: phrase,
      translate: translate
    });
  }

  return arrTranslate;
};

const mountExamples = async examples => {
  var limit = process.env.LIMIT_EXAMPLES || 5;
  if (examples && examples > limit) {
    examples = _.sampleSize(examples, process.env.LIMIT_EXAMPLES || 5);
  } else {
    metrics.fraze++;
    var frazeExamples = await Fraze.getAPIFraze("/phrase", word, "/en/1/no");
    var frazeDefs = frazeExamples.map(p => p.phrase);
    frazeDefs = _.sampleSize(frazeDefs, Math.abs(limit - definitions.length));
    definitions = _.concat(definitions, frazeDefs);
  }

  var translate = "";
  var arrTranslate = [];
  for (var phrase of examples) {
    metrics.google.lt.req++;
    metrics.google.lt.char += phrase.length;
    translate = await Google.getTranslateGoogleAPI(phrase);
    arrTranslate.push({
      phrase: phrase,
      translate: translate
    });
  }

  return arrTranslate;
};

const mountKeyWords = async arr => {
  metrics.watson.nlu.req++;
  metrics.watson.nlu.char += arr.join(", ").length;
  var keys = Object.assign({}, await Watson.getKeyWords(arr.join(", ")));
  return keys;
};

const generateKeyWords = async () => {
  console.log("> [ROBOT TEXT] Generate keywords");
  const state = await State.getState();
  for (var words of state) {
    var def = words.definitions && words.definitions.map(d => d.phrase);
    var exp = words.examples && words.examples.map(d => d.phrase);
    words.keywords = def && (await mountKeyWords(_.concat(def, exp)));
    console.log(words.keywords,def);
  }
  await State.setState("state", state);
};

const mountObjectData = async arrWords => {
  var mountArrayData = [];

  for (var word of arrWords) {
    var temp = {};
    temp.word = word;
    console.log(`\n> [ROBOT TEXT] Word: ${word}`);

    metrics.watson.lt.req++;
    metrics.watson.lt.char += word.length;
    temp.word_translate = await Watson.getTranslate(word);

    console.log("> [ROBOT TEXT] Search in the dictionary of the Oxford");
    var oxfordData = await mountDataOxford(word);
    temp = oxfordData && Object.assign({}, temp, oxfordData);

    console.log("> [ROBOT TEXT] Search transcript");
    metrics.watson.tts.req++;
    metrics.watson.tts.char += word.length;
    temp.transcript =
      (await Watson.getTranscription(word)) ||
      `/${temp.pronunciation.transcription}/`;

    console.log("> [ROBOT TEXT] Translate definitions");
    var definitions = await mountDefinitions(oxfordData.definitions);

    console.log("> [ROBOT TEXT] Translate examples");
    var examples = await mountExamples(oxfordData.examples);

    temp.definitions = definitions;
    temp.examples = examples;

    console.log("> [ROBOT TEXT] Get keywords");
    temp.keywords = await mountKeyWords(oxfordData.definitions);

    mountArrayData.push(temp);
  }
  return mountArrayData;
};

const saveData = async (arrWithoutUsed, arrWords, MData) => {
  console.log("> [ROBOT TEXT] Save state");
  await State.setState("state", MData);
  await State.setState("metrics_text", metrics);

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
    const base = UArchive.loadFile("/assets/text", "wordsDatabase.txt");
    const { arrWithoutUsed, arrWords } = await getWords(base);

    const objectMounted = await mountObjectData(arrWords);

    if (objectMounted) {
      await saveData(arrWithoutUsed, arrWords, objectMounted);
    } else {
      console.log("Object not Mounted");
    }
  } catch (error) {
    console.log("Ops...", error);
  }
};

module.exports = { RobotText };
