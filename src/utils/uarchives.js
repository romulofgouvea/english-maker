import fs from "fs";
import path, { resolve } from "path";
import { constants } from "../../config";
import _ from "lodash";

const BASE_URL = constants.BASE_URL;

const getBaseUrl = source => {
  source = source.replace(/.*src/g, "").replace(/\\\\|\\|\/|\/\//g, "/");
  return path.join(BASE_URL, source);
};

function existsFile(source, nameFile = "") {
  var localUrl = "";
  if (!nameFile) {
    localUrl = getBaseUrl(source);
    var tmpSource = source
      .replace(/.*src/g, "")
      .replace(/\\\\|\\|\/|\/\//g, "/");
    source = tmpSource
      .replace(/.*src/g, "")
      .replace(/.[^/|//|\\|\\\\]+(?=\/$|$)/g, "");
    nameFile = tmpSource.replace(/.+[/|//|\\|\\\\]/g, "");
  } else {
    localUrl = `${getBaseUrl(source)}/${nameFile}`;
  }
  if (fs.existsSync(localUrl)) return `${source}/${nameFile}`;
  return "";
};

const loadFile = (source, nameFile) => {
  try {
    if (!existsFile(source, nameFile)) throw "File not exists";

    var localUrl = `${getBaseUrl(source)}/${nameFile}`;
    var arch = fs
      .readFileSync(localUrl, "utf8")
      .toString()
      .replace(/\r/g, "")
      .split("\n");
    return _.compact(arch);
  } catch (error) {
    return "";
  }
};

const loadFileJson = (source, nameFile) => {
  try {
    if (!existsFile(source, nameFile)) throw "File not exists";

    var localUrl = `${getBaseUrl(source)}/${nameFile}`;
    return JSON.parse(fs.readFileSync(localUrl, "utf8"));
  } catch (error) {
    return "";
  }
};

const appendFile = (source, nameFile, data) => {
  try {
    var localUrl = `${getBaseUrl(source)}/${nameFile}`;
    fs.appendFile(localUrl, data, err => {
      if (err) throw err;
    });
    return existsFile(localUrl);
  } catch (error) {
    return "";
  }
};

function renameFile(source, newSource) {
  try {
    source = getBaseUrl(source);
    newSource = getBaseUrl(newSource);

    if (!this.existsFile(source)) throw "File not exists";

    new Promise(async (resolve, reject) => {
      await fs.rename(source, newSource, err => {
        if (err) reject(err);
      })
      resolve()
    })

    const existsFile = this.existsFile(newSource);
    if (existsFile) {
      console.log("File renamed: " + existsFile);
      return existsFile;
    }
  } catch (error) {
    throw error;
  }
};

function moveFile(source, newSource, callback) {

  source = getBaseUrl(source);
  newSource = getBaseUrl(newSource);
  if (!this.existsFile(source)) throw "File not exists";

  var readStream = fs.createReadStream(source);
  var writeStream = fs.createWriteStream(newSource);

  readStream.on("error", callback);
  writeStream.on("error", callback);

  readStream.on("close", function () {
    fs.unlink(source, callback);
  });

  readStream.pipe(writeStream);
  return this.existsFile(newSource);
};

const writeFileSync = (source, nameFile, data) => {
  try {
    var localUrl = `${getBaseUrl(source)}/${nameFile}`;
    fs.writeFileSync(localUrl, data, err => {
      if (err) throw err;
    });
    return existsFile(source, nameFile);
  } catch (error) {
    console.log(error);
    return "";
  }
};

const writeFileJson = (source, nameFile, data) => {
  try {
    var localUrl = `${getBaseUrl(source)}/${nameFile}.json`;
    fs.writeFileSync(localUrl, JSON.stringify(data));
    return existsFile(localUrl);
  } catch (error) {
    console.log(error);
    return "";
  }
};

const writeFileMP3 = async (source, nameFile, data) => {
  try {
    var localUrl = `${getBaseUrl(source)}/${nameFile}.mp3`;
    fs.writeFileSync(localUrl, data);
    return existsFile(localUrl);
  } catch (error) {
    return "";
  }
};

const writeFileStream = async (source, nameFile) => {
  try {
    var localUrl = `${getBaseUrl(source)}/${nameFile}`;
    fs.createWriteStream(localUrl);
    return existsFile(localUrl);
  } catch (error) {
    return "";
  }
};

const deleteArchive = (source, nameFile = "") => {
  try {
    source = getBaseUrl(source);
    if (!existsFile(source, nameFile)) throw "File not exists";

    var localUrl = !nameFile ? source : `${getBaseUrl(source)}/${nameFile}`;
    var exists = existsFile(localUrl);
    if (exists) {
      fs.unlink(localUrl);
      return exists;
    }
    return "";
  } catch (error) {
    return "";
  }
};


module.exports = {
  loadFile,
  loadFileJson,
  writeFileSync,
  writeFileJson,
  writeFileMP3,
  writeFileStream,
  appendFile,
  renameFile,
  deleteArchive,
  moveFile,
  existsFile,
  getBaseUrl
};
