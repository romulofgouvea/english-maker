import _ from "lodash";

import { UArchive } from "~/utils";

const RobotVideo = async () => {
  try {
    console.log("> [ROBOT VIDEO] Recover state aplication");
    const structureAudio = await UArchive.loadFileJson(
      "/assets/state",
      "text.json"
    );

    console.log(structureAudio);
  } catch (error) {
    console.log("Ops...", error);
  }
};

module.exports = { RobotVideo }
