import _ from "lodash";

import { UArchive } from "~/utils";
import { Watson, Oxford, Google } from "~/services";

const getAudios = async structureText => {
  for (var [key, value] of structureText.entries()) {
    var word = value.word.replace("\r", "");
    console.log("> [ROBOT AUDIO] Word: ", word);

    value.definitions = _.shuffle(value.definitions).slice(0, 5);
    value.examples = _.shuffle(value.examples).slice(0, 5);

    console.log("> [ROBOT AUDIO] Get transcript definitions");
    var tempSourceDefinitions = [];
    for (var [key, def] of value.definitions.entries()) {
      tempSourceDefinitions.push(
        await Google.getAudio(
          "/assets/download/phrases",
          `phrase_${word}${key}_definitions.mp3`,
          def
        )
      );
    }

    console.log("> [ROBOT AUDIO] Get transcript examples");
    var tempSourceExamples = [];
    for (var [key, def] of value.examples.entries()) {
      tempSourceExamples.push(
        await Google.getAudio(
          "/assets/download/phrases",
          `phrase_${word}${key}_examples.mp3`,
          def
        )
      );
    }

    var tempSourceWord = value.pronunciation && value.pronunciation.audio
      ? await Oxford.getAudioFromUrl(
          value.pronunciation.audio,
          "/assets/download/words",
          `word_${word}.mp3`
        )
      : await Google.getAudio(
          "/assets/download/words",
          `word_${word}.mp3`,
          word
        );

    value.audios = {
      word: tempSourceWord,
      definitions: tempSourceDefinitions,
      examples: tempSourceExamples
    };
  }
  return structureText;
};

const RobotAudio = async () => {
  try {
    console.log("> [ROBOT AUDIO] Recover state aplication");
    const structureText = await UArchive.loadFileJson(
      "/assets/state",
      "text.json"
    );

    console.log("> [ROBOT AUDIO] Get audios");
    const structureWithAudio = await getAudios(structureText);

    console.log("> [ROBOT AUDIO] Save data structure");
    UArchive.writeFileJson("/assets/state", "text.json", structureWithAudio);
  } catch (error) {
    console.log("Ops...", error);
  }
};

module.exports = { RobotAudio };
