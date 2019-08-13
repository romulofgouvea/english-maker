import { Instagram } from "~/services";

const sendVideoTimeLine = () => { }

const sendVideoStories = () => { }

const RobotInstagram = async () => {
    console.log("\n\n> [ROBOT INSTAGRAM]");
    try {
        console.log("\n\n> [ROBOT INSTAGRAM] Instagram OAuth");
        await Instagram.authenticateWithOAuth();

        await sendVideoTimeLine();

        await sendVideoStories();

        console.log("> [ROBOT INSTAGRAM] Delete files json");
        UArchive.copyOrDeleteFolder('/assets/state', 'json', `/assets/uploads/${nameFolder}/state`, true)
    } catch (error) {
        console.log("Ops...", error);
    }
};

module.exports = { RobotInstagram };