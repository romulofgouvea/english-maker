import { Google } from "~/services";
import { UArchive } from "~/utils";

const RobotDrive = async () => {
    console.log("\n> [ROBOT DRIVE]");
    try {
        var wordsUsed = UArchive.loadFile(
            "/assets/text",
            "wordsUsed.txt"
        );
        var nameFolder = `Video ${wordsUsed.length / 10}`;

        console.log("> [ROBOT DRIVE] Send files for drive");
        await Google.authenticateWithOAuth();
        await Google.sendFolderVideo(`/uploads/${nameFolder}`);

    } catch (error) {
        console.log("Ops...", error);
    }
};

module.exports = { RobotDrive };
