import _ from "lodash";

import { UArchive, UImage, UVideo } from "~/utils";

const generateImageFromText = async state => {
  console.log("> [ROBOT VIDEO] Generate images");

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
          `${word}_definitions_${key}`,
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
          `${word}_examples_${key}`,
          text
        )
      );
    }
    words.images.examples = tempArrExamples;
  }

  console.log("> [ROBOT VIDEO] Save state");
  await UArchive.writeFileJson("/assets/state", "state.json", state);

  return state;
};

const createVideos = async state => {
  console.log("> [ROBOT VIDEO] Generate videos");

  for (var words of state) {
    const word = words.word.replace(/\r/g, "");

    console.log("> [ROBOT VIDEO] Generate video definitions from: ", word);
    var tempDef = [];
    for (var [key, imgDef] of words.images.definitions.entries()) {
      var existImg = await UArchive.fileExists(imgDef);
      var existAudio = words.audios.definitions[key]
        ? await UArchive.fileExists(words.audios.definitions[key])
        : false;
      if (existImg && existAudio)
        tempDef.push(
          await UVideo.generateVideo(
            imgDef,
            words.audios.definitions[key],
            "/assets/videos/render/temp",
            `${word}_definitions_${key}`
          )
        );
    }

    console.log("> [ROBOT VIDEO] Generate video examples");
    var tempExp = [];
    for (var [key, imgExp] of words.images.examples.entries()) {
      existImg = await UArchive.fileExists(imgExp);
      existAudio = words.audios.examples[key]
        ? await UArchive.fileExists(words.audios.examples[key])
        : false;
      if (existImg && existAudio)
        tempExp.push(
          await UVideo.generateVideo(
            imgExp,
            words.audios.examples[key],
            "/assets/videos/render/temp",
            `${word}_examples_${key}`
          )
        );
    }

    words.videos = {
      definitions: _.compact(tempDef),
      examples: _.compact(tempExp)
    };
  }

  console.log("> [ROBOT VIDEO] Save state");
  await UArchive.writeFileJson("/assets/state", "state.json", state);

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
    var state = await UArchive.loadFileJson("/assets/state", "state.json");

    // state = await generateImageFromText(state);

    // state = await createVideos(state);

    // await unionVideosDefinitionsExamples(state);

    // await finalRenderVideos(state);
  } catch (error) {
    console.log("Ops...", error);
  }
};

module.exports = { RobotVideo };
