global.__base = __dirname + "\\";
import dotenv from "dotenv";

import { UArchive } from "~/utils";
import { Oxford } from "~/services";

dotenv.config();

console.log("Init read file");
const arr = UArchive.loadFile("assets", "wordsNotUsed.txt");

const getWords = arr => {
  var arrWordsTemp = [];
  var arrValuesTemp = [];
  var length = arr.length;
  for (var i = 0; i < process.env.WORDS_FOR_DAY; i++) {
    do {
      var value = Math.floor(Math.random() * length);
    } while (arrValuesTemp.includes(value));
    arrValuesTemp.push(value);
    arrWordsTemp.push(arr[value]);
    arr.splice(value, 1);
  }
  return {
    arrWithoutUsed: arr.join("\n"),
    arrWords: arrWordsTemp.join("\n")
  };
};

const { arrWithoutUsed, arrWords } = getWords(arr);

console.log("Rewrite arquive without words used");
// UArchive.writeFile("assets/wordsNotUsed.txt", arrWithoutUsed);

console.log("Save words used in file");
// UArchive.appendFile("assets", "wordsUsed.txt", arrWords);

const App = async () => {
  try {
    var word = "wrong";
    //var results = await Oxford.getFromAPIOxford("/api/v2/entries/en-us/" + word);

    //Download MP3
    var urlDownload =
      "http://audio.oxforddictionaries.com/en/mp3/wrong_us_1.mp3";
    await Oxford.getAudioFromUrl(
      urlDownload,
      "/assets/download/words",
      "wrong.mp3"
    );
  } catch (error) {
    console.log("Ops...");
    console.log(error);
  }
};

App();
