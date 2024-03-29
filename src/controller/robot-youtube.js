import { format } from 'date-fns';
import _ from 'lodash';

import { Google, State } from "~/services";
import { UArchive } from "~/utils";

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

  textDesc.concat("Folder in drive: https://drive.google.com/drive/folders/1Hfe4TLhfJhzd__BJBb7QafNQvAQgOeA8")

  return textDesc;
};

const mountObjUpload = async state => {
  try {
    var nameFolder = UArchive.getNameFolder();

    var tempObj = {
      url_video: `/assets/uploads/${nameFolder}/youtube/youtube.mp4`,
      title: "",
      description: "",
      tags: ""
    }
    var nameFolder = UArchive.getNameFolder();
    tempObj.title = `${nameFolder} - Ten Words every day`;

    var description = await mountDescription(state)
    tempObj.description = description.length > 5000 ? "" : description;

    var tags = state.map(words => {
      if (words.keywords.length > 3) {
        return Object.values(words.keywords).slice(0, 3)
      } else
        return words.keywords;
    })
    
    tags = ['inglês', 'palavras', 'todo dia', 'estudo', 'inglês diario',
      'diario', 'palavras em igles', 'frases em inglês', 'frases inglês', 'inglês palavras',
      'novas palavras em inglês', 'video em inglês', 'conteudo em inglês'].concat(tempObj.tags);

    tempObj.tags = _.flatten(tags);


    console.log("> [ROBOT YOUTUBE] Save description");
    var urlFolder = UArchive.createFolder(`/assets/uploads/${nameFolder}/text`);
    await UArchive.writeFileSync(
      urlFolder,
      "description.txt",
      description
    );

    return tempObj;
  } catch (error) {
    console.log("Ops...", error);
  }
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

    // var filePath = "";
    // await Google.uploadThumbnail(filePath, videoInformation);

    progress.robot_youtube = true;
    await State.setState("progress", progress);
  } catch (error) {
    console.log("Ops...", error);
  }
};

module.exports = { RobotYouTube };
