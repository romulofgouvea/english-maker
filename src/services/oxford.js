import axios from "axios";
import _ from "lodash";

import { UArchive } from "~/utils";
import { Fraze } from "~/services";
import { Google } from "~/services";

import { constants } from "../../config";

const BASE_URL = constants.BASE_URL;

const populateData = async (word, results) => {
  var MData = [];
  return await new Promise((resolve, reject) => {
    results.map(async en => {
      var temp = {};

      // console.log("Derivatives: ", en.derivatives ? en.derivatives.length : 0);
      temp.derivatives =
        en.derivatives && (await en.derivatives.map(d => d.text));

      // console.log("Entries: ", en.entries ? en.entries.length : 0);
      const entries =
        en.entries &&
        (await en.entries.map(entrie =>
          entrie.senses.map(sense => {
            var tempDefinitions = [];
            var tempExamples = [];
            var tempShortDefinitions = [];

            sense.subsenses &&
              sense.subsenses.map(sub => {
                sub.examples = sub.examples || [];
                tempExamples.push(sub.examples.map(e => e.text));
                tempDefinitions.push(sub.definitions);
                tempShortDefinitions.push(sub.shortDefinitions);
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
            sense.definitions = _.xor(
              sense.definitions,
              _.flatten(tempShortDefinitions),
              _.isEqual
            );

            delete sense.subsenses;
            delete sense.id;
            delete sense.constructions;
            delete sense.thesaurusLinks;
            delete sense.shortDefinitions;
            return sense;
          })
        )[0]);

      var tempDefinitions = [];
      var tempExamples = [];
      entries.map(s => {
        tempDefinitions = _.xor(tempDefinitions, s.definitions);
        tempExamples = _.xor(tempExamples, s.examples);
      });

      temp.definitions = tempDefinitions.filter(Boolean) || [];
      temp.examples = tempExamples.filter(Boolean) || [];

      //console.log("lexicalCategory");
      temp.lexicalCategory = en.lexicalCategory.text;

      //console.log(
      //   "Pronunciation: ",
      //   en.pronunciations ? en.pronunciations.length : 0
      // );
      temp.pronunciation =
        en.pronunciations &&
        (await en.pronunciations.map(p => {
          if (p.phoneticNotation === "IPA") {
            return {
              audio: p.audioFile,
              transcription: p.phoneticSpelling
            };
          }
        })[1]);

      MData.push(temp);
    });
    resolve(MData);
  });
};

const getFromAPIOxford = async (query, level = 1) => {
  try {
    const response = await axios.get(process.env.OXFORD_BASE_URL + query, {
      headers: {
        Accept: "application/json",
        app_id: process.env.OXFORD_APP_ID,
        app_key: process.env.OXFORD_API_KEY
      }
    });
    const word = response.data.results[0].id;
    const results = response.data.results[0].lexicalEntries;

    var MData = await populateData(word, results);

    var data = {
      status: response.status,
      data: MData
    };

    switch (level) {
      case 1:
        return data;
      default:
        return data;
    }
  } catch (error) {
    // console.log("Ops..", error);
    return {
      status: error.response ? error.response.status : 0,
      data: null
    };
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
