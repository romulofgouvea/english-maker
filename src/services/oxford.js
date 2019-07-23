import axios from "axios";
import _ from "lodash";

import { UArchive } from "~/utils";
import { Fraze } from "~/services";
import { rejects } from "assert";

const populateData = async results => {
  var MData = [];
  return await new Promise((resolve, reject) => {
    results.map(async en => {
      var temp = {};

      //console.log("Derivatives: ", en.derivatives ? en.derivatives.length : 0);
      temp.derivatives =
        en.derivatives && (await en.derivatives.map(d => d.text));

      //console.log("Entries: ", en.entries ? en.entries.length : 0);
      const entries =
        en.entries &&
        (await en.entries.map(
          entrie =>
            entrie.senses.map(sense => {
              if (sense.subsenses) {
                sense.subsenses = sense.subsenses[0];

                sense.shortDefinitions = _.concat(
                  sense.shortDefinitions,
                  sense.subsenses.shortDefinitions
                );

                sense.definitions = _.concat(
                  sense.definitions,
                  sense.subsenses.definitions,
                  sense.shortDefinitions
                );

                sense.examples =
                  (sense.examples && sense.examples.map(e => e.text)) || [];
                if (sense.subsenses.examples)
                  sense.examples = _.concat(
                    sense.examples,
                    sense.subsenses.examples.map(e => e.text)
                  );
              }

              delete sense.id;
              delete sense.shortDefinitions;
              delete sense.subsenses;
              delete sense.thesaurusLinks;
              return sense;
            })[0]
        )[0]);
      const { definitions, examples } = entries;
      temp.definitions = definitions || [];
      temp.examples = examples || [];

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
    const results = response.data.results[0].lexicalEntries;

    var MData = await populateData(results);
    //console.log("MData ", JSON.stringify(MData));

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
    //console.log("Ops..", error);
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
        "Content-Type": "audio/mpeg"
      }
    });
    const buffer = Buffer.from(res.data, "base64");
    await UArchive.writeFileMP3(source, nameFile, buffer);
    return true;
  } catch (error) {
    //console.log("Ops..");
    //console.log(error);
    return false;
  }
};

module.exports = { getFromAPIOxford, getAudioFromUrl };
