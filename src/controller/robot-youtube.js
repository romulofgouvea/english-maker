import _ from "lodash";

import { Google, State } from "~/services";

const RobotYouTube = async () => {
  try {
    console.log("> [ROBOT YOUTUBE] Recover state aplication");
    var state = await State.getState();

    await Google.authenticateWithOAuth();
    const videoInformation = await Google.uploadVideo(state);
    var filePath = "";
    await Google.uploadThumbnail(filePath, videoInformation);
  } catch (error) {
    console.log("Ops...", error);
  }
};

module.exports = { RobotYouTube };
