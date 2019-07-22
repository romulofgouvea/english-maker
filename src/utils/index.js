import moment from "moment";

import UArchive from './uarquives';

function GetFormattedDate(separator = "/") {
  return moment().format(`DD${separator}MM${separator}YYYY`);
}

module.exports = {
  UArchive,
  GetFormattedDate
};
