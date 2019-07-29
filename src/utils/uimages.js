import gm from "gm";
import path from "path";

import { constants } from "../../config";

const BASE_URL = constants.BASE_URL;
let imageMagick = gm.subClass({ imageMagick: true });

const generateImageTextCenter = (source, nameFile, text) => {
  var base = path.join(BASE_URL, source);
  return new Promise((resolve, reject) => {
    const outputFile = `${base}/${nameFile}`;

    imageMagick()
      .out("-size", "1920x1080")
      .out("-gravity", "center")
      .out("-fill", "white")
      .fontSize("100")
      // .font(font)
      .border(100, 100)
      .borderColor("transparent")
      .out("-background", "transparent")
      .out("-kerning", "-1")
      .out(`caption:${text}`)
      .write(outputFile, error => {
        if (error) {
          return reject(error);
        }

        console.log(`created: ${outputFile}`);
        resolve();
      });
  });
};

module.exports = {
  generateImageTextCenter
};
