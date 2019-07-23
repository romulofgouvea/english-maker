import fs from "fs";
import path, { resolve } from "path";
import { constants } from '../../config';

const BASE_URL = constants.BASE_URL

const loadFile = (source, nameFile) => {
  try {
    return fs.readFileSync(path.join(BASE_URL, source, nameFile), "utf8").toString().split("\n");
  } catch (error) {
    //console.log("Deu erro! \n", error);
    return null;
  }
};

const appendFile = (source, nameFile, data) => {
  try {
    fs.appendFile(path.join(BASE_URL, source, nameFile), data, err => {
      if (err) throw err;
      //console.log("Updated!");
    });
  } catch (error) {
    //console.log("Deu erro! \n", error);
    return null;
  }
};

const renameFile = (nameFile, newNameFile) => {
  try {
    fs.rename(nameFile, newNameFile, err => {
      if (err) throw err;
      //console.log("Arquivo renomeado!");
    });
  } catch (error) {
    //console.log("Deu erro! \n", error);
    return null;
  }
};

const writeFileSync = (source, nameFile, data) => {
  try {
    fs.writeFileSync(path.join(BASE_URL, source, nameFile), data, err => {
      if (err) throw err;
      //console.log("Arquivo escrito!");
    });
  } catch (error) {
    //console.log("Deu erro! \n", error);
    return null;
  }
};

const deleteArchive = (source, nameFile) => {
  try {
    fs.unlink(path.join(BASE_URL, source, nameFile), err => {
      if (err) throw err;
      //console.log("File deleted!");
    });
  } catch (error) {
    //console.log("Deu erro! \n", error);
    return null;
  }
};

const writeFileMP3 = async (source, nameFile, data) => {
  try {
    //await createFolder(absolutePath);
    fs.writeFileSync(path.join(BASE_URL, source, nameFile), data, err => {
      if (err) throw err;
      //console.log("Arquivo escrito!");
    });
  } catch (error) {
    //console.log("Deu erro! \n", error);
    return null;
  }
};

const createFolder = source => {
  var arrSource = source
    .replace(/\\/g, "/")
    .replace(/.*src\//, "")
    .split("/");
  try {
    arrSource.reduce((ac, value) => {
      var temp = ac + "/" + value;
      if (!fs.existsSync(BASE_URL + temp)) {
        fs.mkdirSync(BASE_URL + temp);
      }
      return temp;
    });
    //console.log("As pastas criadas!");
  } catch (error) {
    //console.log("Ops..");
    //console.log(error);
  }
};

module.exports = {
  loadFile,
  appendFile,
  renameFile,
  writeFileSync,
  deleteArchive,
  writeFileMP3
};
