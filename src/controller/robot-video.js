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
        "/assets/temp",
        `${word}_image_definitions_${key}`,
        text
      );
    }

    console.log("> [ROBOT VIDEO] Generate image of the examples");
    for (var [key, exp] of words.examples.entries()) {
      var text = exp.phrase.concat("\n\n", exp.translate);
      exp.image = await UImage.generateImageTextCenter(
        "/assets/temp",
        `${word}_image_examples_${key}`,
        text
      );
    }

    var covers = await generateCovers(words);

    words.cover_image = covers.image;
    words.cover_video = covers.video;
    words.cover_definition = covers.definition;
    words.cover_examples = covers.example;
  }

  console.log("\n> [ROBOT VIDEO] Save state with images");
  await State.setState("state", state);

  return state;
};

const createVideos = async state => {
  console.log("> [ROBOT VIDEO] Generate videos");

  for (var words of state) {
    const word = words.word;
    console.log(`\n> [ROBOT VIDEO] Word: ${word}`);

    console.log("> [ROBOT VIDEO] Generate video definitions");
    for (var [key, definition] of words.definitions.entries()) {
      definition.video = await UVideo.generateVideo(
        "/assets/temp",
        `${word}_mini_definitions_${key}`,
        definition.image,
        definition.audio
      );
    }

    console.log("> [ROBOT VIDEO] Generate video examples");
    for (var [key, example] of words.examples.entries()) {
      example.video = await UVideo.generateVideo(
        "/assets/temp",
        `${word}_mini_examples_${key}`,
        example.image,
        example.audio
      );
    }
  }

  console.log("> [ROBOT VIDEO] Save state with mini-videos");
  await State.setState("state", state);

  return state;
};

const imageVideoFromText = async (text, saveImage = false) => {
  var nameFile = text.toLowerCase().replace(/\s/g, "_");
  var outputImage = await UImage.generateImageTextCenter(
    "/assets/temp",
    nameFile,
    text
  );

  if (outputImage) {
    var outputVideo = await UVideo.generateVideoTimeFixed(
      "/assets/temp",
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
  var word = text.word.toLowerCase();
  var audioWord = text.audio;
  delete text.audio;

  var outputImage = await UImage.coverImageWord(
    "/assets/images",
    `${word}_word_cover`,
    text
  );

  if (outputImage) {
    var outputVideo = await UVideo.generateVideo(
      "/assets/temp",
      `${word}_word_render`,
      outputImage,
      audioWord
    );

    if (outputVideo) {
      return {
        image: outputImage,
        video: outputVideo
      };
    }
  }
  return {
    image: "",
    video: ""
  };
};

const generateCovers = async words => {
  var word = words.word.toLowerCase();

  console.log("> [ROBOT VIDEO] Generate cover word definitions");
  var cover_definition = await imageVideoFromText(
    `Definitions of the ${word}`,
    true
  );
  console.log("> [ROBOT VIDEO] Generate cover word examples");
  var cover_examples = await imageVideoFromText(
    `Examples of the ${word}`,
    true
  );

  var text = {
    word,
    transcript: `/${words.transcript}/`,
    translate: words.word_translate,
    derivatives: words.derivatives || [],
    audio: words.word_audio
  };
  console.log("> [ROBOT VIDEO] Generate word image,video,definitions, examples");
  var cover = await coverWord(text);

  return {
    image: cover.image,
    video: cover.video,
    definition: cover_definition,
    example: cover_examples
  }
}

const unionVideosDefinitionsExamples = async state => {
  console.log("> [ROBOT VIDEO] Union definitions and examples in video");

  var arrFiles = [];
  for (var [key, words] of state.entries()) {
    const word = words.word;
    console.log(`\n> [ROBOT AUDIO] Word: ${word}`);

    var definitions = words.definitions.map(d => d.video);
    var examples = words.examples.map(d => d.video);

    words.word_order = EStatic.coverWordStatic[key];

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
      "/assets/temp",
      `${word}_join_render`,
      temp
    );

    if (output)
      arrFiles.push(output);
  }

  arrFiles = _.compact(arrFiles);

  console.log("> [ROBOT VIDEO] Save state");
  await State.setState("state", state);

  await UArchive.writeFileSync(
    "/assets/videos",
    "file_render_words.txt",
    arrFiles.join("\n")
  );
};

const finalRenderVideos = async state => {
  console.log("> [ROBOT VIDEO] Final render");

  var arrFilesUnion = await UArchive.loadFile(
    "/assets/videos",
    "file_render_words.txt"
  );

  const output = await UVideo.joinVideos(
    "/assets/videos",
    `final_render`,
    arrFilesUnion
  );

  if (output) {
    arrFilesUnion.map(a => UArchive.deleteArchive('/assets/videos', UArchive.getBaseUrl(a)))

    await UArchive.deleteArchive(
      "/assets/videos",
      "file_render_words.txt"
    );
  }
};

const RobotVideo = async () => {
  try {
    console.log("> [ROBOT VIDEO] Recover state aplication");
    var state = await State.getState();

    //state = await generateImageFromText(state);

    // state = await createVideos(state);

    await unionVideosDefinitionsExamples(state);

    await finalRenderVideos(state);
  } catch (error) {
    console.log("Ops...", error);
  }
};

module.exports = { RobotVideo };
