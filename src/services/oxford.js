import axios from "axios";
import _ from "lodash";

import { UArchive } from "~/utils";

//begginer = 1
const getFromAPIOxford = async (query, level = 1) => {
  try {
    const response = await axios.get(process.env.OXFORD_BASE_URL + query, {
      headers: {
        Accept: "application/json",
        app_id: process.env.OXFORD_APP_ID,
        app_key: process.env.OXFORD_APP_KEY
      }
    });
    const results = response.data.results[0].lexicalEntries;

    var MData = [];
    results.map(en => {
      var temp = {};

      console.log("derivatives");
      temp.derivatives = en.derivatives.map(d => d.text);

      console.log("entries");
      const entries = en.entries.map(
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

              if (sense.subsenses.examples)
                sense.examples = _.concat(
                  sense.examples.map(e => e.text),
                  sense.subsenses.examples.map(e => e.text)
                );
              else
                sense.examples =
                  sense.examples && sense.examples.map(e => e.text);
            }

            delete sense.id;
            delete sense.shortDefinitions;
            delete sense.subsenses;
            delete sense.thesaurusLinks;
            return sense;
          })[0]
      )[0];
      const { definitions, examples } = entries;
      temp.definitions = definitions;
      temp.examples = examples || [];

      console.log("lexicalCategory");
      temp.lexicalCategory = en.lexicalCategory.text;

      console.log("pronunciation");
      temp.pronunciation = en.pronunciations.map(p => {
        if (p.phoneticNotation === "IPA") {
          return {
            audio: p.audioFile,
            transcription: p.phoneticSpelling
          };
        }
      })[1];

      MData.push(temp);
    });

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
    console.log("Ops..");
    return error;
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
  } catch (error) {
    console.log("Ops..");
    console.log(error);
  }
};

module.exports = { getFromAPIOxford, getAudioFromUrl };
