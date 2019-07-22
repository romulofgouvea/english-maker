import dotenv from "dotenv";
import _ from "lodash";

import { UArchive } from "~/utils";
import { Oxford } from "~/services";
import { Watson } from "~/services";
import { Google } from "~/services";

dotenv.config();

const getWords = async arr => {
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
    return await {
        arrWithoutUsed: arr,
        arrWords: arrWordsTemp
    };
};

const mountObjectData = async arrWords => {
    var MData = [];

    console.log("Words: ", arrWords.length);
    await arrWords.map(async word => {
        var temp = {};
        temp.word = word;
        temp.transcript = await Watson.getPronunciations(word);

        var oxfordData = await Oxford.getFromAPIOxford("/api/v2/entries/en-us/" + word);
        oxfordData.data && Object.assign({}, temp, oxfordData[_.random(0, oxfordData.data.length)] || oxfordData.data[0])
        //console.log("aqui: ", word, JSON.stringify(oxfordData.data.length));
        // MData.translate = {
        //     word: await Watson.getTranslate(word),
        //     lexicalCategory = await Watson.getTranslate(MData.lexicalCategory),
        //     definitions: oxfordData.definitions.map(phrase => await Google.getTranslateGoogleAPI(phrase)),
        //     examples: oxfordData.examples.map(phrase => await Google.getTranslateGoogleAPI(phrase)),
        // }

        // MData.keywords = oxfordData.map(d => await Watson.getKeyWords(d.definitions.join(', ')))

        // if (await Oxford.getAudioFromUrl(urlDownload, "/assets/download/words", word + ".mp3"))
        //     MData.audio = __dirname + "/assets/download/words/" + word + ".mp3";

        //Watson.getAudio("locked in a worsening political standoff with Western powers", 'locked.mp3');
        MData.push(temp);
    })
    return await MData;
}

const App = async () => {
    try {
        console.log("Load file");
        const arr = UArchive.loadFile("/assets", "wordsNotUsed.txt");
        const { arrWithoutUsed, arrWords } = await getWords(arr);

        var MData = await mountObjectData(arrWords);
        console.log("MData ", JSON.stringify(MData));

        if (arrWithoutUsed) {
            console.log("Rewrite arquive without words used");
            //UArchive.writeFile("assets/wordsNotUsed.txt", arrWithoutUsed.join("\n"));
        }

        if (arrWords) {
            console.log("Save words used in file");
            //UArchive.appendFile("/assets", "wordsUsed.txt", arrWords.join("\n"));
        }

    } catch (error) {
        console.log("Ops...");
        console.log(error);
    }
};

App();
