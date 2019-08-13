import { State } from "~/services";
import { UArchive } from '~/utils';

const copyFolderByExt = (source, ext, newSource, deleteFiles = false) => {
    UArchive.listFilesDir(source, ext).map(a => {
        var nameFile = UArchive.getNameFile(a);
        var urlFolder = UArchive.createFolder(newSource);
        if (deleteFiles)
            UArchive.deleteArchive(`${urlFolder}/${nameFile}`);
        else
            UArchive.moveFile(a, `${urlFolder}/${nameFile}`, arr => arr !== null && console.log(arr));
    });
}

const copyFilesbyArr = (source, arrData, deleteFiles = false) => {
    arrData.map(data => {
        var nameFile = UArchive.getNameFile(data);
        var urlFolder = UArchive.createFolder(source);
        if (deleteFiles)
            UArchive.deleteArchive(`${urlFolder}/${nameFile}`);
        else
            UArchive.moveFile(a, `${urlFolder}/${nameFile}`, arr => arr !== null && console.log(arr));
    })
}

const organizeFiles = () => {
    var wordsUsed = UArchive.loadFile(
        "/assets/text",
        "wordsUsed.txt"
    );
    var nameFolder = `Video ${wordsUsed.length / 10}`;

    console.log("> [ROBOT ORGANIZE] Move files audio");
    copyFolderByExt('/assets/temp', 'mp3', `/assets/uploads/${nameFolder}/audios`);

    console.log("> [ROBOT ORGANIZE] Move files images");
    copyFolderByExt('/assets/temp', 'png', `/assets/uploads/${nameFolder}/images`, true);

    console.log("> [ROBOT ORGANIZE] Move file to instagram folder");
    var arrFilesInsta = UArchive.loadFileJson("/assets/videos/final_render", "file_render_words");
    copyFilesbyArr('/assets/uploads/instagram' + nameFolder, arrFilesInsta);
    UArchive.deleteArchive('/assets/videos/final_render/file_render_words.json');

    console.log("> [ROBOT ORGANIZE] Move files videos");
    copyFolderByExt('/assets/temp', 'mp4', `/assets/uploads/${nameFolder}/videos`, true)
    copyFolderByExt('/assets/videos/final_render', 'mp4', `/assets/uploads/${nameFolder}/final_render`);

    console.log("> [ROBOT ORGANIZE] Move file description");
    var urlFolder = UArchive.createFolder(`/assets/uploads/${nameFolder}/text`);
    UArchive.moveFile("/assets/text/description.txt", `${urlFolder}/description.txt`, arr => console.log(arr));
}

const RobotOrganize = async () => {
    try {
        var progress = await State.getState('progress');
        if (progress.robot_youtube !== true)
            throw "Not completed robot youtube";
        if (progress.robot_organize === true)
            return;

        console.log("\n\n> [ROBOT ORGANIZE] Organize files");
        await organizeFiles();

        progress.robot_organize = true;
        await State.setState("progress", progress);
    } catch (error) {
        console.log("Ops...", error);
    }
};

module.exports = { RobotOrganize };
