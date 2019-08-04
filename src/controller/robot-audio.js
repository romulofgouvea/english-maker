import _ from "lodash";

import { UArchive } from "~/utils";
import { Oxford, Google } from "~/services";

const getAudios = async state => {
  for (var [key, value] of state.entries()) {
    var word = value.word;
    console.log("> [ROBOT AUDIO] Word: ", word);
    do {
      value.word_audio =
        value.pronunciation && value.pronunciation.audio
          ? await Oxford.getAudioFromUrl(
              value.pronunciation.audio,
              "/assets/audios/words",
              `word_${word}`
            )
          : await Google.getAudio("/assets/audios/words", `word_${word}`, word);
    } while (!value.word_audio);

    console.log("> [ROBOT AUDIO] Get transcript definitions");

    for (var [key, def] of value.definitions.entries()) {
      do {
        def.audio = await Google.getAudio(
          "/assets/audios/phrases",
          `phrase_${word}_definitions_${key}`,
          def.phrase
        );
      } while (!def.audio);
    }

    console.log("> [ROBOT AUDIO] Get transcript examples");
    for (var [key, exp] of value.examples.entries()) {
      do {
        exp.audio = await Google.getAudio(
          "/assets/audios/phrases",
          `phrase_${word}_examples_${key}`,
          exp.phrase
        );
      } while (!exp.audio);
    }
  }
  return state;
};

const RobotAudio = async () => {
  try {
    console.log("> [ROBOT AUDIO] Recover state aplication");
    var state = await UArchive.loadFileJson("/assets/state", "state.json");

    console.log("> [ROBOT AUDIO] Get audios");
    state = await getAudios(state);

    console.log("> [ROBOT AUDIO] Save state");
    UArchive.writeFileJson("/assets/state", "state.json", state);
  } catch (error) {
    console.log("Ops...", error);
  }
};

module.exports = { RobotAudio };
