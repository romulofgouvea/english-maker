import _ from "lodash";

import { UArchive } from "~/utils";
import { Watson } from "~/services";
import { Oxford } from "~/services";

const getAudios = async () => {
  const structureText = await UArchive.loadFileJson(
    "/assets/state",
    "text.json"
  );

  for (var [key, value] of structureText.entries()) {
    var word = value.word.replace("\r", "");
    
    // value.definitions = _.shuffle(value.definitions).slice(0, 5);
    // value.examples = _.shuffle(value.examples).slice(0, 5);

    // console.log("Buscando transcrição das definições e baixando...");
    var tempSourceDefinitions = [];
    // for (var [key, def] of value.definitions.entries()) {
    //   tempSourceDefinitions.push(
    //     await Watson.getAudio(
    //       "/assets/download/phrases",
    //       `phrase_${word}${key}_definitions.mp3`,
    //       def
    //     )
    //   );
    // }

    // console.log("Buscando transcrição dos exemplos e baixando...");
    var tempSourceExamples = [];
    // for (var [key, def] of value.examples.entries()) {
    //   tempSourceExamples.push(
    //     await Watson.getAudio(
    //       "/assets/download/phrases",
    //       `phrase_${word}${key}_examples.mp3`,
    //       def
    //     )
    //   );
    // }

    value.audios = {
      word: await Oxford.getAudioFromUrl(
        value.pronunciation.audio,
        "/assets/download/words",
        `word_${word}.mp3`
      ),
      definitions: tempSourceDefinitions,
      examples: tempSourceExamples
    };
    console.log(value.audios);
  }

  return structureText;
};

const RobotAudio = async () => {
  try {
    console.log("RobotAudio: Load file");
    const structureWithAudio = await getAudios();
    console.log(structureWithAudio);
    console.log("Save data structure");
    UArchive.writeFileJson("/assets/state", "text.json", structureWithAudio);
  } catch (error) {
    console.log("Ops...", error);
  }
};

RobotAudio();
