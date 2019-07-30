import gm from "gm";
import path from "path";

import { constants } from "../../config";

const BASE_URL = constants.BASE_URL;
let imageMagick = gm.subClass({ imageMagick: true });

const generateImageTextCenter = (source, nameFile, text) => {
  var base = path.join(BASE_URL, source);
  return new Promise((resolve, reject) => {
    const outputFile = `${base}/${nameFile}`;

    const width = 1920;
    const height = 1080;

    imageMagick()
      .out("-size", `${width}x${height}`)
      .out("-gravity", "center")
      .out("-fill", "white")
      // .fontSize(100)
      .font("Verdana", 100)
      .border(100, 100)
      .borderColor("transparent")
      .out("-background", "transparent")
      .out("-resize", `${width}x${height}`)
      // .out("-kerning", "-1")
      .out(`caption:${text}`)
      .write(outputFile, error => {
        if (error) {
          return reject(error);
        }
        resolve(outputFile);
      });
  });
};

module.exports = {
  generateImageTextCenter
};
