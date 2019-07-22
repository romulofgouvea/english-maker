import fs from "fs";
import path, { resolve } from "path";

const loadFile = (source, nameFile) => {
  try {
    const absolutePath = resolve(__base, source);
    const file = fs.readFileSync(path.join(absolutePath, nameFile), "utf8");
    return file.toString().split("\n");
  } catch (error) {
    console.log("Deu erro! \n", error);
    return null;
  }
};

const appendFile = (source, nameFile, data) => {
  try {
    const absolutePath = resolve(__base, source);
    fs.appendFile(path.join(absolutePath, nameFile), data, err => {
      if (err) throw err;
      console.log("Updated!");
    });
  } catch (error) {
    console.log("Deu erro! \n", error);
    return null;
  }
};

const renameFile = (nameFile, newNameFile) => {
  try {
    fs.rename(nameFile, newNameFile, err => {
      if (err) throw err;
      console.log("Arquivo renomeado!");
    });
  } catch (error) {
    console.log("Deu erro! \n", error);
    return null;
  }
};

const writeFileSync = (nameFile, data) => {
  try {
    const absolutePath = resolve(__base, nameFile);
    fs.writeFileSync(absolutePath, data, err => {
      if (err) throw err;
      console.log("Arquivo escrito!");
    });
  } catch (error) {
    console.log("Deu erro! \n", error);
    return null;
  }
};

const deleteArchive = nameFile => {
  try {
    fs.unlink(nameFile, err => {
      if (err) throw err;
      console.log("File deleted!");
    });
  } catch (error) {
    console.log("Deu erro! \n", error);
    return null;
  }
};

const writeFileMP3 = async (source, nameFile, data) => {
  try {
    //await createFolder(absolutePath);
    const absolutePath = path.resolve(__base + source, nameFile);
    fs.writeFileSync(absolutePath, data, err => {
      if (err) throw err;
      console.log("Arquivo escrito!");
    });
  } catch (error) {
    console.log("Deu erro! \n", error);
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
      if (!fs.existsSync(__base + temp)) {
        fs.mkdirSync(__base + temp);
      }
      return temp;
    });
    console.log("As pastas criadas!");
  } catch (error) {
    console.log("Ops..");
    console.log(error);
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
