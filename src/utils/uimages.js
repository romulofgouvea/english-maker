import gm from "gm";
import path from "path";

import UString from "./ustring";
import { constants } from "../../config";

const BASE_URL = constants.BASE_URL;
const imageMagick = gm.subClass({ imageMagick: true });

const generateImageTextCenter = async (source, nameFile, text) => {
  return await new Promise((resolve, reject) => {
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
        resolve(`${source}/${nameFile}.png`);
      });
  });
};

const coverImageWord = async (source, nameFile, objText) => {
  return await new Promise((resolve, reject) => {
    const base = path.join(BASE_URL, source);
    const outputFile = `${base}\\${nameFile}.png`;

    const width = 1920;
    const height = 1080;

    var drawText = 580;
    var drawTranscript = 780;
    var drawTranslate = 1020;
    var drawDerivatives = 980;

    var fontWord = 200;

    const im = imageMagick()
      .out("-size", `${width}x${height}`)
      .out("-fill", "white")
      .out("-background", "transparent")
      .borderColor("transparent")
      .border(100, 100)
      .out(`caption: `);

    if (objText.word.length >= 20) {
      objText.word = objText.word.splice(20, 0, "\n");
      fontWord = 170;

      drawText = 300;
      drawTranscript = 500;
      drawTranslate = 740;
      drawDerivatives = 900;
      drawTranscript += fontWord;
      drawTranslate += fontWord;
      drawDerivatives += fontWord;
    }

    objText.word = UString.captalize(objText.word.toLowerCase());
    objText.translate = UString.captalize(objText.translate.toLowerCase());

    if (objText.derivatives != "") {
      drawText = 380;
      drawTranscript = 580;
      drawTranslate = 820;
      drawDerivatives = 980;

      objText.derivatives = objText.derivatives
        .map(o => UString.captalize(o))
        .join(", ");
      im.fontSize(100).draw([
        `text 200,${drawDerivatives} '${objText.derivatives}'`
      ]);
    }

    im.fontSize(fontWord)
      .draw([`text 200,${drawText} '${objText.word}'`])
      .fontSize(150)
      .draw([`text 200,${drawTranscript} '/${objText.transcript}/'`])
      .fontSize(150)
      .draw([`text 200,${drawTranslate} '${objText.translate}'`]);

    im.write(outputFile, error => {
      if (error) {
        reject(error);
      }
      resolve(`${source}/${nameFile}.png`);
    });
  });
};

String.prototype.splice = function(idx, rem, str) {
  return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem));
};

module.exports = {
  generateImageTextCenter,
  coverImageWord
};
