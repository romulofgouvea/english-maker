import { RobotText, RobotAudio, RobotVideo, RobotYouTube } from "~/controller";

const Index = async () => {
  //await RobotText.RobotText();
  //await RobotAudio.RobotAudio();
  await RobotVideo.RobotVideo();
  // await RobotYouTube.RobotYouTube();
};

Index();
