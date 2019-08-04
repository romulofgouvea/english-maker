import _ from "lodash";

import { UArchive, UImage, UVideo } from "~/utils";
import { State } from "~/services";

const generateImageFromText = async state => {
  console.log("> [ROBOT VIDEO] Generate images");

  for (var words of state) {
    const word = words.word;
    console.log(`\n> [ROBOT VIDEO] Word: ${word}`);

    console.log("> [ROBOT VIDEO] Generate image definitions");
    for (var [key, def] of words.definitions.entries()) {
      var text = def.phrase.concat("\n\n", def.translate);
      def.image = await UImage.generateImageTextCenter(
        "/assets/images",
        `${word}_definitions_${key}`,
        text
      );
    }

    console.log("> [ROBOT VIDEO] Generate image of the examples");
    for (var [key, exp] of words.examples.entries()) {
      var text = exp.phrase.concat("\n\n", exp.translate);
      exp.image = await UImage.generateImageTextCenter(
        "/assets/images",
        `${word}_examples_${key}`,
        text
      );
    }
  }

  console.log("\n> [ROBOT VIDEO] Save state");
  await State.setState("state", state);

  return state;
};

const createVideos = async state => {
  console.log("> [ROBOT VIDEO] Generate videos");

  for (var words of state) {
    const word = words.word;
    console.log(`\n> [ROBOT AUDIO] Word: ${word}`);

    console.log("> [ROBOT VIDEO] Generate video definitions");
    var arrTemp = [];
    for (var [key, definition] of words.definitions.entries()) {
      const urlAudio = await UVideo.generateVideo(
        "/assets/videos/render/temp",
        `${word}_definitions_${key}`,
        definition.image,
        definition.audio
      );
      arrTemp.push(urlAudio);
    }

    console.log("> [ROBOT VIDEO] Generate video examples");
    var arrTemp = [];
    for (var [key, example] of words.examples.entries()) {
      const urlAudio = await UVideo.generateVideo(
        "/assets/videos/render/temp",
        `${word}_definitions_${key}`,
        example.image,
        example.audio
      );
      arrTemp.push(urlAudio);
    }
  }

  console.log("> [ROBOT VIDEO] Save state");
  await State.setState("state", state);

  return state;
};

const unionVideosDefinitionsExamples = async state => {
  console.log("> [ROBOT VIDEO] Union definitions and examples in video");

  var arrFiles = [];
  for (var words of state) {
    const word = words.word.replace(/\r/g, "");
    console.log("> [ROBOT VIDEO] Generate temp union video from: ", word);

    var temp = _.concat(
      "D:\\workspace\\video-maker\\src\\assets\\videos\\static\\definitions_render.mp4",
      words.videos.definitions,
      "D:\\workspace\\video-maker\\src\\assets\\videos\\static\\examples_render.mp4",
      words.videos.examples
    );

    var output = await UVideo.joinVideos(
      "/assets/videos/render/temp",
      `${word}_render`,
      temp
    );
    arrFiles.push(await UArchive.fileExists(output));
  }
  arrFiles = _.compact(arrFiles);

  await UArchive.writeFileSync(
    "/assets/videos/render/final",
    "file_render_words.txt",
    arrFiles.join("\n")
  );

  return arrFiles;
};

const finalRenderVideos = async state => {
  console.log("> [ROBOT VIDEO] Final render");

  var arrFilesUnion = await UArchive.loadFile(
    "/assets/videos/render/final",
    "file_render_words.txt"
  );

  await UVideo.joinVideos(
    "/assets/videos/render/final",
    `final_render`,
    arrFilesUnion
  );

  if (UArchive.fileExists("/assets/videos/render/final", "final_render.mp4")) {
    await UArchive.deleteArchive(
      "/assets/videos/render/final",
      "file_render_words.txt"
    );
  }
};

const imageVideoFromText = async (text, saveImage = false) => {
  var nameFile = text.toLowerCase().replace(" ", "_");
  var outputImage = await UImage.generateImageTextCenter(
    "/assets/videos/render/temp/images",
    nameFile,
    text
  );

  if (UArchive.fileExists(outputImage)) {
    await UVideo.generateVideoTimeFixed(
      "/assets/videos",
      nameFile,
      outputImage
    );

    !saveImage
      ? await UArchive.deleteArchive(outputImage)
      : await UArchive.moveFile(
          "/assets/videos/render/temp/images",
          "/assets/videos/render/images"
        );
  }
};

const RobotVideo = async () => {
  try {
    console.log("> [ROBOT VIDEO] Recover state aplication");
    var state = await State.getState();

    //state = await generateImageFromText(state);

    state = await createVideos(state);

    // await unionVideosDefinitionsExamples(state);

    // await finalRenderVideos(state);
  } catch (error) {
    console.log("Ops...", error);
  }
};

module.exports = { RobotVideo };
