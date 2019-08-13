import { Instagram } from "~/services";

const RobotInstagram = async () => {
    console.log("\n\n> [ROBOT INSTAGRAM]");
    try {
        Instagram.auth()
    } catch (error) {
        console.log("Ops...", error);
    }
};

module.exports = { RobotInstagram };