import fs from "fs";
import path from "path";
import _ from "lodash";
import archiver from "archiver";

import UUtils from "./uutils";
import { constants } from "../../config";

const BASE_URL = constants.BASE_URL;

const removeBase = source => {
  return source.replace(/.*src/g, "").replace(/\\\\|\\|\/|\/\//g, "/");
}

function getBaseUrl(source) {
  if (!source) throw "Source is empty";
  source = removeBase(source);
  return path.join(BASE_URL, source);
};

const getNameFile = source => {
  return removeBase(source).replace(/.+[/|//|\\|\\\\]/g, "");
}

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
  if (!UUtils.isEmpty(fs.existsSync(localUrl))) {
    return `${source}/${nameFile}`;
  }
  return "";
}

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
    var localUrl = `${getBaseUrl(source)}/${nameFile}.json`;
    if (!existsFile(localUrl)) throw "File not exists";
    return JSON.parse(fs.readFileSync(localUrl, "utf8"));
  } catch (error) {
    // console.log(error);
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
      });
      resolve();
    });

    const existsFile = this.existsFile(newSource);
    if (existsFile) {
      console.log("File renamed: " + existsFile);
      return existsFile;
    }
  } catch (error) {
    throw error;
  }
}

function moveFile(source, newSource, callback) {
  source = getBaseUrl(source);
  newSource = getBaseUrl(newSource);
  if (!this.existsFile(source)) throw "File not exists";

  var readStream = fs.createReadStream(source);
  var writeStream = fs.createWriteStream(newSource);

  readStream.on("error", callback);
  writeStream.on("error", callback);

  readStream.on("close", () => {
    fs.unlink(source, callback);
  });

  readStream.pipe(writeStream);
  return this.existsFile(newSource);
}

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
    var localUrl = !nameFile ? source : `${source}/${nameFile}`;
    var exists = existsFile(localUrl);
    if (UUtils.isEmpty(exists)) {
      throw "File not exists";
    }
    fs.unlink(localUrl, err => {
      if (err) throw err
      //console.log("Removed : ", exists);
    });
    return exists;
  } catch (error) {
    console.log(error);
    return "";
  }
};

const removeGroupFiles = group => {
  for (var gp of group) {
    const source = getBaseUrl(gp);
    deleteArchive(source);
  }
}

const listFilesDir = (source, filterExt = "") => {
  try {
    source = getBaseUrl(source);
    var files = fs.readdirSync(source, err => { if (err) throw err })

    return files.map(f => {
      var ext = f.replace(/.+\./g, "");
      if (ext === filterExt) {
        return `${source}/${f}`
      }
    }).filter(Boolean);
  } catch (error) {
    console.log(error);
    return "";
  }
}

const createFolder = source => {
  try {
    var arrSource = removeBase(source).split('/');
    var t = arrSource.reduce((ac, value) => {
      var temp = `${ac}\\${value}`;
      var url = getBaseUrl(temp);
      if (!fs.existsSync(url)) {
        fs.mkdirSync(url);
      }
      return temp;
    });
    return t;
  } catch (error) {
    //console.log(error);
    return "";
  }
};

const zipFolder = (source, output) => {
  source = getBaseUrl(source)
  output = getBaseUrl(output)

  const archive = archiver('zip', { zlib: { level: 9 } });
  const stream = fs.createWriteStream(output);

  return new Promise((resolve, reject) => {
    archive
      .directory(source, false)
      .on('error', err => reject(err))
      .pipe(stream);

    stream.on('close', () => resolve(existsFile(output)));
    archive.finalize();
  });
}


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
  getBaseUrl,
  removeGroupFiles,
  listFilesDir,
  getNameFile,
  createFolder,
  zipFolder
};
