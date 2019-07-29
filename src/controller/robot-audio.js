import _ from "lodash";

import { UArchive } from "~/utils";
import { Watson } from "~/services";
import { Oxford } from "~/services";

const getAudios = async structureText => {

  for (var [key, value] of structureText.entries()) {
    var word = value.word.replace("\r", "");

    value.definitions = _.shuffle(value.definitions).slice(0, 5);
    value.examples = _.shuffle(value.examples).slice(0, 5);

    console.log("> [ROBOT AUDIO] Get transcript definitions");
    var tempSourceDefinitions = [];
    for (var [key, def] of value.definitions.entries()) {
      tempSourceDefinitions.push(
        await Watson.getAudio(
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
        await Watson.getAudio(
          "/assets/download/phrases",
          `phrase_${word}${key}_examples.mp3`,
          def
        )
      );
    }

    value.audios = {
      word: await Oxford.getAudioFromUrl(
        value.pronunciation.audio,
        "/assets/download/words",
        `word_${word}.mp3`
      ),
      definitions: tempSourceDefinitions,
      examples: tempSourceExamples
    };
  }
  return structureText;
};

const RobotAudio = async () => {
  try {
    console.log("> [ROBOT AUDIO] Recover state aplication");
    const structureText = await UArchive.loadFileJson("/assets/state", "text.json");
    
    console.log("> [ROBOT AUDIO] Get audios");
    const structureWithAudio = await getAudios(structureText);

    console.log("> [ROBOT AUDIO] Save data structure");
    UArchive.writeFileJson("/assets/state", "text.json", structureWithAudio);
  } catch (error) {
    console.log("Ops...", error);
  }
};

module.exports = { RobotAudio }
