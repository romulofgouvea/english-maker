global.__base = __dirname + "\\";
import Utils from "~/utils";
import dotenv from "dotenv";

dotenv.config();

const arr = Utils.loadFile("assets", "wordsNotUsed.txt");

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

// Remove words used of the wordsNotUsed
Utils.writeFile("assets/wordsNotUsed.txt", arrWithoutUsed);
//save in new archive
Utils.appendFile("assets", "wordsUsed.txt", arrWords);
