import _ from "lodash";

import { UArchive } from "~/utils";
import { Oxford, Google, State } from "~/services";

const metrics = {
  oxford: 0,
  google: {
    lt: { req: 0, char: 0 },
    tts: { req: 0, char: 0 }
  }
};

const getAudios = async state => {
  for (var [key, value] of state.entries()) {
    var word = value.word;
    console.log("> [ROBOT AUDIO] Word: ", word);
    do {
      if (value.pronunciation && value.pronunciation.audio) {
        metrics.oxford++;
        value.word_audio = await Oxford.getAudioFromUrl(
          value.pronunciation.audio,
          "/assets/audios/words",
          `word_${word}`
        );
      } else {
        metrics.google.tts.req++;
        metrics.google.tts.char += word.length;
        value.word_audio = await Google.getAudio(
          "/assets/audios/words",
          `word_${word}`,
          word
        );
      }
    } while (!value.word_audio);

    console.log("> [ROBOT AUDIO] Get transcript definitions");

    for (var [key, def] of value.definitions.entries()) {
      do {
        metrics.google.tts.req++;
        metrics.google.tts.char += word.length;
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
        metrics.google.tts.req++;
        metrics.google.tts.char += word.length;
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
    var state = await State.getState();

    console.log("> [ROBOT AUDIO] Get audios");
    state = await getAudios(state);

    console.log("> [ROBOT AUDIO] Save state");
    await State.setState("state", state);
    await State.setState("metrics_audio", metrics);
  } catch (error) {
    console.log("Ops...", error);
  }
};

module.exports = { RobotAudio };
