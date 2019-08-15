import { format } from 'date-fns';

import { State } from "~/services";
import { UArchive } from "~/utils";

const removeLinkOfState = async () => {
    var state = await State.getState();
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
    await State.setState("state", state);
}

const organizeFiles = async () => {
    try {
        var nameFolder = UArchive.getNameFolder();

        console.log("> [ROBOT ORGANIZE] Move files audio");
        UArchive.copyOrDeleteFolderByExt('/assets/temp', 'mp3', `/assets/uploads/${nameFolder}/audios`);
        
        console.log("> [ROBOT ORGANIZE] Move file to instagram folder");
        var arrFilesInsta = UArchive.loadFileJson("/assets/videos/final_render", "file_render_words");
        if (arrFilesInsta) {
            arrFilesInsta.shift();
            UArchive.copyOrDeleteFilesbyArr('/assets/uploads/instagram/' + nameFolder, arrFilesInsta);
            UArchive.deleteArchive('/assets/videos/final_render/file_render_words.json');
        }

        console.log("> [ROBOT ORGANIZE] Delete files images");
        UArchive.copyOrDeleteFolderByExt('/assets/temp', 'png', `/assets/uploads/${nameFolder}/images`, true);

        console.log("> [ROBOT ORGANIZE] Organize files to youtube folder");
        UArchive.copyOrDeleteFolderByExt('/assets/videos/final_render', 'mp4', `/assets/uploads/${nameFolder}/youtube`);

        console.log("> [ROBOT ORGANIZE] Remove videos");
        UArchive.copyOrDeleteFolderByExt('/assets/temp', 'mp4', `/assets/uploads/${nameFolder}/videos`, true)

        var existDesc = UArchive.existsFile("/assets/text/description.txt");
        if (existDesc) {
            console.log("> [ROBOT ORGANIZE] Move file description");
            var urlFolder = UArchive.createFolder(`/assets/uploads/${nameFolder}/text`);
            UArchive.moveFile(existDesc, `${urlFolder}/description.txt`, arr => console.log(arr));
        }

        console.log("> [ROBOT ORGANIZE] Update State");
        removeLinkOfState()
    } catch (error) {
        console.log('organizeFiles: ', error);
    }
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
