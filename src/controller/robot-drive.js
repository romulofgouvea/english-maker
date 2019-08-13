import { Google } from "~/services";
import { UArchive } from "~/utils";

const sendFolderVideo = async () => {

    var wordsUsed = UArchive.loadFile(
        "/assets/text",
        "wordsUsed.txt"
    );
    var nameFolder = `Video ${wordsUsed.length / 10}`;
    var url = `/assets/uploads/${nameFolder}`;

    var urlZipFolder = await UArchive.zipFolder(url, `${url}.zip`);

    var idFile = await Google.sendZipToDrive(urlZipFolder)

    if (idFile) {
        console.log('File Uploaded: ', idFile);

        console.log("> [ROBOT DRIVE] Delete zip");
        UArchive.deleteArchive(urlZipFolder)
    }
}

const RobotDrive = async () => {
    console.log("\n\n> [ROBOT DRIVE]");
    try {
        console.log("> [ROBOT DRIVE] Authenticate");
        await Google.authenticateWithOAuth('drive');

        console.log("> [ROBOT DRIVE] Send folder");
        await sendFolderVideo();

    } catch (error) {
        console.log("Ops...", error);
    }
};

module.exports = { RobotDrive };
