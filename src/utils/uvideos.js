import path from "path";
import { spawn } from "child_process";

import UArchive from "./uarchives";
import { constants } from "../../config";

const BASE_URL = constants.BASE_URL;

const generateVideo = async (source, nameFile, sourceImage, sourceMp3) => {
  const base = path.join(BASE_URL, source);
  const image = path.join(BASE_URL, sourceImage);
  const mp3 = path.join(BASE_URL, sourceMp3);
  const outputFile = `${base}\\${nameFile}.mp4`;

  if (!UArchive.fileExists(image)) throw "Images not exists";
  if (!UArchive.fileExists(mp3)) throw "Audio not exists";

  var arg = [
    "-y",
    "-loop",
    1,
    "-i",
    image,
    "-i",
    mp3,
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

  const out = await new Promise((resolve, reject) => {
    var ffmpeg = spawn("ffmpeg", arg);

    ffmpeg.on("exit", () => {
      const exists = UArchive.fileExists(`${source}/${nameFile}.mp4`);
      if (exists) {
        resolve(exists);
      }
      resolve("");
    });
  });
  if (!out) throw "Video not created!";
  return out;
};

const generateVideoTimeFixed = async (source, nameFile, sourceImage) => {
  const base = path.join(BASE_URL, source);
  const image = path.join(BASE_URL, sourceImage);
  const outputFile = `${base}\\${nameFile}.mp4`;

  var arg = [
    "-y",
    "-loop",
    1,
    "-t",
    "00:00:03",
    "-i",
    image,
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

    ffmpeg.on("exit", () => {
      const exists = UArchive.fileExists(`${source}/${nameFile}.mp4`);
      if (exists) {
        resolve(exists);
      }
      resolve("");
    });
  });
};

function transformVideo(source, nameFile, inputFile) {
  const base = path.join(BASE_URL, source);
  const outputFile = `${base}\\${nameFile}.mp4`;

  var arg = [
    "-y",
    "-i",
    inputFile,
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

  const p = new Promise((resolve, reject) => {
    const ffmpeg = spawn("ffmpeg", arg);
    ffmpeg.stderr.on("data", data => {
      console.log(`${data}`);
    });
    ffmpeg.on("close", code => {
      resolve();
    });
  });
  return p;
}

const generateTempVideo = async (source, nameFile, temp) => {
  // ffmpeg -i input2.mp4 -c copy -bsf:v h264_mp4toannexb -f mpegts intermediate2.ts
  var arrIntermediate = [];
  for (var [key, file] of temp.entries()) {
    let outputFile = `${source}\\${nameFile}_tmp_${key}.ts`;

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

      ffmpeg.on("exit", () => {
        const exists = UArchive.fileExists(`${source}/${nameFile}.ts`);
        if (exists) {
          resolve(exists);
        }
        resolve("");
      });
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
      const exists = UArchive.fileExists(`${source}/${nameFile}.mp4`);
      if (exists) {
        resolve(exists);
      }
      resolve("");
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
  transformVideo,
  joinVideos
};
