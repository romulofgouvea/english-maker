import moment from "moment";

import UArchive from './uarchives';
import UImage from './uimages';

function GetFormattedDate(separator = "/") {
  return moment().format(`DD${separator}MM${separator}YYYY`);
}

module.exports = {
  UArchive,
  UImage,
  GetFormattedDate
};
