import _ from "lodash";

import { UArchive, UImage, UVideo } from "~/utils";

const generateImageFromText = async structureAudio => {
  for (var words of structureAudio) {
    words.images = {
      definitions: [],
      examples: []
    };
    const word = words.word.replace(/\r/g, "");

    console.log("> [ROBOT VIDEO] Generate image of the definitions of word: ", word);
    var tempArrDefinitions = [];
    words.images.coverDefinitions =
      "D:/workspace/video-maker/src/assets/template-video/definitions.png";
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
    words.images.coverExamples =
      "D:/workspace/video-maker/src/assets/template-video/examples.png";
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

    console.log("> [ROBOT VIDEO] Generate video definitions from word");
    for (var [key, imgDef] of words.images.definitions.entries()) {
      await UVideo.generateVideo(imgDef, words.audios.definitions[key], `${word}_definitions_${key}.mp4`);
    }

    console.log("> [ROBOT VIDEO] Generate video examples from word");
    for (var [key, imgExp] of words.images.examples.entries()) {
      await UVideo.generateVideo(imgExp, words.audios.definitions[key], `${word}_examples_${key}.mp4`);
    }
  }

  console.log("> [ROBOT VIDEO] Save state");
  await UArchive.writeFileJson("/assets/state", "text.json", structureAudio);

  return structureAudio;
};

const createVideos = async structureImages => {
  var arrTempVideos = {
    definitions: [],
    examples: []
  };
  for (var words of structureImages) {
    const word = words.word.replace(/\r/g, "");

    console.log("> [ROBOT VIDEO] Generate video definitions from word");
    var tempDef = [];
    for (var [key, imgDef] of words.images.definitions.entries()) {
      tempDef.push(await UVideo.generateVideo(imgDef, words.audios.definitions[key], '/assets/videos', `${word}_definitions_${key}.mp4`));
    }
    arrTempVideos.definitions = tempDef;

    console.log("> [ROBOT VIDEO] Generate video examples from word");
    var tempExp = [];
    for (var [key, imgExp] of words.images.examples.entries()) {
      tempExp.push(await UVideo.generateVideo(imgExp, words.audios.definitions[key], '/assets/videos', `${word}_examples_${key}.mp4`));
    }
    arrTempVideos.examples = tempExp;

    structureImages.videos = arrTempVideos;
  }

  console.log("> [ROBOT VIDEO] Save state");
  await UArchive.writeFileJson("/assets/state", "text.json", structureImages);

  return structureImages;
};

const RobotVideo = async () => {
  try {
    console.log("> [ROBOT VIDEO] Recover state aplication");
    const state = await UArchive.loadFileJson(
      "/assets/state",
      "text.json"
    );

    // console.log("> [ROBOT VIDEO] Generate images");
    // state = await generateImageFromText(structureAudio);

    console.log("> [ROBOT VIDEO] Generate videos");
    await createVideos(state);

  } catch (error) {
    console.log("Ops...", error);
  }
};

module.exports = { RobotVideo };
