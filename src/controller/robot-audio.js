import UArchive from '~/utils';
import Watson from '~/services';
import Oxford from '~/services';

const getAudios = async () => {
    const dataText = await UArchive.loadJson('/assets/download/state', 'text.json');

    for (var i = 0; i < dataText.length; i++) {
        var word = dataText[i];

        var tempSourceDefinitions = []
        for (var [key, def] of word.definitions.entries()) {
            tempSourceDefinitions.push(await Watson.getAudio(def, word.word + key + '.mp3'));
        }

        word.audios = {
            word: await Oxford.getAudioFromUrl('', '', word.translate.word + ".mp3")
        }

    }
}

module.exports = {

}