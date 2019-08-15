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

const getEtapa = () => {}
const setEtapa = (etapa) => {}

module.exports = { getState, setState };
