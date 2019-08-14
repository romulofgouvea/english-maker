import { RobotText, RobotAudio, RobotVideo, RobotYouTube, RobotOrganize, RobotDrive } from "~/controller";

const Index = async () => {
  await RobotText.RobotText();
  await RobotAudio.RobotAudio();
  await RobotVideo.RobotVideo();
  await RobotOrganize.RobotOrganize();
  await RobotYouTube.RobotYouTube();
  await RobotDrive.RobotDrive();
};

Index();
