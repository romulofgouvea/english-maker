import { UArchive } from '~/utils';
import { Watson } from '~/services';
import { Oxford } from '~/services';

const getAudios = async () => {
    const dataText = await UArchive.loadFileJson('/assets/state', 'text.json');

    for (var [key, value] of dataText.entries()) {

        console.log('Transcrevendo definições');
        var tempSourceDefinitions = []
        for (var [key, def] of value.definitions.entries()) {
            tempSourceDefinitions.push(await Watson.getAudio(def, value.word + key + '.mp3'));
        }

        console.log('Transcrevendo exemplos');
        var tempSourceExamples = []
        for (var [key, def] of value.examples.entries()) {
            tempSourceExamples.push(await Watson.getAudio("/assets/download/phrases", value.word + key + '.mp3', def));
        }

        value.audios = {
            word: await Oxford.getAudioFromUrl(value.pronunciation.audio, '/assets/download/words', value.word + ".mp3"),
            definitions: tempSourceDefinitions,
            examples: tempSourceExamples,
        }

        console.log(value.audios);
    }
}

const RobotAudio = async () => {
    try {
        console.log("RobotAudio: Load file");
        getAudios()
    } catch (error) {
        console.log("Ops...", error);
    }
};

RobotAudio();
