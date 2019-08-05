import { UArchive } from "~/utils";

const getState = async nameFile => {
  return await UArchive.loadFileJson(
    "/assets/state",
    !nameFile && "state.json"
  );
};

const setState = async (nameFile, data) => {
  await UArchive.writeFileJson("/assets/state", nameFile, data);
};

module.exports = { getState, setState };
