import { UArchive } from "~/utils";

const getState = async () => {
  return await UArchive.loadFileJson("/assets/state", "state.json");
};

const setState = async (nameFile, data) => {
  await UArchive.writeFileJson("/assets/state", `${nameFile}.json`, data);
};

module.exports = { getState, setState };
