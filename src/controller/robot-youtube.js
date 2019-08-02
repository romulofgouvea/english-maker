import _ from "lodash";

import { Google } from "~/services";

const RobotYouTube = async () => {
  try {
    // console.log("> [ROBOT YOUTUBE] Recover state aplication");
    // var renderFinal = await UArchive.loadFileJson("/assets/state", "render.json");

    await Google.authenticateWithOAuth()
    // const videoInformation = await Google.uploadVideo(renderFinal)
    // await Google.uploadThumbnail(videoInformation)

  } catch (error) {
    console.log("Ops...", error);
  }
};

module.exports = { RobotYouTube };
