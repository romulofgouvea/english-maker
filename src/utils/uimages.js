import gm from "gm";
import path from "path";

import { constants } from "../../config";

const BASE_URL = constants.BASE_URL;
let imageMagick = gm.subClass({ imageMagick: true });

const generateImageTextCenter = (source, nameFile, text) => {
  return new Promise((resolve, reject) => {
    const base = path.join(BASE_URL, source);
    const outputFile = `${base}\\${nameFile}.png`;

    const width = 1920;
    const height = 1080;

    imageMagick()
      .out("-size", `${width}x${height}`)
      .out("-gravity", "center")
      .out("-fill", "white")
      .font("Verdana", text.length > 100 ? 80 : 100)
      .border(100, 100)
      .borderColor("transparent")
      .out("-background", "transparent")
      .out("-resize", `${width}x${height}`)
      .out("-kerning", "-1")
      .out(`caption:${text}`)
      .write(outputFile, error => {
        if (error) {
          reject(error);
        }
        resolve(outputFile);
      });
  });
};

module.exports = {
  generateImageTextCenter
};
