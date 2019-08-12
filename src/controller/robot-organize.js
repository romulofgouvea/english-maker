import { State } from "~/services";
import { UArchive } from '~/utils';

var copyFolder = (source, ext, newSource) => {
    UArchive.listFilesDir(source, ext).map(a => {
        var nameFile = UArchive.getNameFile(a);
        var urlFolder = UArchive.createFolder(`/assets/uploads${newSource}`)
        UArchive.moveFile(a, `${urlFolder}/${nameFile}`, arr => arr !== null && console.log(arr))
    });
}

const organizeFiles = () => {
    var wordsUsed = UArchive.loadFile(
        "/assets/text",
        "wordsUsed.txt"
    );
    var nameFolder = `Video ${wordsUsed.length / 10}`;

    console.log("> [ROBOT ORGANIZE] Move files audio");
    copyFolder('/assets/temp', 'mp3', `/${nameFolder}/audios`)

    console.log("> [ROBOT ORGANIZE] Move files images");
    copyFolder('/assets/temp', 'png', `/${nameFolder}/images`)

    console.log("> [ROBOT ORGANIZE] Move files videos");
    copyFolder('/assets/temp', 'mp4', `/${nameFolder}/videos`)

    copyFolder('/assets/videos/final_render', 'mp4', `/${nameFolder}/final_render`)

    console.log("> [ROBOT ORGANIZE] Move file description");
    var urlFolder = UArchive.createFolder(`/assets/uploads/${nameFolder}/text`)
    UArchive.moveFile("/assets/text/description.txt", `${urlFolder}/description.txt`, arr => console.log(arr))

    console.log("> [ROBOT ORGANIZE] Move files json");
    copyFolder('/assets/state', 'json', `/${nameFolder}/state`)
}

const RobotOrganize = async () => {
    try {
        var progress = await State.getState('progress');
        if (progress.robot_youtube !== true)
            throw "Not completed robot youtube"
        if (progress.robot_organize === true)
            return;

        console.log("\n\n> [ROBOT ORGANIZE] Organize files");
        await organizeFiles()

        progress.robot_organize = true;
        await State.setState("progress", progress);
    } catch (error) {
        console.log("Ops...", error);
    }
};

module.exports = { RobotOrganize };