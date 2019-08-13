import { Google } from "~/services";
import { UArchive } from "~/utils";

const RobotDrive = async () => {
    console.log("\n\n> [ROBOT DRIVE]");
    try {
        // console.log("> [ROBOT DRIVE] Authenticate");
        await Google.authenticateWithOAuth('drive');

        // var wordsUsed = UArchive.loadFile(
        //     "/assets/text",
        //     "wordsUsed.txt"
        // );
        // var nameFolder = `Video ${wordsUsed.length / 10}`;

        await Google.sendFolderVideo();

    } catch (error) {
        console.log("Ops...", error);
    }
};

module.exports = { RobotDrive };
