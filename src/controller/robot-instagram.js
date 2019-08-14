import { Facebook } from "~/services";

const RobotInstagram = async () => {
    console.log("\n\n> [ROBOT INSTAGRAM]");
    try {
        console.log("\n\n> [ROBOT INSTAGRAM] Instagram OAuth");
        await Facebook.authenticateWithOAuth(process.env.FACEBOOK_CLIENT_SECRET);

        
        // await Instagram.sendVideoTimeLine();

        // await Instagram.sendVideoStories('/assets/uploads/instagram');

        // console.log("> [ROBOT INSTAGRAM] Delete files json");
        // UArchive.copyOrDeleteFolder('/assets/state', 'json', `/assets/uploads/${nameFolder}/state`, true)
    } catch (error) {
        console.log("Ops...", error);
    }
};

module.exports = { RobotInstagram };