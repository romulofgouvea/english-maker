import { RobotText, RobotAudio, RobotVideo, RobotYouTube, RobotOrganize, RobotDrive } from "~/controller";

const Index = async () => {
  await RobotText.RobotText();
  await RobotAudio.RobotAudio();
  await RobotVideo.RobotVideo();
  await RobotYouTube.RobotYouTube();
  await RobotOrganize.RobotOrganize();
  await RobotDrive.RobotDrive();
};

Index();
