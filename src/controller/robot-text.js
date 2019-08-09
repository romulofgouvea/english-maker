import dotenv from "dotenv";
import _ from "lodash";

import { UArchive, UString } from "~/utils";
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

const progress = {
  robot_text: {
    words: [],
  },
  mountArrayData: []
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
  var oxfordData = await Oxford.getFromAPIOxford(word);
  if (!oxfordData) return null;
  return oxfordData.data;
};

const mountDefinitions = async (word, definitions) => {
  var limit = process.env.LIMIT_DEFINITIONS || 5;
  if (definitions && definitions.length >= limit) {
    definitions = _.sampleSize(definitions, process.env.LIMIT_DEFINITIONS || 5);
  } else {
    metrics.fraze++;
    var defs = await Fraze.getAPIFraze("/dico", word, "/en");
    var frazeDefinitions = defs.data || [];
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

const mountExamples = async (word, examples) => {
  var limit = process.env.LIMIT_EXAMPLES || 5;
  if (examples && examples.length >= limit) {
    examples = _.sampleSize(examples, process.env.LIMIT_EXAMPLES || 5);
  } else {
    metrics.fraze++;
    var exp = await Fraze.getAPIFraze("/phrase", word, "/en/1/no");
    var frazeExamples = exp.data || [];
    var frazeExp = frazeExamples.map(p => p.phrase);
    frazeExp = _.sampleSize(frazeExp, Math.abs(limit - examples.length));
    examples = _.concat(examples, frazeExp);
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
    console.log(words.keywords, def);
  }
  await State.setState("state", state);
};

const generateTranslates = async () => {
  console.log("> [ROBOT TEXT] Generate Translates");
  const state = await State.getState();
  for (var words of state) {
    for (var definition of words.definitions) {
      metrics.google.lt.req++;
      metrics.google.lt.char += definition.phrase.length;
      definition.translate = await Google.getTranslateGoogleAPI(
        definition.phrase
      );
    }
    for (var example of words.examples) {
      metrics.google.lt.req++;
      metrics.google.lt.char += example.phrase.length;
      example.translate = await Google.getTranslateGoogleAPI(example.phrase);
    }
  }
  await State.setState("state", state);
};

const mountObjectData = async arrWords => {
  for (var word of arrWords) {
    if (progress.robot_text.words.includes(word)) continue;
    var temp = {};
    temp.word = UString.captalize(word);
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
    temp.transcript = temp && "";
    temp.transcript =
      `/${await Watson.getTranscription(word)}/` ||
      `/${temp.pronunciation.transcription}/`;

    console.log("> [ROBOT TEXT] Translate definitions");
    var definitions = await mountDefinitions(word, oxfordData.definitions);

    console.log("> [ROBOT TEXT] Translate examples");
    var examples = await mountExamples(word, oxfordData.examples);

    temp.definitions = definitions;
    temp.examples = examples;

    console.log("> [ROBOT TEXT] Get keywords");
    temp.keywords = await mountKeyWords(oxfordData.definitions);

    progress.robot_text.words.push(word);
    progress.robot_text.mountArrayData.push(temp);
    State.setState("progress", progress);
  }
  return progress.robot_text.mountArrayData;
};

const saveData = async (arrWithoutUsed, arrWords, MData) => {
  console.log("> [ROBOT TEXT] Save state");
  await State.setState("state", MData);
  await State.setState("metrics_text", metrics);

  if (arrWithoutUsed) {
    console.log("> [ROBOT TEXT] rewrite database words without words used");
    await UArchive.writeFileSync(
      "/assets/text",
      "wordsDatabase.txt",
      arrWithoutUsed.join("\n")
    );
  }

  if (arrWords) {
    console.log("> [ROBOT TEXT] Save words used");
    await UArchive.appendFile(
      "/assets/text",
      "wordsUsed.txt",
      "\n" + arrWords.join("\n")
    );
  }

  progress.robot_text.finish = true;
};

const RobotText = async () => {
  try {
    console.log("> [ROBOT TEXT] Load words");
    const base = UArchive.loadFile("/assets/text", "wordsDatabase.txt");
    progress = State.getState("progress");

    const { arrWithoutUsed, arrWords } = await getWords(base);

    const objectMounted = await mountObjectData(arrWords);

    if (objectMounted) {
      await saveData(arrWithoutUsed, arrWords, objectMounted);
    } else {
      await State.setState("progress", progress);
      console.log("Object not Mounted");
    }
  } catch (error) {
    await State.setState("progress", progress);
    console.log("Ops...", error);
  }
};

module.exports = { RobotText };
