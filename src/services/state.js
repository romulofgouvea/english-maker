import { UArchive } from "~/utils";

const getState = nameFile => {
  return UArchive.loadFileJson(
    "/assets/state",
    nameFile ? nameFile : "state"
  );
};

const setState = async (nameFile, data) => {
  await UArchive.writeFileJson("/assets/state", nameFile, data);
};

const setProcessState = async (nameFile, data) => {

  var data = {
    text: {},
    audio: {},
    video: {},
    youtube: {}
  }

  await UArchive.writeFileJson("/assets/state", nameFile, data);
}

module.exports = { getState, setState };
