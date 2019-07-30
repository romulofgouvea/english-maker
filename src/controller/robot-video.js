import _ from "lodash";

import { UArchive, UImage } from "~/utils";

const generateImageFromText = async structureAudio => {
  for (var words of structureAudio) {
    words.images = {
      definitions: [],
      examples: []
    };
    const word = words.word.replace(/\r/g, "");

    console.log("> [ROBOT VIDEO] Generate image of the definitions");
    var tempArrDefinitions = [];
    words.image.coverDefinitions =
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
    words.image.coverExamples =
      "D:/workspace/video-maker/src/assets/template-video/examples.png";
    for (var [key, exm] of words.examples.entries()) {
      var text =
        word.translate && exm.concat("\n\n", word.translate.examples[key]);
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
};

const RobotVideo = async () => {
  try {
    console.log("> [ROBOT VIDEO] Recover state aplication");
    const structureAudio = await UArchive.loadFileJson(
      "/assets/state",
      "text.json"
    );

    console.log("> [ROBOT VIDEO] Generate images");
    await generateImageFromText(structureAudio);

  } catch (error) {
    console.log("Ops...", error);
  }
};

module.exports = { RobotVideo };
