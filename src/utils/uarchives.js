import fs from "fs";
import path, { resolve } from "path";
import { constants } from "../../config";
import _ from "lodash";

const BASE_URL = constants.BASE_URL;

const getBaseUrl = source => {
  source = source.replace(/.*src/g, "").replace(/\\\\|\\|\/|\/\//g, "/");
  return path.join(BASE_URL, source);
};

const loadFile = (source, nameFile) => {
  try {
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
  } catch (error) {
    return "";
  }
};

const renameFile = (nameFile, newNameFile) => {
  try {
    fs.rename(nameFile, newNameFile, err => {
      if (err) throw err;
    });
  } catch (error) {
    return "";
  }
};

const moveFile = (source, newSource) => {
  var localUrl = getBaseUrl(source);
  var newLocalUrl = getBaseUrl(newSource);

  var readStream = fs.createReadStream(localUrl);
  var writeStream = fs.createWriteStream(newLocalUrl);

  readStream.on("error", callback);
  writeStream.on("error", callback);

  readStream.on("close", function() {
    fs.unlink(localUrl, callback);
  });

  readStream.pipe(writeStream);
  return newSource;
};

const writeFileSync = (source, nameFile, data) => {
  try {
    var localUrl = `${getBaseUrl(source)}/${nameFile}`;
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
    var localUrl = `${getBaseUrl(source)}/${nameFile}`;
    fs.writeFileSync(localUrl, JSON.stringify(data));
    return fileExists(source, nameFile);
  } catch (error) {
    return "";
  }
};

const deleteArchive = (source, nameFile = "") => {
  try {
    var localUrl = !nameFile ? source : `${getBaseUrl(source)}/${nameFile}`;
    var exists = fileExists(localUrl);
    if (exists) {
      fs.unlink(localUrl, err => {
        if (err) throw err;
      });
      return exists;
    }
    return "";
  } catch (error) {
    return "";
  }
};

const writeFileMP3 = async (source, nameFile, data) => {
  try {
    var localUrl = `${getBaseUrl(source)}/${nameFile}`;
    fs.writeFileSync(localUrl, data);
    return fileExists(source, nameFile);
  } catch (error) {
    return "";
  }
};

const writeFileStream = async (source, nameFile) => {
  try {
    var localUrl = `${getBaseUrl(source)}/${nameFile}`;
    fs.createWriteStream(localUrl);
    return fileExists(source, nameFile);
  } catch (error) {
    return "";
  }
};

const fileExists = (source, nameFile = "") => {
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
  fileExists,
  moveFile
};
