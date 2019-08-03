import _ from "lodash";

import { Google } from "~/services";
import { UArchive } from "~/utils";

const RobotYouTube = async () => {
  try {
    console.log("> [ROBOT YOUTUBE] Recover state aplication");
    var state = await UArchive.loadFileJson("/assets/state", "state.json");

    await Google.authenticateWithOAuth();
    const videoInformation = await Google.uploadVideo(state);
    var filePath = ""
    await Google.uploadThumbnail(filePath,videoInformation);
  } catch (error) {
    console.log("Ops...", error);
  }
};

module.exports = { RobotYouTube };
