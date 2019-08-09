import _ from "lodash";

import { Google, State } from "~/services";

const RobotYouTube = async () => {
  try {
    console.log("> [ROBOT YOUTUBE] Recover state aplication");
    var state = await State.getState();
    progress = await State.getState('progress');
    if (!progress.robot_video.finish)
      throw "Not completed robot video"

    await Google.authenticateWithOAuth();
    const videoInformation = await Google.uploadVideo(state);
    var filePath = "";
    await Google.uploadThumbnail(filePath, videoInformation);

    progress.robot_youtube.finish = true;
    await State.setState("progress", progress);
  } catch (error) {
    console.log("Ops...", error);
  }
};

module.exports = { RobotYouTube };
