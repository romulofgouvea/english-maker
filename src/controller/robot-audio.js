import _ from "lodash";

import { Oxford, Google, State } from "~/services";

const metrics = {
  oxford: 0,
  google: {
    tts: { req: 0, char: 0 }
  }
};

var progress = {};

const getAudios = async state => {
  for (var [key, value] of state.entries()) {
    var word = value.word;
    if (progress.robot_audio.words) {
      progress = State.getState("progress");
      if (progress.robot_audio.words.includes(word)) {
        continue;
      };
    }

    console.log(`\n> [ROBOT AUDIO] Word: ${word}`);
    do {
      if (value.pronunciation && value.pronunciation.audio) {
        metrics.oxford++;
        value.word_audio = await Oxford.getAudioFromUrl(
          value.pronunciation.audio,
          "/assets/temp",
          `word_${word}`
        );
      } else {
        metrics.google.tts.req++;
        metrics.google.tts.char += word.length;
        value.word_audio = await Google.getAudio(
          "/assets/temp",
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
          "/assets/temp",
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
          "/assets/temp",
          `phrase_${word}_examples_${key}`,
          exp.phrase
        );
      } while (!exp.audio);
    }

    progress.robot_audio.words.push(word);
    await State.setState("progress", progress);
  }
  return state;
};

const RobotAudio = async () => {
  try {
    progress = await State.getState('progress');
    if (progress.robot_text !== true)
      throw "Not completed robot text"

    if (progress.robot_audio === true)
      return;

    console.log("\n\n> [ROBOT AUDIO]");
    var state = await State.getState();

    console.log("> [ROBOT AUDIO] Get audios");
    state = await getAudios(state);

    console.log("\n> [ROBOT AUDIO] Save state");
    await State.setState("state", state);
    await State.setState("metrics_audio", metrics);

    if (progress.robot_audio.words.length === 10) {
      progress.robot_audio = true;
      await State.setState("progress", progress);
    }
  } catch (error) {
    await State.setState("progress", progress);
    console.log("Ops...", error);
  }
};

module.exports = { RobotAudio };
