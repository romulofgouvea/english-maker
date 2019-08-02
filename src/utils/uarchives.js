import fs from "fs";
import path, { resolve } from "path";
import { constants } from "../../config";

const BASE_URL = constants.BASE_URL;

const loadFile = (source, nameFile) => {
  try {
    var localUrl = `${path.join(BASE_URL, source)}\\${nameFile}`;
    return fs
      .readFileSync(localUrl, "utf8")
      .toString()
      .split("\n");
  } catch (error) {
    //console.log("Deu erro! \n", error);
    return null;
  }
};

const loadFileJson = (source, nameFile) => {
  try {
    var localUrl = `${path.join(BASE_URL, source)}\\${nameFile}`;
    return JSON.parse(fs.readFileSync(localUrl, "utf8"));
  } catch (error) {
    return null;
  }
};

const appendFile = (source, nameFile, data) => {
  try {
    var localUrl = `${path.join(BASE_URL, source)}\\${nameFile}`;
    fs.appendFile(localUrl, data, err => {
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
    var localUrl = `${path.join(BASE_URL, source)}\\${nameFile}`;
    fs.writeFileSync(localUrl, data, err => {
      if (err) throw err;
    });
    return fileExists(source, nameFile);
  } catch (error) {
    return "";
  }
};

const writeFileJson = (source, nameFile, data) => {
  try {
    var localUrl = `${path.join(BASE_URL, source)}\\${nameFile}`;
    return fs.writeFileSync(localUrl, JSON.stringify(data));
  } catch (error) {
    return null;
  }
};

const deleteArchive = (source, nameFile = "") => {
  try {
    var localUrl = !nameFile ? source : `${path.join(BASE_URL, source)}\\${nameFile}`;
    var exists = fileExists(localUrl)
    if (exists) {
      fs.unlink(localUrl, err => {
        if (err) throw err;
      });
      return exists
    }
    return "";
  } catch (error) {
    return null;
  }
};

const writeFileMP3 = async (source, nameFile, data) => {
  try {
    var localUrl = `${path.join(BASE_URL, source)}\\${nameFile}`;
    fs.writeFileSync(localUrl, data);
    return localURL;
  } catch (error) {
    return null;
  }
};

const writeFileStream = async (source, nameFile) => {
  try {
    var localUrl = `${path.join(BASE_URL, source)}\\${nameFile}`;
    fs.createWriteStream(localUrl);
  } catch (error) {
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

const fileExists = (source, nameFile = "") => {
  var localUrl = !nameFile ? source : `${path.join(BASE_URL, source)}\\${nameFile}`;
  if (fs.existsSync(localUrl)) return localUrl;
  return "";
};

module.exports = {
  loadFile,
  appendFile,
  renameFile,
  writeFileSync,
  deleteArchive,
  writeFileMP3,
  writeFileStream,
  writeFileJson,
  loadFileJson,
  fileExists
};
