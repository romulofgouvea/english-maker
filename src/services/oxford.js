import axios from "axios";
import _ from "lodash";

import { UArchive, UUtils } from "~/utils";

const getDefinitionsAndExamplesByEntries = lexical => {
  var entries =
    lexical.entries &&
    lexical.entries.map(entrie =>
      entrie.senses.map(sense => {
        var tempDefinitions = [];
        var tempExamples = [];

        sense.subsenses &&
          sense.subsenses.map(sub => {
            sub.examples = sub.examples || [];
            tempExamples.push(sub.examples.map(e => e.text));
            tempDefinitions.push(sub.definitions);
          });
        sense.examples = sense.examples || [];

        sense.definitions = _.concat(
          sense.definitions,
          _.flatten(tempDefinitions)
        );
        sense.examples = _.concat(
          sense.examples.map(e => e.text),
          _.flatten(tempExamples)
        );

        //remove extras
        sense.definitions = sense.definitions.map(str => str && str.replace(/\s{2,}|\\n|\\r|—/g, " ").replace(/\\|"|”|“|\[|\]/g, ""))
        sense.examples = sense.examples.map(str => str && str.replace(/\s{2,}|\\n|\\r|—/g, " ").replace(/\\|"|”|“|\[|\]/g, ""))

        return {
          definitions: sense.definitions,
          examples: sense.examples
        };
      })
    );

  entries = _.flatten(entries);

  var tempDefinitions = [];
  var tempExamples = [];
  entries.map(s => {
    tempDefinitions = _.xor(tempDefinitions, s.definitions);
    tempExamples = _.xor(tempExamples, s.examples);
  });

  return {
    definitions: tempDefinitions.filter(Boolean) || [],
    examples: tempExamples.filter(Boolean) || []
  };
};

const getEntrieVerb = results => {
  if (results.length > 1) {
    var objTemp =
      results &&
      _.compact(results.map(r => r.lexicalCategory && r.lexicalCategory.id === "verb" && r))[0];

    if (objTemp) {
      return objTemp;
    };
    return results[_.random(0, results.length)];
  }
  return results[0];
};

const prettierData = async lexical => {
  var temp = {};
  temp.word = lexical.word;
  temp.language = lexical.language;
  temp.derivatives = temp.derivatives && lexical.derivatives.map(d => d.text);
  temp.lexicalCategory = lexical.lexicalCategory && lexical.lexicalCategory.text;
  temp.pronunciation =
    temp.pronunciation &&
    _.compact(
      lexical.pronunciations.map(p => {
        if (p.phoneticNotation === "IPA")
          return {
            audio: p.audioFile,
            transcription: p.phoneticSpelling
          };
      })
    )[0];

  var entrie = await getDefinitionsAndExamplesByEntries(lexical);

  temp.definitions = entrie.definitions;
  temp.examples = entrie.examples;

  return temp;
};

const getFromAPIOxford = async (word, level = 1) => {
  var lexical = {};
  try {
    do {
      var result = await axios
        .get(`${process.env.OXFORD_BASE_URL}/api/v2/entries/en-us/${word}`, {
          headers: {
            Accept: "application/json",
            app_id: process.env.OXFORD_APP_ID,
            app_key: process.env.OXFORD_API_KEY
          }
        })
        .then(response => response.data.results[0]);

      lexical = await getEntrieVerb(result.lexicalEntries);

    } while (UUtils.isEmpty(lexical))


    switch (level) {
      case 1:
        lexical.word = result.id || result.word || lexical.text;
        lexical.language = result.language || lexical.language;

        return {
          status: 200,
          data: await prettierData(lexical)
        };
      default:
        return data;
    }
  } catch (error) {
    console.log("Ops..", error);
  }
};

const getAudioFromUrl = async (url, source, nameFile) => {
  try {
    const res = await axios.get(url, {
      responseType: "arraybuffer",
      headers: {
        "Content-Type": "audio/mp3"
      }
    });
    const buffer = Buffer.from(res.data, "base64");
    return await UArchive.writeFileMP3(source, nameFile, buffer);
  } catch (error) {
    return "";
  }
};

module.exports = { getFromAPIOxford, getAudioFromUrl };
