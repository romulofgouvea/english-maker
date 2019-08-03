import { RobotText, RobotAudio, RobotVideo, RobotYouTube } from '~/controller';

const App = async () => {
  // await RobotText.RobotText();
  // await RobotAudio.RobotAudio();
  await RobotVideo.RobotVideo();
  // await RobotYouTube.RobotYouTube();
};

App();
