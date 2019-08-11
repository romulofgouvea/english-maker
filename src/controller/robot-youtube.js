import { Google, State } from "~/services";

const RobotYouTube = async () => {
  try {
    var progress = await State.getState('progress');
    if (progress.robot_video !== true)
      throw "Not completed robot video"

    if (progress.robot_youtube === true)
      return;
      
    console.log("\n\n> [ROBOT YOUTUBE]");
    var state = await State.getState();

    await Google.authenticateWithOAuth();
    const videoInformation = await Google.uploadVideo(state);
    var filePath = "";
    await Google.uploadThumbnail(filePath, videoInformation);

    progress.robot_youtube = true;
    await State.setState("progress", progress);
  } catch (error) {
    console.log("Ops...", error);
  }
};

module.exports = { RobotYouTube };
