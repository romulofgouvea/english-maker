import path from "path";
import { spawn } from "child_process";

import { constants } from "../../config";

const BASE_URL = constants.BASE_URL;

const generateVideo = async (inputURLImage, inputURLMp3, source, nameFile) => {
  const base = path.join(BASE_URL, source);
  const outputFile = `${base}/${nameFile}`;

  var arg = [
    "-y",
    "-loop",
    1,
    "-framerate",
    1,
    "-i",
    inputURLImage,
    "-i",
    inputURLMp3,
    "-vcodec",
    "libx264",
    "-acodec",
    "aac",
    "-strict",
    "experimental",
    "-b:a",
    "192k",
    "-vf",
    "scale='min(1280,iw)':-2,format=yuv420p",
    "-preset",
    "medium",
    "-profile:v",
    "main",
    "-movflags",
    "+faststart",
    "-shortest",
    outputFile
  ];

  return await new Promise((resolve, reject) => {
    spawn("ffmpeg", arg);
    resolve(outputFile);
  });
};

const joinMiniVideos = async () => {};

module.exports = {
  generateVideo
};
