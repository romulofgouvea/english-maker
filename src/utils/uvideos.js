import path from "path";
import { spawn } from "child_process";

import UArchive from "./uarchives";
import UImage from "./uimages";

const generateVideo = async (source, nameFile, sourceImage, sourceMp3) => {
  const base = UArchive.getBaseUrl(source);
  const image = UArchive.getBaseUrl(sourceImage);
  const mp3 = UArchive.getBaseUrl(sourceMp3);

  const outputFile = `${base}\\${nameFile}.mp4`;

  if (!UArchive.existsFile(image)) throw "Images not exists";
  if (!UArchive.existsFile(mp3)) throw "Audio not exists";

  var arg = [
    "-y",
    "-loop",
    1,
    "-i",
    image,
    "-i",
    mp3,
    "-vcodec", "libx264",
    "-acodec", "aac",
    "-b:a", "192k",
    "-s", "hd1080",
    "-pix_fmt", "yuv420p",
    "-preset", "veryslow",
    "-profile:v", "baseline",
    "-level", "3.0",
    "-crf", 22,
    "-movflags",
    "+faststart",
    "-shortest",
    outputFile
  ];

  const out = await new Promise((resolve, reject) => {
    var ffmpeg = spawn("ffmpeg", arg);

    ffmpeg.on("exit", () => {
      const exists = UArchive.existsFile(outputFile);
      if (exists) {
        resolve(exists);
      }
      reject("");
    });
  });
  if (!out) throw "Video not created!";
  return out;
};

const generateVideoTimeFixed = async (source, nameFile, sourceImage) => {
  const base = UArchive.getBaseUrl(source);
  const image = UArchive.getBaseUrl(sourceImage);
  const outputFile = `${base}\\${nameFile}.mp4`;

  var arg = [
    "-y",
    "-loop",
    1,
    "-t",
    "00:00:03",
    "-i",
    image,
    "-vcodec", "libx264",
    "-acodec", "aac",
    "-b:a", "192k",
    "-s", "hd1080",
    "-pix_fmt", "yuv420p",
    "-preset", "veryslow",
    "-profile:v", "baseline",
    "-level", "3.0",
    "-shortest",
    outputFile
  ];

  return await new Promise((resolve, reject) => {
    var ffmpeg = spawn("ffmpeg", arg);

    ffmpeg.on("exit", () => {
      const exists = UArchive.existsFile(outputFile);
      if (exists) {
        resolve(exists);
      }
      reject("");
    });
  });
};

function transformVideo(source, nameFile, inputFile) {
  const base = UArchive.getBaseUrl(source);
  inputFile = UArchive.getBaseUrl(inputFile);
  const outputFile = `${base}\\${nameFile}.mp4`;

  var arg = [
    "-y",
    "-i",
    inputFile,
    "-vcodec", "libx264",
    "-acodec", "aac",
    "-b:a", "192k",
    "-s", "hd1080",
    "-pix_fmt", "yuv420p",
    "-preset", "veryslow",
    "-profile:v", "baseline",
    "-level", "3.0",
    "-shortest",
    outputFile
  ];

  const p = new Promise((resolve, reject) => {
    const ffmpeg = spawn("ffmpeg", arg);

    ffmpeg.on("exit", () => {
      const exists = UArchive.existsFile(outputFile);
      if (exists) {
        resolve(exists);
      }
      reject("");
    });
  });
  return p;
}

const generateTempVideo = async (source, nameFile, temp) => {
  // ffmpeg -i input2.mp4 -c copy -bsf:v h264_mp4toannexb -f mpegts intermediate2.ts
  source = UArchive.getBaseUrl(source);
  temp = temp.map(t => UArchive.getBaseUrl(t));

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
      "-f",
      "mpegts",
      outputFile
    ];

    var out = await new Promise((resolve, reject) => {
      var ffmpeg = spawn("ffmpeg", arg);

      ffmpeg.on("error", err => console.log(err));

      ffmpeg.on("exit", () => {
        const exists = UArchive.existsFile(outputFile);
        if (exists) {
          resolve(outputFile);
        }
        reject("");
      });
    });
    arrIntermediate.push(out);
  }
  return arrIntermediate;
};

const joinVideos = async (source, nameFile, arrFiles, removeFiles = true) => {
  const base = UArchive.getBaseUrl(source);
  let outputFile = `${base}\\${nameFile}.mp4`;

  var arrTemp = [...(await generateTempVideo(base, nameFile, arrFiles))];

  return await new Promise((resolve, reject) => {
    let inputNamesFormatted = `concat:${arrTemp.join("|")}`;

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

      "-preset", "veryslow",
      "-profile:v", "baseline",
      "-level", "3.0",
      "-shortest",
      outputFile
    ];

    var ffmpeg = spawn("ffmpeg", arg);

    ffmpeg.on("error", err => console.log("aa", err));

    ffmpeg.on("exit", () => {
      const exists = UArchive.existsFile(outputFile);
      if (exists) {
        if (removeFiles)
          UArchive.removeGroupFiles(arrTemp);
        resolve(exists);
      }
      reject("");
    });
  });
};

const generateVideoFromTextFixed = async (source, nameFile, text, saveImage = false) => {
  if (nameFile && !text) {
    text = nameFile;
    nameFile = nameFile.toLowerCase().replace(/\s/g, "_");
  }
  var outputImage = await UImage.generateImageTextCenter(source, nameFile, text);

  if (outputImage) {
    var outputVideo = await generateVideoTimeFixed(source, nameFile, outputImage);

    if (outputVideo) {
      if (!saveImage)
        UArchive.deleteArchive(outputImage)
      return {
        image: outputImage,
        video: outputVideo
      };
    }
  }
  return {
    image: "",
    video: ""
  };
};

const generateVideoFromObjText = async (source, text, saveImage = false) => {
  //objText = { word, translate, transcript, derivatives,audio}
  const word = text.word.toLowerCase();
  var audioWord = text.audio;
  delete text.audio;

  var outputImage = await UImage.coverImageWord(source, `${word}_word_cover`, text);

  if (outputImage) {
    var outputVideo = await generateVideo(source, `${word}_word_render`, outputImage, audioWord);

    if (outputVideo) {
      if (!saveImage)
        UArchive.deleteArchive(outputImage)
      return {
        image: outputImage,
        video: outputVideo
      };
    }
  }
  return {
    image: "",
    video: ""
  };
};

module.exports = {
  generateVideo,
  generateVideoTimeFixed,
  generateTempVideo,
  transformVideo,
  joinVideos,
  generateVideoFromTextFixed,
  generateVideoFromObjText
};
