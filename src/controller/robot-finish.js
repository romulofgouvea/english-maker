import { State } from "~/services";
import { UArchive } from "~/utils";

const RobotFinish = async () => {
    try {

        console.log("> [ROBOT ORGANIZE] Delete state");
        await UArchive.copyOrDeleteFolderByExt('/assets/state', 'json', `/assets/temp`);

    } catch (error) {
        console.log("Ops...", error);
    }
};

module.exports = { RobotFinish };
