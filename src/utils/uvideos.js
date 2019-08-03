import path from "path";
import { spawn } from "child_process";

import UArchive from "./uarchives";
import { constants } from "../../config";

const BASE_URL = constants.BASE_URL;

const generateVideo = async (inputURLImage, inputURLMp3, source, nameFile) => {
  const base = path.join(BASE_URL, source);
  const outputFile = `${base}\\${nameFile}.mp4`;

  var arg = [
    "-y",
    "-loop",
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
    "-s",
    "hd1080",
    "-vf",
    "scale='min(1280,iw)':-2,format=yuv420p",
    "-preset",
    "slow",
    "-profile:v",
    "main",
    "-movflags",
    "+faststart",
    "-shortest",
    outputFile
  ];

  return await new Promise((resolve, reject) => {
    var ffmpeg = spawn("ffmpeg", arg);

    ffmpeg.on("exit", () => {
      if (UArchive.fileExists(outputFile)) {
        resolve(outputFile);
      }
      reject("");
    });
  });
};

const generateVideoTimeFixed = async (source, nameFile, inputURLImage) => {
  const base = path.join(BASE_URL, source);
  const outputFile = `${base}\\${nameFile}.mp4`;

  var arg = [
    "-y",
    "-loop",
    1,
    "-t",
    "00:00:03",
    "-i",
    inputURLImage,
    "-vcodec",
    "libx264",
    "-strict",
    "experimental",
    "-s",
    "hd1080",
    "-vf",
    "scale='min(1280,iw)':-2,format=yuv420p",
    "-preset",
    "slow",
    "-profile:v",
    "main",
    "-movflags",
    "+faststart",
    "-shortest",
    outputFile
  ];

  return await new Promise((resolve, reject) => {
    var ffmpeg = spawn("ffmpeg", arg);

    ffmpeg.on("exit", () => resolve(outputFile));
  });
};

function resizeVideo(source, nameFile, quality) {
  const base = path.join(BASE_URL, source);
  const inputFile = `${base}\\${nameFile}.mp4`;
  const outputFile = `${base}\\${nameFile}_${quality}.mp4`;

  const p = new Promise((resolve, reject) => {
    const ffmpeg = spawn("ffmpeg", [
      "-i",
      inputFile,
      "-codec:v",
      "libx264",
      "-profile:v",
      "main",
      "-preset",
      "slow",
      "-b:v",
      "400k",
      "-maxrate",
      "400k",
      "-bufsize",
      "800k",
      "-vf",
      `scale=-2:${quality}`,
      "-threads",
      "0",
      "-b:a",
      "128k",
      outputFile
    ]);
    ffmpeg.stderr.on("data", data => {
      console.log(`${data}`);
    });
    ffmpeg.on("close", code => {
      resolve();
    });
  });
  return p;
}

const generateTempVideo = async (base, nameFile, temp) => {
  // ffmpeg -i input2.mp4 -c copy -bsf:v h264_mp4toannexb -f mpegts intermediate2.ts

  var arrIntermediate = [];
  for (var [key, file] of temp.entries()) {
    let outputFile = `${base}\\${nameFile}_tmp_${key}.ts`;
    outputFile = outputFile.replace(/\\/g, "/");
    var arg = [
      "-y",
      "-i",
      file,
      "-c",
      "copy",
      "-bsf:v",
      "h264_mp4toannexb",
      "-ac",
      1,
      "-ar",
      48000,
      "-b:a",
      "192k",
      "-preset",
      "slow",
      "-f",
      "mpegts",
      outputFile
    ];

    var out = await new Promise((resolve, reject) => {
      var ffmpeg = spawn("ffmpeg", arg);

      ffmpeg.on("exit", () => resolve(outputFile));
    });

    arrIntermediate.push(out);
  }
  return arrIntermediate;
};

const joinVideos = async (source, nameFile, arrFiles) => {
  const base = path.join(BASE_URL, source);
  let outputFile = `${base}\\${nameFile}.mp4`;

  var arr = await generateTempVideo(base, nameFile, arrFiles);

  return await new Promise((resolve, reject) => {
    let inputNamesFormatted = "concat:" + arr.join("|");

    var arg = [
      "-y",
      "-i",
      inputNamesFormatted,
      "-c",
      "copy",
      "-vcodec",
      "libx264",
      "-acodec",
      "aac",
      "-b:a",
      "192k",
      outputFile
    ];

    var ffmpeg = spawn("ffmpeg", arg);

    ffmpeg.on("exit", () => {
      removeTmpFiles(arr);
      resolve(outputFile);
    });
  });
};

const removeTmpFiles = async files => {
  for (var file of files) {
    await UArchive.deleteArchive(file);
  }
};

module.exports = {
  generateVideo,
  generateVideoTimeFixed,
  resizeVideo,
  joinVideos
};
