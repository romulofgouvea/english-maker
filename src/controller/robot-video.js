import _ from "lodash";
import { UArchive } from "~/utils";

const saveScriptAfterEffects = async content => {
  var scriptString = `var content = ${JSON.stringify(content)}`;
  return await UArchive.writeFileSync(
    "/assets/scripts",
    "after-effects-script.js",
    scriptString
  );
};

const RobotVideo = async () => {
  try {
    console.log("RobotVideo: Load file");
    const structureAudio = await UArchive.loadFileJson(
      "/assets/state",
      "text.json"
    );

    console.log("Save Script for import in After Effects");
    await saveScriptAfterEffects(structureAudio);

    console.log(structureAudio);
  } catch (error) {
    console.log("Ops...", error);
  }
};

RobotVideo();
