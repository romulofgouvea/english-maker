import {UArchive} from '~/utils';
import Watson from '~/services';
import Oxford from '~/services';

const getAudios = async () => {
    const dataText = await UArchive.loadFileJson('/assets/state', 'text.json');
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
  