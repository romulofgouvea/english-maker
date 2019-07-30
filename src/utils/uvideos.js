var ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
var ffmpeg = require("fluent-ffmpeg");
import path from "path";

import { constants } from "../../config";

ffmpeg.setFfmpegPath(ffmpegPath);
const command = ffmpeg();
const BASE_URL = constants.BASE_URL;

const generateVideo = async (inputURLImage, inputURLMp3, source, nameFile) => {
    const base = path.join(BASE_URL, source);
    const outputFile = `${base}/${nameFile}`;

    return await new Promise((resolve, reject) => {
        command
            .input(inputURLImage)
            .inputFPS(1 / 5)
            .input(inputURLMp3)
            .output(outputFile)
            .outputFPS(30)
            .on("end", () => {
                console.log('Finish process video');
                resolve(outputFile)
            })
            .on("progress", onProgress)
            .on("error", (err, stdout, stderr) => {
                console.log("Cannot process video: " + err.message);
                reject("")
            })
            .run();
    })
}

const joinMiniVideos = async () => { };

function onProgress(progress) {
    console.log("Time mark: " + progress.timemark);
}

module.exports = {
    generateVideo
}