import path from "path";
import { spawn } from "child_process";

import UArchive from './uarchives';
import { constants } from "../../config";

const BASE_URL = constants.BASE_URL;

const generateVideo = async (inputURLImage, inputURLMp3, source, nameFile) => {
  const base = path.join(BASE_URL, source);
  const outputFile = `${base}\\${nameFile}.mp4`;

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
    var ffmpeg = spawn("ffmpeg", arg);

    ffmpeg.on('exit', () => resolve(outputFile));
  });
};

const generateVideoTimeFixed = async (source, nameFile, inputURLImage) => {
  const base = path.join(BASE_URL, source);
  const outputFile = `${base}\\${nameFile}.mp4`;

  var arg = [
    "-y",
    "-loop",
    1,
    "-framerate",
    1,
    '-t', '00:00:03',
    "-i",
    inputURLImage,
    "-vcodec",
    "libx264",
    "-strict",
    "experimental",
    "-vf",
    "scale=-2:1920,format=yuv420p",
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

function resizeVideo(source, nameFile, quality) {
  const base = path.join(BASE_URL, source);
  const inputFile = `${base}\\${nameFile}.mp4`;
  const outputFile = `${base}\\${nameFile}_${quality}.mp4`;

  const p = new Promise((resolve, reject) => {
    const ffmpeg = spawn('ffmpeg', ['-i', inputFile, '-codec:v', 'libx264', '-profile:v', 'main', '-preset', 'slow', '-b:v', '400k', '-maxrate', '400k', '-bufsize', '800k', '-vf', `scale=-2:${quality}`, '-threads', '0', '-b:a', '128k', outputFile]);
    ffmpeg.stderr.on('data', (data) => {
      console.log(`${data}`);
    });
    ffmpeg.on('close', (code) => {
      resolve();
    });
  });
  return p;
}

const joinVideos = async (source, nameFile, textVideos) => {
  const base = path.join(BASE_URL, source);
  const outputFile = `${base}\\${nameFile}.mp4`;

};


module.exports = {
  generateVideo,
  generateVideoTimeFixed,
  resizeVideo,
  joinVideos,
};
