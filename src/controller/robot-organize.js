import { format } from 'date-fns';

import { State } from "~/services";
import { UArchive } from "~/utils";

const copyOrDeleteFilesbyArr = (source, arrData, deleteFiles = false) => {
    arrData.map(data => {
        var nameFile = UArchive.getNameFile(data);
        var urlFolder = UArchive.createFolder(source);
        if (deleteFiles)
            UArchive.deleteArchive(data);
        else
            UArchive.moveFile(data, `${urlFolder}/${nameFile}`, arr => arr !== null && console.log(arr));
    })
}

const removeLinkOfState = state => {
    state.map(words => {
        delete words.definitions.map(d => {
            delete d.video;
            delete d.image;
        });
        delete words.examples.map(d => {
            delete d.video;
            delete d.image;
        });

        delete words.cover_image;
        delete words.cover_video;
        delete words.cover_definition;
        delete words.cover_examples;
    })
}

const organizeFiles = () => {
    var wordsUsed = UArchive.loadFile(
        "/assets/text",
        "wordsUsed.txt"
    );
    const day = format(new Date(), 'DD/MM');
    var nameFolder = `[${day}] Video ${wordsUsed.length / 10}`;

    console.log("> [ROBOT ORGANIZE] Delete files images");
    UArchive.copyOrDeleteFolderByExt('/assets/temp', 'png', `/assets/uploads/${nameFolder}/images`, true);

    console.log("> [ROBOT ORGANIZE] Move file to instagram folder");
    var arrFilesInsta = UArchive.loadFileJson("/assets/videos/final_render", "file_render_words");
    copyOrDeleteFilesbyArr('/assets/uploads/instagram/' + nameFolder, arrFilesInsta);
    UArchive.deleteArchive('/assets/videos/final_render/file_render_words.json');

    console.log("> [ROBOT ORGANIZE] Move files videos");
    UArchive.copyOrDeleteFolderByExt('/assets/videos/final_render', 'mp4', `/assets/uploads/${nameFolder}/youtube`);
    UArchive.copyOrDeleteFolderByExt('/assets/temp', 'mp4', `/assets/uploads/${nameFolder}/videos`, true)

    console.log("> [ROBOT ORGANIZE] Move files audio");
    UArchive.copyOrDeleteFolderByExt('/assets/temp', 'mp3', `/assets/uploads/${nameFolder}/audios`);

    console.log("> [ROBOT ORGANIZE] Move file description");
    var urlFolder = UArchive.createFolder(`/assets/uploads/${nameFolder}/text`);
    UArchive.moveFile("/assets/text/description.txt", `${urlFolder}/description.txt`, arr => console.log(arr));

    removeLinkOfState(State.getState())
}

const RobotOrganize = async () => {
    try {
        var progress = await State.getState('progress');
        if (progress.robot_video !== true)
            throw "Not completed robot video";
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
