import _ from "lodash";

import { UArchive, UImage, UVideo } from "~/utils";

const generateImageFromText = async state => {
  for (var words of state) {
    words.images = {
      definitions: [],
      examples: []
    };
    const word = words.word.replace(/\r/g, "");

    console.log(
      "> [ROBOT VIDEO] Generate image of the definitions of word: ",
      word
    );
    var tempArrDefinitions = [];
    for (var [key, def] of words.definitions.entries()) {
      var text = def.concat("\n\n", words.translate.definitions[key]);
      tempArrDefinitions.push(
        await UImage.generateImageTextCenter(
          "/assets/images",
          `${word}_definitions_${key}.png`,
          text
        )
      );
    }
    words.images.definitions = tempArrDefinitions;

    console.log("> [ROBOT VIDEO] Generate image of the examples");
    var tempArrExamples = [];
    for (var [key, exm] of words.examples.entries()) {
      var text = exm.concat("\n\n", words.translate.examples[key]);
      tempArrExamples.push(
        await UImage.generateImageTextCenter(
          "/assets/images",
          `${word}_examples_${key}.png`,
          text
        )
      );
    }
    words.images.examples = tempArrExamples;
  }

  console.log("> [ROBOT VIDEO] Save state");
  await UArchive.writeFileJson("/assets/state", "text.json", state);

  return state;
};

const createVideos = async state => {
  for (var words of state) {
    const word = words.word.replace(/\r/g, "");

    console.log("> [ROBOT VIDEO] Generate video definitions from: ", word);
    var tempDef = [];
    for (var [key, imgDef] of words.images.definitions.entries()) {
      tempDef.push(
        await UVideo.generateVideo(
          imgDef,
          words.audios.definitions[key],
          "/assets/videos",
          `${word}_definitions_${key}`
        )
      );
    }

    console.log("> [ROBOT VIDEO] Generate video examples");
    var tempExp = [];
    for (var [key, imgExp] of words.images.examples.entries()) {
      tempExp.push(
        await UVideo.generateVideo(
          imgExp,
          words.audios.examples[key],
          "/assets/videos",
          `${word}_examples_${key}`
        )
      );
    }

    words.videos = {
      definitions: tempDef,
      examples: tempExp
    };
  }

  console.log("> [ROBOT VIDEO] Save state");
  await UArchive.writeFileJson("/assets/state", "text.json", state);

  return state;
};

const unionVideosDefinitionsExamples = async state => {
  console.log("> [ROBOT VIDEO] Union definitions and examples in video");

  var arrFiles = []
  for (var words of state) {
    const word = words.word.replace(/\r/g, "");
    var temp = _.concat(
      "F:\\GitHub Examples\\video-maker\\src\\assets\\base-videos\\definitions_render.mp4",
      words.videos.definitions,
      "F:\\GitHub Examples\\video-maker\\src\\assets\\base-videos\\examples_render.mp4",
      words.videos.examples
    );

    var output = await UVideo.joinVideos(
      "/assets/base-videos/temp-union",
      `${word}_render`,
      temp
    );
    arrFiles.push(await UArchive.fileExists(output))
  }
  arrFiles = _.compact(arrFiles);

  await UArchive.writeFileSync(
    '/assets/base-videos/temp-union',
    "file_render_words.txt",
    arrFiles.join("\n")
  );
  return _.compact(arrFiles)
};

const finalRenderVideos = async state => {
  console.log("> [ROBOT VIDEO] Final render videos");
  await unionVideosDefinitionsExamples(state);
  var arrFilesUnion = await UArchive.loadFile('/assets/base-videos/temp-union', 'file_render_words.txt')

  await UVideo.joinVideos(
    "/assets/base-videos/final-render",
    `final_render`,
    arrFilesUnion
  );
}

const RobotVideo = async () => {
  try {
    console.log("> [ROBOT VIDEO] Recover state aplication");
    var state = await UArchive.loadFileJson("/assets/state", "text.json");

    // console.log("> [ROBOT VIDEO] Generate images");
    // state = await generateImageFromText(state);

    // console.log("> [ROBOT VIDEO] Generate videos");
    // state = await createVideos(state);

    await finalRenderVideos(state);
  } catch (error) {
    console.log("Ops...", error);
  }
};

module.exports = { RobotVideo };
