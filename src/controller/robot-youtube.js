import { format } from 'date-fns';

import { Google, State } from "~/services";

const mountTextByArray = (text, arr) => {
  var tempText = "";
  for (var [key, value] of arr.entries()) {
    tempText += `${text} ${key}:\n` +
      ` EN: ${value.phrase}\n` +
      ` PT: ${value.translate}\n`;
  }
  return tempText
}

const mountDescription = state => {
  var textDesc = "";
  for (var words of state) {
    var tempD = [words.definitions[0]]

    textDesc += `Word: \nEN: ${words.word} \nTranscript: ${words.transcript}\n` +
      `PT: ${words.word_translate}\n` +
      `${mountTextByArray('Definition', tempD)}\n` +
      `${mountTextByArray('Example', words.examples)}\n\n`
  }
  return textDesc;
};

const mountObjUpload = async state => {

  var wordsUsed = UArchive.loadFile(
    "/assets/text",
    "wordsUsed.txt"
  );
  const day = format(new Date(), 'DD/MM')
  var nameFolder = `[${day}] Video ${wordsUsed.length / 10}`;

  var tempObj = {
    url_video: `/assets/uploads/${nameFolder}/youtube/youtube.mp4`,
    title: "",
    description: "",
    tags: ""
  }

  tempObj.title = `[${day}] Ten Words every day`;

  var description = await mountDescription(state)
  tempObj.description = description.length > 5000 ? "" : description;

  var tags = state.map(words => {
    if (words.keywords.length > 3) {
      return Object.values(words.keywords).slice(0, 3)
    } else
      return words.keywords;
  })
  tempObj.tags = _.flatten(tags);

  console.log("> [ROBOT YOUTUBE] Save description");
  await UArchive.writeFileSync(
    "/assets/text",
    "description.txt",
    description
  );

  return tempObj;
}

const RobotYouTube = async () => {
  try {
    var progress = await State.getState('progress');
    if (progress.robot_organize !== true)
      throw "Not completed robot organize"

    if (progress.robot_youtube === true)
      return;

    console.log("\n\n> [ROBOT YOUTUBE]");
    var state = await State.getState();

    await Google.authenticateWithOAuth('youtube');

    const objMounted = await mountObjUpload(state)
    const videoInformation = await Google.uploadVideo(objMounted);

    console.log(videoInformation);
    // var filePath = "";
    // await Google.uploadThumbnail(filePath, videoInformation);

    progress.robot_youtube = true;
    await State.setState("progress", progress);
  } catch (error) {
    console.log("Ops...", error);
  }
};

module.exports = { RobotYouTube };
