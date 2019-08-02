import _ from "lodash";
import { UArchive } from "~/utils";

const uploadVideo = state => {

}

const RobotYouTube = async () => {
  try {
    console.log("> [ROBOT YOUTUBE] Recover state aplication");
    var state = await UArchive.loadFileJson("/assets/state", "text.json");

    console.log(state.length);
  } catch (error) {
    console.log("Ops...", error);
  }
};

module.exports = { RobotYouTube };
