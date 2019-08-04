import _ from "lodash";

import { UArchive, UImage, UVideo, EStatic } from "~/utils";
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
    for (var [key, definition] of words.definitions.entries()) {
      definition.video = await UVideo.generateVideo(
        "/assets/videos/render/temp",
        `${word}_definitions_${key}`,
        definition.image,
        definition.audio
      );
    }

    console.log("> [ROBOT VIDEO] Generate video examples");
    for (var [key, example] of words.examples.entries()) {
      example.video = await UVideo.generateVideo(
        "/assets/videos/render/temp",
        `${word}_examples_${key}`,
        example.image,
        example.audio
      );
    }
  }

  console.log("> [ROBOT VIDEO] Save state");
  await State.setState("state", state);

  return state;
};

const imageVideoFromText = async (text, saveImage = false) => {
  var nameFile = text.toLowerCase().replace(/\s/g, "_");
  var outputImage = await UImage.generateImageTextCenter(
    "/assets/videos/render/images",
    nameFile,
    text
  );

  if (UArchive.fileExists(outputImage)) {
    var outputVideo = await UVideo.generateVideoTimeFixed(
      "/assets/videos/render/temp",
      nameFile,
      outputImage
    );

    if (!saveImage) {
      await UArchive.deleteArchive(outputImage);
    }

    return outputVideo;
  }
  return "";
};

const coverWord = async text => {
  var audioWord = text.audio;
  delete text.audio;

  var outputImage = await UImage.coverImageWord(
    "/assets/videos/render/images",
    `${text.word}_word_cover`,
    text
  );

  if (UArchive.fileExists(outputImage)) {
    var outputVideo = await UVideo.generateVideo(
      "/assets/videos/render/temp",
      `${text.word}_word_render`,
      outputImage,
      audioWord
    );

    return {
      image: outputImage,
      video: UArchive.fileExists(outputVideo)
    };
  }
  return {
    image: "",
    video: ""
  };
};

const unionVideosDefinitionsExamples = async state => {
  console.log("> [ROBOT VIDEO] Union definitions and examples in video");

  var arrFiles = [];
  for (var [key, words] of state.entries()) {
    const word = words.word;
    console.log(`\n> [ROBOT AUDIO] Word: ${word}`);

    var definitions = words.definitions.map(d => d.video);
    var examples = words.examples.map(d => d.video);

    var text = {
      word,
      transcript: `/${words.transcript}/`,
      translate: words.word_translate,
      derivatives: words.derivatives || [],
      audio: words.word_audio
    };

    words.word_order = EStatic.coverWordStatic[key];
    var cover = await coverWord(text);
    words.cover_image = cover.image;
    words.cover_video = cover.video;

    words.cover_definition = await imageVideoFromText(
      `Definitions of the ${word}`,
      true
    );
    words.cover_examples = await imageVideoFromText(
      `Examples of the ${word}`,
      true
    );

    var temp = _.concat(
      words.word_order,
      words.cover_video,
      words.cover_video,
      words.cover_definition,
      definitions,
      words.cover_examples,
      examples
    );

    console.log("> [ROBOT VIDEO] Join videos in temp file");
    var output = await UVideo.joinVideos(
      "/assets/videos/render/temp",
      `${word}_render`,
      temp
    );

    console.log(output, temp);

    arrFiles.push(UArchive.fileExists(output));
  }

  arrFiles = _.compact(arrFiles);

  console.log("> [ROBOT VIDEO] Save state");
  await State.setState("state", state);

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

const RobotVideo = async () => {
  try {
    console.log("> [ROBOT VIDEO] Recover state aplication");
    var state = await State.getState();

    //state = await generateImageFromText(state);

    //state = await createVideos(state);

    await unionVideosDefinitionsExamples(state);

    // await finalRenderVideos(state);
  } catch (error) {
    console.log("Ops...", error);
  }
};

module.exports = { RobotVideo };
