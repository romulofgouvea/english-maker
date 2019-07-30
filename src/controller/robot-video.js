var ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
var ffmpeg = require("fluent-ffmpeg");
import _ from "lodash";

import { UArchive, UImage } from "~/utils";

ffmpeg.setFfmpegPath(ffmpegPath);
var command = ffmpeg();

const generateImageFromText = async structureAudio => {
  for (var words of structureAudio) {
    words.images = {
      definitions: [],
      examples: []
    };
    const word = words.word.replace(/\r/g, "");

    console.log("> [ROBOT VIDEO] Generate image of the definitions");
    var tempArrDefinitions = [];
    words.images.coverDefinitions =
      "D:/workspace/video-maker/src/assets/template-video/definitions.png";
    for (var [key, def] of words.definitions.entries()) {
      var text = def.concat("\n\n", words.translate.definitions[key]);
      tempArrDefinitions.push(
        await UImage.generateImageTextCenter(
          "/assets/images",
          `${word}_definitions_${key}.jpg`,
          text
        )
      );
    }
    words.images.definitions = tempArrDefinitions;

    console.log("> [ROBOT VIDEO] Generate image of the examples");
    var tempArrExamples = [];
    words.images.coverExamples =
      "D:/workspace/video-maker/src/assets/template-video/examples.png";
    for (var [key, exm] of words.examples.entries()) {
      var text =
        word.translate && exm.concat("\n\n", word.translate.examples[key]);
      tempArrExamples.push(
        await UImage.generateImageTextCenter(
          "/assets/images",
          `${word}_examples_${key}.jpg`,
          text
        )
      );
    }
    words.images.examples = tempArrExamples;
  }

  console.log("> [ROBOT VIDEO] Save state");
  await UArchive.writeFileJson("/assets/state", "text.json", structureAudio);

  return structureAudio;
};

function* generateMiniVideosFromAudio(structureImage) {
  for (var words of structureImage) {
    const word = words.word.replace(/\r/g, "");

    for (var [key, image] of words.images.definitions.entries()) {
      yield command
        .input(image)
        .inputFPS(1 / 5)
        .input(words.audios.definitions[key])
        .output(
          `D:/workspace/video-maker/src/assets/mini-videos/${word}_${key}.mp4`
        )
        .outputFPS(30)
        .on("end", onEnd)
        .on("progress", onProgress)
        .on("error", onError)
        .run();
    }
  }
}

function onProgress(progress) {
  console.log("Time mark: " + progress.timemark + "...");
}

function onError(err, stdout, stderr) {
  console.log("Cannot process video: " + err.message);
}

function onEnd() {
  console.log("Finished processing");
}

const joinMiniVideos = async () => {};

const RobotVideo = async () => {
  try {
    console.log("> [ROBOT VIDEO] Recover state aplication");
    const structureAudio = await UArchive.loadFileJson(
      "/assets/state",
      "text.json"
    );

    // console.log("> [ROBOT VIDEO] Generate images");
    // const structureImage = await generateImageFromText(structureAudio);

    console.log("> [ROBOT VIDEO] Generate mini videos");
    await generateMiniVideosFromAudio(structureAudio);
  } catch (error) {
    console.log("Ops...", error);
  }
};

module.exports = { RobotVideo };
