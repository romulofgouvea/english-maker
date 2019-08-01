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
  await UArchive.writeFileJson("/assets/state", "text.json", structureAudio);

  return structureAudio;
};

const createVideos = async structureImages => {

  for (var words of structureImages) {
    const word = words.word.replace(/\r/g, "");

    console.log("> [ROBOT VIDEO] Generate video definitions from: ", word);
    var tempDef = [];
    for (var [key, imgDef] of words.images.definitions.entries()) {
      tempDef.push(await UVideo.generateVideo(imgDef, words.audios.definitions[key], '/assets/videos', `${word}_definitions_${key}`));
    }

    console.log("> [ROBOT VIDEO] Generate video examples");
    var tempExp = [];
    for (var [key, imgExp] of words.images.examples.entries()) {
      tempExp.push(await UVideo.generateVideo(imgExp, words.audios.examples[key], '/assets/videos', `${word}_examples_${key}`));
    }

    words.videos = {
      definitions: tempDef,
      examples: tempExp
    };
  }

  console.log("> [ROBOT VIDEO] Save state");
  await UArchive.writeFileJson("/assets/state", "text.json", structureImages);

  return structureImages;
};

const generateArquiveFilesFromWords = async state => {
  try {
    console.log("> [ROBOT VIDEO] Generate files to concat videos");
    var tempArrFilesText = []
    for (var words of state) {
      const word = words.word.replace(/\r/g, "");

      if (await UArchive.fileExists('/assets/base-videos/temp-union', `${word}_render.txt`))
        continue;

      console.log("> [ROBOT VIDEO] Union video from: ", word);
      var temp = _.concat(
        'F:\\GitHub Examples\\video-maker\\src\\assets\\base-videos\\definitions_transition.mp4',
        words.videos.definitions,
        'F:\\GitHub Examples\\video-maker\\src\\assets\\base-videos\\examples_transition.mp4',
        words.videos.examples
      ).map(v => `file '${v}'`).join('\n');

      tempArrFilesText.push(await UArchive.writeFileSync('/assets/base-videos/temp-union', `${word}_render.txt`, temp));
    }

    return tempArrFilesText
  } catch (error) {
    console.log(error);
  }
}

const unionVideos = async state => {

  var arrArquives = await generateArquiveFilesFromWords(state);

  for (var archive of arrArquives) {
    var name = archive.replace(/.+\\|\..+/, '');
    console.log(name);
    await UVideo.joinVideos('/assets/base-videos/temp-union', name, archive)
  }

}

const RobotVideo = async () => {
  try {
    console.log("> [ROBOT VIDEO] Recover state aplication");
    var state = await UArchive.loadFileJson(
      "/assets/state",
      "text.json"
    );

    // console.log("> [ROBOT VIDEO] Generate images");
    // state = await generateImageFromText(state);


    // console.log("> [ROBOT VIDEO] Generate videos");
    // await createVideos(state);

    console.log("> [ROBOT VIDEO] Union videos");
    await unionVideos(state);

  } catch (error) {
    console.log("Ops...", error);
  }
};

module.exports = { RobotVideo };
